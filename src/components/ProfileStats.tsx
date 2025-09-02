import { Trophy, Target, CheckCircle, Rocket } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

type ProfileStatsData = {
  launched: number;
  participated: number;
  completed: number;
  won: number;
};

interface ProfileStatsProps {
  stats?: ProfileStatsData;
  isLoading: boolean;
  error?: Error | null;
  onRetry?: () => void;
}

export function ProfileStats({ stats, isLoading, error, onRetry }: ProfileStatsProps) {
  if (error) {
    return (
      <Card className="p-6">
        <div className="text-center space-y-4">
          <p className="text-sm text-muted-foreground">Erro ao carregar estatísticas</p>
          {onRetry && (
            <Button variant="outline" size="sm" onClick={onRetry}>
              Tentar novamente
            </Button>
          )}
        </div>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="h-20 bg-muted rounded-xl"></div>
          </div>
        ))}
      </div>
    );
  }

  const metrics = [
    {
      label: 'Lançados',
      value: stats?.launched || 0,
      icon: Rocket,
      color: 'text-blue-600',
    },
    {
      label: 'Participando', 
      value: stats?.participated || 0,
      icon: Target,
      color: 'text-green-600',
    },
    {
      label: 'Completos',
      value: stats?.completed || 0,
      icon: CheckCircle,
      color: 'text-purple-600',
    },
    {
      label: 'Ganhei',
      value: stats?.won || 0,
      icon: Trophy,
      color: 'text-yellow-600',
    },
  ];

  console.debug('[ProfileStats] loaded', stats);

  return (
    <div className="grid grid-cols-2 gap-4">
      {metrics.map((metric) => {
        const Icon = metric.icon;
        return (
          <Card key={metric.label} className="border border-border/60">
            <CardContent className="flex flex-col items-center justify-center p-4 text-center">
              <Icon className={`w-5 h-5 mb-2 ${metric.color}`} />
              <div className="text-2xl font-bold">{metric.value}</div>
              <div className="text-xs text-muted-foreground">{metric.label}</div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}