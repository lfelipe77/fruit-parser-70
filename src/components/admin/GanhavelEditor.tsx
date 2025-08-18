import { useEffect, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { nanoid } from "nanoid";

export interface GanhavelEditorProps {
  id: string | null;
  onClose: () => void;
  onSaved: (id: string) => void;
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

export function GanhavelEditor({ id, onClose, onSaved }: GanhavelEditorProps) {
  const { user } = useAuth();
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
  const [loading, setLoading] = useState<boolean>(!!id);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);

  // Load row
  useEffect(() => {
    let active = true;
    const load = async () => {
      if (!id) return; // new
      setLoading(true);
      const { data, error } = await supabase
        .from("ganhaveis")
        .select("*")
        .eq("id", id)
        .maybeSingle();
      if (!active) return;
      if (error) {
        console.error("Erro ao carregar ganhavel:", error);
        toast({ title: "Erro", description: "Falha ao carregar ganhavel.", variant: "destructive" });
      } else if (data) {
        const row: any = data as any;
        setForm({
          title: row.title ?? "",
          description: row.description ?? "",
          image_url: row.image_url ?? null,
          goal_amount: row.goal_amount != null ? String(row.goal_amount) : "",
          ticket_price: row.ticket_price != null ? String(row.ticket_price) : "",
          total_tickets: row.total_tickets != null ? String(row.total_tickets) : "",
          status: (row.status as FormState["status"]) ?? "pending",
          product_name: row.product_name ?? "",
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
      }
      setLoading(false);
    };
    load();
    return () => { active = false; };
  }, [id, toast]);

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
      const key = `images/${id ?? nanoid()}/${Date.now()}-${nanoid()}.${ext}`;
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

      let savedId = id;
      if (id) {
        const { data, error } = await supabase
          .from("ganhaveis")
          .update(payload)
          .eq("id", id)
          .select()
          .single();
        if (error) throw error;
        savedId = data?.id ?? id;
        toast({ title: "Ganhavel atualizado", description: "As alterações foram salvas." });
      } else {
        const { data, error } = await supabase
          .from("ganhaveis")
          .insert([{ ...payload, creator_id: user?.id ?? null }])
          .select()
          .single();
        if (error) throw error;
        savedId = data?.id;
        toast({ title: "Ganhavel criado", description: "Registro criado com sucesso." });
      }

      if (savedId) onSaved(savedId);
    } catch (err) {
      console.error("Save error", err);
      toast({ title: "Erro", description: "Falha ao salvar ganhavel.", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const currency = (n: number | null | undefined) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(n || 0));

  return (
    <div className="grid gap-4 py-2">
      {loading ? (
        <div className="animate-pulse h-24 bg-muted rounded" />
      ) : null}

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
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          />
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

      <div className="flex justify-end gap-2 pt-2">
        <Button variant="outline" onClick={onClose}>Cancelar</Button>
        <Button onClick={handleSave} disabled={!isValid || saving || uploading}>
          {saving ? "Salvando..." : uploading ? "Enviando..." : "Salvar"}
        </Button>
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
