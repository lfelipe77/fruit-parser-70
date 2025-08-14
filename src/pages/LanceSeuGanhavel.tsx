import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

type Category = {
  id: number;
  nome: string;
};

export default function LanceSeuGanhavel() {
  const navigate = useNavigate();
  const [session, setSession] = useState<Awaited<ReturnType<typeof supabase.auth.getSession>>["data"]["session"]>(null);

  // form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState<number | "">("");
  const [prizeValue, setPrizeValue] = useState<number | "">("");
  const [totalTickets, setTotalTickets] = useState<number | "">("");
  const [ticketPrice, setTicketPrice] = useState<number | "">("");
  const [drawDate, setDrawDate] = useState<string>(""); // ISO local datetime
  const [imageFile, setImageFile] = useState<File | null>(null);

  const [categories, setCategories] = useState<Category[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // load auth session
  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setSession(data.session);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, sess) => setSession(sess));
    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  // load categories (public select allowed by RLS)
  useEffect(() => {
    let active = true;
    supabase
      .from("categories")
      .select("id, nome")
      .order("nome", { ascending: true })
      .then(({ data, error }) => {
        if (!active) return;
        if (error) {
          console.error("Load categories error:", error);
        } else if (data) {
          setCategories(data as Category[]);
        }
      });
    return () => {
      active = false;
    };
  }, []);

  const userId = useMemo(() => session?.user?.id ?? null, [session]);

  async function uploadImageAndGetUrl(file: File, uid: string) {
    const path = `${uid}/${Date.now()}-${file.name}`;
    // 1) upload
    const { error: upErr } = await supabase.storage.from("raffle-images").upload(path, file, {
      cacheControl: "3600",
      upsert: false,
    });
    if (upErr) throw upErr;

    // 2) get public url
    const { data: pub } = supabase.storage.from("raffle-images").getPublicUrl(path);
    if (!pub?.publicUrl) throw new Error("Falha ao obter URL pública da imagem");
    return pub.publicUrl;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!userId) {
      setErrorMsg("Você precisa estar logado para criar um Ganhavel.");
      return;
    }
    if (!imageFile) {
      setErrorMsg("Selecione uma imagem do prêmio.");
      return;
    }
    if (!categoryId || !title || !totalTickets || !ticketPrice) {
      setErrorMsg("Preencha os campos obrigatórios.");
      return;
    }

    setSubmitting(true);
    try {
      const imageUrl = await uploadImageAndGetUrl(imageFile, userId);

      // draw_date in UTC (optional): if user provided local datetime, convert to ISO
      const drawDateIso = drawDate ? new Date(drawDate).toISOString() : null;

      // call RPC to create raffle (status = under_review)
      const { data: newId, error: rpcErr } = await supabase.rpc("create_raffle", {
        p_title: title,
        p_description: description || null,
        p_category_id: Number(categoryId),
        p_image_url: imageUrl,
        p_prize_value: prizeValue === "" ? null : Number(prizeValue),
        p_total_tickets: Number(totalTickets),
        p_ticket_price: Number(ticketPrice),
        p_draw_date: drawDateIso,
      });

      if (rpcErr) throw rpcErr;

      setSuccessMsg("Ganhavel criado! Enviado para revisão.");
      // optional: redirect to dashboard or raffle detail
      setTimeout(() => {
        navigate("/minha-conta"); // ajuste a rota desejada
      }, 800);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err?.message ?? "Erro ao criar Ganhavel.");
    } finally {
      setSubmitting(false);
    }
  }

  if (!session) {
    return (
      <div className="max-w-xl mx-auto p-6">
        <h1 className="text-2xl font-semibold mb-4">Lançar Ganhavel</h1>
        <p>Faça login para lançar um Ganhavel.</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4">Lançar Ganhavel</h1>

      {errorMsg && <div className="mb-4 p-3 rounded bg-red-100 text-red-800">{errorMsg}</div>}
      {successMsg && <div className="mb-4 p-3 rounded bg-green-100 text-green-800">{successMsg}</div>}

      <form onSubmit={onSubmit} className="grid gap-4">
        <div>
          <label className="block text-sm font-medium">Título*</label>
          <input
            className="mt-1 w-full border rounded p-2"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ex.: iPhone 15 Pro"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Descrição</label>
          <textarea
            className="mt-1 w-full border rounded p-2"
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Detalhes do prêmio, regras, etc."
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Categoria*</label>
          <select
            className="mt-1 w-full border rounded p-2"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value ? Number(e.target.value) : "")}
            required
          >
            <option value="">Selecione...</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nome}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium">Valor do Prêmio (R$)</label>
            <input
              type="number"
              className="mt-1 w-full border rounded p-2"
              value={prizeValue}
              onChange={(e) => setPrizeValue(e.target.value === "" ? "" : Number(e.target.value))}
              min={0}
              step="0.01"
              placeholder="Opcional"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Preço por Bilhete (R$)*</label>
            <input
              type="number"
              className="mt-1 w-full border rounded p-2"
              value={ticketPrice}
              onChange={(e) => setTicketPrice(e.target.value === "" ? "" : Number(e.target.value))}
              min={0}
              step="0.01"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium">Total de Bilhetes*</label>
            <input
              type="number"
              className="mt-1 w-full border rounded p-2"
              value={totalTickets}
              onChange={(e) => setTotalTickets(e.target.value === "" ? "" : Number(e.target.value))}
              min={1}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Data do Sorteio</label>
            <input
              type="datetime-local"
              className="mt-1 w-full border rounded p-2"
              value={drawDate}
              onChange={(e) => setDrawDate(e.target.value)}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium">Imagem do Prêmio*</label>
          <input
            type="file"
            accept="image/*"
            className="mt-1 w-full"
            onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
            required
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center justify-center rounded bg-black text-white px-4 py-2 disabled:opacity-60"
        >
          {submitting ? "Enviando..." : "Criar Ganhavel"}
        </button>
      </form>
    </div>
  );
}