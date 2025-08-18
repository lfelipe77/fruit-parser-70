import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { RaffleRow } from "@/types/raffles";
import { useToast } from "@/hooks/use-toast";
import { nanoid } from "nanoid";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";

interface GanhavelEditorProps {
  open: boolean;
  row: RaffleRow | null;
  onClose: () => void;
  onSaved: (row: RaffleRow) => void;
}

interface FormState {
  title: string;
  description: string;
  image_url: string | null;
  goal_amount: string;
  ticket_price: string;
  status: "active" | "pending" | "archived";
  location_city: string;
  location_state: string;
  direct_purchase_link: string;
}

interface Category {
  id: number;
  nome: string;
}

interface Subcategory {
  id: string;
  name: string;
  category_id: number;
}

export function GanhavelEditor({ open, row, onClose, onSaved }: GanhavelEditorProps) {
  const { toast } = useToast();

  const [form, setForm] = useState<FormState>({
    title: "",
    description: "",
    image_url: null,
    goal_amount: "",
    ticket_price: "",
    status: "pending",
    location_city: "",
    location_state: "",
    direct_purchase_link: "",
  });

  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);

  // Load categories and subcategories
  useEffect(() => {
    if (!open) return;
    
    const loadCategories = async () => {
      const { data: cats } = await (supabase as any)
        .from("categories")
        .select("id, nome")
        .order("nome", { ascending: true });
      setCategories(cats || []);
    };

    const loadSubcategories = async () => {
      const { data: subs } = await (supabase as any)
        .from("subcategories")
        .select("id, name, category_id")
        .order("name", { ascending: true });
      setSubcategories(subs || []);
    };

    loadCategories();
    loadSubcategories();
  }, [open]);

  // Load row data when opened
  useEffect(() => {
    if (!open || !row) {
      // Reset form for new creation
      setForm({
        title: "",
        description: "",
        image_url: null,
        goal_amount: "",
        ticket_price: "",
        status: "pending",
        location_city: "",
        location_state: "",
        direct_purchase_link: "",
      });
      setSelectedCategoryId(null);
      setSelectedSubcategoryId(null);
      return;
    }

    // Load existing row data
    setForm({
      title: row.title ?? "",
      description: row.description ?? "",
      image_url: row.image_url ?? null,
      goal_amount: row.goal_amount != null ? String(row.goal_amount) : "",
      ticket_price: row.ticket_price != null ? String(row.ticket_price) : "",
      status: (row.status as FormState["status"]) ?? "pending",
      location_city: row.location_city ?? "",
      location_state: row.location_state ?? "",
      direct_purchase_link: row.direct_purchase_link ?? "",
    });
    setSelectedCategoryId(row.category_id);
    setSelectedSubcategoryId(row.subcategory_id);
  }, [open, row]);

  // Filter subcategories by selected category
  const subOptions = useMemo(() => {
    return subcategories.filter(s => s.category_id === selectedCategoryId);
  }, [subcategories, selectedCategoryId]);

  // Reset subcategory when category changes
  useEffect(() => {
    if (selectedCategoryId && selectedSubcategoryId) {
      const isValidSub = subOptions.find(s => s.id === selectedSubcategoryId);
      if (!isValidSub) {
        setSelectedSubcategoryId(null);
      }
    }
  }, [selectedCategoryId, selectedSubcategoryId, subOptions]);

  const errors = useMemo(() => {
    const e: Record<string, string> = {};
    const goal = form.goal_amount.trim();
    const ticket = form.ticket_price.trim();

    if (!form.title.trim()) e.title = "Título é obrigatório";
    if (goal === "" || isNaN(Number(goal)) || Number(goal) < 0) e.goal_amount = "Meta inválida";
    if (ticket === "" || isNaN(Number(ticket)) || Number(ticket) < 0) e.ticket_price = "Preço inválido";
    return e;
  }, [form]);

  const isValid = Object.keys(errors).length === 0;

  const handleUpload = async (): Promise<string | null> => {
    if (!imageFile) return form.image_url || null;
    setUploading(true);
    try {
      const ext = imageFile.name.split(".").pop();
      const key = `images/${row?.id ?? nanoid()}/${Date.now()}-${nanoid()}.${ext}`;
      const { error } = await supabase.storage.from("ganhaveis").upload(key, imageFile, { upsert: true });
      if (error) throw error;
      const { data } = supabase.storage.from("ganhaveis").getPublicUrl(key);
      return data.publicUrl;
    } catch (err) {
      console.error("Upload error", err);
      toast({ title: "Upload falhou", description: "Não foi possível enviar a imagem.", variant: "destructive" });
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (uploading || saving || !isValid || !row) return;
    setSaving(true);
    try {
      const imageUrl = await handleUpload();
      if (imageFile && !imageUrl) {
        setSaving(false);
        return;
      }

      const goal = form.goal_amount.trim();
      const ticket = form.ticket_price.trim();
      const city = form.location_city?.trim();
      const stateUf = form.location_state?.trim();
      const directLink = form.direct_purchase_link?.trim();

      // Editor payload must match exactly the raffles table columns
      const payload: Partial<RaffleRow> = {
        title: form.title.trim(),
        description: (form.description ?? "").trim() || null,
        image_url: imageUrl || null,
        goal_amount: goal !== "" ? Number(goal) : null,
        ticket_price: ticket !== "" ? Number(ticket) : null,
        category_id: selectedCategoryId ?? null,
        subcategory_id: selectedSubcategoryId ?? null,
        location_city: city || null,
        location_state: stateUf || null,
        direct_purchase_link: directLink || null,
        status: (form.status || "active") as any,
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await (supabase as any)
        .from("raffles")
        .update(payload)
        .eq("id", row.id)
        .select("*")
        .single();
        
      if (error) throw error;
      
      toast({ title: "Ganhavel atualizado", description: "As alterações foram salvas." });
      
      // Create updated row for callback
      const updatedRow: RaffleRow = {
        ...row,
        ...payload,
        id: row.id,
        user_id: row.user_id,
        created_at: row.created_at,
        updated_at: data?.updated_at || payload.updated_at || row.updated_at,
      };
      
      onSaved(updatedRow);
    } catch (err) {
      console.error("Save error", err);
      toast({ title: "Erro", description: "Falha ao salvar ganhavel.", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
      <div className="w-[680px] max-w-[96vw] rounded-2xl bg-background p-6 max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-semibold mb-2">
          {row ? "Editar Ganhavel" : "Novo Ganhavel"}
        </h2>
        <p className="text-sm text-muted-foreground mb-6">
          {row ? "Edite as informações do ganhavel." : "Crie um novo ganhavel."}
        </p>

        <div className="grid gap-4">
          {/* Title */}
          <div className="grid gap-2">
            <Label htmlFor="title">Título</Label>
            <Input 
              id="title" 
              value={form.title} 
              onChange={(e) => setForm(p => ({ ...p, title: e.target.value }))} 
              placeholder="Título do ganhavel" 
            />
            {errors.title && <p className="text-destructive text-sm">{errors.title}</p>}
          </div>

          {/* Description */}
          <div className="grid gap-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea 
              id="description" 
              rows={3} 
              value={form.description} 
              onChange={(e) => setForm(p => ({ ...p, description: e.target.value }))} 
            />
          </div>

          {/* Goal Amount and Ticket Price */}
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="goal_amount">Meta (R$)</Label>
              <Input 
                id="goal_amount" 
                type="number" 
                step="0.01" 
                value={form.goal_amount} 
                onChange={(e) => setForm(p => ({ ...p, goal_amount: e.target.value }))} 
              />
              {errors.goal_amount && <p className="text-destructive text-sm">{errors.goal_amount}</p>}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="ticket_price">Preço do Ticket (R$)</Label>
              <Input 
                id="ticket_price" 
                type="number" 
                step="0.01" 
                value={form.ticket_price} 
                onChange={(e) => setForm(p => ({ ...p, ticket_price: e.target.value }))} 
              />
              {errors.ticket_price && <p className="text-destructive text-sm">{errors.ticket_price}</p>}
            </div>
          </div>

          {/* Status and Categories */}
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Status</Label>
              <Select 
                value={form.status} 
                onValueChange={(v: FormState["status"]) => setForm(p => ({ ...p, status: v }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pendente</SelectItem>
                  <SelectItem value="active">Ativo</SelectItem>
                  <SelectItem value="archived">Arquivado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Categoria</Label>
              <Select 
                value={selectedCategoryId?.toString() || ""} 
                onValueChange={(v) => setSelectedCategoryId(v ? Number(v) : null)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(cat => (
                    <SelectItem key={cat.id} value={cat.id.toString()}>
                      {cat.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Subcategory and Location */}
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Subcategoria</Label>
              <Select 
                value={selectedSubcategoryId || ""} 
                onValueChange={(v) => setSelectedSubcategoryId(v || null)}
                disabled={!selectedCategoryId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma subcategoria" />
                </SelectTrigger>
                <SelectContent>
                  {subOptions.map(sub => (
                    <SelectItem key={sub.id} value={sub.id}>
                      {sub.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Cidade</Label>
              <Input 
                value={form.location_city} 
                onChange={(e) => setForm(p => ({ ...p, location_city: e.target.value }))} 
                placeholder="Cidade"
              />
            </div>
          </div>

          {/* State and Direct Purchase Link */}
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Estado</Label>
              <Input 
                value={form.location_state} 
                onChange={(e) => setForm(p => ({ ...p, location_state: e.target.value }))} 
                placeholder="Estado"
              />
            </div>
            <div className="grid gap-2">
              <Label>Link de Compra Direta</Label>
              <Input 
                value={form.direct_purchase_link} 
                onChange={(e) => setForm(p => ({ ...p, direct_purchase_link: e.target.value }))} 
                placeholder="https://..."
              />
            </div>
          </div>

          {/* Image Upload */}
          <div className="grid gap-2">
            <Label>Imagem</Label>
            <Input
              type="file"
              accept="image/*"
              onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
              disabled={uploading}
            />
            {uploading && <p className="text-sm text-muted-foreground">Enviando imagem...</p>}
            {form.image_url && (
              <img 
                src={form.image_url} 
                alt="Imagem atual do ganhavel" 
                className="mt-2 h-28 w-auto rounded" 
              />
            )}
          </div>

          {/* Action buttons */}
          <div className="flex justify-end gap-2 pt-4">
            <button 
              className="border rounded-lg px-4 py-2 hover:bg-muted/50" 
              onClick={onClose}
            >
              Cancelar
            </button>
            <button
              className="rounded-lg px-4 py-2 bg-primary text-primary-foreground disabled:opacity-50 hover:bg-primary/90"
              disabled={!isValid || saving || uploading || !row}
              onClick={handleSave}
            >
              {saving ? "Salvando..." : uploading ? "Enviando..." : "Salvar"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}