import React from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import Navigation from "@/components/Navigation";
import { 
  ArrowLeft, 
  ShoppingCart, 
  CreditCard, 
  Shield,
  Clock,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Edit3
} from "lucide-react";
import { toast } from "sonner";

interface PurchaseData {
  rifaId: string;
  rifaTitle: string;
  rifaImage: string;
  selectedNumbers: string[];
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  organizerName: string;
}

export default function ConfirmacaoPagamento() {
  // ✅ All hooks declared first, unconditionally
  const location = useLocation();
  const navigate = useNavigate();
  const { rifaId } = useParams();
  const params = new URLSearchParams(location.search);
  const txId = params.get("tx") ?? "";
  
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [showAllNumbers, setShowAllNumbers] = React.useState(false);
  const [currentNumbers, setCurrentNumbers] = React.useState<string[]>([]);
  const [status, setStatus] = React.useState<"loading" | "ok" | "error">("loading");

  // Get purchase data from navigation state
  const purchaseData: PurchaseData = location.state || {
    rifaId: "honda-civic-0km-2024",
    rifaTitle: "Honda Civic 0KM 2024",
    rifaImage: "/src/assets/honda-civic-2024.jpg",
    selectedNumbers: [
      "(12-43-24-56-78-90)", 
      "(34-67-89-12-45-78)", 
      "(56-89-23-45-67-34)",
      "(78-90-12-34-56-89)",
      "(90-12-34-56-78-43)",
      "(43-56-78-90-12-34)"
    ],
    quantity: 6,
    unitPrice: 25.00,
    totalAmount: 152.00,
    organizerName: "João Silva"
  };

  // ✅ Effects after hooks
  React.useEffect(() => {
    setCurrentNumbers(purchaseData.selectedNumbers);
  }, []);

  React.useEffect(() => {
    if (!txId) {
      setStatus("ok");
      return;
    }
    
    let alive = true;
    
    (async () => {
      try {
        setStatus("loading");
        // Simulate fetching transaction details
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        if (alive) {
          setStatus("ok");
        }
      } catch {
        if (alive) {
          setStatus("error");
        }
      }
    })();
    
    return () => {
      alive = false;
    };
  }, [txId]);

  const generateRandomNumbers = () => {
    const numbers = [];
    for (let i = 0; i < 6; i++) {
      const group = [];
      for (let j = 0; j < 6; j++) {
        group.push(String(Math.floor(Math.random() * 90) + 10).padStart(2, '0'));
      }
      numbers.push(`(${group.join('-')})`);
    }
    return numbers;
  };

  const handleShuffleNumbers = () => {
    const newNumbers = generateRandomNumbers();
    setCurrentNumbers(newNumbers);
    toast.success("Números embaralhados com sucesso!");
  };

  const handleFinalizePurchase = async () => {
    setIsProcessing(true);
    
    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      toast.success("Compra finalizada com sucesso!");
      navigate('/pagamento-sucesso', {
        state: {
          transactionId: 'TX' + Date.now(),
          rifaTitle: purchaseData.rifaTitle,
          quantity: purchaseData.quantity,
          totalAmount: purchaseData.totalAmount,
          selectedNumbers: currentNumbers
        }
      });
    } catch (error) {
      console.error('Payment error:', error);
      toast.error("Erro ao processar pagamento. Tente novamente.");
    } finally {
      setIsProcessing(false);
    }
  };

  // ✅ Conditional render happens *after* hooks  
  if (status === "loading") {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold text-red-600">Erro no Pagamento</h1>
            <p className="mt-2 text-gray-600">Ocorreu um erro ao processar seu pagamento.</p>
            <Button onClick={() => navigate(-1)} className="mt-4">
              Tentar Novamente
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <h1 className="text-2xl font-bold">Confirmação de Compra</h1>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr,400px]">
          {/* Main Content - Purchase Details */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5" />
                  Detalhes da Compra
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-4">
                  <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                    <img 
                      src={purchaseData.rifaImage} 
                      alt={purchaseData.rifaTitle}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{purchaseData.rifaTitle}</h3>
                    <p className="text-gray-600">por {purchaseData.organizerName}</p>
                    <div className="flex items-center gap-4 mt-2">
                      <Badge variant="secondary">{purchaseData.quantity} bilhetes</Badge>
                      <span className="text-sm text-gray-600">
                        R$ {purchaseData.unitPrice.toFixed(2)} cada
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Selected Numbers */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Números Selecionados</CardTitle>
                  <Button variant="outline" size="sm" onClick={handleShuffleNumbers}>
                    <Edit3 className="h-4 w-4 mr-2" />
                    Embaralhar
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {(showAllNumbers ? currentNumbers : currentNumbers.slice(0, 3)).map((number, index) => (
                      <div key={index} className="font-mono text-sm bg-gray-50 p-2 rounded border">
                        Bilhete {index + 1}: {number}
                      </div>
                    ))}
                  </div>
                  
                  {currentNumbers.length > 3 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowAllNumbers(!showAllNumbers)}
                      className="w-full"
                    >
                      {showAllNumbers ? (
                        <>
                          <ChevronUp className="h-4 w-4 mr-2" />
                          Mostrar menos
                        </>
                      ) : (
                        <>
                          <ChevronDown className="h-4 w-4 mr-2" />
                          Mostrar todos os {currentNumbers.length} números
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Security Info */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-sm text-green-600">
                  <Shield className="h-4 w-4" />
                  <span>Números gerados de forma aleatória e segura</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-green-600 mt-1">
                  <CheckCircle className="h-4 w-4" />
                  <span>Pagamento processado com segurança</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Payment Summary */}
          <aside>
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Resumo do Pagamento
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Bilhetes ({purchaseData.quantity}x):</span>
                    <span>R$ {(purchaseData.unitPrice * purchaseData.quantity).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Taxa de processamento:</span>
                    <span>R$ 2,00</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total:</span>
                    <span>R$ {purchaseData.totalAmount.toFixed(2)}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-xs text-gray-500 mb-2">Método de Pagamento</div>
                  <div className="flex items-center gap-2 p-2 border rounded">
                    <CreditCard className="h-4 w-4" />
                    <span className="text-sm">PIX / Cartão de Crédito</span>
                  </div>
                </div>

                <Button
                  className="w-full"
                  size="lg"
                  onClick={handleFinalizePurchase}
                  disabled={isProcessing}
                >
                  {isProcessing ? 'Processando...' : 'Finalizar Compra'}
                </Button>

                <p className="text-xs text-gray-500 text-center">
                  Ao finalizar, você concorda com nossos termos de uso e política de privacidade.
                </p>
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>
    </div>
  );
}