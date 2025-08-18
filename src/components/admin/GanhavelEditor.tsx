import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { GanhavelRow } from "@/types/ganhaveis";
import { useToast } from "@/hooks/use-toast";
import { nanoid } from "nanoid";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";

interface GanhavelEditorProps {
  open: boolean;
  row: GanhavelRow | null;
  onClose: () => void;
  onSaved: (row: GanhavelRow) => void;
}

interface FormState {
  title: string;
  description: string;
  image_url: string | null;
  goal_amount: string; // R$ string
  ticket_price: string; // R$ string
  total_tickets: string; // integer string
  status: "active" | "pending" | "archived";
  product_name: string;
  category: string;
  subcategory: string;
  start_date: string; // datetime-local
  end_date: string;   // datetime-local
  location: string;
  country_region: string;
  affiliate_link: string;
  direct_purchase_link: string;
}

export function GanhavelEditor({ open, row, onClose, onSaved }: GanhavelEditorProps) {
  const { toast } = useToast();

  const [form, setForm] = useState<FormState>({
    title: "",
    description: "",
    image_url: null,
    goal_amount: "",
    ticket_price: "",
    total_tickets: "",
    status: "pending",
    product_name: "",
    category: "",
    subcategory: "",
    start_date: "",
    end_date: "",
    location: "",
    country_region: "",
    affiliate_link: "",
    direct_purchase_link: "",
  });

  const [raisedAmount, setRaisedAmount] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);

  // Load row data when opened
  useEffect(() => {
    if (!open || !row) return;
    setForm({
      title: row.title ?? "",
      description: row.description ?? "",
      image_url: row.image_url ?? null,
      goal_amount: row.goal_amount != null ? String(row.goal_amount) : "",
      ticket_price: row.ticket_price != null ? String(row.ticket_price) : "",
      total_tickets: row.total_tickets != null ? String(row.total_tickets) : "",
      status: (row.status as FormState["status"]) ?? "pending",
      product_name: "",
      category: row.category ?? "",
      subcategory: row.subcategory ?? "",
      start_date: row.start_date ? toLocalInput(row.start_date) : "",
      end_date: row.end_date ? toLocalInput(row.end_date) : "",
      location: row.location ?? "",
      country_region: row.country_region ?? "",
      affiliate_link: row.affiliate_link ?? "",
      direct_purchase_link: row.direct_purchase_link ?? "",
    });
    setRaisedAmount(typeof row.raised_amount === "number" ? row.raised_amount : Number(row.raised_amount ?? 0));
  }, [open, row]);

  const errors = useMemo(() => {
    const e: Record<string, string> = {};
    const goal = form.goal_amount.trim();
    const price = form.ticket_price.trim();
    const total = form.total_tickets.trim();

    if (!form.title.trim()) e.title = "Título é obrigatório";
    if (goal === "" || isNaN(Number(goal)) || Number(goal) < 0) e.goal_amount = "Meta inválida";
    if (price === "" || isNaN(Number(price)) || Number(price) < 0) e.ticket_price = "Preço inválido";
    if (total !== "" && (isNaN(Number(total)) || Number(total) < 0 || !Number.isFinite(Number(total)))) e.total_tickets = "Total inválido";
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
    if (uploading || saving || !isValid) return;
    setSaving(true);
    try {
      const imageUrl = await handleUpload();
      if (imageFile && !imageUrl) {
        setSaving(false);
        return;
      }

      const vGoal = form.goal_amount.trim();
      const vTicket = form.ticket_price.trim();
      const vTotal = form.total_tickets.trim();

      const payload: any = {
        title: form.title.trim(),
        description: form.description.trim() || null,
        image_url: imageUrl ?? form.image_url ?? null,
        goal_amount: vGoal !== "" ? Number(vGoal) : null,
        ticket_price: vTicket !== "" ? Number(vTicket) : null,
        total_tickets: vTotal !== "" ? Number(vTotal) : null,
        status: form.status,
        product_name: form.product_name.trim() || null,
        category: form.category.trim() || null,
        subcategory: form.subcategory.trim() || null,
        start_date: form.start_date || null,
        end_date: form.end_date || null,
        location: form.location.trim() || null,
        country_region: form.country_region.trim() || null,
        affiliate_link: form.affiliate_link.trim() || null,
        direct_purchase_link: form.direct_purchase_link.trim() || null,
        updated_at: new Date().toISOString(),
      };

      if (!row) return;
      
      const { data, error } = await supabase
        .from("ganhaveis")
        .update(payload)
        .eq("id", row.id)
        .select()
        .single();
        
      if (error) throw error;
      
      toast({ title: "Ganhavel atualizado", description: "As alterações foram salvas." });
      onSaved((data as GanhavelRow) ?? { ...row, ...payload });
    } catch (err) {
      console.error("Save error", err);
      toast({ title: "Erro", description: "Falha ao salvar ganhavel.", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const currency = (n: number | null | undefined) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(n || 0));

  if (!open || !row) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
      <div className="w-[680px] max-w-[96vw] rounded-2xl bg-background p-6 max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-semibold mb-2">Editar Ganhavel</h2>
        <p className="text-sm text-muted-foreground mb-6">Edite as informações do ganhavel.</p>

        <div className="grid gap-4">{/* Form content */}

      <div className="grid gap-2">
        <Label htmlFor="title">Título</Label>
        <Input id="title" value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} placeholder="Título do ganhavel" />
        {errors.title && <p className="text-destructive text-sm">{errors.title}</p>}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="description">Descrição</Label>
        <Textarea id="description" rows={3} value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="goal_amount">Meta (R$)</Label>
          <Input id="goal_amount" type="number" step="0.01" value={form.goal_amount} onChange={(e) => setForm((p) => ({ ...p, goal_amount: e.target.value }))} />
          {errors.goal_amount && <p className="text-destructive text-sm">{errors.goal_amount}</p>}
        </div>
        <div className="grid gap-2">
          <Label htmlFor="ticket_price">Preço do Ticket (R$)</Label>
          <Input id="ticket_price" type="number" step="0.01" value={form.ticket_price} onChange={(e) => setForm((p) => ({ ...p, ticket_price: e.target.value }))} />
          {errors.ticket_price && <p className="text-destructive text-sm">{errors.ticket_price}</p>}
        </div>
        <div className="grid gap-2">
          <Label htmlFor="total_tickets">Total de Tickets</Label>
          <Input id="total_tickets" type="number" value={form.total_tickets} onChange={(e) => setForm((p) => ({ ...p, total_tickets: e.target.value }))} />
          {errors.total_tickets && <p className="text-destructive text-sm">{errors.total_tickets}</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label>Status</Label>
          <Select value={form.status} onValueChange={(v: FormState["status"]) => setForm((p) => ({ ...p, status: v }))}>
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
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label>Nome do Produto (opcional)</Label>
          <Input value={form.product_name} onChange={(e) => setForm((p) => ({ ...p, product_name: e.target.value }))} />
        </div>
        <div className="grid gap-2">
          <Label>Categoria (texto)</Label>
          <Input value={form.category} onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label>Subcategoria (texto)</Label>
          <Input value={form.subcategory} onChange={(e) => setForm((p) => ({ ...p, subcategory: e.target.value }))} />
        </div>
        <div className="grid gap-2">
          <Label>Localização</Label>
          <Input value={form.location} onChange={(e) => setForm((p) => ({ ...p, location: e.target.value }))} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label>País/Região</Label>
          <Input value={form.country_region} onChange={(e) => setForm((p) => ({ ...p, country_region: e.target.value }))} />
        </div>
        <div className="grid gap-2">
          <Label>Link de Afiliado</Label>
          <Input value={form.affiliate_link} onChange={(e) => setForm((p) => ({ ...p, affiliate_link: e.target.value }))} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label>Link de Compra Direta</Label>
          <Input value={form.direct_purchase_link} onChange={(e) => setForm((p) => ({ ...p, direct_purchase_link: e.target.value }))} />
        </div>
        <div className="grid gap-2">
          <Label>Início</Label>
          <Input type="datetime-local" value={form.start_date} onChange={(e) => setForm((p) => ({ ...p, start_date: e.target.value }))} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label>Fim</Label>
          <Input type="datetime-local" value={form.end_date} onChange={(e) => setForm((p) => ({ ...p, end_date: e.target.value }))} />
        </div>
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
            <img src={form.image_url} alt="Imagem atual do ganhavel" className="mt-2 h-28 w-auto rounded" />
          )}
        </div>
      </div>

      {raisedAmount != null && form.goal_amount && (
        <Card>
          <CardContent className="py-4 text-sm">
            Arrecadado: <strong>{currency(raisedAmount)}</strong> de <strong>{currency(Number(form.goal_amount))}</strong>
          </CardContent>
        </Card>
      )}

        <div className="flex justify-end gap-2 pt-4">
          <button 
            className="border rounded-lg px-4 py-2 hover:bg-muted/50" 
            onClick={onClose}
          >
            Cancelar
          </button>
          <button
            className="rounded-lg px-4 py-2 bg-primary text-primary-foreground disabled:opacity-50 hover:bg-primary/90"
            disabled={!isValid || saving || uploading}
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

function toLocalInput(ts: string): string {
  try {
    const d = new Date(ts);
    const pad = (n: number) => String(n).padStart(2, "0");
    const yyyy = d.getFullYear();
    const mm = pad(d.getMonth() + 1);
    const dd = pad(d.getDate());
    const hh = pad(d.getHours());
    const mi = pad(d.getMinutes());
    return `${yyyy}-${mm}-${dd}T${hh}:${mi}`;
  } catch {
    return "";
  }
}
