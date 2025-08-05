import { useEffect, useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Navigation from "@/components/Navigation";
import { 
  XCircle, 
  RefreshCw, 
  Home,
  ArrowLeft,
  AlertTriangle,
  Clock,
  HelpCircle
} from "lucide-react";

interface PaymentErrorData {
  rifaId?: string;
  rifaTitle?: string;
  errorType?: 'cancelled' | 'failed' | 'timeout';
  errorMessage?: string;
  attemptCount?: number;
}

export default function PagamentoErro() {
  const location = useLocation();
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(15);

  const errorData: PaymentErrorData = location.state || {
    rifaId: "honda-civic-0km-2024",
    rifaTitle: "Honda Civic 0KM 2024",
    errorType: 'cancelled',
    errorMessage: "Pagamento cancelado pelo usuário",
    attemptCount: 1
  };

  useEffect(() => {
    // Countdown to redirect to home
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          navigate("/");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate]);

  const getErrorDetails = () => {
    switch (errorData.errorType) {
      case 'cancelled':
        return {
          title: "Pagamento Cancelado",
          description: "Você cancelou o processo de pagamento.",
          icon: <XCircle className="h-12 w-12 text-yellow-600" />,
          color: "yellow",
          suggestion: "Não se preocupe! Você pode tentar novamente a qualquer momento."
        };
      case 'failed':
        return {
          title: "Pagamento Falhou",
          description: "Houve um problema ao processar seu pagamento.",
          icon: <XCircle className="h-12 w-12 text-red-600" />,
          color: "red",
          suggestion: "Verifique seus dados de pagamento e tente novamente."
        };
      case 'timeout':
        return {
          title: "Tempo Esgotado",
          description: "O tempo para completar o pagamento expirou.",
          icon: <Clock className="h-12 w-12 text-orange-600" />,
          color: "orange",
          suggestion: "Inicie o processo de compra novamente."
        };
      default:
        return {
          title: "Erro no Pagamento",
          description: "Ocorreu um erro inesperado.",
          icon: <AlertTriangle className="h-12 w-12 text-red-600" />,
          color: "red",
          suggestion: "Entre em contato com o suporte se o problema persistir."
        };
    }
  };

  const errorDetails = getErrorDetails();

  const handleTryAgain = () => {
    if (errorData.rifaId) {
      navigate(`/ganhavel/${errorData.rifaId}`);
    } else {
      navigate("/");
    }
  };

  const getCommonIssues = () => {
    return [
      {
        issue: "Cartão recusado",
        solution: "Verifique se o cartão possui limite disponível e dados corretos"
      },
      {
        issue: "Dados incorretos",
        solution: "Confirme se nome, CPF e endereço estão corretos"
      },
      {
        issue: "Problemas de conexão",
        solution: "Verifique sua conexão com a internet e tente novamente"
      },
      {
        issue: "PIX não gerado",
        solution: "Aguarde alguns segundos e tente gerar novamente"
      }
    ];
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Error Header */}
          <div className="text-center mb-8">
            <div className={`w-20 h-20 bg-${errorDetails.color}-100 rounded-full flex items-center justify-center mx-auto mb-4`}>
              {errorDetails.icon}
            </div>
            <h1 className={`text-3xl font-bold text-${errorDetails.color}-600 mb-2`}>
              {errorDetails.title}
            </h1>
            <p className="text-muted-foreground text-lg">
              {errorDetails.description}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Error Details */}
            <div className="md:col-span-2 space-y-6">
              {/* Error Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5" />
                    Detalhes do Erro
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {errorData.rifaTitle && (
                    <div className="mb-4">
                      <p className="text-sm text-muted-foreground">Rifa</p>
                      <p className="font-medium">{errorData.rifaTitle}</p>
                    </div>
                  )}
                  
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      {errorData.errorMessage || errorDetails.suggestion}
                    </AlertDescription>
                  </Alert>

                  {errorData.attemptCount && errorData.attemptCount > 1 && (
                    <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm text-blue-800">
                        <strong>Tentativas:</strong> {errorData.attemptCount}
                      </p>
                      <p className="text-xs text-blue-600 mt-1">
                        Se o problema persistir, entre em contato com o suporte.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Common Issues */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <HelpCircle className="h-5 w-5" />
                    Problemas Comuns e Soluções
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {getCommonIssues().map((item, index) => (
                      <div key={index} className="border-l-4 border-primary pl-4">
                        <h4 className="font-medium text-sm">{item.issue}</h4>
                        <p className="text-sm text-muted-foreground">{item.solution}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* What Happened */}
              <Card>
                <CardHeader>
                  <CardTitle>O que aconteceu?</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                        ✓
                      </div>
                      <div>
                        <p className="font-medium">Rifa selecionada</p>
                        <p className="text-sm text-muted-foreground">
                          Você escolheu seus números da sorte
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                        ✓
                      </div>
                      <div>
                        <p className="font-medium">Confirmação realizada</p>
                        <p className="text-sm text-muted-foreground">
                          Dados da compra foram confirmados
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                        ✗
                      </div>
                      <div>
                        <p className="font-medium">Pagamento não concluído</p>
                        <p className="text-sm text-muted-foreground">
                          O processo de pagamento foi interrompido
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
                  <CardTitle className="text-base">Próximas Ações</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button 
                    onClick={handleTryAgain}
                    className="w-full"
                    size="lg"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Tentar Novamente
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => navigate(-1)}
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Voltar
                  </Button>
                  
                  <Link to="/" className="block">
                    <Button variant="secondary" className="w-full">
                      <Home className="h-4 w-4 mr-2" />
                      Página Inicial
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              {/* Auto Redirect Info */}
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <Clock className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      Redirecionando automaticamente em
                    </p>
                    <p className="text-2xl font-bold text-primary">
                      {countdown}s
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Support */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Precisa de Ajuda?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-3">
                    Nossa equipe de suporte está pronta para ajudar.
                  </p>
                  <Button variant="outline" size="sm" className="w-full mb-2">
                    Falar com Suporte
                  </Button>
                  <p className="text-xs text-muted-foreground text-center">
                    Atendimento: 24/7
                  </p>
                </CardContent>
              </Card>

              {/* Payment Methods Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Métodos Disponíveis</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>PIX (Recomendado)</span>
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