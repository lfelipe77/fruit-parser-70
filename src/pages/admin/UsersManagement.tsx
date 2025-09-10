import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Search,
  Filter,
  Eye,
  Ban,
  CheckCircle,
  XCircle,
  User,
  Mail,
  Calendar,
  Star,
  AlertTriangle,
  Shield,
  Users,
  Activity,
  TrendingUp,
  DollarSign,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getAvatarSrc } from '@/lib/avatarUtils';
import { useToast } from "@/hooks/use-toast";

type UserRow = {
  id: string;
  username?: string | null;
  full_name?: string | null;
  avatar_url?: string | null;
  role?: string | null;
  banned?: boolean | null;
  created_at?: string | null;
  total_ganhaveis?: number;
  total_transactions?: number;
  last_login?: string | null;
};

type UserStats = {
  total_users: number;
  active_users_30d: number;
  banned_users: number;
  new_users_month: number;
};

type UserDetail = UserRow & {
  bio?: string | null;
  location?: string | null;
  social_links?: any;
  recent_transactions?: any[];
  recent_raffles?: any[];
};

export default function UsersManagement() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserRow[]>([]);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<UserDetail | null>(null);
  const [userDetailLoading, setUserDetailLoading] = useState(false);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  
  const { toast } = useToast();

  // Load users and stats
  useEffect(() => {
    loadUsersAndStats();
  }, []);

  // Apply filters
  useEffect(() => {
    let filtered = users;
    
    if (searchTerm) {
      filtered = filtered.filter(user => 
        user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.username?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (roleFilter !== "all") {
      filtered = filtered.filter(user => user.role === roleFilter);
    }
    
    if (statusFilter !== "all") {
      const isBanned = statusFilter === "banned";
      filtered = filtered.filter(user => !!user.banned === isBanned);
    }
    
    setFilteredUsers(filtered);
  }, [users, searchTerm, roleFilter, statusFilter]);

  const loadUsersAndStats = async () => {
    setLoading(true);
    
    try {
      // Load users with basic info
      const { data: userData, error: userError } = await supabase
        .from("user_profiles")
        .select(`
          id, username, full_name, avatar_url, role, banned, created_at,
          total_ganhaveis
        `)
        .order("created_at", { ascending: false })
        .limit(500);

      if (userError) throw userError;

      // Get transaction counts per user
      const userIds = userData?.map(u => u.id) || [];
      let usersWithTransactions = userData || [];
      
      if (userIds.length > 0) {
        const { data: transactionData, error: transactionError } = await supabase
          .from("transactions")
          .select("user_id")
          .in("user_id", userIds);

        if (!transactionError) {
          const transactionCounts = transactionData.reduce((acc: Record<string, number>, t) => {
            acc[t.user_id] = (acc[t.user_id] || 0) + 1;
            return acc;
          }, {});

          usersWithTransactions = userData.map(user => ({
            ...user,
            total_transactions: transactionCounts[user.id] || 0
          }));
        }
      }

      setUsers(usersWithTransactions);

      // Load stats
      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      const [totalUsersResult, activeUsersResult, bannedUsersResult, newUsersResult] = await Promise.all([
        supabase.from("user_profiles").select("id", { count: "exact" }),
        supabase.from("user_profiles").select("id", { count: "exact" }).gte("created_at", thirtyDaysAgo.toISOString()),
        supabase.from("user_profiles").select("id", { count: "exact" }).eq("banned", true),
        supabase.from("user_profiles").select("id", { count: "exact" }).gte("created_at", startOfMonth.toISOString())
      ]);

      setStats({
        total_users: totalUsersResult.count || 0,
        active_users_30d: activeUsersResult.count || 0,
        banned_users: bannedUsersResult.count || 0,
        new_users_month: newUsersResult.count || 0
      });

    } catch (error) {
      console.error("Error loading users:", error);
      toast({
        title: "Erro",
        description: "Erro ao carregar usuários",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const loadUserDetails = async (userId: string) => {
    setUserDetailLoading(true);
    
    try {
      const { data: userDetail, error } = await supabase
        .from("user_profiles")
        .select(`
          id, username, full_name, avatar_url, role, banned, created_at,
          bio, location, social_links, total_ganhaveis
        `)
        .eq("id", userId)
        .single();

      if (error) throw error;

      // Get recent transactions
      const { data: transactions } = await supabase
        .from("transactions")
        .select("id, amount, status, created_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(5);

      // Get recent raffles
      const { data: raffles } = await supabase
        .from("raffles")
        .select("id, title, status, created_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(5);

      setSelectedUser({
        ...userDetail,
        recent_transactions: transactions || [],
        recent_raffles: raffles || []
      });

    } catch (error) {
      console.error("Error loading user details:", error);
      toast({
        title: "Erro",
        description: "Erro ao carregar detalhes do usuário",
        variant: "destructive"
      });
    } finally {
      setUserDetailLoading(false);
    }
  };

  const toggleUserBan = async (userId: string, currentBanStatus: boolean) => {
    try {
      const { error } = await supabase
        .from("user_profiles")
        .update({ banned: !currentBanStatus })
        .eq("id", userId);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: `Usuário ${!currentBanStatus ? 'banido' : 'desbloqueado'} com sucesso`
      });

      loadUsersAndStats();
      if (selectedUser?.id === userId) {
        setSelectedUser({ ...selectedUser, banned: !currentBanStatus });
      }

    } catch (error) {
      console.error("Error toggling user ban:", error);
      toast({
        title: "Erro",
        description: "Erro ao alterar status do usuário",
        variant: "destructive"
      });
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const formatCurrency = (amount: number | null) => {
    if (!amount) return "R$ 0,00";
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Carregando usuários...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Gestão de Usuários</h1>
        <Button onClick={loadUsersAndStats} variant="outline">
          <Activity className="w-4 h-4 mr-2" />
          Atualizar
        </Button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Usuários</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_users}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ativos (30 dias)</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.active_users_30d}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Usuários Banidos</CardTitle>
              <Ban className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">{stats.banned_users}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Novos (este mês)</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.new_users_month}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Label htmlFor="search">Buscar</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Nome ou username..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <Label>Função</Label>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="usuario">Usuário</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="active">Ativos</SelectItem>
                  <SelectItem value="banned">Banidos</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Usuários ({filteredUsers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Usuário</TableHead>
                <TableHead>Função</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ganhavéis</TableHead>
                <TableHead>Transações</TableHead>
                <TableHead>Criado em</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage 
                          src={getAvatarSrc({ avatar_url: user.avatar_url }, user.id)} 
                          alt={user.full_name || 'User'} 
                        />
                        <AvatarFallback>
                          {(user.full_name || user.username || 'U').charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{user.full_name || 'Nome não informado'}</div>
                        <div className="text-sm text-muted-foreground">@{user.username || 'sem-username'}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                      {user.role || 'usuário'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {user.banned ? (
                      <Badge variant="destructive">
                        <Ban className="w-3 h-3 mr-1" />
                        Banido
                      </Badge>
                    ) : (
                      <Badge variant="outline">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Ativo
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>{user.total_ganhaveis || 0}</TableCell>
                  <TableCell>{user.total_transactions || 0}</TableCell>
                  <TableCell>{formatDate(user.created_at)}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => loadUserDetails(user.id)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Detalhes do Usuário</DialogTitle>
                          </DialogHeader>
                          {userDetailLoading ? (
                            <div className="flex items-center justify-center py-8">
                              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                            </div>
                          ) : selectedUser ? (
                            <div className="space-y-6">
                              <div className="flex items-center gap-4">
                                <Avatar className="h-16 w-16">
                                  <AvatarImage 
                                    src={getAvatarSrc({ avatar_url: selectedUser.avatar_url }, selectedUser.id)} 
                                  />
                                  <AvatarFallback className="text-lg">
                                    {(selectedUser.full_name || 'U').charAt(0).toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <h3 className="text-lg font-semibold">{selectedUser.full_name}</h3>
                                  <p className="text-muted-foreground">@{selectedUser.username}</p>
                                  <div className="flex gap-2 mt-2">
                                    <Badge variant={selectedUser.role === 'admin' ? 'default' : 'secondary'}>
                                      {selectedUser.role}
                                    </Badge>
                                    {selectedUser.banned && (
                                      <Badge variant="destructive">Banido</Badge>
                                    )}
                                  </div>
                                </div>
                              </div>

                              <Tabs defaultValue="info">
                                <TabsList>
                                  <TabsTrigger value="info">Informações</TabsTrigger>
                                  <TabsTrigger value="activity">Atividade</TabsTrigger>
                                </TabsList>

                                <TabsContent value="info" className="space-y-4">
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <Label>Ganhavéis Criados</Label>
                                      <p className="text-sm">{selectedUser.total_ganhaveis || 0}</p>
                                    </div>
                                    <div>
                                      <Label>Localização</Label>
                                      <p className="text-sm">{selectedUser.location || '—'}</p>
                                    </div>
                                    <div>
                                      <Label>Bio</Label>
                                      <p className="text-sm">{selectedUser.bio || '—'}</p>
                                    </div>
                                    <div>
                                      <Label>Membro desde</Label>
                                      <p className="text-sm">{formatDate(selectedUser.created_at)}</p>
                                    </div>
                                  </div>
                                </TabsContent>

                                <TabsContent value="activity" className="space-y-4">
                                  <div>
                                    <Label>Transações Recentes</Label>
                                    {selectedUser.recent_transactions?.length ? (
                                      <div className="space-y-2 mt-2">
                                        {selectedUser.recent_transactions.map((t: any) => (
                                          <div key={t.id} className="flex justify-between text-sm">
                                            <span>{formatCurrency(t.amount)}</span>
                                            <span className="text-muted-foreground">{formatDate(t.created_at)}</span>
                                          </div>
                                        ))}
                                      </div>
                                    ) : (
                                      <p className="text-sm text-muted-foreground mt-2">Nenhuma transação</p>
                                    )}
                                  </div>

                                  <div>
                                    <Label>Ganhavéis Recentes</Label>
                                    {selectedUser.recent_raffles?.length ? (
                                      <div className="space-y-2 mt-2">
                                        {selectedUser.recent_raffles.map((r: any) => (
                                          <div key={r.id} className="text-sm">
                                            <div className="font-medium">{r.title}</div>
                                            <div className="text-muted-foreground">{formatDate(r.created_at)}</div>
                                          </div>
                                        ))}
                                      </div>
                                    ) : (
                                      <p className="text-sm text-muted-foreground mt-2">Nenhum ganhavel criado</p>
                                    )}
                                  </div>
                                </TabsContent>
                              </Tabs>

                              <div className="flex gap-2 pt-4 border-t">
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button 
                                      variant={selectedUser.banned ? "outline" : "destructive"} 
                                      size="sm"
                                    >
                                      {selectedUser.banned ? (
                                        <>
                                          <CheckCircle className="w-4 h-4 mr-2" />
                                          Desbloquear
                                        </>
                                      ) : (
                                        <>
                                          <Ban className="w-4 h-4 mr-2" />
                                          Banir Usuário
                                        </>
                                      )}
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>
                                        {selectedUser.banned ? 'Desbloquear' : 'Banir'} Usuário
                                      </AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Tem certeza que deseja {selectedUser.banned ? 'desbloquear' : 'banir'} este usuário?
                                        {!selectedUser.banned && ' Esta ação impedirá o usuário de acessar a plataforma.'}
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={() => toggleUserBan(selectedUser.id, selectedUser.banned || false)}
                                      >
                                        {selectedUser.banned ? 'Desbloquear' : 'Banir'}
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </div>
                            </div>
                          ) : null}
                        </DialogContent>
                      </Dialog>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button 
                            variant={user.banned ? "outline" : "destructive"} 
                            size="sm"
                          >
                            {user.banned ? <CheckCircle className="w-4 h-4" /> : <Ban className="w-4 h-4" />}
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              {user.banned ? 'Desbloquear' : 'Banir'} Usuário
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              Tem certeza que deseja {user.banned ? 'desbloquear' : 'banir'} o usuário {user.full_name}?
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => toggleUserBan(user.id, user.banned || false)}
                            >
                              Confirmar
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}