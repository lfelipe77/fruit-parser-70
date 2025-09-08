import { 
  Trophy, 
  Hash, 
  Calendar, 
  Target, 
  FileText 
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
        <Trophy className="w-5 h-5 text-primary" />
        <CardTitle id="secure-title" className="text-lg">Como funciona o sorteio</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <div className="flex items-start gap-2">
          <Calendar className="w-4 h-4 mt-0.5 text-muted-foreground flex-shrink-0" />
          <span>Sorteio quando atingir 100% das vendas</span>
        </div>
        <div className="flex items-start gap-2">
          <Hash className="w-4 h-4 mt-0.5 text-muted-foreground flex-shrink-0" />
          <span>Cada bilhete tem <strong>5 números</strong></span>
        </div>
        <div className="flex items-start gap-2">
          <Target className="w-4 h-4 mt-0.5 text-muted-foreground flex-shrink-0" />
          <span>Resultado baseado na <strong>Loteria Federal</strong></span>
        </div>
        <div className="flex items-start gap-2">
          <FileText className="w-4 h-4 mt-0.5 text-muted-foreground flex-shrink-0" />
          <span>Tudo registrado na página Resultados</span>
        </div>
      </CardContent>
      <CardFooter className="flex flex-wrap gap-2 text-xs">
        <span className="rounded-full border border-border bg-background px-2 py-0.5">Federal</span>
        <span className="rounded-full border border-border bg-background px-2 py-0.5">5 números</span>
        <span className="rounded-full border border-border bg-background px-2 py-0.5">Automático</span>
      </CardFooter>
    </Card>
  );
}