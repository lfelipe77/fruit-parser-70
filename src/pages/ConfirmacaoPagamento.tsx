import React, { useMemo } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { formatBRL } from "@/lib/formatters";
import { asNumber, computeCheckout } from "@/utils/money";
import { CreditCard, Smartphone, Building, ArrowLeft, Share2, Eye, RefreshCw } from "lucide-react";
import Navigation from "@/components/Navigation";
import { toConfirm } from "@/lib/nav";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";
import PixPaymentModal from "@/components/PixPaymentModal";
import { isDebugMode, logDebugInfo } from "@/utils/envDebug";
import { nanoid } from "nanoid";

type RaffleRow = {
  id: string;
  title: string;
  image_url: string | null;
  ticket_price: number;
};

type ServerState = {
  ok: boolean;
  source: 'pending' | 'transactions';
  reservationId: string;
  raffleId: string;
  status: 'pending' | 'paid' | 'expired' | 'failed';
  qty: number;
  unitPrice: number;
  amount: number;
  numbers: string[];
  transaction: {
    id: string | null;
    provider: string | null;
    providerPaymentId: string | null;
    paidAt: string | null;
  };
  debug: {
    hasTicketsPaid: boolean;
  };
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

// Safe localStorage parsing with fallback
function safeParseLocalStorage(key: string): any {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  } catch {
    // Clear invalid data and return null
    localStorage.removeItem(key);
    return null;
  }
}

export default function ConfirmacaoPagamento() {
  console.log("[ConfirmacaoPagamento] Component loading...");
  
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [isMounted, setIsMounted] = React.useState(true);
  const [isOffline, setIsOffline] = React.useState(false);

  console.log("[ConfirmacaoPagamento] Hook states:", { id, userExists: !!user, authLoading });

  // Get query params
  const searchParams = new URLSearchParams(location.search);
  const reservationUuid = useMemo(() => 
    searchParams.get('reservationId') || crypto.randomUUID(), 
    [searchParams]
  );
  const reservationId = reservationUuid;
  const raffleId = id || searchParams.get('raffleId');

  // Server state for persistence
  const [serverState, setServerState] = React.useState<ServerState | null>(null);
  const [stateMachineInitialized, setStateMachineInitialized] = React.useState(false);

  // Track component mount status
  React.useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  // Debug instrumentation (only when ?debug=1)
  React.useEffect(() => {
    if (!isDebugMode()) return;

    const supabaseUrl = "https://whqxpuyjxoiufzhvqneg.supabase.co";
    
    logDebugInfo("ConfirmacaoPagamento:Mount", {
      edgeBaseUrl: supabaseUrl,
      endpoints: [
        `${supabaseUrl}/functions/v1/create-checkout`,
        `${supabaseUrl}/functions/v1/confirm-state-upsert`,
        `${supabaseUrl}/functions/v1/confirm-state-get`,
      ],
      headers: {
        "Content-Type": "present",
        "Authorization": user ? "present (Bearer session.access_token)" : "missing",
        "apikey": "present (anon key)"
      },
      maskedSession: user ? {
        userId: "****" + (user.id?.slice(-4) || ""),
        hasAccessToken: !!(user as any)?.access_token
      } : null
    });
  }, [user]);

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
      for (let j = 0; j < 5; j++) {
        const num = String(Math.floor(Math.random() * 100)).padStart(2, '0');
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
  const [showPixModal, setShowPixModal] = React.useState(false);
  const [pixPaymentData, setPixPaymentData] = React.useState<any>(null);
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

  // Generate lottery combinations (5 two-digit numbers, like: (12-43-24-56-78))
  const generateLotteryCombination = () => {
    const numbers = [];
    for (let i = 0; i < 5; i++) {
      const num = String(Math.floor(Math.random() * 100)).padStart(2, '0');
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

  // State for checkout calculations
  const [checkoutData, setCheckoutData] = React.useState({
    adjustedQty: qty,
    fee: 2.00,
    subtotal: 0,
    chargeTotal: 0
  });
  
  const qtyAdjusted = checkoutData.adjustedQty !== qty;

  // Calculate checkout in useEffect instead of useMemo
  React.useEffect(() => {
    if (!isMounted) return;
    
    const computed = computeCheckout(raffle?.ticket_price ?? 0, qty);
    setCheckoutData({
      adjustedQty: computed.qty,
      fee: computed.fee,
      subtotal: computed.subtotal,
      chargeTotal: computed.chargeTotal
    });
  }, [raffle?.ticket_price, qty, isMounted]);

  // Debug: log computed amounts and reservation
  React.useEffect(() => {
    if (!isDebugMode() || !isMounted) return;
    try {
      logDebugInfo("ConfirmacaoPagamento:Computed", {
        reservation_id: reservationId,
        qty: checkoutData.adjustedQty,
        unit_price: raffle?.ticket_price || 0,
        subtotal: checkoutData.subtotal,
        fee: checkoutData.fee,
        total: checkoutData.chargeTotal
      });
    } catch (_) { /* no-op */ }
  }, [reservationId, checkoutData, raffle?.ticket_price, isMounted]);

  // State machine initialization and server persistence
  React.useEffect(() => {
    let mounted = true;

    async function initializeStateMachine() {
      if (!user || !raffleId || stateMachineInitialized || !isMounted) return;

      try {
        setIsOffline(false);
        
        // Get session for auth
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.access_token || !mounted) return;

        // Build context from current page state
        const contextData = {
          reservationId,
          raffleId,
          qty,
          unitPrice: raffle?.ticket_price || 0,
          amount: checkoutData.subtotal, // IMPORTANT: tickets only (used by money views)
          numbers: selectedNumbers,
          buyerUserId: user.id,
          pageFingerprint: `confirm-${raffleId}-${Date.now()}`,
          uiState: {
            cameFrom: `ganhavel/${raffleId}`,
            ts: Date.now(),
            paymentMethod,
            formData,
            // Store fee info for audit and ASAAS payment
            institutional_fee: checkoutData.fee,
            charge_total: checkoutData.chargeTotal,
            qty: checkoutData.adjustedQty,
            unit_price: raffle?.ticket_price || 0
          }
        };

        // Persist context to server
        const { data: upsertResult, error: upsertError } = await supabase.functions.invoke('confirm-state-upsert', {
          body: contextData,
          headers: {
            Authorization: `Bearer ${session.access_token}`
          }
        });

        if (upsertError) {
          console.error('Failed to upsert state:', upsertError);
          setIsOffline(true);
          return;
        }

        // Store local backup with safe handling
        try {
          localStorage.setItem(`confirm.${reservationId}`, JSON.stringify(contextData));
        } catch {
          // Ignore localStorage errors
        }

        // Get current state from server
        const getUrl = `https://whqxpuyjxoiufzhvqneg.supabase.co/functions/v1/confirm-state-get?reservationId=${reservationId}`;
        const getResponse = await fetch(getUrl, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!getResponse.ok) {
          setIsOffline(true);
          // Try to load from localStorage as fallback
          const backup = safeParseLocalStorage(`confirm.${reservationId}`);
          if (backup && mounted) {
            console.log('Using localStorage backup due to network error');
          }
          return;
        }

        const getResult = await getResponse.json();

        if (getResult?.ok && mounted && isMounted) {
          setServerState(getResult);
          setStateMachineInitialized(true);
          
          // Log network success for debug
          if (isDebugMode()) {
            logDebugInfo("ConfirmacaoPagamento:NetworkSuccess", {
              reservation_id: reservationId,
              network_call_success: true
            });
          }
        }

      } catch (error) {
        console.error('State machine initialization error:', error);
        setIsOffline(true);
        
        // Try localStorage fallback
        const backup = safeParseLocalStorage(`confirm.${reservationId}`);
        if (backup && mounted && isMounted) {
          console.log('Using localStorage backup due to error');
        }
      }
    }

    initializeStateMachine();

    return () => {
      mounted = false;
    };
  }, [user, raffleId, raffle?.ticket_price, selectedNumbers, checkoutData.chargeTotal, qty, paymentMethod, formData, isMounted]);

  // Load raffle data with isMounted guard
  React.useEffect(() => {
    let mounted = true;
    const onUpdate = (e: Event) => {
      if (!mounted || !isMounted) return;
      // Safely handle raffle updates
    };
    
    window.addEventListener('raffleUpdated', onUpdate);
    
    (async () => {
      if (!isMounted) return;
      
      try {
        setLoading(true);
        const { data } = await (supabase as any)
          .from("raffles_public_money_ext")
          .select("id,title,image_url,ticket_price")
          .eq("id", raffleId)
          .maybeSingle();
        
        if (!mounted || !isMounted) return;
        setRaffle((data ?? null) as RaffleRow | null);
      } catch (error) {
        console.error('Failed to load raffle:', error);
        if (mounted && isMounted) {
          setIsOffline(true);
        }
      } finally {
        if (mounted && isMounted) setLoading(false);
      }
    })();
    
    return () => {
      mounted = false;
      window.removeEventListener('raffleUpdated', onUpdate);
    };
  }, [raffleId, isMounted]);

  // Handle form submission
  async function handlePayment() {
    // Double-submit guard
    if (isProcessing) {
      console.log("[payment] Already processing, ignoring duplicate submit");
      return;
    }

    try {
      setIsProcessing(true);

      // 1) Validate form first
      if (!validateForm()) {
        toast({
          title: "Formulário inválido",
          description: "Por favor, corrija os erros no formulário",
          variant: "destructive"
        });
        return;
      }

      // 2) Require auth
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        const url = new URL("/login", window.location.origin);
        url.searchParams.set("redirectTo", location.pathname + location.search);
        navigate(url.pathname + url.search, { replace: true });
        return;
      }

      // 3) Inputs - tickets only (excluding institutional fee)
      const safeQty = Math.max(1, asNumber(qty, 1));
      const unitPrice = asNumber(raffle?.ticket_price, 0);
      const totalPaid = +(unitPrice * safeQty).toFixed(2); // subtotal only (excludes fee)

      const payloadData = {
        provider: 'asaas',
        method: 'pix',
        reservation_id: reservationId,
        raffle_id: id,
        qty: safeQty,
        amount: unitPrice * safeQty,
        currency: 'BRL',
        buyer: {
          fullName: formData.fullName,
          phone: digits(formData.phone),
          cpf: digits(formData.cpf)
        }
      };

      // Log before invoke
      console.log("[payment] Calling create-checkout", {
        reservationId: reservationUuid,
        raffleId: id,
        qty: safeQty,
        amount: payloadData.amount,
        expectedUrl: "https://whqxpuyjxoiufzhvqneg.supabase.co/functions/v1/create-checkout"
      });

      // 4) Call create-checkout with Asaas PIX
      const { data: checkoutData, error } = await supabase.functions.invoke('create-checkout', {
        body: payloadData
      });

      // Log response
      if (error) {
        const r = error?.context?.response;
        console.error('[payment] invoke error:', error.message);
        if (r) console.error('[payment] body:', await r.text());
        else console.error('[payment] no response in error.context');
        
        // dev-only fallback fetch (so we *always* see status/body)
        try {
          const url = `https://whqxpuyjxoiufzhvqneg.supabase.co/functions/v1/create-checkout`;
          const resp = await fetch(url, {
            method: 'POST',
            headers: {
              'Content-Type':'application/json',
              'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndocXhwdXlqeG9pdWZ6aHZxbmVnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQxNjYyODMsImV4cCI6MjA2OTc0MjI4M30.lXLlvJkB48KSUsroImqkZSjNLpQjg7Pe_bYH5h6ztjo`
            },
            body: JSON.stringify(payloadData)
          });
          const text = await resp.text();
          console.log('[payment] fetch status', resp.status, 'body:', text);
        } catch {}
        
        toast({
          title: "Erro no pagamento",
          description: "Pagamento falhou. Tente novamente.",
          variant: "destructive"
        });
        return;
      }

      console.log("[payment] create-checkout success", {
        reservationId,
        responseKeys: checkoutData ? Object.keys(checkoutData) : [],
        hasPaymentId: !!checkoutData?.asaas_payment_id
      });

      // Debug: Log checkout response structure (only when ?debug=1)
      if (isDebugMode()) {
        logDebugInfo("ConfirmacaoPagamento:CheckoutResponse", {
          function: "create-checkout",
          success: !error,
          responseKeys: checkoutData ? Object.keys(checkoutData) : [],
          errorPresent: !!error,
          maskedPaymentId: checkoutData?.asaas_payment_id ? "****" + String(checkoutData.asaas_payment_id).slice(-4) : null
        });
      }

      // 5) Show PIX modal for embedded payment
      if (!checkoutData?.provider_payment_id) {
        console.error("[payment] No payment ID in checkout response:", checkoutData);
        toast({
          title: "Erro na criação do pagamento",
          description: "Tente novamente.",
          variant: "destructive"
        });
        return;
      }

      // Check if we have PIX data for embedded payment
      if (checkoutData.pix_qr_code || checkoutData.pix_copy_paste) {
        console.log("[payment] Opening PIX modal:", {
          payment_id: checkoutData.provider_payment_id,
          amount: checkoutData.charge_total,
          has_qr: !!checkoutData.pix_qr_code,
          has_copy_paste: !!checkoutData.pix_copy_paste
        });

        setPixPaymentData({
          provider_payment_id: checkoutData.provider_payment_id,
          amount: checkoutData.charge_total,
          pix_qr_code: checkoutData.pix_qr_code,
          pix_copy_paste: checkoutData.pix_copy_paste,
          reservation_id: reservationId,
          raffle_id: id,
          qty: safeQty
        });
        setShowPixModal(true);
      } else {
        // Fallback to redirect if no PIX data
        console.warn("[payment] No PIX data, falling back to redirect");
        if (checkoutData.redirect_url) {
          window.location.href = checkoutData.redirect_url;
        } else {
          toast({
            title: "Erro no pagamento",
            description: "Dados PIX não encontrados. Tente novamente.",
            variant: "destructive"
          });
        }
      }
    } catch (e: any) {
      console.error("[payment] unexpected error", {
        error: e,
        message: e.message,
        reservationId
      });
      toast({
        title: "Erro no pagamento",
        description: "Pagamento falhou. Tente novamente.",
        variant: "destructive"
      });
    } finally {
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

  // Validate form data
  const validateForm = () => {
    const errors = { name: '', phone: '', cpf: '' };
    
    if (formData.fullName.trim().length < 2) {
      errors.name = 'Nome deve ter pelo menos 2 caracteres';
    }
    
    const phoneDigits = digits(formData.phone);
    if (phoneDigits.length < 10 || phoneDigits.length > 13) {
      errors.phone = 'Telefone deve ter entre 10 e 13 dígitos';
    }
    
    const cpfDigits = digits(formData.cpf);
    if (cpfDigits.length !== 11) {
      errors.cpf = 'CPF deve ter exatamente 11 dígitos';
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

  // Show login required if no user
  if (!authLoading && !user) {
    return (
      <>
        <Navigation />
        <div className="container mx-auto p-4 max-w-4xl text-center">
          <h1 className="text-2xl font-bold mb-4">Login Necessário</h1>
          <p className="text-muted-foreground mb-4">Você precisa estar logado para confirmar o pagamento.</p>
          <Button onClick={() => navigate('/login')}>Fazer Login</Button>
        </div>
      </>
    );
  }

  if (loading || authLoading) return <div className="p-6">Carregando…</div>;
  if (!raffle) return <div className="p-6">Rifa não encontrada.</div>;

  // Determine status from server state
  const currentStatus = serverState?.status || 'pending';
  const statusBadges = {
    pending: { text: 'Aguardando Confirmação', color: 'bg-yellow-100 text-yellow-800' },
    paid: { text: 'Pagamento Aprovado', color: 'bg-green-100 text-green-800' },
    expired: { text: 'Expirado', color: 'bg-gray-100 text-gray-800' },
    failed: { text: 'Falhou', color: 'bg-red-100 text-red-800' }
  };
  const currentBadge = statusBadges[currentStatus];

  return (
    <>
      <Navigation />
      <div className="container mx-auto p-4 max-w-4xl">
        {/* Offline Banner */}
        {isOffline && (
          <div className="mb-4 bg-orange-50 border border-orange-200 rounded-lg p-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 bg-orange-500 rounded-full"></div>
              <span className="text-sm text-orange-800">Conectividade limitada. Alguns dados podem estar desatualizados.</span>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => window.location.reload()}
              className="text-orange-700 border-orange-300 hover:bg-orange-100"
            >
              <RefreshCw className="h-3 w-3 mr-1" />
              Tentar novamente
            </Button>
          </div>
        )}

        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <Button 
              variant="ghost" 
              onClick={() => navigate(`/ganhavel/${raffleId}`)}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </Button>
            <div className="flex items-center gap-3">
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${currentBadge.color}`}>
                {currentBadge.text}
              </div>
              <Button 
                variant="outline" 
                className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white border-0 hover:from-emerald-600 hover:to-emerald-700 shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <Share2 className="mr-2 h-4 w-4" />
                Compartilhe
              </Button>
            </div>
          </div>
          <h1 className="text-2xl font-bold">Confirmação de Pagamento</h1>
          <p className="text-muted-foreground">Complete seus dados para finalizar a compra</p>
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

          {/* Detalhes do Pedido Card (Server State) */}
          {serverState && (
            <Card>
              <CardHeader>
                <CardTitle>Detalhes do Pedido</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Reservation ID:</span>
                    <p className="font-mono text-xs">{serverState.reservationId}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Raffle ID:</span>
                    <p className="font-mono text-xs">{serverState.raffleId}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Quantidade:</span>
                    <p>{serverState.qty}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Valor Unitário:</span>
                    <p>{formatBRL(serverState.unitPrice)}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Total:</span>
                    <p className="font-semibold">{formatBRL(serverState.amount)}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Status:</span>
                    <p className="capitalize">{serverState.status}</p>
                  </div>
                </div>
                
                {serverState.numbers.length > 0 && (
                  <div>
                    <span className="text-muted-foreground text-sm">Números:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {serverState.numbers.slice(0, 3).map((num, idx) => (
                        <span key={idx} className="font-mono text-xs bg-emerald-50 px-2 py-1 rounded">
                          {num}
                        </span>
                      ))}
                      {serverState.numbers.length > 3 && (
                        <span className="text-xs text-muted-foreground">
                          +{serverState.numbers.length - 3} mais
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {serverState.transaction.id && (
                  <div className="border-t pt-3">
                    <span className="text-muted-foreground text-sm">Transação:</span>
                    <div className="text-xs space-y-1 mt-1">
                      <p><span className="text-muted-foreground">ID:</span> {serverState.transaction.id}</p>
                      {serverState.transaction.provider && (
                        <p><span className="text-muted-foreground">Provider:</span> {serverState.transaction.provider}</p>
                      )}
                      {serverState.transaction.paidAt && (
                        <p><span className="text-muted-foreground">Pago em:</span> {new Date(serverState.transaction.paidAt).toLocaleString()}</p>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Diagnóstico Card (debug only) */}
          {isDebugMode() && serverState && (
            <Card>
              <CardHeader>
                <CardTitle>Diagnóstico</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-xs">
                <div><span className="text-muted-foreground">Source:</span> {serverState.source}</div>
                <div><span className="text-muted-foreground">Has Tickets Paid:</span> {serverState.debug.hasTicketsPaid ? 'Yes' : 'No'}</div>
                <div><span className="text-muted-foreground">State Machine:</span> {stateMachineInitialized ? 'Initialized' : 'Pending'}</div>
                <div><span className="text-muted-foreground">Local Storage Key:</span> confirm.{reservationId}</div>
              </CardContent>
            </Card>
          )}

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
                <span>Bilhetes ({checkoutData.adjustedQty}x)</span>
                <span>{formatBRL(checkoutData.subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Taxa de processamento</span>
                <span>{formatBRL(checkoutData.fee)}</span>
              </div>
              {qtyAdjusted && (
                <div className="text-xs text-amber-600 bg-amber-50 rounded-lg p-2">
                  Quantidade ajustada para atender o mínimo de R$ 5,00.
                </div>
              )}
              <Separator />
              <div className="flex justify-between font-semibold text-lg">
                <span>Total</span>
                <span className="text-emerald-600">{formatBRL(checkoutData.chargeTotal)}</span>
              </div>
              
              <Button 
                onClick={handlePayment}
                disabled={!user || isProcessing || formData.fullName.trim().length < 2 || digits(formData.phone).length < 10 || digits(formData.cpf).length !== 11}
                className="w-full mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
                size="lg"
              >
                {isProcessing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Processando...
                  </>
                ) : !user ? "Fazer Login para Pagar" : `Pagar ${formatBRL(checkoutData.chargeTotal)}`}
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

      {/* PIX Payment Modal */}
      {showPixModal && pixPaymentData && (
        <PixPaymentModal
          isOpen={showPixModal}
          onClose={() => setShowPixModal(false)}
          onSuccess={(transactionData) => {
            console.log('[payment] PIX payment successful:', transactionData);
            setShowPixModal(false);
            
            // Navigate to success page
            navigate(`/ganhavel/${id}/pagamento-sucesso`, {
              replace: true,
              state: {
                raffleId: id,
                txId: transactionData.transactionId,
                quantity: qty,
                unitPrice: raffle?.ticket_price,
                totalPaid: pixPaymentData.amount,
                selectedNumbers: selectedNumbers.map(toComboString),
              },
            });
          }}
          paymentData={pixPaymentData}
        />
      )}
    </>
  );
}