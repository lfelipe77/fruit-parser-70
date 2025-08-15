import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

type Category = { id: number; nome: string };

const brl = (n: number | string | null | undefined) =>
  Number(n ?? 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

// Subcategorias em memória (você pode popular isso depois conforme a categoria)
const SUBCATS: Record<number, string[]> = {
  // 1: ["Smartphones", "Notebooks", "Consoles"],
};

export default function LanceSeuGanhavel() {
  const navigate = useNavigate();

  const [session, setSession] = useState<Awaited<ReturnType<typeof supabase.auth.getSession>>["data"]["session"]>(null);
  const [cats, setCats] = useState<Category[]>([]);

  // Básico
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState<number | "">("");
  const [subcat, setSubcat] = useState<string>("");

  // Local
  const [locationMode, setLocationMode] = useState<"online" | "city">("online");
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");

  // Afiliado
  const [affiliateUrl, setAffiliateUrl] = useState("");

  // Valores
  const [prizeValue, setPrizeValue] = useState<number | "">("");
  const [ticketPrice, setTicketPrice] = useState<number | "">("");

  // Imagens
  const [files, setFiles] = useState<File[]>([]);

  // UI
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  // Sessão
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, []);

  // Categorias
  useEffect(() => {
    supabase
      .from("categories")
      .select("id, nome")
      .order("nome", { ascending: true })
      .then(({ data, error }) => {
        if (error) console.error(error);
        if (data) setCats(data as Category[]);
      });
  }, []);

  const uid = session?.user?.id || null;

  // Calculadora (sem data de sorteio)
  const prize = Number(prizeValue || 0);
  const price = Number(ticketPrice || 0);
  const taxPct = 0.02;
  const taxAmt = Math.round(prize * taxPct * 100) / 100;
  const goal = prize + taxAmt;
  const totalTicketsComputed = price > 0 ? Math.ceil(goal / price) : 0;

  function onPickFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const list = Array.from(e.target.files || []);
    setFiles(prev => [...prev, ...list].slice(0, 5)); // máx 5
  }

  async function uploadAllAndGetUrls(): Promise<string[]> {
    if (!uid || files.length === 0) return [];
    const urls: string[] = [];
    for (const file of files) {
      const path = `${uid}/${Date.now()}-${file.name}`;
      const { error: upErr } = await supabase.storage.from("raffle-images").upload(path, file, {
        upsert: false,
        cacheControl: "3600",
      });
      if (upErr) throw upErr;
      const { data: pub } = supabase.storage.from("raffle-images").getPublicUrl(path);
      if (!pub?.publicUrl) throw new Error("Falha ao obter URL pública da imagem");
      urls.push(pub.publicUrl);
    }
    return urls;
  }

  function buildMetaBlock(gallery: string[]) {
    const local = locationMode === "online" ? "Online" : `${city || ""}, ${country || ""}`.trim();
    const md =
`---

**Meta**
- Local: ${local || "-"}
- Subcategoria: ${subcat || "-"}
- Link do Vendedor: ${affiliateUrl || "-"}
- Galeria: ${gallery.length ? gallery.join(", ") : "-"}

> Observação: O sorteio será definido automaticamente quando a meta atingir 100% (baseado na Loteria Federal/algoritmo oficial).
> Dica: Compartilhe seu Ganhavel para acelerar as vendas! 📣
`;
    return md;
  }

  async function submitUnderReview() {
    if (!uid) return setMsg("Faça login para lançar um Ganhavel.");
    if (!title || !categoryId || !ticketPrice || !prizeValue) {
      return setMsg("Preencha os campos obrigatórios (*).");
    }
    if (files.length === 0) return setMsg("Envie pelo menos 1 imagem do prêmio.");

    setBusy(true);
    setMsg(null);

    try {
      const gallery = await uploadAllAndGetUrls();
      const primary = gallery[0];
      const fullDesc = `${description || ""}\n\n${buildMetaBlock(gallery)}`;
      const totalTickets = totalTicketsComputed > 0 ? totalTicketsComputed : 1;

      // draw_date removido → sempre null
      const { data: newId, error: rpcErr } = await supabase.rpc("create_raffle", {
        p_title: title,
        p_description: fullDesc,
        p_category_id: Number(categoryId),
        p_image_url: primary,
        p_prize_value: Number(prizeValue),
        p_total_tickets: totalTickets,
        p_ticket_price: Number(ticketPrice),
        p_draw_date: null,
      });
      if (rpcErr) throw rpcErr;

      setMsg("Enviado para análise! Você será notificado após a aprovação.");
      setTimeout(() => navigate("/minha-conta"), 900);
    } catch (e: any) {
      console.error(e);
      setMsg(e?.message ?? "Erro ao enviar para análise.");
    } finally {
      setBusy(false);
    }
  }

  async function saveDraft() {
    if (!uid) return setMsg("Faça login para salvar rascunho.");
    if (files.length === 0) return setMsg("Envie pelo menos 1 imagem do prêmio.");

    setBusy(true);
    setMsg(null);

    try {
      const gallery = await uploadAllAndGetUrls();
      const primary = gallery[0];
      const fullDesc = `${description || ""}\n\n${buildMetaBlock(gallery)}`;
      const totalTickets = totalTicketsComputed > 0 ? totalTicketsComputed : 1;

      const { error: insErr } = await supabase.from("raffles").insert({
        owner_user_id: uid,
        title,
        description: fullDesc,
        category_id: categoryId ? Number(categoryId) : null,
        image_url: primary,
        prize_value: prize || null,
        total_tickets: totalTickets,
        ticket_price: price,
        draw_date: null,      // sem data
        status: "draft",
      });
      if (insErr) throw insErr;

      setMsg("Rascunho salvo!");
      setTimeout(() => navigate("/minha-conta"), 900);
    } catch (e: any) {
      console.error(e);
      setMsg(e?.message ?? "Erro ao salvar rascunho.");
    } finally {
      setBusy(false);
    }
  }

  if (!session) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <h1 className="text-2xl font-semibold mb-2">Lance seu Ganhavel</h1>
        <p className="text-gray-600">Faça login para criar um Ganhavel.</p>
      </div>
    );
  }

  const activeSubcats = categoryId && SUBCATS[Number(categoryId)] ? SUBCATS[Number(categoryId)] : [];

  return (
    <div className="max-w-6xl mx-auto p-6 grid lg:grid-cols-5 gap-8">
      {/* ESQUERDA */}
      <div className="lg:col-span-3 grid gap-6">
        <header className="grid gap-1">
          <h1 className="text-2xl font-semibold">Lance seu Ganhavel</h1>
          <p className="text-gray-600">Transforme seus sonhos em realidade e ajude outros a realizarem os deles</p>
          <div className="flex gap-4 text-xs text-gray-500">
            <span>✅ 100% Seguro</span>
            <span>👥 +50.000 Criadores</span>
            <span>⏱️ Análise em 24h</span>
          </div>
        </header>

        {msg && <div className="p-3 rounded bg-amber-50 text-amber-800">{msg}</div>}

        {/* Informações Básicas */}
        <section className="grid gap-3 border rounded-2xl p-4">
          <h2 className="font-medium">Informações Básicas</h2>
          <label className="text-sm">Título do Ganhavel *</label>
          <input className="border rounded p-2" placeholder="Ex: iPhone 15 Pro Max 256GB"
                 value={title} onChange={(e)=>setTitle(e.target.value)} />

          <label className="text-sm">Descrição *</label>
          <textarea className="border rounded p-2 min-h-[120px]"
                    placeholder="Descreva o prêmio, condições, especificações..."
                    value={description} onChange={(e)=>setDescription(e.target.value)} />

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm">Categoria *</label>
              <select className="border rounded p-2 w-full"
                      value={categoryId}
                      onChange={(e)=>setCategoryId(e.target.value ? Number(e.target.value) : "")}>
                <option value="">Selecione...</option>
                {cats.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm">Subcategoria (opcional)</label>
              <select className="border rounded p-2 w-full"
                      value={subcat}
                      onChange={(e)=>setSubcat(e.target.value)}
                      disabled={!activeSubcats.length}>
                <option value="">{activeSubcats.length ? "Selecione..." : "—"}</option>
                {activeSubcats.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
        </section>

        {/* Local e Afiliado */}
        <section className="grid gap-3 border rounded-2xl p-4">
          <h2 className="font-medium">Local</h2>
          <div className="flex gap-6 text-sm">
            <label className="flex items-center gap-2">
              <input type="radio" checked={locationMode==="online"} onChange={()=>setLocationMode("online")} />
              Online
            </label>
            <label className="flex items-center gap-2">
              <input type="radio" checked={locationMode==="city"} onChange={()=>setLocationMode("city")} />
              Cidade
            </label>
          </div>
          {locationMode === "city" && (
            <div className="grid md:grid-cols-2 gap-4">
              <input className="border rounded p-2" placeholder="País"
                     value={country} onChange={(e)=>setCountry(e.target.value)} />
              <input className="border rounded p-2" placeholder="Cidade"
                     value={city} onChange={(e)=>setCity(e.target.value)} />
            </div>
          )}

          <div className="grid gap-2">
            <label className="text-sm">Link do Vendedor (Afiliado) — "Comprar diretamente com o vendedor"</label>
            <input className="border rounded p-2" placeholder="https://…"
                   value={affiliateUrl} onChange={(e)=>setAffiliateUrl(e.target.value)} />
          </div>
        </section>

        {/* Configurações */}
        <section className="grid gap-3 border rounded-2xl p-4">
          <h2 className="font-medium">Configurações</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm">Preço do Bilhete (R$) *</label>
              <input type="number" min={0} step="0.01" className="border rounded p-2 w-full"
                     value={ticketPrice}
                     onChange={(e)=>setTicketPrice(e.target.value===""? "": Number(e.target.value))}/>
            </div>
            <div>
              <label className="text-sm">Valor do Prêmio (R$) *</label>
              <input type="number" min={0} step="0.01" className="border rounded p-2 w-full"
                     value={prizeValue}
                     onChange={(e)=>setPrizeValue(e.target.value===""? "": Number(e.target.value))}/>
            </div>
          </div>

          {/* Número de bilhetes só exibe (final) */}
          <div className="text-sm text-gray-600">
            Bilhetes (calculado): <b>{totalTicketsComputed || "—"}</b>
          </div>
          <p className="text-xs text-gray-500">
            O número de bilhetes é calculado automaticamente considerando 2% de taxa de processamento.
            O sorteio será definido automaticamente quando a meta atingir 100%.
          </p>
        </section>

        {/* Imagens */}
        <section className="grid gap-3 border rounded-2xl p-4">
          <h2 className="font-medium">Imagens do Prêmio</h2>
          <label className="text-sm">PNG/JPG até 10MB cada (máx. 5 imagens). A primeira será a capa.</label>
          <input type="file" accept="image/*" multiple onChange={onPickFiles} />
          {!!files.length && (
            <div className="grid grid-cols-5 gap-3 mt-2">
              {files.map((f, i)=>(
                <div key={i} className="text-xs">
                  <div className="border rounded p-2 truncate">{f.name}</div>
                  {i===0 && <div className="text-[11px] text-gray-500 mt-1">Imagem principal</div>}
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Ações */}
        <div className="flex flex-wrap gap-3">
          <button
            disabled={busy}
            onClick={submitUnderReview}
            className="px-4 py-2 rounded-2xl bg-black text-white disabled:opacity-60">
            {busy ? "Enviando..." : "Enviar para Análise"}
          </button>
          <button
            disabled={busy}
            onClick={saveDraft}
            className="px-4 py-2 rounded-2xl border disabled:opacity-60">
            {busy ? "Salvando..." : "Salvar Rascunho"}
          </button>
        </div>
      </div>

      {/* DIREITA */}
      <aside className="lg:col-span-2 grid gap-6">
        <section className="border rounded-2xl p-4">
          <h3 className="font-medium mb-2">Calculadora</h3>
          <div className="text-sm grid gap-1">
            <div className="flex justify-between"><span>Valor do Prêmio:</span><b>{brl(prize)}</b></div>
            <div className="flex justify-between"><span>Taxa de Processamento (2%):</span><b>+ {brl(taxAmt)}</b></div>
            <div className="flex justify-between"><span>Total a arrecadar:</span><b>{brl(goal)}</b></div>
            <div className="flex justify-between"><span>Preço por Bilhete:</span><b>{price>0? brl(price): "—"}</b></div>
            <div className="flex justify-between"><span>Bilhetes (calculado):</span><b>{totalTicketsComputed || "—"}</b></div>
          </div>
          <p className="text-[12px] text-gray-500 mt-2">
            Os 2% adicionais cobrem o processamento via API e garantem a segurança das transações.
          </p>
        </section>

        <section className="border rounded-2xl p-4">
          <h3 className="font-medium mb-2">Como Funciona</h3>
          <ol className="list-decimal pl-5 text-sm grid gap-1">
            <li>Envie seu Ganhavel — analisamos em até 24h.</li>
            <li>Aprovação — publicamos e promovemos.</li>
            <li>Sorteio — definido automaticamente quando a meta atingir 100% (Loteria Federal/algoritmo oficial).</li>
            <li>Recebimento — transferência após confirmação da entrega.</li>
          </ol>
        </section>

        <section className="border rounded-2xl p-4">
          <h3 className="font-medium mb-1">Compartilhe para fazer acontecer</h3>
          <p className="text-sm text-gray-600">
            A divulgação acelera a arrecadação. Compartilhe seu link com amigos, grupos e redes sociais para alcançar 100% mais rápido.
          </p>
        </section>

        <section className="border rounded-2xl p-4">
          <h3 className="font-medium mb-1">Precisa de Ajuda?</h3>
          <p className="text-sm text-gray-600 mb-3">
            Nossa equipe está pronta para te ajudar a criar a rifa perfeita.
          </p>
          <a href="mailto:suporte@ganhavel.com"
             className="inline-flex px-3 py-2 rounded-2xl bg-emerald-600 text-white text-sm">
            Falar com Suporte
          </a>
        </section>
      </aside>
    </div>
  );
}