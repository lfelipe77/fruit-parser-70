import { useState, useEffect } from "react";
import { useLocation, useNavigate, useParams, Link } from "react-router-dom";
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
import { useToast } from "@/hooks/use-toast";

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
  const location = useLocation();
  const navigate = useNavigate();
  const { rifaId } = useParams();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [showAllNumbers, setShowAllNumbers] = useState(false);
  const [currentNumbers, setCurrentNumbers] = useState<string[]>([]);

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
      "(23-45-67-89-01-23)",
      "(45-67-89-01-23-45)"
    ],
    quantity: 6,
    unitPrice: 5,
    totalAmount: 30,
    organizerName: "AutoRifas Premium"
  };

  // Initialize current numbers with purchase data
  useEffect(() => {
    setCurrentNumbers(purchaseData.selectedNumbers);
  }, []);

  const generateRandomNumbers = (quantity: number) => {
    const numbers = [];
    for (let i = 0; i < quantity; i++) {
      const combination = Array.from({ length: 6 }, () => 
        Math.floor(Math.random() * 90) + 10
      ).join('-');
      numbers.push(`(${combination})`);
    }
    return numbers;
  };

  const handleShuffleNumbers = () => {
    const newNumbers = generateRandomNumbers(purchaseData.quantity);
    setCurrentNumbers(newNumbers);
    toast({
      title: "Números atualizados!",
      description: "Seus números foram embaralhados com sucesso.",
    });
  };

  const handleFinalizePurchase = async () => {
    setIsProcessing(true);
    
    try {
      // Here you'll integrate with Mercado Pago/PIX payment system
      // For now, simulate processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Navigate to success page with new URL structure
      const successRoute = rifaId 
        ? `/ganhavel/${rifaId}/pagamento-sucesso` 
        : "/pagamento-sucesso";
        
      navigate(successRoute, {
        state: {
          ...purchaseData,
          selectedNumbers: currentNumbers,
          paymentId: "MP_" + Date.now(),
          paymentDate: new Date().toISOString()
        }
      });
    } catch (error) {
      toast({
        title: "Erro no pagamento",
        description: "Ocorreu um erro ao processar o pagamento. Tente novamente.",
        variant: "destructive",
      });
      setIsProcessing(false);
    }
  };

  const displayedNumbers = showAllNumbers 
    ? currentNumbers 
    : currentNumbers.slice(0, 3);

  const hasMoreNumbers = currentNumbers.length > 3;

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate(-1)}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Confirmação de Compra</h1>
              <p className="text-muted-foreground">Revise os detalhes antes de finalizar</p>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Purchase Summary */}
            <div className="md:col-span-2 space-y-6">
              {/* Rifa Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ShoppingCart className="h-5 w-5" />
                    Detalhes da Rifa
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-4">
                    <img 
                      src={purchaseData.rifaImage} 
                      alt={purchaseData.rifaTitle}
                      className="w-24 h-24 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{purchaseData.rifaTitle}</h3>
                      <p className="text-muted-foreground">Por: {purchaseData.organizerName}</p>
                      <Badge variant="secondary" className="mt-2">
                        Em andamento
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Selected Numbers */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Números Selecionados</CardTitle>
                      <CardDescription>
                        {purchaseData.quantity} combinação(ões) de 6 números
                      </CardDescription>
                    </div>
                     <Button
                       variant="outline"
                       size="sm"
                       className="flex items-center gap-2"
                       onClick={handleShuffleNumbers}
                     >
                       <Edit3 className="h-4 w-4" />
                       Embaralhar números
                     </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {displayedNumbers.map((combination, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                        <span className="font-mono text-sm">{combination}</span>
                        <Badge variant="outline">R$ {purchaseData.unitPrice}</Badge>
                      </div>
                    ))}
                  </div>
                  
                  {hasMoreNumbers && (
                    <div className="mt-4 text-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowAllNumbers(!showAllNumbers)}
                        className="flex items-center gap-2"
                      >
                        {showAllNumbers ? (
                          <>
                            <ChevronUp className="h-4 w-4" />
                            Ver menos números
                          </>
                        ) : (
                          <>
                            <ChevronDown className="h-4 w-4" />
                            Ver mais números (+{currentNumbers.length - 3})
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Security Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-green-600" />
                    Pagamento Seguro
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>Mercado Pago Certificado</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>PIX Instantâneo</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>Dados Criptografados</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>Compra Garantida</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Payment Summary */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Resumo do Pagamento</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Quantidade de bilhetes:</span>
                      <span>{purchaseData.quantity}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Valor unitário:</span>
                      <span>R$ {purchaseData.unitPrice.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Taxa Institucional:</span>
                      <span>R$ 2,00</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-semibold">
                      <span>Total:</span>
                      <span className="text-lg text-primary">
                        R$ {((purchaseData.quantity * purchaseData.unitPrice) + 2).toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3 pt-4">
                    <Button 
                      onClick={handleFinalizePurchase}
                      disabled={isProcessing}
                      className="w-full"
                      size="lg"
                    >
                      {isProcessing ? (
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 animate-spin" />
                          Processando...
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <CreditCard className="h-4 w-4" />
                          Finalizar Compra
                        </div>
                      )}
                    </Button>
                    
                    <p className="text-xs text-muted-foreground text-center">
                      Ao finalizar, você será redirecionado para o Mercado Pago
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Payment Methods */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Métodos de Pagamento</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>PIX (Aprovação instantânea)</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span>Cartão de Crédito</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                      <span>Cartão de Débito</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}