import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { RAFFLE_IMAGE_BUCKET, pathForRaffleImage } from "@/lib/storage";

// inline toast to avoid new imports/files
function ToastInline({
  open,
  onClose,
  title = "Pronto!",
  message,
  duration = 2000,
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  message: string;
  duration?: number;
}) {
  React.useEffect(() => {
    if (!open) return;
    const t = window.setTimeout(onClose, duration);
    return () => window.clearTimeout(t);
  }, [open, duration, onClose]);

  if (!open) return null;
  return (
    <div className="fixed bottom-4 right-4 z-[9999]">
      <div className="rounded-xl shadow-lg border bg-white max-w-sm">
        <div className="px-4 py-3">
          <div className="font-semibold">{title}</div>
          <div className="text-sm text-gray-700 mt-1">{message}</div>
          <button
            onClick={onClose}
            className="mt-3 text-xs underline text-gray-600"
          >
            fechar
          </button>
        </div>
      </div>
    </div>
  );
}

// util simples para BRL
function brl(n: number | null | undefined) {
  const v = Number(n ?? 0);
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

// helper de animação simples
function Reveal({ show, children }: { show: boolean; children: React.ReactNode }) {
  return (
    <div
      className={[
        "transition-all duration-300 ease-out overflow-hidden",
        show ? "max-h-24 opacity-100 mt-2" : "max-h-0 opacity-0 mt-0"
      ].join(" ")}
      aria-hidden={!show}
    >
      {children}
    </div>
  );
}

type Category = { id: number; nome: string };
 type Subcat = { id: string; name: string; category_id: number; slug: string };
export default function LanceSeuGanhavel() {
  const navigate = useNavigate();

  // auth
  const [session, setSession] = useState<Awaited<ReturnType<typeof supabase.auth.getSession>>["data"]["session"]>(null);

  // form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState<number | "">("");
  const [subcategoryId, setSubcategoryId] = useState<string>("");
  const [subs, setSubs] = useState<Subcat[]>([]);
  const [locationType, setLocationType] = useState<"online" | "cidade">("online");
  const [city, setCity] = useState("");
  const [affiliateUrl, setAffiliateUrl] = useState("");

  // numeric fields as strings
  const [valueGoal, setValueGoal] = useState<string>("");
  const [valueTicket, setValueTicket] = useState<string>("");

  const [images, setImages] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);

  const [categories, setCategories] = useState<Category[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [toastOpen, setToastOpen] = React.useState(false);
  const [toastMsg, setToastMsg] = React.useState("");
  const redirectTimerRef = React.useRef<number | null>(null);
  React.useEffect(() => () => {
    if (redirectTimerRef.current) window.clearTimeout(redirectTimerRef.current);
  }, []);

  // auth
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, []);

  // categorias
  useEffect(() => {
    supabase
      .from("categories")
      .select("id, nome")
      .order("nome", { ascending: true })
      .then(({ data, error }) => {
        if (error) console.error(error);
        if (data) setCategories(data as Category[]);
      });
  }, []);

  // subcategorias
  useEffect(() => {
    supabase
      .from("subcategories")
      .select("id, name, category_id, slug")
      .order("name", { ascending: true })
      .then(({ data, error }) => {
        if (error) console.error(error);
        if (data) setSubs(data as Subcat[]);
      });
  }, []);

  const subOptions = useMemo(() => {
    const cat = categoryId ? Number(categoryId) : null;
    return subs.filter((s) => (cat ? s.category_id === cat : true));
  }, [subs, categoryId]);

  useEffect(() => { setSubcategoryId(""); }, [categoryId]);

  const userId = useMemo(() => session?.user?.id ?? null, [session]);

  // Cálculo interno para exibir taxa e meta
  const calc = useMemo(() => {
    const pv = Number(valueGoal || 0);
    const tp = Number(valueTicket || 0);
    const fee = Math.round(pv * 0.02 * 100) / 100; // 2% arredondado para centavos
    const goal = Math.round((pv + fee) * 100) / 100;

    return { pv, tp, fee, goal };
  }, [valueGoal, valueTicket]);

  function onFilesSelected(files: FileList | null) {
    if (!files) return;
    const list = Array.from(files).slice(0, 5); // até 5 imagens
    setImages(list);
  }

  async function uploadCoverAndGetUrl(file: File, uid: string) {
    setUploading(true);
    try {
      const path = pathForRaffleImage(uid, file.name);
      const { error: upErr } = await supabase.storage
        .from(RAFFLE_IMAGE_BUCKET)
        .upload(path, file, { upsert: true, contentType: file.type });
      if (upErr) throw upErr;

      const { data } = supabase.storage.from(RAFFLE_IMAGE_BUCKET).getPublicUrl(path);
      if (!data?.publicUrl) throw new Error("Falha ao obter URL pública da imagem");
      return data.publicUrl as string;
    } finally {
      setUploading(false);
    }
  }

  // numeric coercion utility
  const toNum = (v: any, fallback = null) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : fallback;
  };

  // validation - require title and check numeric fields are >= 0
  const canSave = useMemo(() => {
    return (title ?? "").trim().length > 0 &&
      Number(valueGoal) >= 0 &&
      Number(valueTicket) >= 0 &&
      valueGoal !== "" &&
      valueTicket !== "";
  }, [title, valueGoal, valueTicket]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    // Get current user for user_id
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      setErrorMsg("Você precisa estar logado.");
      navigate(`/login?redirectTo=${encodeURIComponent(location.pathname)}`);
      return;
    }

    // Basic validation
    if (!title.trim()) {
      setErrorMsg("Título é obrigatório.");
      return;
    }
    if (!valueGoal || toNum(valueGoal) === null || toNum(valueGoal)! < 0) {
      setErrorMsg("Informe um valor de meta válido.");
      return;
    }
    if (!valueTicket || toNum(valueTicket) === null || toNum(valueTicket)! < 0) {
      setErrorMsg("Informe um preço de bilhete válido.");
      return;
    }
    if (!images.length) {
      setErrorMsg("Envie ao menos 1 imagem.");
      return;
    }

    setSubmitting(true);
    try {
      const uid = session.user.id;

      // Upload image to raffles bucket
      const cover = images[0];
      const path = pathForRaffleImage(uid, cover.name);
      const { error: upErr } = await supabase.storage
        .from(RAFFLE_IMAGE_BUCKET)
        .upload(path, cover, { upsert: true, contentType: cover.type });
      if (upErr) {
        console.error("[upload]", upErr);
        toast.error("Falha ao subir imagem");
        setErrorMsg("Falha ao subir imagem.");
        return;
      }

      const { data: pub } = supabase.storage.from(RAFFLE_IMAGE_BUCKET).getPublicUrl(path);
      const imageUrlPublic = pub.publicUrl;

      const payload = {
        user_id: session.user.id,
        title: title.trim(),
        description: description.trim() || null,
        image_url: imageUrlPublic,

        goal_amount: toNum(valueGoal),
        ticket_price: toNum(valueTicket),

        status: "active",
        category_id: categoryId ? Number(categoryId) : null,
        subcategory_id: subcategoryId || null,
        city: locationType === "cidade" ? city : null,
        state: locationType === "cidade" ? city : null,
        direct_purchase_link: (affiliateUrl ?? '').trim() || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      console.log("[lancar ganhavel] payload", payload);
      const { data, error } = await supabase
        .from("raffles")
        .insert(payload)
        .select("*")
        .single();

      if (error) {
        console.error("[lancar ganhavel] insert error", {
          code: (error as any)?.code,
          message: (error as any)?.message,
          details: (error as any)?.details,
          hint: (error as any)?.hint,
        });
        setErrorMsg("Falha ao lançar ganhavel. Verifique os campos.");
        return;
      }

      setSuccessMsg("Ganhavel lançado com sucesso!");
      setToastMsg("✅ Ganhavel lançado! Navegando para a página do ganhavel...");
      setToastOpen(true);
      redirectTimerRef.current = window.setTimeout(() => {
        navigate(`/ganhavel/${data.id}`);
      }, 1800);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err?.message ?? "Erro ao criar Ganhavel.");
    } finally {
      setSubmitting(false);
    }
  }

  if (!session) {
    return (
      <div className="max-w-5xl mx-auto p-6">
        <h1 className="text-2xl font-semibold mb-3">Lance seu Ganhavel</h1>
        <p>Faça login para criar um Ganhavel.</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <header className="mb-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold">Lance seu Ganhavel</h1>
            <p className="text-gray-700 mt-1">
              Transforme seus sonhos em realidade e ajude outros a realizarem os deles
            </p>
            <div className="flex flex-wrap gap-3 mt-3 text-sm text-gray-600">
              <span className="inline-flex items-center gap-2 bg-gray-100 px-3 py-1 rounded-full">✅ 100% Seguro</span>
              <span className="inline-flex items-center gap-2 bg-gray-100 px-3 py-1 rounded-full">👥 +50.000 Criadores</span>
              <span className="inline-flex items-center gap-2 bg-gray-100 px-3 py-1 rounded-full">⏱️ Análise em 24h</span>
            </div>
          </div>

          <div className="shrink-0 flex gap-2">
            <Link
              to="/"
              className="inline-flex items-center rounded-xl border px-3 py-2 text-sm hover:bg-gray-50"
              title="Voltar para a home"
            >
              <span className="mr-2">🏠</span> Home
            </Link>
            <Link
              to="/dashboard"
              className="inline-flex items-center rounded-xl border px-3 py-2 text-sm hover:bg-gray-50"
              title="Ir para Dashboard"
            >
              📊 Dashboard
            </Link>
          </div>
        </div>
      </header>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* COLUNA PRINCIPAL */}
        <form onSubmit={onSubmit} className="lg:col-span-2 grid gap-6">
          {/* Informações Básicas */}
          <section className="bg-gray-50 rounded-xl border p-4 shadow-sm">
            <h2 className="text-lg font-semibold mb-2">Informações Básicas</h2>

            {errorMsg && (
              <div className="mb-3 p-3 rounded border border-red-200 bg-red-50 text-red-700">
                {errorMsg}
              </div>
            )}
            {successMsg && (
              <div className="mb-3 p-3 rounded border border-green-200 bg-green-50 text-green-800">
                {successMsg}
              </div>
            )}

            <div className="grid gap-4">
              <div>
                <label className="block text-sm font-medium">Título do Ganhavel *</label>
                <input
                  className="mt-1 w-full border rounded-lg p-2"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: iPhone 15 Pro Max 256GB"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium">Descrição *</label>
                <textarea
                  className="mt-1 w-full border rounded-lg p-2"
                  rows={5}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Descreva detalhadamente o prêmio, suas condições, especificações..."
                  required
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium">Categoria *</label>
                  <select
                    className="mt-1 w-full border rounded-lg p-2"
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value ? Number(e.target.value) : "")}
                    required
                  >
                    <option value="">Selecione uma categoria</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.nome}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium">Subcategoria (opcional)</label>
                  <select
                    className="mt-1 w-full border rounded-lg p-2"
                    value={subcategoryId}
                    onChange={(e) => setSubcategoryId(e.target.value)}
                    disabled={!categoryId}
                  >
                    <option value="">{categoryId ? "Selecione uma subcategoria" : "Selecione uma categoria primeiro"}</option>
                    {subOptions.map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium">Local</label>
                  <div className="mt-2 flex gap-4 text-sm">
                    <label className="inline-flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="loc"
                        checked={locationType === "online"}
                        onChange={() => setLocationType("online")}
                        aria-controls="campo-cidade"
                        aria-expanded={false}
                      />
                      Online
                    </label>
                    <label className="inline-flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="loc"
                        checked={locationType === "cidade"}
                        onChange={() => setLocationType("cidade")}
                        aria-controls="campo-cidade"
                        aria-expanded={true}
                      />
                      Cidade
                    </label>
                  </div>

                  {/* Campo Cidade com animação suave */}
                  <Reveal show={locationType === "cidade"}>
                    <input
                      id="campo-cidade"
                      className="w-full border rounded-lg p-2"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="Ex: São Paulo - SP"
                      inputMode="text"
                      autoComplete="address-level2"
                    />
                  </Reveal>
                </div>

                <div>
                  <label className="block text-sm font-medium">Link do Vendedor (Afiliado)</label>
                  <input
                    className="mt-1 w-full border rounded-lg p-2"
                    value={affiliateUrl}
                    onChange={(e) => setAffiliateUrl(e.target.value)}
                    placeholder="Comprar diretamente com o vendedor (URL)"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Configurações */}
          <section className="bg-gray-50 rounded-xl border p-4 shadow-sm">
            <h2 className="text-lg font-semibold mb-2">Configurações</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium">Meta de Arrecadação (R$) *</label>
                <input
                  type="text"
                  inputMode="decimal"
                  className="mt-1 w-full border rounded-lg p-2"
                  value={valueGoal}
                  onChange={(e) => setValueGoal(e.target.value)}
                  placeholder="Ex: 3500.00"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Preço do Bilhete (R$) *</label>
                <input
                  type="text"
                  inputMode="decimal"
                  className="mt-1 w-full border rounded-lg p-2"
                  value={valueTicket}
                  onChange={(e) => setValueTicket(e.target.value)}
                  placeholder="Ex: 25.00"
                  required
                />
              </div>
            </div>

            <p className="text-sm text-gray-600 mt-3">
              Configure a meta de arrecadação e preço dos bilhetes. O sorteio será definido automaticamente quando a meta for atingida.
            </p>
          </section>

          {/* Imagens */}
          <section className="bg-gray-50 rounded-xl border p-4 shadow-sm">
            <h2 className="text-lg font-semibold mb-2">Imagens do Prêmio</h2>
            <p className="text-sm text-gray-600 mb-3">
              PNG/JPG até 10MB cada (máx. 5 imagens). A <b>primeira</b> será a capa exibida na listagem.
            </p>
            <label className="block">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => onFilesSelected(e.target.files)}
              />
            </label>

            {images.length > 0 && (
              <div className="mt-3 grid grid-cols-2 md:grid-cols-3 gap-3">
                {images.map((f, i) => (
                  <div key={i} className="border rounded-lg p-2 text-sm">
                    <div className="text-xs text-gray-500 mb-1 truncate">{f.name}</div>
                    <div className={`inline-block px-2 py-0.5 rounded ${i === 0 ? "bg-blue-50 text-blue-700 border border-blue-200" : "bg-gray-100 text-gray-700"}`}>
                      {i === 0 ? "Imagem principal" : "Imagem"}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Ações */}
          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={submitting || uploading || !canSave}
              className="inline-flex items-center justify-center rounded-lg bg-black text-white px-4 py-2 disabled:opacity-60"
              title={uploading ? "Enviando imagem..." : canSave ? "Lançar Ganhavel" : "Preencha os campos obrigatórios"}
            >
              {submitting ? "Enviando..." : uploading ? "Processando imagens..." : "Lançar"}
            </button>

            <button
              type="button"
              disabled
              className="inline-flex items-center justify-center rounded-lg bg-gray-200 text-gray-600 px-4 py-2 cursor-not-allowed"
              title="Rascunho indisponível — o RPC cria como 'under_review'"
            >
              Salvar Rascunho
            </button>
          </div>
        </form>

        {/* COLUNA DIREITA */}
        <aside className="grid gap-6">
          {/* Calculadora */}
          <section className="bg-white rounded-xl border p-4 shadow-sm">
            <h3 className="text-lg font-semibold mb-2">Calculadora</h3>
            <div className="grid gap-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Valor do Prêmio:</span>
                <span className="font-medium">{brl(calc.pv)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Taxa de Processamento (2%):</span>
                <span className="font-medium">+ {brl(calc.fee)}</span>
              </div>
              <div className="flex items-center justify-between border-t pt-2">
                <span className="text-gray-800 font-medium">Total a arrecadar:</span>
                <span className="font-semibold">{brl(calc.goal)}</span>
              </div>

              <div className="mt-3 p-2 bg-green-50 border border-green-200 rounded text-green-800 font-semibold">
                Meta a atingir: {brl(calc.goal)} — Quando atingida, o sorteio acontece automaticamente ✅
              </div>

              <p className="text-xs text-gray-600 mt-2">
                Os 2% adicionais cobrem o processamento via API e garantem a segurança das transações.
              </p>
            </div>
          </section>

          {/* Como Funciona / Ajuda */}
          <section className="bg-white rounded-xl border p-4 shadow-sm">
            <h3 className="text-lg font-semibold mb-2">Como Funciona</h3>
            <ol className="list-decimal pl-5 space-y-1 text-sm text-gray-700">
              <li>Envie seu Ganhavel — analisamos em até 24h.</li>
              <li>Aprovação — publicamos e promovemos.</li>
              <li>Sorteio — definido automaticamente ao atingir 100% (Loteria Federal/algoritmo oficial).</li>
              <li>Recebimento — transferência após confirmação da entrega.</li>
            </ol>

            <div className="mt-4 p-3 rounded-lg bg-blue-50 border border-blue-200">
              <h4 className="font-medium text-blue-900 mb-1">Compartilhe para fazer acontecer</h4>
              <p className="text-sm text-blue-900/90">
                A divulgação acelera a arrecadação. Compartilhe seu link com amigos, grupos e redes sociais.
              </p>
            </div>

            <div className="mt-4">
              <h4 className="font-medium mb-1">Precisa de Ajuda?</h4>
              <p className="text-sm text-gray-700 mb-2">
                Nossa equipe está pronta para te ajudar a criar a rifa perfeita.
              </p>
              <a
                href="mailto:suporte@ganhavel.com"
                className="inline-flex items-center justify-center rounded-lg bg-black text-white px-4 py-2"
              >
                Falar com Suporte
              </a>
            </div>
          </section>
        </aside>
      </div>

        <ToastInline
          open={toastOpen}
          onClose={() => setToastOpen(false)}
          title="Ganhavel enviado!"
          message={toastMsg}
        />
    </div>
  );
}