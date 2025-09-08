import { useAdminHealth } from '@/hooks/useAdminHealth';
import { Card, CardContent } from '@/components/ui/card';

export default function AdminHealthPanel() {
  const { data, error, loading } = useAdminHealth();

  if (loading) return <div className="text-muted-foreground">Carregando status…</div>;
  if (error) return <div className="text-destructive">Erro: {error.message}</div>;
  if (!data) return <div className="text-muted-foreground">Nenhum dado.</div>;

  const last = data.last_caixa || {};
  const pick = data.last_picker_run || {};

  const nums = Array.isArray(last.numbers) ? last.numbers.join(' - ') : '';

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <HealthCard 
        title="Prontos para Flipar (≥100%)" 
        value={data.flip_candidates} 
        hint="status=active → funded" 
      />
      <HealthCard 
        title="Prontos para Pick" 
        value={data.pick_candidates} 
        hint="status in (funded,drawing) elegíveis" 
      />
      <HealthCard 
        title="Último Caixa" 
        value={last.draw_date || '—'} 
        hint={`${nums} • conc. ${last.concurso || '—'}`} 
      />
      <HealthCard 
        title="Último Picker" 
        value={pick.last_pick_at || '—'} 
        hint={`prov: ${pick.provider || '—'} • hoje: ${pick.picks_today ?? 0}`} 
      />
    </div>
  );
}

function HealthCard({ title, value, hint }: { title: string; value: any; hint?: string }) {
  return (
    <Card className="bg-card border-border">
      <CardContent className="p-4">
        <div className="text-sm text-muted-foreground">{title}</div>
        <div className="text-3xl font-semibold my-1 text-foreground">{String(value)}</div>
        {hint ? <div className="text-xs text-muted-foreground">{hint}</div> : null}
      </CardContent>
    </Card>
  );
}