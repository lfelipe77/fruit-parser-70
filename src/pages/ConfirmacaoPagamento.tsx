/*
DEV NOTES: Valid sandbox CPFs for testing:
- 52998224725
- 15350946056  
- 11144477735

To use loose validation mode in dev:
Set VITE_PIX_VALIDATE="loose" in .env.local
*/

import React, { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { formatBRL } from "@/lib/formatters";
import { asNumber } from "@/utils/money";
import { CreditCard, Smartphone, Building, ArrowLeft, Share2, Eye } from "lucide-react";
import Navigation from "@/components/Navigation";
import { toConfirm } from "@/lib/nav";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { normalizeCPFForAsaas, tryNormalizeCPF, onlyDigits } from '@/lib/cpf';
import { useMyProfile } from '@/hooks/useMyProfile';
import { edgeBase, edgeHeaders } from "@/helpers/edge";

type RaffleRow = {
  id: string;
  title: string;
  image_url: string | null;
  ticket_price: number;
};

// 1) Helpers FIRST (hoisted function declaration = no TDZ)
function toComboString(input: unknown): string {
  try {
    if (typeof input === "string") return input.replace(/[^\d-]/g, "");
    if (Array.isArray(input)) {
      const flat = (input as unknown[]).flat(2).map(x => String(x).replace(/[^\d]/g, ""));
      return flat.filter(Boolean).join("-");
    }
    return String(input ?? "").replace(/[^\d-]/g, "");
  } catch {
    return "";
  }
}

// derive initial qty safely from URL hash (or pass location in if you prefer)
function deriveInitialQty(): number {
  try {
    const hash = window.location.hash || "";
    const qs = hash.includes("?") ? hash.split("?")[1] : "";
    const sp = new URLSearchParams(qs);
    const q = Number(sp.get("qty"));
    return Number.isFinite(q) && q > 0 ? q : 1;
  } catch {
    return 1;
  }
}

// derive initial combos ONLY from the navigation state we receive
function deriveInitialCombos(navState: any): string[] {
  try {
    const raw = Array.isArray(navState?.selectedNumbers) ? navState.selectedNumbers : [];
    return raw.map(toComboString).filter(Boolean);
  } catch {
    return [];
  }
}

export default function ConfirmacaoPagamento() {
  console.log("[ConfirmacaoPagamento] Component loading...");
  
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { profile: userProfile } = useMyProfile();
  const [sp] = useSearchParams();
  const debugOn = sp.get("debug") === "1";
  const [debugToken, setDebugToken] = useState<string>("");
  const [debugReservationId, setDebugReservationId] = useState<string | null>(null);

  // PIX validation mode from environment (strict by default)
  const pixValidateMode = import.meta.env.VITE_PIX_VALIDATE || 'strict';

  // Router + guard
  const hasNavigatedRef = useRef(false);

  // Resolve raffle_id via reservationId -> reservations.raffle_id if needed
  async function resolveRaffleIdFromReservation(reservationId: string): Promise<string | null> {
    try {
      const { data, error } = await supabase
        .from("tickets")
        .select("raffle_id")
        .eq("reservation_id", reservationId)
        .limit(1)
        .single();
      if (error) {
        console.warn("[payment-status] could not resolve raffle_id:", error);
        return null;
      }
      return data?.raffle_id ?? null;
    } catch (e) {
      console.warn("[payment-status] resolve raffleId error:", e);
      return null;
    }
  }

  function handlePaidNavigate(raffleId: string, reservationId: string) {
    if (hasNavigatedRef.current) return;
    hasNavigatedRef.current = true;
    console.log("[payment-status] PAID → navigating to success");
    // Include reservationId in query for the success page to fetch all details.
    navigate(`/ganhavel/${raffleId}/pagamento-sucesso?reservationId=${encodeURIComponent(reservationId)}`, { replace: true });
  }

  console.log("[ConfirmacaoPagamento] Hook states:", { id, userExists: !!user, authLoading });

  const navState = (location.state ?? {}) as {
    selectedNumbers?: unknown[];
    quantity?: number;
    // ... any other primitives you pass here
  };

  // 2) INITIAL STATE: use lazy initializers that do not reference variables declared below
  const [qty] = React.useState<number>(() =>
    Number.isFinite(Number(navState.quantity)) && Number(navState.quantity) > 0
      ? Number(navState.quantity)
      : deriveInitialQty()
  );

  const [selectedNumbers, setSelectedNumbers] = React.useState<string[]>(() => {
    const fromNav = deriveInitialCombos(navState);
    if (fromNav.length > 0) return fromNav;
    // Fallback to generating new numbers
    const numbers = [];
    for (let i = 0; i < qty; i++) {
      const combo = [];
      for (let j = 0; j < 6; j++) {
        const num = String(Math.floor(Math.random() * 89) + 10).padStart(2, '0');
        combo.push(num);
      }
      numbers.push(`(${combo.join('-')})`);
    }
    return numbers.map(toComboString).filter(Boolean);
  });
  
  // State
  const [raffle, setRaffle] = React.useState<RaffleRow | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [paymentMethod, setPaymentMethod] = React.useState<'pix' | 'card' | 'bank'>('pix');
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [showAllNumbers, setShowAllNumbers] = React.useState(false);
  
  // Form data
  const [formData, setFormData] = React.useState({
    email: '',
    phone: '',
    fullName: '',
    cpf: '',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardName: ''
  });

  // Form validation states
  const [formErrors, setFormErrors] = React.useState({
    name: '',
    phone: '',
    cpf: ''
  });

  // PIX modal state
  const [pix, setPix] = React.useState<{
    open: boolean; 
    qr?: any; 
    paymentId?: string; 
    reservationId?: string; 
    err?: string
  }>({ open: false });

  useEffect(() => {
    (async () => {
      if (!debugOn) return;
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.access_token) setDebugToken(session.access_token);
    })();
  }, [debugOn]);

  // Generate lottery combinations (6 two-digit numbers, like: (12-43-24-56-78-90))
  const generateLotteryCombination = () => {
    const numbers = [];
    for (let i = 0; i < 6; i++) {
      const num = String(Math.floor(Math.random() * 89) + 10).padStart(2, '0');
      numbers.push(num);
    }
    return `(${numbers.join('-')})`;
  };

  const generateNumbers = (count: number) => {
    return Array.from({ length: count }, () => generateLotteryCombination());
  };

  // TODO: Connect to database - persist tickets preview
  const persistTicketsPreview = (numbers: string[]) => {
    // TODO: Insert into tickets table with status='reserved'
    // TODO: Store numbers in ticket_picks table
    console.log('Tickets to persist:', numbers);
  };

  // Numbers are initialized properly in useState, no need for qty effect since qty doesn't change

  // Load raffle data
  React.useEffect(() => {
    let mounted = true;
    const onUpdate = (e: Event) => {
      if (!mounted) return;
      // Safely handle raffle updates
    };
    
    window.addEventListener('raffleUpdated', onUpdate);
    
    (async () => {
      try {
        setLoading(true);
        const { data } = await (supabase as any)
          .from("raffles_public_money_ext")
          .select("id,title,image_url,ticket_price")
          .eq("id", id)
          .maybeSingle();
        
        if (!mounted) return;
        setRaffle((data ?? null) as RaffleRow | null);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    
    return () => {
      mounted = false;
      window.removeEventListener('raffleUpdated', onUpdate);
    };
  }, [id]);

  // Robust payment status polling effect
  useEffect(() => {
    if (!pix.reservationId) return; // Only start polling when we have a reservationId from PIX flow
    
    let timer: number | undefined;
    let stopped = false;

    (async () => {
      // 1) get JWT
      const { data: { session } } = await supabase.auth.getSession();
      const jwt = session?.access_token!;
      const EDGE = import.meta.env.VITE_SUPABASE_EDGE_URL || import.meta.env.VITE_SUPABASE_URL;

      // 2) a safe navigate function that resolves raffleId if missing
      const ensureNavigateToSuccess = async () => {
        const raffleIdKnown: string | undefined = id; // if this page already receives `id` (raffleId) prop/param
        let raffleId = raffleIdKnown;
        if (!raffleId) {
          raffleId = await resolveRaffleIdFromReservation(pix.reservationId!) ?? undefined;
        }
        if (raffleId) {
          handlePaidNavigate(raffleId, pix.reservationId!);
        } else {
          console.warn("[payment-status] PAID but raffleId not resolved yet — retrying on next tick");
        }
      };

      // 3) tick function
      let tries = 0;
      const maxTries = 60;         // ~10 minutes
      const intervalMs = 10_000;

      async function tick() {
        if (stopped || hasNavigatedRef.current) return;
        try {
          const s = await pollPaymentStatus(EDGE, jwt, pix.reservationId!);
          console.log("[payment-status] response:", s);
          const status = String(s?.status || "").toUpperCase();
          if (status === "PAID") {
            await ensureNavigateToSuccess();
            return;
          }
          // PENDING or UNKNOWN → keep polling
        } catch (e) {
          console.warn("[payment-status] error:", e);
        } finally {
          tries++;
          if (tries >= maxTries || hasNavigatedRef.current) {
            if (!hasNavigatedRef.current) {
              console.warn("[payment-status] timeout waiting for PAID");
              setPix(prev => ({ ...prev, err: "Tempo expirado aguardando confirmação." }));
            }
            stopped = true;
            if (timer) clearInterval(timer);
            return;
          }
        }
      }

      // 4) kick now, then set interval
      tick();
      // @ts-ignore
      timer = setInterval(tick, intervalMs);
    })();

    return () => {
      stopped = true;
      if (timer) clearInterval(timer);
    };
  }, [id, pix.reservationId]);

  // Calculations
  const subtotal = (raffle?.ticket_price ?? 0) * qty;
  const fee = 2.00;
  const total = subtotal + fee;

  // Payment polling helper
  async function pollPaymentStatus(EDGE: string, jwt: string, reservationId: string) {
    const url = `${EDGE}/functions/v1/payment-status?reservationId=${encodeURIComponent(reservationId)}`;
    const res = await fetch(url, { headers: edgeHeaders(jwt) });
    const text = await res.text();
    let json: any = null; try { json = text ? JSON.parse(text) : null; } catch {}
    if (!res.ok) throw new Error(`payment-status ${res.status} ${res.statusText}: ${text}`);
    return json; // { status, reservationId, paymentId, asaasStatus? }
  }

  // Handle PIX payment with modal
  async function onPayPix() {
    try {
      // 0) validate form
      if (!validateForm()) {
        toast.error("Por favor, corrija os erros no formulário");
        return;
      }

      // ALWAYS use the same supabase client you use for auth
      const { data: { session } } = await supabase.auth.getSession();
      console.log('[reserve] session?', !!session, session?.user?.id);
      if (!session?.access_token) {
        // force login and bounce back to this page afterwards
        navigate(`/login?redirectTo=${location.pathname}${location.search}`);
        return;
      }

      console.log('[PIX] session?', !!session, session?.user?.id, session?.access_token?.slice(0,16));

      setIsProcessing(true);

      // 2) inputs
      const safeQty = Math.max(1, asNumber(qty, 1));
      const unitPrice = asNumber(raffle?.ticket_price, 0);

      // 3) reserve tickets
      const { data: r1, error: e1 } = await supabase.rpc('reserve_tickets_v2', {
        p_raffle_id: id,
        p_qty: safeQty,
      });
      if (e1 || !r1?.[0]?.reservation_id) {
        console.warn('[reserve_tickets_v2] failed:', e1);
        const msg = e1?.message || e1?.details || e1?.hint || 'Falha ao reservar bilhetes';
        throw new Error(msg);
      }
      const reservation_id = r1[0].reservation_id;
      if (debugOn) setDebugReservationId(reservation_id);
      console.log("[debug] reservation_id", reservation_id);

      // 4) Validate CPF before calling edge function
      const cpfInput = formData.cpf || (userProfile as any)?.tax_id || '';
      let normalizedCPF: string;
      
      try {
        normalizedCPF = normalizeCPFForAsaas(cpfInput);
        console.log('[checkout] sending CPF', { 
          raw: cpfInput, 
          normalized: normalizedCPF, 
          validate: pixValidateMode 
        });
      } catch (err: any) {
        toast.error(err.message || 'CPF inválido. Corrija o documento.');
        throw new Error("CPF validation failed");
      }

      // 5) create PIX on Asaas with minimum value check and validated CPF
      const MIN_PIX_VALUE = 5.00;
      const value = unitPrice * safeQty;
      if (value < MIN_PIX_VALUE) {
        alert(`O valor mínimo para PIX é R$ ${MIN_PIX_VALUE.toFixed(2)}.`);
        throw new Error('Valor abaixo do mínimo PIX');
      }
      
      const EDGE = edgeBase();
      const validateParam = pixValidateMode === 'loose' ? '?validate=loose' : '?validate=strict';
      const res = await fetch(`${EDGE}/functions/v1/asaas-payments-complete${validateParam}`, {
        method: 'POST',
        headers: edgeHeaders(session!.access_token),
        body: JSON.stringify({ 
          reservationId: reservation_id, 
          value: Number(value), 
          description: 'Compra de bilhetes',
          customer: {
            customer_cpf: normalizedCPF,
            customer_name: formData.fullName || userProfile?.full_name,
            customer_phone: formData.phone || (userProfile as any)?.phone
          }
        }),
      });
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        const errorMessage = errorData?.error || 'Erro desconhecido';
        const errorSource = errorData?._where ? ` (${errorData._where})` : '';
        
        if (errorData?.code === 'INVALID_DOCUMENT') {
          toast.error('CPF inválido. Corrija o documento.');
        } else {
          toast.error(`${errorMessage}${errorSource}`);
        }
        throw new Error(`PIX ${res.status}: ${errorMessage}`);
      }
      
      const data = await res.json();
      console.log('[PIX] response', data); // <- keep this so we see fields at runtime

      // 6) show PIX modal with QR normalization fallback
      const qrData = data.qr || data.pix;
      const normalizedQr = qrData ? {
        ...qrData,
        encodedImage: qrData.encodedImage ? 
          (String(qrData.encodedImage).startsWith('data:') ? 
            String(qrData.encodedImage) : 
            `data:image/png;base64,${String(qrData.encodedImage)}`) : ""
      } : null;
      
      setPix({ 
        open: true, 
        qr: normalizedQr, 
        paymentId: data.payment_id, 
        reservationId: reservation_id 
      });

      // 7) Start robust polling with useEffect cleanup
      // We'll trigger the polling effect by setting the reservationId in PIX state

      setIsProcessing(false);
    } catch (err: any) {
      // Try to unwrap Supabase / fetch errors into a readable string
      const msg =
        err?.message ||
        err?.error_description ||
        err?.hint ||
        (typeof err === 'object' ? JSON.stringify(err) : String(err));

      console.error('[PIX] error:', msg, err);
      setPix({ open: false, err: msg });

      // Keep the existing toast but show the real message when available
      try {
        toast.error(msg || 'Pagamento falhou. Tente novamente.');
      } catch {
        // fallback UI
        alert(msg || 'Pagamento falhou. Tente novamente.');
      }
      setIsProcessing(false);
    }
  }

  const handleRegenerateNumbers = () => {
    const numbers = generateNumbers(qty);
    const safeNumbers = numbers.map(toComboString).filter(Boolean);
    setSelectedNumbers(safeNumbers);
    persistTicketsPreview(safeNumbers); // TODO: Connect to DB
  };

  // Helper function to extract only digits
  const digits = (s?: string) => (s ?? '').replace(/\D/g, '');

  // Validate form data with strict CPF validation
  const validateForm = () => {
    const errors = { name: '', phone: '', cpf: '' };
    
    if (formData.fullName.trim().length < 2) {
      errors.name = 'Nome deve ter pelo menos 2 caracteres';
    }
    
    const phoneDigits = digits(formData.phone);
    if (phoneDigits.length < 10 || phoneDigits.length > 13) {
      errors.phone = 'Telefone deve ter entre 10 e 13 dígitos';
    }
    
    // Strict CPF validation using our utility
    const cpfInput = formData.cpf || (userProfile as any)?.tax_id || '';
    if (cpfInput && !tryNormalizeCPF(cpfInput)) {
      errors.cpf = 'CPF inválido. Verifique e tente novamente.';
    } else if (!cpfInput) {
      errors.cpf = 'CPF é obrigatório';
    }
    
    setFormErrors(errors);
    return !errors.name && !errors.phone && !errors.cpf;
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field when user starts typing
    if (field === 'fullName' && formErrors.name) {
      setFormErrors(prev => ({ ...prev, name: '' }));
    }
    if (field === 'phone' && formErrors.phone) {
      setFormErrors(prev => ({ ...prev, phone: '' }));
    }
    if (field === 'cpf' && formErrors.cpf) {
      setFormErrors(prev => ({ ...prev, cpf: '' }));
    }
  };

  // Developer test function
  const handleTestAsaasPayment = async () => {
    try {
      console.log('🧪 Testing Asaas Payment...');
      
      // 1. Get current user session JWT
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        console.error('❌ No user session found');
        return;
      }
      console.log('✅ User session found');

      // 2. Fetch most recent reservation for this user
      const { data: reservations, error: reservationError } = await supabase
        .from('tickets')
        .select('reservation_id')
        .eq('user_id', session.user.id)
        .not('reservation_id', 'is', null)
        .order('created_at', { ascending: false })
        .limit(1);

      if (reservationError || !reservations?.length) {
        console.error('❌ No reservations found:', reservationError);
        return;
      }

      const reservationId = reservations[0].reservation_id;
      console.log('✅ Found reservation:', reservationId);

      // 3. Call Edge Function
      const { data, error } = await supabase.functions.invoke('asaas-payments-complete', {
        body: {
          reservationId,
          value: 15,
          description: 'Teste via DevButton'
        }
      });

      if (error) {
        console.error('❌ Edge function error:', error);
        console.log('Status:', error.status || 'unknown');
        console.log('Body:', error.message || 'no message');
      } else {
        console.log('✅ Edge function success:');
        console.log('Status: 200');
        console.log('Body:', data);
      }

    } catch (err) {
      console.error('❌ Test failed:', err);
    }
  };

  if (loading || authLoading) return <div className="p-6">Carregando…</div>;
  if (!raffle) return <div className="p-6">Rifa não encontrada.</div>;

  return (
    <>
      <Navigation />
      <div className="container mx-auto p-4 max-w-4xl">
        {/* Debug Block */}
        {debugOn && (
          <div className="p-3 rounded-lg border bg-yellow-50 text-xs break-all space-y-3 mb-6">
            <div>
              <div className="font-semibold mb-1">Debug: Session JWT</div>
              <div className="mb-2">{debugToken || "(no session found)"}</div>
              <button
                className="btn btn-sm"
                onClick={() => navigator.clipboard.writeText(debugToken)}
                disabled={!debugToken}
              >
                Copy token
              </button>
            </div>
            {debugReservationId && (
              <div>
                <div className="font-semibold mb-1">Debug: reservation_id</div>
                <div className="mb-2">{debugReservationId}</div>
                <button
                  className="btn btn-sm"
                  onClick={() => navigator.clipboard.writeText(debugReservationId)}
                >
                  Copy reservation_id
                </button>
              </div>
            )}
          </div>
        )}
        
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <Button 
              variant="ghost" 
              onClick={() => navigate(`/ganhavel/${id}`)}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </Button>
            <Button 
              variant="outline" 
              className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white border-0 hover:from-emerald-600 hover:to-emerald-700 shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <Share2 className="mr-2 h-4 w-4" />
              Compartilhe
            </Button>
          </div>
          <h1 className="text-2xl font-bold">Confirmação de Pagamento</h1>
          <p className="text-muted-foreground">Complete seus dados para finalizar a compra</p>
          
          {/* Developer Test Button */}
          {import.meta.env.VITE_ENV === 'dev' && (
            <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
              <p className="text-xs text-orange-700 mb-2">Developer Tools:</p>
              <Button
                onClick={handleTestAsaasPayment}
                variant="outline"
                size="sm"
                className="text-orange-700 border-orange-300 hover:bg-orange-100"
              >
                💳 Test Asaas Payment
              </Button>
            </div>
          )}
        </div>

      <div className="grid gap-6 lg:grid-cols-[1fr,400px]">
        {/* Main Form */}
        <div className="space-y-6">
          {/* Raffle Summary & Selected Numbers */}
          <Card>
            <CardHeader>
              <CardTitle>Resumo da Compra</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <img
                  src={raffle.image_url || "https://placehold.co/100x60?text=Imagem"}
                  alt={raffle.title}
                  className="h-16 w-24 rounded object-cover"
                />
                <div className="flex-1">
                  <h3 className="font-semibold">{String(raffle.title ?? '')}</h3>
                  <p className="text-sm text-muted-foreground">
                    {Number(qty ?? 0)} bilhete{qty > 1 ? 's' : ''} × {formatBRL(Number(raffle.ticket_price ?? 0))}
                  </p>
                </div>
              </div>

              {/* Selected Numbers */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium">Seus Números da Sorte:</h4>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleRegenerateNumbers}
                  >
                    🎲 Gerar Novos
                  </Button>
                </div>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {(Array.isArray(selectedNumbers) ? selectedNumbers : []).map((combination, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                      <span className="font-mono text-sm font-semibold text-emerald-800">{String(combination ?? '')}</span>
                      <div className="text-xs text-emerald-600 font-medium">
                        Bilhete #{index + 1}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between mt-3">
                  <p className="text-xs text-muted-foreground">
                    💡 Estes números são gerados aleatoriamente para você. Clique em "Gerar Novos" se quiser trocar.
                  </p>
                  <Dialog open={showAllNumbers} onOpenChange={setShowAllNumbers}>
                    <DialogTrigger asChild>
                      <Button variant="link" size="sm" className="text-emerald-600 hover:text-emerald-700 p-0 h-auto">
                        <Eye className="mr-1 h-3 w-3" />
                        ver todos os números
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Todos os Seus Números da Sorte</DialogTitle>
                      </DialogHeader>
                      <div className="max-h-96 overflow-y-auto space-y-3 p-4">
                        {(Array.isArray(selectedNumbers) ? selectedNumbers : []).map((combination, index) => (
                          <div key={index} className="flex items-center justify-between p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
                            <div>
                              <span className="font-mono text-lg font-bold text-emerald-800">{String(combination ?? '')}</span>
                            </div>
                            <div className="text-sm text-emerald-600 font-medium bg-emerald-100 px-3 py-1 rounded-full">
                              Bilhete #{index + 1}
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="flex justify-between items-center pt-4 border-t">
                        <div className="text-sm text-muted-foreground">
                           Total: {Number(selectedNumbers.length ?? 0)} bilhete{selectedNumbers.length > 1 ? 's' : ''}
                        </div>
                        <Button onClick={handleRegenerateNumbers} variant="outline">
                          🎲 Gerar Novos Números
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle>Dados de Contato</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="fullName">Nome Completo *</Label>
                  <Input
                    id="fullName"
                    value={formData.fullName}
                    onChange={(e) => handleInputChange('fullName', e.target.value)}
                    placeholder="Seu nome completo"
                    className={formErrors.name ? "border-red-500" : ""}
                  />
                  {formErrors.name && (
                    <p className="text-sm text-red-500 mt-1">{formErrors.name}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="cpf">CPF *</Label>
                  <Input
                    id="cpf"
                    value={formData.cpf}
                    onChange={(e) => handleInputChange('cpf', e.target.value)}
                    placeholder="000.000.000-00"
                    className={formErrors.cpf ? "border-red-500" : ""}
                  />
                  {formErrors.cpf && (
                    <p className="text-sm text-red-500 mt-1">{formErrors.cpf}</p>
                  )}
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="email">E-mail</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="seu@email.com"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Telefone *</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="(11) 99999-9999"
                    className={formErrors.phone ? "border-red-500" : ""}
                  />
                  {formErrors.phone && (
                    <p className="text-sm text-red-500 mt-1">{formErrors.phone}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Order Summary Sidebar */}
        <div className="space-y-6">
          {/* Payment Methods */}
          <Card>
            <CardHeader>
              <CardTitle>Forma de Pagamento</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3">
                <Button
                  variant={paymentMethod === 'pix' ? 'default' : 'outline'}
                  onClick={() => setPaymentMethod('pix')}
                  className="flex items-center gap-2 h-auto p-4 justify-start"
                >
                  <Smartphone className="h-5 w-5" />
                  <div className="text-left">
                    <div className="font-semibold">PIX</div>
                    <div className="text-xs">Aprovação imediata</div>
                  </div>
                </Button>
                
                <Button
                  variant={paymentMethod === 'card' ? 'default' : 'outline'}
                  onClick={() => setPaymentMethod('card')}
                  className="flex items-center gap-2 h-auto p-4 justify-start"
                >
                  <CreditCard className="h-5 w-5" />
                  <div className="text-left">
                    <div className="font-semibold">Cartão</div>
                    <div className="text-xs">Débito ou crédito</div>
                  </div>
                </Button>
                
                <Button
                  variant={paymentMethod === 'bank' ? 'default' : 'outline'}
                  onClick={() => setPaymentMethod('bank')}
                  className="flex items-center gap-2 h-auto p-4 justify-start"
                >
                  <Building className="h-5 w-5" />
                  <div className="text-left">
                    <div className="font-semibold">Boleto</div>
                    <div className="text-xs">Até 3 dias úteis</div>
                  </div>
                </Button>
              </div>

              {/* Card Details */}
              {paymentMethod === 'card' && (
                <div className="mt-4 space-y-4">
                  <div>
                    <Label htmlFor="cardNumber">Número do Cartão</Label>
                    <Input
                      id="cardNumber"
                      value={formData.cardNumber}
                      onChange={(e) => handleInputChange('cardNumber', e.target.value)}
                      placeholder="0000 0000 0000 0000"
                    />
                  </div>
                  <div className="grid gap-4 grid-cols-2">
                    <div>
                      <Label htmlFor="expiryDate">Validade</Label>
                      <Input
                        id="expiryDate"
                        value={formData.expiryDate}
                        onChange={(e) => handleInputChange('expiryDate', e.target.value)}
                        placeholder="MM/AA"
                      />
                    </div>
                    <div>
                      <Label htmlFor="cvv">CVV</Label>
                      <Input
                        id="cvv"
                        value={formData.cvv}
                        onChange={(e) => handleInputChange('cvv', e.target.value)}
                        placeholder="123"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="cardName">Nome no Cartão</Label>
                    <Input
                      id="cardName"
                      value={formData.cardName}
                      onChange={(e) => handleInputChange('cardName', e.target.value)}
                      placeholder="Nome impresso"
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Resumo do Pedido</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between text-sm">
                <span>Bilhetes ({qty}x)</span>
                <span>{formatBRL(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Taxa de processamento</span>
                <span>{formatBRL(fee)}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-semibold text-lg">
                <span>Total</span>
                <span className="text-emerald-600">{formatBRL(total)}</span>
              </div>
              
              <Button 
                onClick={onPayPix}
                disabled={!user || isProcessing || formData.fullName.trim().length < 2 || digits(formData.phone).length < 10 || digits(formData.cpf).length !== 11}
                className="w-full mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
                size="lg"
              >
                {isProcessing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Processando...
                  </>
                ) : !user ? "Fazer Login para Pagar" : `Pagar ${formatBRL(total)}`}
              </Button>
              
              <p className="text-xs text-muted-foreground text-center">
                Seus dados estão protegidos com criptografia SSL
              </p>
            </CardContent>
          </Card>

          {/* Security Info */}
          <Card>
            <CardContent className="pt-6">
              <div className="text-center space-y-2">
                <div className="text-sm font-medium">🔒 Pagamento Seguro</div>
                <p className="text-xs text-muted-foreground">
                  Processado pela Asaas, uma das maiores empresas de pagamento do Brasil
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      </div>

      {/* PIX Modal */}
      {pix.open && pix.qr && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-3">Pague com PIX</h3>
            {(() => {
              // Build a safe data URL from whatever the backend gave us
              const raw = pix.qr?.encodedImage ?? pix.qr?.image ?? '';
              const qrImageSrc = raw
                ? (String(raw).startsWith('data:') ? String(raw) : `data:image/png;base64,${String(raw)}`)
                : '';

              return qrImageSrc ? (
                <img
                  src={qrImageSrc}
                  alt="QR PIX"
                  className="w-64 h-64 mx-auto border rounded-md mb-4 object-contain"
                />
              ) : (
                <div className="w-64 h-64 mx-auto border rounded-md mb-4 flex items-center justify-center">
                  <span className="text-sm opacity-70">QR indisponível — use o código abaixo</span>
                </div>
              );
            })()}
            <div className="flex items-center gap-2">
              <Input
                readOnly
                value={pix.qr.payload}
                className="flex-1"
              />
              <Button
                onClick={() => navigator.clipboard.writeText(pix.qr.payload)}
              >
                Copiar
              </Button>
            </div>
            <p className="text-sm opacity-70 mt-2">
              Expira em: {new Date(pix.qr.expiresAt || pix.qr.expirationDate).toLocaleString()}
            </p>
            {pix.err && (
              <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-700">{pix.err}</p>
              </div>
            )}
            <div className="mt-4 flex justify-between">
              <Button
                variant="outline"
                onClick={async () => {
                  try {
                    const { data: { session } } = await supabase.auth.getSession();
                    const jwt = session?.access_token!;
                    const EDGE = import.meta.env.VITE_SUPABASE_EDGE_URL || import.meta.env.VITE_SUPABASE_URL;
                    const s = await pollPaymentStatus(EDGE, jwt, pix.reservationId!);
                    const status = String(s?.status || "").toUpperCase();
                    if (status === "PAID") {
                      const raffleIdKnown: string | undefined = id;
                      const raffleId = raffleIdKnown ?? (await resolveRaffleIdFromReservation(pix.reservationId!) ?? undefined);
                      if (raffleId) handlePaidNavigate(raffleId, pix.reservationId!);
                      else console.warn("[payment-status] Paid but raffleId unresolved");
                    } else {
                      toast.info("Ainda aguardando confirmação do PIX…");
                    }
                  } catch {
                    toast.error("Não foi possível verificar agora. Tente novamente.");
                  }
                }}
              >
                Já paguei
              </Button>
              <Button onClick={() => setPix({open:false})}>Fechar</Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
