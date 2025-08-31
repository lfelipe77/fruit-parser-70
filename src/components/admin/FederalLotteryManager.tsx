import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { Calendar, Hash, Clock, Database } from "lucide-react";
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';

dayjs.extend(customParseFormat);

interface FederalStoreData {
  concurso_number: string;
  draw_date: string;
  numbers: string[];
  updated_at: string;
}

export default function FederalLotteryManager() {
  const [data, setData] = useState<FederalStoreData | null>(null);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  // Manual form state
  const [concurso, setConcurso] = useState("");
  const [drawDate, setDrawDate] = useState("");
  const [numbers, setNumbers] = useState(["", "", "", "", ""]);

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

  const syncFederalNow = async () => {
    try {
      setBusy("sync");
      
      // Store current data before sync to compare after polling
      const initialData = data;
      
      const { data: rpcData, error } = await supabase.rpc('admin_federal_sync_enqueue' as any);
      
      if (error) {
        toast({ 
          title: 'Erro ao sincronizar', 
          description: error.message, 
          variant: 'destructive' 
        });
        return;
      }

      // Start polling
      let attempts = 0;
      const maxAttempts = 8;
      
      const pollData = async (): Promise<boolean> => {
        attempts++;
        
        const { data: newData, error: fetchError } = await supabase
          .from("lottery_latest_federal_store")
          .select("concurso_number, draw_date, numbers, updated_at")
          .eq("game_slug", "federal")
          .maybeSingle();
          
        if (fetchError || !newData) {
          return false;
        }

        // Check if data changed
        const concursoChanged = newData.concurso_number !== initialData?.concurso_number;
        const dateAdvanced = initialData && new Date(newData.draw_date) > new Date(initialData.draw_date);
        const updatedAndNumbersDiffer = initialData && 
          new Date(newData.updated_at) > new Date(initialData.updated_at) &&
          JSON.stringify(newData.numbers) !== JSON.stringify(initialData.numbers);

        if (concursoChanged || dateAdvanced || updatedAndNumbersDiffer) {
          setData(newData);
          toast({ 
            title: 'Sincronizado', 
            description: `Concurso ${newData.concurso_number} - ${formatDate(newData.draw_date)}` 
          });
          
          // Invalidate queries
          queryClient.invalidateQueries({ queryKey: ['lottery_latest_federal_store'] });
          queryClient.invalidateQueries({ queryKey: ['v_federal_winners'] });
          queryClient.invalidateQueries({ queryKey: ['admin_latest_federal_status'] });
          
          return true;
        }

        return false;
      };

      // Poll every 5s for max 8 tries (~40s)
      const startPolling = () => {
        if (pollingRef.current) {
          clearInterval(pollingRef.current);
        }
        
        pollingRef.current = setInterval(async () => {
          const success = await pollData();
          
          if (success || attempts >= maxAttempts) {
            if (pollingRef.current) {
              clearInterval(pollingRef.current);
              pollingRef.current = null;
            }
            
            if (!success && attempts >= maxAttempts) {
              toast({
                title: 'Aviso',
                description: 'A API pode estar lenta — tente novamente ou use o preenchimento manual.',
                variant: 'default'
              });
            }
            
            setBusy(null);
          }
        }, 5000);
      };

      startPolling();
      
    } catch (e: any) {
      toast({ 
        title: 'Erro ao sincronizar', 
        description: e?.message || String(e), 
        variant: 'destructive' 
      });
      setBusy(null);
    }
  };

  const pickWinnerNow = async () => {
    try {
      setBusy("pick");
      const { data, error } = await supabase.rpc('admin_federal_pick_now' as any);
      
      if (error) {
        toast({ 
          title: 'Erro ao escolher vencedor', 
          description: error.message, 
          variant: 'destructive' 
        });
        return;
      }

      toast({ title: 'Vencedor calculado com sucesso' });
      
      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ['v_federal_winners'] });
      queryClient.invalidateQueries({ queryKey: ['lottery_latest_federal_store'] });
      
      await fetchData();
    } catch (e: any) {
      toast({ 
        title: 'Erro ao escolher vencedor', 
        description: e?.message || String(e), 
        variant: 'destructive' 
      });
    } finally {
      setBusy(null);
    }
  };

  const onManualSave = async () => {
    try {
      setBusy("manual");
      
      // Validate inputs
      if (!concurso.trim()) {
        toast({ title: 'Erro', description: 'Concurso é obrigatório', variant: 'destructive' });
        return;
      }
      
      if (!drawDate) {
        toast({ title: 'Erro', description: 'Data do sorteio é obrigatória', variant: 'destructive' });
        return;
      }
      
      const validNumbers = numbers.filter(n => n.trim()).map(n => n.trim().padStart(2, '0'));
      if (validNumbers.length !== 5) {
        toast({ title: 'Erro', description: 'Todos os 5 números são obrigatórios', variant: 'destructive' });
        return;
      }

      const payload = {
        p_concurso: concurso.trim(),
        p_draw_date: drawDate,
        p_numbers: validNumbers
      };
      
      const { data, error } = await supabase.rpc('admin_federal_set_latest' as any, payload);
      
      if (error) { 
        toast({ title: 'Erro', description: error.message, variant: 'destructive' }); 
        return; 
      }
      
      const response = data as { ok?: boolean; concurso?: string } | null;
      toast({ title: 'Salvo', description: `Concurso ${response?.concurso || concurso} salvo manualmente` });
      
      // Reset form
      setConcurso("");
      setDrawDate("");
      setNumbers(["", "", "", "", ""]);
      
      await fetchData();
    } catch (e: any) {
      toast({ 
        title: 'Erro', 
        description: e?.message || String(e), 
        variant: 'destructive' 
      });
    } finally {
      setBusy(null);
    }
  };

  const handleNumberChange = (index: number, value: string) => {
    // Only allow digits, max 2 chars
    const cleaned = value.replace(/\D/g, '').slice(0, 2);
    const newNumbers = [...numbers];
    newNumbers[index] = cleaned;
    setNumbers(newNumbers);
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
              <Label>Números (5 pares de dígitos)</Label>
              <div className="flex gap-2">
                {numbers.map((num, index) => (
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
    </div>
  );
}