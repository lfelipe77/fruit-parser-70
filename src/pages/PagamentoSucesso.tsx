import { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate, useParams, Link } from "react-router-dom";
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
import { usePersistMock } from "@/hooks/usePersistMock";

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

export default function PagamentoSucesso() {
  const location = useLocation();
  const navigate = useNavigate();
  const { rifaId } = useParams();
  const { toast } = useToast();
  const s = location.state as PaymentSuccessData || {};
  const [rehydrated, setRehydrated] = useState<PaymentSuccessData>(s);

  useEffect(() => {
    // If we have new format state, we're good
    if (s?.txId && s?.raffleId) return;

    // Attempt rehydrate via latest successful tx for this user (fallback)
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;

      // Grab latest "paid" tx from the user
      const { data: tx, error } = await supabase
        .from("transactions")
        .select("id, raffle_id, amount")
        .eq("buyer_user_id", session.user.id)
        .eq("status", "paid")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!error && tx) {
        setRehydrated({
          raffleId: tx.raffle_id,
          txId: tx.id,
          quantity: 1, // Default since we don't have qty in transactions
          totalPaid: asNumber(tx.amount, 0),
          unitPrice: asNumber(tx.amount, 0),
        });
      }
    })();
  }, [s?.txId, s?.raffleId]);

  // Support both new and legacy formats
  const quantity = asNumber(rehydrated.quantity || rehydrated.quantity, 1);
  const unitPrice = asNumber(rehydrated.unitPrice, rehydrated.totalPaid ? asNumber(rehydrated.totalPaid || rehydrated.totalAmount, 0) / Math.max(1, quantity) : 0);
  const totalPaid = asNumber(rehydrated.totalPaid || rehydrated.totalAmount, unitPrice * quantity);
  const numbers = rehydrated.numbers || rehydrated.selectedNumbers || [];
  const raffleId = rehydrated.raffleId || rehydrated.rifaId || rifaId;
  const paymentId = rehydrated.txId || rehydrated.paymentId || "N/A";
  const paymentDate = rehydrated.paymentDate || new Date().toISOString();

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

  // Process mock purchase using RPC
  usePersistMock(
    paymentData.rifaId,
    paymentData.quantity,
    paymentData.totalAmount / paymentData.quantity,
    paymentData.selectedNumbers
  );


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
                      <h3 className="font-semibold text-lg">{paymentData.rifaTitle}</h3>
                      <p className="text-muted-foreground">Por: {paymentData.organizerName}</p>
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
                      {paymentData.selectedNumbers.map((combination, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                          <span className="font-mono text-sm">{combination}</span>
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