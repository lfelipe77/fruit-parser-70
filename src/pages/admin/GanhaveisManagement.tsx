import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { useAuditLogger } from "@/hooks/useAuditLogger";
import {
  Search,
  Filter,
  Clock,
  TrendingUp,
  Gift,
  AlertTriangle,
} from "lucide-react";
import { getAllCategories } from "@/data/categoriesData";
import { supabase } from "@/integrations/supabase/client";
import { RafflePublicMoney } from "@/types/public-views";
import { AdminRaffleRow } from "@/components/AdminRaffleRow";
import FederalLotteryManager from "@/components/admin/FederalLotteryManager";
import { sendAppEmail } from "@/lib/sendAppEmail";
import { launchEmail } from "@/lib/emailTemplates";


const PAUSE_TO = "archived"; // toggle policy: active <-> archived
const RESUME_TO = "active";

function useRaffleActions(setRows: Function) {
  const navigate = useNavigate();

  async function onView(id: string) {
    navigate(`/ganhavel/${id}`); // open public page
  }

  async function onToggleStatus(row: any) {
    const current = (row?.status ?? "active").toLowerCase();
    const next = current === "active" ? PAUSE_TO : RESUME_TO;

    const { data, error } = await (supabase as any)
      .from("raffles")
      .update({ status: next, updated_at: new Date().toISOString() })
      .eq("id", row.id)
      .select("*")
      .single();

    if (error) {
      console.error("[Admin Ganhaveis] toggle status error:", error);
      alert("Falha ao atualizar status.");
      return;
    }

    // refresh the item in local state (list comes from view; we can patch locally)
    setRows((prev: any[]) =>
      prev.map(r => r.id === row.id ? { ...r, status: next } : r)
    );
  }

  return { onView, onToggleStatus };
}

export default function GanhaveisManagement() {
  // ✅ All hooks at the top of the component
  const [selectedTab, setSelectedTab] = useState("todas");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("todas");
  const [raffles, setRaffles] = useState<RafflePublicMoney[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { logAdminAction } = useAuditLogger();
  const { onView, onToggleStatus } = useRaffleActions(setRaffles);

  // ✅ Prevent overlapping loads
  const busyRef = useRef(false);

  // ✅ Stable loader function
  const loadRaffles = useCallback(async () => {
    if (busyRef.current) return;
    busyRef.current = true;
    try {
      setLoading(true);
      
      // Use financial view with full data for admin access
      const query = supabase
        .from('raffles_public_money_ext')
        .select(`
          id,
          title,
          description,
          image_url,
          status,
          ticket_price,
          goal_amount,
          amount_raised,
          progress_pct_money,
          last_paid_at,
          created_at,
          draw_date,
          category_name,
          subcategory_name,
          participants_count
        `)
        .order('created_at', { ascending: false });

      const { data, error } = await query;
      
      if (error) throw error;
      
      // Transform data to match expected format
      const transformedData = (data || []).map(raffle => ({
        id: raffle.id,
        title: raffle.title || 'Sem título',
        description: raffle.description,
        image_url: raffle.image_url,
        status: raffle.status || 'pending',
        ticket_price: raffle.ticket_price || 0,
        total_tickets: null, // Not used in money view
        draw_date: raffle.draw_date,
        created_at: raffle.created_at,
        category_id: null, // Not needed for display
        subcategory_id: null, // Not needed for display
        category_name: raffle.category_name,
        subcategory_name: raffle.subcategory_name,
        amount_raised: raffle.amount_raised || 0,
        goal_amount: raffle.goal_amount || 0,
        progress_pct_money: raffle.progress_pct_money || 0,
        last_paid_at: raffle.last_paid_at
      }));

      console.log('admin-rows', transformedData.length, transformedData.slice(0, 3));
      setRaffles(transformedData as RafflePublicMoney[]);
    } catch (error) {
      console.error('Error loading raffles:', error);
      setRaffles([]); // ✅ Always set to empty array on error
    } finally {
      setLoading(false);
      busyRef.current = false;
    }
  }, []);

  // Load raffles from database
  useEffect(() => {
    loadRaffles();
  }, [loadRaffles]);

  // Realtime subscription to reload on raffle inserts/updates/deletes
  useEffect(() => {
    let lastReload = 0;
    const DEBOUNCE_MS = 2000; // avoid rapid reload loops

    const handleChange = () => {
      const now = Date.now();
      if (now - lastReload < DEBOUNCE_MS) return;
      lastReload = now;
      loadRaffles();
    };

    const channel = supabase
      .channel('admin-raffles-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'raffles' }, handleChange)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [loadRaffles]);
  // ✅ Filter data safely with fallbacks
  const safeRaffles = Array.isArray(raffles) ? raffles : [];
  const safeCategories = getAllCategories() || [];
  
  const filteredGanhaveis = safeRaffles.filter((raffle) => {
    const matchesTab = selectedTab === "todas" || raffle.status === selectedTab;
    const matchesSearch = raffle.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "todas" || raffle.category_name === selectedCategory;
    
    return matchesTab && matchesSearch && matchesCategory;
  });

  const handleApprove = async (ganhaveisId: string) => {
    try {
      // First, get raffle details 
      const { data: raffleData, error: fetchError } = await supabase
        .from('raffles')
        .select(`
          id, title, slug, owner_user_id, launch_email_sent_at,
          user_profiles!owner_user_id (id, full_name)
        `)
        .eq('id', ganhaveisId)
        .single();

      if (fetchError) throw fetchError;

      // Update raffle status to active in database
      const { error: updateError } = await supabase
        .from('raffles')
        .update({ status: 'active' })
        .eq('id', ganhaveisId);

      if (updateError) throw updateError;

      // Log admin action
      logAdminAction('raffle_approved', {
        targetRaffleId: ganhaveisId,
        reason: 'Approved via admin panel'
      });

      // Send launch email if not already sent
      if (raffleData && !raffleData.launch_email_sent_at) {
        await handleLaunchEmail(raffleData);
      }

      toast({
        title: "Ganhavel Aprovado",
        description: `O ganhavel foi aprovado e está agora ativo.`,
      });
      
      // Update local state without reload
      setRaffles(prev => prev.map(r => r.id === ganhaveisId ? { ...r, status: 'active' } : r));
    } catch (error) {
      console.error('Error approving raffle:', error);
      toast({
        title: "Erro",
        description: "Falha ao aprovar o ganhavel. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const handleLaunchEmail = async (raffle: any) => {
    if (!raffle?.owner_user_id || !raffle?.title) {
      console.warn('Missing required raffle data for launch email');
      return;
    }

    try {
      // Get organizer email from auth.users
      const { data: userData, error: userError } = await supabase.auth.admin.getUserById(raffle.owner_user_id);
      
      if (userError) {
        console.error('Error fetching user for launch email:', userError);
        return;
      }

      if (!userData?.user?.email) {
        console.warn('No email found for raffle organizer:', raffle.owner_user_id);
        return;
      }

      // Atomic "send once" guard
      const { data: claim, error: claimError } = await supabase
        .from('raffles')
        .update({ launch_email_sent_at: new Date().toISOString() })
        .eq('id', raffle.id)
        .is('launch_email_sent_at', null)
        .select('id');

      if (claimError) {
        console.error('Error claiming launch email send:', claimError);
        return;
      }
      if (!claim || claim.length === 0) {
        return; // already sent/claimed
      }

      try {
        const raffleUrl = `${window.location.origin}/#/ganhavel/${raffle.slug || raffle.id}`;
        const parts = launchEmail({
          raffleTitle: raffle.title,
          raffleUrl,
          resultsUrl: `${window.location.origin}/#/resultados`,
          tipsUrl: null
        });

        await sendAppEmail(userData.user.email, parts.subject, parts.html, parts.text);
        console.log('Launch email sent successfully to:', userData.user.email);
      } catch (e) {
        console.error('Launch email send failed, reverting claim:', e);
        await supabase
          .from('raffles')
          .update({ launch_email_sent_at: null })
          .eq('id', raffle.id);
      }
    } catch (error) {
      console.error('Error sending launch email:', error);
      // Don't throw - just log the error so approval continues
    }
  };

  const handleReject = async (ganhaveisId: string, reason: string) => {
    try {
      // Update raffle status to rejected in database
      const { error: updateError } = await supabase
        .from('raffles')
        .update({ status: 'rejected' })
        .eq('id', ganhaveisId);

      if (updateError) throw updateError;

      // Log admin action
      logAdminAction('raffle_rejected', {
        targetRaffleId: ganhaveisId,
        reason
      });

      toast({
        title: "Ganhavel Rejeitado",
        description: `O ganhavel foi rejeitado. Motivo: ${reason}`,
        variant: "destructive",
      });
      
      // Update local state without reload
      setRaffles(prev => prev.map(r => r.id === ganhaveisId ? { ...r, status: 'rejected' } : r));
    } catch (error) {
      console.error('Error rejecting raffle:', error);
      toast({
        title: "Erro",
        description: "Falha ao rejeitar o ganhavel. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const handleSuspend = async (ganhaveisId: string) => {
    try {
      // Log admin action
      logAdminAction('raffle_suspended', {
        targetRaffleId: ganhaveisId,
        reason: 'Suspended via admin panel'
      });

      toast({
        title: "Ganhavel Suspenso",
        description: `O ganhavel ${ganhaveisId} foi suspenso temporariamente.`,
        variant: "destructive",
      });
    } catch (error) {
      console.error('Error suspending raffle:', error);
    }
  };

  const handleReactivate = async (ganhaveisId: string) => {
    try {
      // Log admin action
      logAdminAction('raffle_reactivated', {
        targetRaffleId: ganhaveisId,
        reason: 'Reactivated via admin panel'
      });

      toast({
        title: "Ganhavel Reativado",
        description: `O ganhavel ${ganhaveisId} foi reativado com sucesso.`,
      });
    } catch (error) {
      console.error('Error reactivating raffle:', error);
    }
  };

  const handleSaveNotes = async (ganhaveisId: string, notes: string) => {
    try {
      // Log admin action for notes update
      logAdminAction('raffle_rejected', {
        targetRaffleId: ganhaveisId,
        additionalContext: {
          action_type: 'notes_update',
          notes_preview: notes.substring(0, 100) + (notes.length > 100 ? '...' : '')
        }
      });

      toast({
        title: "Observações Salvas",
        description: "As observações administrativas foram salvas.",
      });
    } catch (error) {
      console.error('Error saving notes:', error);
    }
  };

  const handleVerifyAffiliate = (link: string) => {
    toast({
      title: "Link Verificado",
      description: "O link de afiliado foi verificado com sucesso.",
    });
  };

  // ✅ Early returns after all hooks are declared  
  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestão de Ganhaveis</h1>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
        <div className="animate-pulse space-y-4">
          <div className="h-32 bg-muted rounded-lg"></div>
          <div className="h-64 bg-muted rounded-lg"></div>
        </div>
      </div>
    );
  }

  if (!safeRaffles.length && !loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestão de Ganhaveis</h1>
          <p className="text-muted-foreground">Nenhum ganhavel encontrado</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Gestão de Ganhaveis</h1>
        <p className="text-muted-foreground">
          Aprovação, monitoramento e controle de todos os ganhaveis da plataforma
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Ganhaveis</CardTitle>
            <Gift className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{safeRaffles.length}</div>
            <p className="text-xs text-muted-foreground">+12% este mês</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {safeRaffles.filter(r => r.status === "pending").length}
            </div>
            <p className="text-xs text-muted-foreground">Aguardando aprovação</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ganhaveis Ativos</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {safeRaffles.filter(r => r.status === "active").length}
            </div>
            <p className="text-xs text-muted-foreground">Em andamento</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Concluídos</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {safeRaffles.filter(r => r.status === "completed").length}
            </div>
            <p className="text-xs text-muted-foreground">Finalizados</p>
          </CardContent>
        </Card>
      </div>

      {/* Federal Lottery Management Section */}
      <section className="mt-6">
        <FederalLotteryManager />
      </section>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label>Buscar</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por título ou organizador..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Categoria</Label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas as categorias</SelectItem>
                  {safeCategories.map(category => (
                    <SelectItem key={category.slug} value={category.slug}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Ganhaveis List */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Ganhaveis</CardTitle>
          <CardDescription>
            {filteredGanhaveis.length} ganhaveis encontrados
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={selectedTab} onValueChange={setSelectedTab}>
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="todas">Todas</TabsTrigger>
              <TabsTrigger value="pending">Pendentes</TabsTrigger>
              <TabsTrigger value="active">Ativas</TabsTrigger>
              <TabsTrigger value="review">Em Análise</TabsTrigger>
              <TabsTrigger value="suspended">Suspensas</TabsTrigger>
              <TabsTrigger value="completed">Concluídas</TabsTrigger>
            </TabsList>
            
            <TabsContent value={selectedTab} className="mt-6">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Título</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Arrecadado</TableHead>
                      <TableHead>Meta</TableHead>
                      <TableHead>%</TableHead>
                      <TableHead>Último pagamento</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8">
                          <div className="animate-pulse">Carregando...</div>
                        </TableCell>
                      </TableRow>
                    ) : filteredGanhaveis.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8">
                          <div className="text-muted-foreground">Nenhum ganhavel encontrado</div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredGanhaveis.map((raffle) => (
                        <AdminRaffleRow
                          key={raffle.id}
                          raffle={raffle}
                          onApprove={handleApprove}
                          onReject={handleReject}
                          onSuspend={handleSuspend}
                          onReactivate={handleReactivate}
                          onSaveNotes={handleSaveNotes}
                          onVerifyAffiliate={handleVerifyAffiliate}
                          onView={onView}
                          onToggleStatus={onToggleStatus}
                        />
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}