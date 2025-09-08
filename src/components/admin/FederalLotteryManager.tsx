import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { Calendar, Hash, Clock, Database, Search } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';

dayjs.extend(customParseFormat);

interface FederalStoreData {
  concurso_number: string;
  draw_date: string;
  numbers: string[];
  updated_at: string;
}

interface DryRunResult {
  ok: boolean;
  source: string;
  concurso_number: string;
  draw_date: string;
  numbers: string[];
  prizes_raw: any;
  debug?: any;
}

export default function FederalLotteryManager() {
  const [data, setData] = useState<FederalStoreData | null>(null);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const pollingRef = useRef<NodeJS.Timeout | null>(null);
  const syncingRef = useRef(false);

  // Manual form state
  const [concurso, setConcurso] = useState("");
  const [drawDate, setDrawDate] = useState("");
  const [manualNumbers, setManualNumbers] = useState<string[]>(Array(5).fill(''));
  
  // Dry run modal state
  const [dryRunModalOpen, setDryRunModalOpen] = useState(false);
  const [dryRunResult, setDryRunResult] = useState<DryRunResult | null>(null);

  const fetchData = async () => {
    try {
      const { data: storeData, error } = await supabase
        .from("lottery_latest_federal_store")
        .select("concurso_number, draw_date, numbers, updated_at")
        .eq("game_slug", "federal")
        .maybeSingle();
      
      if (!error && storeData) {
        setData(storeData);
      }
    } catch (e) {
      console.warn("Failed to fetch federal store data:", e);
    }
  };

  useEffect(() => {
    fetchData();
    
    const handler = () => fetchData();
    window.addEventListener("federal:refetch", handler);
    
    return () => {
      window.removeEventListener("federal:refetch", handler);
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
    };
  }, []);

  const syncFederalNow = useCallback(async () => {
    if (syncingRef.current) return;
    syncingRef.current = true;
    setBusy("sync");

    // 15s client-side timeout so UI never hangs
    const ac = new AbortController();
    const t = setTimeout(() => ac.abort(), 15000);

    try {
      // 1) Prefer invoke (adds auth automatically)
      const { data, error } = await supabase.functions.invoke('federal-sync', {
        body: { debug: '1' },
        // @ts-ignore: supabase-js passes signal through
        signal: ac.signal,
      });

      if (error) throw error;
      const payload = data ?? {};
      if (payload.ok === false) throw new Error(payload.error || 'Sync failed');

      toast({ 
        title: 'Sync OK', 
        description: `Concurso ${payload.concurso_number || 'N/A'}` 
      });
      await fetchData(); // refresh data

    } catch (err: any) {
      // 2) Fallback to direct fetch ONCE (with body!)
      try {
        const SUPABASE_URL = "https://whqxpuyjxoiufzhvqneg.supabase.co";
        const res = await fetch(`${SUPABASE_URL}/functions/v1/federal-sync?debug=1`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({}), // important
          signal: ac.signal
        });
        const payload = await res.json().catch(() => ({ ok: false, error: 'Invalid JSON' }));
        if (!payload.ok) throw new Error(payload.error || 'Sync failed');

        toast({ 
          title: 'Sync OK', 
          description: `Concurso ${payload.concurso_number || 'N/A'}` 
        });
        await fetchData();

      } catch (e2: any) {
        toast({ 
          title: 'Sync failed', 
          description: e2?.message || String(e2), 
          variant: 'destructive' 
        });
        console.warn('[syncFederalNow] fail', e2);
      }

    } finally {
      clearTimeout(t);
      setBusy(null);
      syncingRef.current = false;
    }

  }, []);

  const pickWinnerNow = async () => {
    try {
      setBusy("pick");
      console.log('[PickNow] calling admin_federal_pick_now');

      const { data, error } = await supabase.rpc('admin_federal_pick_now' as any);

      if (error) {
        console.error('[PickNow] RPC error', error);
        toast({ 
          title: 'Erro', 
          description: error.message ?? 'Falha ao processar ganhadores.', 
          variant: 'destructive' 
        });
        return;
      }

      if (!data?.ok) {
        console.warn('[PickNow] RPC not ok', data);
        toast({ 
          title: 'Erro', 
          description: data?.error ?? 'Pick falhou.', 
          variant: 'destructive' 
        });
        return;
      }

      const picked = Number(data?.picked ?? 0);
      if (picked > 0) {
        toast({ title: 'Sucesso!', description: `Ganhadores processados: ${picked}` });
      } else {
        toast({ title: 'Nenhum sorteio elegível', description: 'Sem matches ou já premiados.' });
      }

      // Make sure "Completas" and related views refresh
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['raffles'] }),
        queryClient.invalidateQueries({ queryKey: ['raffles', 'completed-unpicked'] }),
        queryClient.invalidateQueries({ queryKey: ['raffle_winners'] }),
        queryClient.invalidateQueries({ queryKey: ['v_federal_winners'] }),
        queryClient.invalidateQueries({ queryKey: ['lottery_latest_federal_store'] }),
        queryClient.invalidateQueries({ queryKey: ['completed_unpicked'] }),
      ]);
      
      await fetchData();
    } catch (e: any) {
      console.error('[PickNow] exception', e);
      toast({ 
        title: 'Erro', 
        description: e?.message ?? 'Erro inesperado no Pick.', 
        variant: 'destructive' 
      });
    } finally {
      setBusy(null);
    }
  };

  // Force: call Edge Function directly and then pick
  const forceSyncAndPick = async () => {
    try {
      setBusy("force");
      
      // Step 1: Force sync latest lottery numbers
      toast({ title: 'Iniciando sync forçado...', description: 'Buscando últimos resultados' });
      
      const { data: syncResult, error } = await supabase.functions.invoke('federal-sync', {
        body: { auto_pick: '1', debug: '1' }
      });
      
      if (error) {
        throw new Error(`Sync failed: ${error.message}`);
      }
      
      // Step 2: Refresh our local data
      await fetchData();
      
      // Step 3: Check if we have completed raffles to pick from
      const { data: completedRaffles, error: raffleErr } = await supabase
        .from('raffles')
        .select('id, title, status')
        .eq('status', 'completed');
        
      if (raffleErr) {
        throw new Error(`Failed to check raffles: ${raffleErr.message}`);
      }
      
      if (!completedRaffles || completedRaffles.length === 0) {
        toast({ 
          title: 'Aviso', 
          description: 'Números atualizados, mas não há rifas concluídas para sortear vencedores.',
          variant: 'default'
        });
        return;
      }
      
      // Step 4: Run winner picking algorithm
      toast({ title: 'Calculando vencedores...', description: `${completedRaffles.length} rifas para processar` });
      
      const { data: pickResult, error: pickErr } = await supabase.rpc('admin_federal_pick_now' as any);
      
      if (pickErr) {
        throw new Error(`Pick failed: ${pickErr.message}`);
      }
      
      // Step 5: Success - invalidate caches and refresh
      toast({ 
        title: '✅ Sync + Pick concluídos!', 
        description: `Resultados: ${syncResult?.concurso || 'N/A'} | Vencedores calculados`
      });
      
      queryClient.invalidateQueries({ queryKey: ['v_federal_winners'] });
      queryClient.invalidateQueries({ queryKey: ['lottery_latest_federal_store'] });
      queryClient.invalidateQueries({ queryKey: ['completed_unpicked'] });
      queryClient.invalidateQueries({ queryKey: ['raffles'] });
      
    } catch (e: any) {
      console.error('Force sync failed:', e);
      toast({ 
        title: 'Erro no processo', 
        description: e?.message || String(e), 
        variant: 'destructive' 
      });
    } finally {
      setBusy(null);
    }
  };

  const onManualSave = async (event?: React.FormEvent) => {
    console.log('[onManualSave] Starting manual save...');
    
    if (event) {
      event.preventDefault();
    }
    
    try {
      setBusy("manual");
      console.log('[onManualSave] Set busy state to manual');
      
      // Normalize payload before calling RPC
      const normalizedConcurso = (concurso || '').toString().trim();
      const isoDate = new Date(drawDate).toISOString().slice(0, 10);
      
      // Make sure these are STRINGS with 2 digits
      const numbers = (manualNumbers || [])
        .map((n: string | number) => n.toString().trim())
        .filter(Boolean)
        .map(s => s.padStart(2, '0'));
      
      console.log('[onManualSave] Normalized data:', {
        normalizedConcurso,
        isoDate,
        numbers,
        originalDrawDate: drawDate,
        originalNumbers: manualNumbers
      });
      
      // Validate inputs
      if (!normalizedConcurso) {
        console.log('[onManualSave] Validation failed: missing concurso');
        toast({ title: 'Erro', description: 'Concurso é obrigatório', variant: 'destructive' });
        return;
      }
      
      if (!drawDate) {
        console.log('[onManualSave] Validation failed: missing draw date');
        toast({ title: 'Erro', description: 'Data do sorteio é obrigatória', variant: 'destructive' });
        return;
      }
      
      if (numbers.length !== 5) {
        console.log('[onManualSave] Validation failed: wrong number count', numbers.length);
        toast({ title: 'Erro', description: 'Informe exatamente 5 dezenas (00–99).', variant: 'destructive' });
        return;
      }
      
      const payload = {
        p_concurso: normalizedConcurso,
        p_draw_date: isoDate,
        p_numbers: numbers
      };
      
      console.log('[onManualSave] Calling RPC with payload:', payload);
      
      const { data, error } = await supabase.rpc('admin_federal_set_latest' as any, payload);
      
      console.log('[onManualSave] RPC response:', { data, error });
      
      if (error) {
        console.error('[admin_federal_set_latest] error', error);
        toast({ title: 'Erro', description: error.message || 'Falha ao salvar override.', variant: 'destructive' });
        return; // Don't reset form on error
      }
      
      const response = data as { ok?: boolean; concurso?: string } | null;
      console.log('[onManualSave] Success response:', response);
      
      toast({ title: 'Override salvo com sucesso!', description: `Concurso ${response?.concurso || normalizedConcurso}` });
      
      // Invalidate queries after successful save
      queryClient.invalidateQueries({ queryKey: ['lottery_latest_federal_store'] });
      queryClient.invalidateQueries({ queryKey: ['v_federal_winners'] });
      queryClient.invalidateQueries({ queryKey: ['admin_latest_federal_status'] });
      queryClient.invalidateQueries({ queryKey: ['completed_unpicked'] });
      
      // Only reset form on success
      setConcurso("");
      setDrawDate("");
      setManualNumbers(["", "", "", "", ""]);
      
      console.log('[onManualSave] Form reset, refreshing data...');
      await fetchData();
      console.log('[onManualSave] Data refresh complete');
    } catch (e: any) {
      console.error('[onManualSave] catch', e);
      toast({ 
        title: 'Erro', 
        description: e?.message || String(e), 
        variant: 'destructive' 
      });
      // Don't reset form on error
    } finally {
      console.log('[onManualSave] Finally block, clearing busy state');
      setBusy(null);
    }
  };

  const handleNumberChange = (index: number, value: string) => {
    // Only allow digits, max 2 chars
    const cleaned = value.replace(/\D/g, '').slice(0, 2);
    const newNumbers = [...manualNumbers];
    newNumbers[index] = cleaned;
    setManualNumbers(newNumbers);
  };

  const formatDate = (dateStr: string) => {
    try {
      return dayjs(dateStr, 'YYYY-MM-DD').format('DD/MM/YYYY');
    } catch {
      return dateStr;
    }
  };

  const formatTime = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleString('pt-BR');
    } catch {
      return dateStr;
    }
  };

  const isStale = () => {
    if (!data?.updated_at || !data?.draw_date) return false;
    
    const now = dayjs();
    const drawDate = dayjs(data.draw_date, 'YYYY-MM-DD');
    const dayOfWeek = drawDate.day(); // 0=Sunday, 3=Wednesday, 6=Saturday
    
    // Check if it's after 20:40 on Wednesday (3) or Saturday (6)
    if ((dayOfWeek === 3 || dayOfWeek === 6) && now.hour() >= 20 && now.minute() >= 40) {
      const today = now.format('YYYY-MM-DD');
      const drawDateStr = drawDate.format('YYYY-MM-DD');
      return drawDateStr < today;
    }
    
    return false;
  };

  // Normalization helper for dry run preview
  const normalizePrizes = (rawPrizes: any): string[] | null => {
    let source: any[] = [];
    
    if (Array.isArray(rawPrizes)) {
      source = rawPrizes;
    } else if (rawPrizes && typeof rawPrizes === 'object') {
      source = Object.values(rawPrizes);
    } else if (rawPrizes) {
      source = [rawPrizes];
    }
    
    const normalized = source
      .slice(0, 5)
      .map(x => String(x).replace(/\D/g, '').padStart(5, '0'))
      .filter(x => x.length === 5);
    
    return normalized.length === 5 ? normalized : null;
  };

  const dryRunSync = async () => {
    try {
      setBusy("dry-run");
      toast({ title: 'Dry-run iniciado...', description: 'Testando sync sem writes' });

      let response: Response;
      let result: any;

      // First try supabase.functions.invoke
      try {
        const { data, error } = await supabase.functions.invoke('federal-sync', {
          body: { debug: '1', dry_run: '1' }
        });
        
        if (error) throw error;
        result = data;
      } catch (invokeError) {
        // Fallback to direct fetch
        console.warn('invoke() failed, trying direct fetch:', invokeError);
        toast({ 
          title: 'Fallback ativo', 
          description: 'invoke() falhou, tentando URL direta...' 
        });
        
        const supabaseUrl = "https://whqxpuyjxoiufzhvqneg.supabase.co";
        const functionsUrl = `${supabaseUrl}/functions/v1/federal-sync?debug=1&dry_run=1`;
        
        response = await fetch(functionsUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({})
        });
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        result = await response.json();
      }

      console.info('[federal-sync dry-run]', result);
      
      setDryRunResult(result);
      setDryRunModalOpen(true);
      
      toast({ 
        title: 'Dry-run concluído', 
        description: result.ok ? 'Dados obtidos com sucesso' : 'Falha na obtenção' 
      });
      
    } catch (e: any) {
      console.error('Dry-run failed:', e);
      toast({ 
        title: 'Dry-run falhou', 
        description: e?.message || String(e), 
        variant: 'destructive' 
      });
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Gerenciar Loteria Federal
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Status Card */}
          <div className="border rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">Status Atual</h3>
              <Badge variant="outline">
                {data ? "Store" : "Sem dados"}
              </Badge>
            </div>
            
            {data ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Hash className="h-4 w-4 text-muted-foreground" />
                  <span>Concurso: <strong>{data.concurso_number}</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>Data: <strong>{formatDate(data.draw_date)}</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>Atualizado: <strong>{formatTime(data.updated_at)}</strong></span>
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground">Nenhum dado encontrado</p>
            )}
            
            {data?.numbers && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Números:</span>
                <div className="flex gap-1">
                  {data.numbers.map((num, i) => (
                    <span key={i} className="bg-primary text-primary-foreground px-2 py-1 rounded text-sm font-mono">
                      {num}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {isStale() && (
              <Badge variant="destructive" className="text-xs">
                ⚠️ Dados podem estar desatualizados após sorteio
              </Badge>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3">
            <Button 
              onClick={syncFederalNow} 
              disabled={!!busy}
              variant="default"
            >
              {busy === "sync" ? "Sincronizando…" : "Sincronizar Resultado (Caixa)"}
            </Button>
            
            <Button 
              onClick={pickWinnerNow} 
              disabled={!!busy}
              variant="secondary"
            >
              {busy === "pick" ? "Calculando…" : "Pick agora (Federal)"}
            </Button>

            <Button
              onClick={forceSyncAndPick}
              disabled={!!busy}
              variant="outline"
            >
              {busy === "force" ? "Executando…" : "Forçar Sync + Pick"}
            </Button>

            <Button
              onClick={dryRunSync}
              disabled={!!busy}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Search className="h-4 w-4" />
              {busy === "dry-run" ? "Testando…" : "Dry-run Sync (no writes)"}
            </Button>
          </div>

          {/* Manual Override Form */}
          <div className="border rounded-lg p-4 space-y-4">
            <h3 className="font-medium">Override Manual</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="concurso">Concurso</Label>
                <Input
                  id="concurso"
                  value={concurso}
                  onChange={(e) => setConcurso(e.target.value)}
                  placeholder="Ex: 5123"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="drawDate">Data do Sorteio</Label>
                <Input
                  id="drawDate"
                  type="date"
                  value={drawDate}
                  onChange={(e) => setDrawDate(e.target.value)}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Números Federais (5 dezenas)</Label>
              <div className="flex gap-2">
                {manualNumbers.map((num, index) => (
                  <Input
                    key={index}
                    value={num}
                    onChange={(e) => handleNumberChange(index, e.target.value)}
                    className="w-16 text-center font-mono"
                    placeholder={String(index + 1).padStart(2, '0')}
                    maxLength={2}
                  />
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                Digite os 5 números sorteados (cada um com 2 dígitos: 00-99)
              </p>
            </div>
            
            <div className="flex items-center justify-between">
              <Button 
                onClick={onManualSave} 
                disabled={!!busy}
                variant="outline"
              >
                {busy === "manual" ? "Salvando…" : "Salvar Manual"}
              </Button>
              
              <p className="text-xs text-muted-foreground">
                💡 O cálculo de ganhador roda automaticamente após salvar
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dry Run Modal */}
      <Dialog open={dryRunModalOpen} onOpenChange={setDryRunModalOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Federal Sync - Dry Run Results
            </DialogTitle>
          </DialogHeader>
          
          {dryRunResult && (
            <div className="space-y-6">
              {/* Status */}
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Status:</span>
                <Badge variant={dryRunResult.ok ? "default" : "destructive"}>
                  {dryRunResult.ok ? "✅ OK" : "❌ Falha"}
                </Badge>
              </div>

              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label className="text-xs text-muted-foreground">Concurso</Label>
                  <p className="font-mono text-sm">{dryRunResult.concurso_number || 'N/A'}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Data</Label>
                  <p className="font-mono text-sm">{formatDate(dryRunResult.draw_date) || 'N/A'}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Fonte</Label>
                  <p className="font-mono text-sm">{dryRunResult.source || 'N/A'}</p>
                </div>
              </div>

              {/* Raw Prizes */}
              <div>
                <Label className="text-sm font-medium">Prizes Raw (JSON)</Label>
                <pre className="bg-muted p-3 rounded-md text-xs overflow-x-auto mt-1">
                  {JSON.stringify(dryRunResult.prizes_raw, null, 2)}
                </pre>
              </div>

              {/* Normalized Prizes Preview */}
              <div>
                <Label className="text-sm font-medium">Prizes Normalized (Preview)</Label>
                {(() => {
                  const normalized = normalizePrizes(dryRunResult.prizes_raw);
                  return normalized ? (
                    <div className="flex gap-1 mt-2">
                      {normalized.map((num, i) => (
                        <span key={i} className="bg-primary text-primary-foreground px-2 py-1 rounded text-sm font-mono">
                          {num}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <Badge variant="destructive" className="mt-2">Incomplete - Menos de 5 números válidos</Badge>
                  );
                })()}
              </div>

              {/* Helper Text */}
              <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-md p-3">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  💡 <strong>Dry-run only</strong> — Nenhuma escrita foi feita no banco de dados.
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}