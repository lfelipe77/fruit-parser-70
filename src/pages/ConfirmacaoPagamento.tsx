import React from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
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
import { isDebugMode, logDebugInfo } from "@/utils/envDebug";

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

  console.log("[ConfirmacaoPagamento] Hook states:", { id, userExists: !!user, authLoading });

  // Debug instrumentation (only when ?debug=1)
  React.useEffect(() => {
    if (!isDebugMode()) return;

    const supabaseUrl = "https://whqxpuyjxoiufzhvqneg.supabase.co";
    
    logDebugInfo("ConfirmacaoPagamento:Mount", {
      edgeBaseUrl: supabaseUrl,
      endpoints: [
        `${supabaseUrl}/functions/v1/record_purchase_v2`,
        `${supabaseUrl}/functions/v1/record_mock_purchase_admin`,
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

  // Calculations
  const subtotal = (raffle?.ticket_price ?? 0) * qty;
  const fee = 2.00;
  const total = subtotal + fee;

  // Handle form submission
  async function handlePayment() {
    try {
      // 1) Validate form first
      if (!validateForm()) {
        toast.error("Por favor, corrija os erros no formulário");
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

      setIsProcessing(true);

      // 3) Inputs
      const now = Date.now();
      const providerRef = `mock-${id}-${now}-${Math.floor(Math.random() * 1e9)}`;
      const safeQty = Math.max(1, asNumber(qty, 1));
      const unitPrice = asNumber(raffle?.ticket_price, 0);
      const totalPaid = +(unitPrice * safeQty).toFixed(2); // number

      // 4) Call new RPC with customer data
      const { data: txId, error } = await (supabase as any).rpc("record_purchase_v2", {
        p_buyer_user_id: session.user.id,
        p_raffle_id: id,
        p_qty: safeQty,
        p_unit_price: unitPrice,
        p_numbers: selectedNumbers,    // Use the correctly formatted numbers from UI
        p_provider_ref: providerRef,   // must be unique
        p_customer_name: formData.fullName,
        p_customer_phone: digits(formData.phone),
        p_customer_cpf: digits(formData.cpf),
      });

      // Debug: Log RPC response structure (only when ?debug=1)
      if (isDebugMode()) {
        logDebugInfo("ConfirmacaoPagamento:RPCResponse", {
          function: "record_purchase_v2",
          success: !error,
          responseKeys: txId ? ["txId"] : [],
          errorPresent: !!error,
          maskedTxId: txId ? "****" + String(txId).slice(-4) : null
        });
      }

      if (error) {
        console.error("[payment] rpc error", {
          code: (error as any)?.code,
          message: (error as any)?.message,
          details: (error as any)?.details,
          hint: (error as any)?.hint,
          constraint: (error as any)?.constraint,
        });
        toast.error("Pagamento falhou. Tente novamente.");
        return;
      }

      // 4) Refresh cards + redirect to success
      window.dispatchEvent(new CustomEvent("raffleUpdated"));
      navigate(`/ganhavel/${id}/pagamento-sucesso`, {
        replace: true,
        state: {
          raffleId: id,
          txId,                         // uuid returned by RPC
          quantity: safeQty,            // number
          unitPrice,                    // number
          totalPaid,                    // number
          selectedNumbers: selectedNumbers.map(toComboString), // ensure strings
        },
      });
    } catch (e: any) {
      console.error("[payment] unexpected", e);
      toast.error("Pagamento falhou. Tente novamente.");
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

  if (loading || authLoading) return <div className="p-6">Carregando…</div>;
  if (!raffle) return <div className="p-6">Rifa não encontrada.</div>;

  return (
    <>
      <Navigation />
      <div className="container mx-auto p-4 max-w-4xl">
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
    </>
  );
}