import { 
  ShieldCheck, 
  Lock, 
  CreditCard, 
  CheckCircle, 
  Mail, 
  FileCheck 
} from "lucide-react";
import { 
  Card, 
  CardContent, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";

export default function PaymentSecureMockCard() {
  return (
    <Card role="region" aria-labelledby="secure-title" className="h-full">
      <CardHeader className="flex flex-row items-center gap-2 space-y-0">
        <ShieldCheck className="w-5 h-5 text-primary" />
        <CardTitle id="secure-title" className="text-lg">Pagamento Seguro</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <div className="flex items-start gap-2">
          <Lock className="w-4 h-4 mt-0.5 text-muted-foreground flex-shrink-0" />
          <span>Conexão criptografada (SSL)</span>
        </div>
        <div className="flex items-start gap-2">
          <CreditCard className="w-4 h-4 mt-0.5 text-muted-foreground flex-shrink-0" />
          <span>Processado pela <strong>Asaas</strong> com PIX/Cartão</span>
        </div>
        <div className="flex items-start gap-2">
          <CheckCircle className="w-4 h-4 mt-0.5 text-muted-foreground flex-shrink-0" />
          <span>Confirmação imediata após o pagamento</span>
        </div>
        <div className="flex items-start gap-2">
          <Mail className="w-4 h-4 mt-0.5 text-muted-foreground flex-shrink-0" />
          <span>Você recebe recibo por e-mail</span>
        </div>
        <div className="flex items-start gap-2">
          <FileCheck className="w-4 h-4 mt-0.5 text-muted-foreground flex-shrink-0" />
          <span>Proteção de dados conforme <strong>LGPD</strong></span>
        </div>
      </CardContent>
      <CardFooter className="flex flex-wrap gap-2 text-xs">
        <span className="rounded-full border border-border bg-background px-2 py-0.5">SSL</span>
        <span className="rounded-full border border-border bg-background px-2 py-0.5">PIX</span>
        <span className="rounded-full border border-border bg-background px-2 py-0.5">Asaas</span>
      </CardFooter>
    </Card>
  );
}