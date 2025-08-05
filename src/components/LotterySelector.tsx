import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Globe } from "lucide-react";

export interface LotteryOption {
  id: string;
  name: string;
  country: string;
  flag: string;
  nextDraw: string;
  drawDays: string[];
  description: string;
}

const lotteryOptions: LotteryOption[] = [
  {
    id: 'loteria-federal-br',
    name: 'Loteria Federal',
    country: 'Brasil',
    flag: '🇧🇷',
    nextDraw: '2024-01-10 20:00',
    drawDays: ['Quarta-feira', 'Sábado'],
    description: 'Sorteio oficial da Caixa Econômica Federal'
  },
  {
    id: 'national-lottery-uk',
    name: 'National Lottery',
    country: 'Reino Unido',
    flag: '🇬🇧',
    nextDraw: '2024-01-09 19:45',
    drawDays: ['Quarta-feira', 'Sábado'],
    description: 'Loteria nacional do Reino Unido'
  },
  {
    id: 'powerball-usa',
    name: 'Powerball',
    country: 'Estados Unidos',
    flag: '🇺🇸',
    nextDraw: '2024-01-08 22:59',
    drawDays: ['Segunda', 'Quarta', 'Sábado'],
    description: 'Uma das maiores loterias americanas'
  },
  {
    id: 'loteria-nacional-es',
    name: 'Lotería Nacional',
    country: 'Espanha',
    flag: '🇪🇸',
    nextDraw: '2024-01-11 21:00',
    drawDays: ['Quinta-feira', 'Sábado'],
    description: 'Loteria nacional espanhola'
  },
  {
    id: 'lotto-max-ca',
    name: 'Lotto Max',
    country: 'Canadá',
    flag: '🇨🇦',
    nextDraw: '2024-01-12 21:30',
    drawDays: ['Terça-feira', 'Sexta-feira'],
    description: 'Loteria nacional canadense'
  },
  {
    id: 'oz-lotto-au',
    name: 'Oz Lotto',
    country: 'Austrália',
    flag: '🇦🇺',
    nextDraw: '2024-01-09 20:30',
    drawDays: ['Terça-feira'],
    description: 'Loteria nacional australiana'
  }
];

interface LoterySelectorProps {
  value?: string;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
}

export default function LotterySelector({ value, onValueChange, disabled = false }: LoterySelectorProps) {
  const selectedLottery = lotteryOptions.find(option => option.id === value);

  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium mb-2 block">
          Loteria de Referência para o Sorteio
        </label>
        <Select value={value} onValueChange={onValueChange} disabled={disabled}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione uma loteria oficial" />
          </SelectTrigger>
          <SelectContent>
            {lotteryOptions.map((lottery) => (
              <SelectItem key={lottery.id} value={lottery.id}>
                <div className="flex items-center gap-2">
                  <span className="text-lg">{lottery.flag}</span>
                  <div>
                    <div className="font-medium">{lottery.name}</div>
                    <div className="text-xs text-muted-foreground">{lottery.country}</div>
                  </div>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedLottery && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <span className="text-2xl">{selectedLottery.flag}</span>
              {selectedLottery.name}
              <Badge variant="secondary">{selectedLottery.country}</Badge>
            </CardTitle>
            <CardDescription>
              {selectedLottery.description}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Próximo sorteio:</span>
              <span className="text-primary font-medium">
                {new Date(selectedLottery.nextDraw).toLocaleString('pt-BR')}
              </span>
            </div>
            
            <div className="flex items-center gap-2 text-sm">
              <Globe className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Dias de sorteio:</span>
              <div className="flex gap-1">
                {selectedLottery.drawDays.map((day, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {day}
                  </Badge>
                ))}
              </div>
            </div>
            
            <div className="bg-muted/50 p-3 rounded-lg">
              <p className="text-xs text-muted-foreground">
                <strong>Como funciona:</strong> O resultado da sua rifa será determinado automaticamente 
                com base no resultado oficial desta loteria, garantindo total transparência e 
                impossibilidade de manipulação.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}