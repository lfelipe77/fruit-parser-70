import { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate, useParams, useSearchParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toBRL, asNumber } from "@/utils/money";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import Navigation from "@/components/Navigation";
import { 
  CheckCircle, 
  Download, 
  Share2, 
  Home,
  Receipt,
  Calendar,
  Clock,
  Trophy
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";


interface PaymentSuccessData {
  raffleId?: string;
  txId?: string;
  quantity?: number;
  unitPrice?: number;
  totalPaid?: number;
  numbers?: string[];
  // Legacy fields for compatibility
  rifaId?: string;
  rifaTitle?: string;
  rifaImage?: string;
  selectedNumbers?: string[];
  totalAmount?: number;
  organizerName?: string;
  paymentId?: string;
  paymentDate?: string;
}

function toComboString(input: unknown): string {
  // handles "11-22-33...", ["11","22",...], [11,22,...], [[11,22,...]], or objects
  try {
    if (typeof input === "string") {
      // keep digits & dashes only; strip wrappers like "(...)"
      return input.replace(/[^\d-]/g, "");
    }
    if (Array.isArray(input)) {
      const flat = input.flat(2).map(x => String(x).replace(/[^\d]/g, ""));
      return flat.filter(Boolean).join("-");
    }
    // last resort: stringify then sanitize
    return String(input ?? "").replace(/[^\d-]/g, "");
  } catch {
    return "";
  }
}

export default function PagamentoSucesso() {
  const location = useLocation();
  const navigate = useNavigate();
  const { rifaId } = useParams();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const s = location.state as PaymentSuccessData || {};
  const [rehydrated, setRehydrated] = useState<PaymentSuccessData>(s);
  const [combos, setCombos] = useState<string[] | null>(
    s?.selectedNumbers?.map(toComboString) ?? null
  );

  const txId = s?.txId ?? searchParams.get("tx") ?? rifaId ?? undefined;
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    // If we already have combos from nav state, we're good
    if (combos && combos.length) return;
    if (!txId) return;

    setIsLoading(true);
    setHasError(false);

    // Fetch numbers from database using txId
    (async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) {
          setHasError(true);
          setIsLoading(false);
          return;
        }

        const { data: tx, error } = await supabase
          .from("transactions")
          .select("id, numbers, buyer_user_id, raffle_id, amount")
          .eq("id", txId)
          .maybeSingle();

        if (error) {
          console.error("Error fetching transaction:", error);
          setHasError(true);
          setIsLoading(false);
          return;
        }

        if (tx) {
          const raw = tx.numbers;
          let arr: string[] = [];
          if (Array.isArray(raw)) {
            arr = raw as string[];
          } else if (typeof raw === "string") {
            try { 
              arr = JSON.parse(raw); 
            } catch { 
              arr = []; 
            }
          }
          setCombos(arr.map(toComboString).filter(Boolean));
          
          // Also update rehydrated data
          setRehydrated({
            raffleId: tx.raffle_id,
            txId: tx.id,
            quantity: arr.length || 1,
            totalPaid: asNumber(tx.amount, 0),
            unitPrice: asNumber(tx.amount, 0) / Math.max(1, arr.length),
          });
          setIsLoading(false);
        } else {
          setHasError(true);
          setIsLoading(false);
        }
      } catch (err) {
        console.error("Error fetching transaction data:", err);
        setHasError(true);
        setIsLoading(false);
      }
    })();
  }, [txId, combos]);

  // Support both new and legacy formats
  const quantity = asNumber(rehydrated.quantity || rehydrated.quantity, 1);
  const unitPrice = asNumber(rehydrated.unitPrice, rehydrated.totalPaid ? asNumber(rehydrated.totalPaid || rehydrated.totalAmount, 0) / Math.max(1, quantity) : 0);
  const totalPaid = asNumber(rehydrated.totalPaid || rehydrated.totalAmount, unitPrice * quantity);
  const numbers = combos || rehydrated.numbers || rehydrated.selectedNumbers || [];
  const raffleId = rehydrated.raffleId || rehydrated.rifaId || rifaId;
  const paymentId = rehydrated.txId || rehydrated.paymentId || "N/A";
  const paymentDate = rehydrated.paymentDate || new Date().toISOString();

  // Handle different states
  if (!txId) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-2xl font-bold mb-4">Transação não encontrada</h1>
            <p className="text-muted-foreground mb-6">
              Não foi possível localizar os dados desta transação. 
              Verifique se você acessou o link correto ou tente novamente.
            </p>
            <Link to="/my-tickets">
              <Button>Ver Meus Tickets</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }
  
  if (hasError) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-2xl font-bold mb-4">Erro ao carregar transação</h1>
            <p className="text-muted-foreground mb-6">
              Ocorreu um erro ao carregar os dados da sua transação. 
              Tente recarregar a página ou verifique sua conexão.
            </p>
            <div className="space-x-4">
              <Button onClick={() => window.location.reload()}>
                Tentar Novamente
              </Button>
              <Link to="/my-tickets">
                <Button variant="outline">Ver Meus Tickets</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  if (isLoading || !combos) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto text-center">
            <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
              <Clock className="h-12 w-12 text-muted-foreground" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Carregando seus números...</h1>
            <p className="text-muted-foreground">
              Aguarde enquanto buscamos os dados da sua transação.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const paymentData = {
    rifaId: raffleId,
    rifaTitle: rehydrated.rifaTitle || "Sorteio",
    rifaImage: rehydrated.rifaImage || "/placeholder.svg",
    selectedNumbers: numbers,
    quantity,
    totalAmount: totalPaid,
    organizerName: rehydrated.organizerName || "Ganhavel",
    paymentId,
    paymentDate
  };

  // Transaction already created in ConfirmacaoPagamento - no need to call usePersistMock again


  const handleDownloadReceipt = () => {
    toast({
      title: "Download iniciado",
      description: "Seu comprovante está sendo gerado...",
    });
    // Here you would implement PDF generation
  };

  const handleShare = () => {
    const shareTitle = `🍀 Participando do Ganhavel: ${paymentData.rifaTitle}`;
    const shareText = `Acabei de comprar ${paymentData.quantity} bilhete${paymentData.quantity > 1 ? 's' : ''} no ganhavel "${paymentData.rifaTitle}"! 

🎯 Prêmio: ${paymentData.rifaTitle}
🎫 Bilhetes: ${paymentData.quantity}
💰 Valor: ${toBRL(paymentData.totalAmount)}
🏆 Organizado por: ${paymentData.organizerName}

Participe você também e concorra a este prêmio incrível! 🚀`;
    
    const shareUrl = `${window.location.origin}/#/ganhavel/${paymentData.rifaId}`;

    if (navigator.share) {
      navigator.share({
        title: shareTitle,
        text: shareText,
        url: shareUrl
      });
    } else {
      // Fallback: copy rich text to clipboard
      const fullShareText = `${shareText}\n\n🔗 ${shareUrl}`;
      navigator.clipboard.writeText(fullShareText);
      toast({
        title: "Conteúdo copiado!",
        description: "As informações do ganhavel foram copiadas para compartilhar.",
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Success Header */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-green-600 mb-2">
              Pagamento Aprovado!
            </h1>
            <p className="text-muted-foreground text-lg">
              Sua participação foi confirmada com sucesso
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Purchase Details */}
            <div className="md:col-span-2 space-y-6">
              {/* Transaction Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Receipt className="h-5 w-5" />
                    Detalhes da Transação
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">ID do Pagamento</p>
                      <p className="font-mono text-sm">{paymentData.paymentId}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Data e Hora</p>
                      <p className="text-sm">{formatDate(paymentData.paymentDate)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Valor Pago</p>
                       <p className="text-lg font-semibold text-green-600">
                         {toBRL(paymentData.totalAmount)}
                       </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Status</p>
                      <Badge className="bg-green-100 text-green-800">
                        Aprovado
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Rifa Details */}
              <Card>
                <CardHeader>
                  <CardTitle>Rifa Participando</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-4 mb-4">
                    <img 
                      src={paymentData.rifaImage} 
                      alt={paymentData.rifaTitle}
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{String(paymentData.rifaTitle ?? '')}</h3>
                      <p className="text-muted-foreground">Por: {String(paymentData.organizerName ?? '')}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Trophy className="h-4 w-4 text-yellow-500" />
                        <span className="text-sm text-muted-foreground">
                          Aguardando sorteio
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <Separator className="my-4" />
                  
                  <div>
                    <h4 className="font-medium mb-2">Seus Números da Sorte:</h4>
                    <div className="space-y-2">
                    {(Array.isArray(paymentData.selectedNumbers) ? paymentData.selectedNumbers : []).map((combination, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                          <span className="font-mono text-sm">({String(combination)})</span>
                          <Badge variant="outline" className="border-green-300 text-green-700">
                            Bilhete #{index + 1}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Next Steps */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Próximos Passos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-white text-xs font-bold">
                        1
                      </div>
                      <div>
                        <p className="font-medium">Acompanhe o sorteio</p>
                        <p className="text-sm text-muted-foreground">
                          Você será notificado sobre a data do sorteio e resultados
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-white text-xs font-bold">
                        2
                      </div>
                      <div>
                        <p className="font-medium">Verifique sua conta</p>
                        <p className="text-sm text-muted-foreground">
                          Seus bilhetes aparecerão em "Minha Conta" - "Rifas Participadas"
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-white text-xs font-bold">
                        3
                      </div>
                      <div>
                        <p className="font-medium">Compartilhe com amigos</p>
                        <p className="text-sm text-muted-foreground">
                          Quanto mais participantes, maior o prêmio!
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Actions Sidebar */}
            <div className="space-y-6">
              {/* Action Buttons */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Ações Rápidas</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button 
                    onClick={handleDownloadReceipt}
                    variant="outline" 
                    className="w-full"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Baixar Comprovante
                  </Button>
                  
                  <Button 
                    onClick={handleShare}
                    variant="outline" 
                    className="w-full"
                  >
                    <Share2 className="h-4 w-4 mr-2" />
                    Compartilhar Ganhável
                  </Button>
                  
                  <Link to="/my-tickets" className="block">
                    <Button variant="secondary" className="w-full">
                      Ver Meus Tickets
                    </Button>
                  </Link>
                  
                  <Link to="/" className="block">
                    <Button className="w-full">
                      <Home className="h-4 w-4 mr-2" />
                      Voltar ao Início
                    </Button>
                  </Link>
                </CardContent>
              </Card>


              {/* Support */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Precisa de Ajuda?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-3">
                    Entre em contato conosco se tiver dúvidas sobre sua compra.
                  </p>
                  <Button variant="outline" size="sm" className="w-full">
                    Falar com Suporte
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}