import { useState, useEffect } from "react";
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
} from "lucide-react";

interface UserProfile {
  id: string;
  username: string;
  full_name: string;
  avatar_url?: string;
  bio?: string;
  location?: string;
  role: string;
  rating: number;
  total_ganhaveis: number;
  banned: boolean;
  created_at: string;
  updated_at: string;
}

export default function UsersManagement() {
  const [selectedTab, setSelectedTab] = useState("todos");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("todos");
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  
  // Supabase state
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    verified: 0,
    newThisWeek: 0
  });

  // Load users from Supabase
  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: usersError } = await supabase
        .from('user_profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (usersError) {
        throw usersError;
      }

      setUsers(data || []);
      
      // Calculate stats
      const totalUsers = data?.length || 0;
      const activeUsers = data?.filter(user => !user.banned).length || 0;
      const verifiedUsers = data?.filter(user => user.role === 'admin' || user.role === 'moderator').length || 0;
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      const newUsers = data?.filter(user => new Date(user.created_at) > oneWeekAgo).length || 0;

      setStats({
        total: totalUsers,
        active: activeUsers,
        verified: verifiedUsers,
        newThisWeek: newUsers
      });

    } catch (err) {
      console.error('Error loading users:', err);
      setError(err instanceof Error ? err.message : 'Erro ao carregar usuários');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (user: UserProfile) => {
    if (user.banned) {
      return <Badge variant="outline" className="text-red-600 border-red-200"><Ban className="h-3 w-3 mr-1" />Suspenso</Badge>;
    } else {
      return <Badge variant="outline" className="text-green-600 border-green-200"><CheckCircle className="h-3 w-3 mr-1" />Ativo</Badge>;
    }
  };

  const getVerificationBadge = (user: UserProfile) => {
    const isVerified = user.role === 'admin' || user.role === 'moderator';
    return isVerified ? (
      <Badge variant="outline" className="text-blue-600 border-blue-200">
        <Shield className="h-3 w-3 mr-1" />Verificado
      </Badge>
    ) : (
      <Badge variant="outline" className="text-gray-600 border-gray-200">
        Não Verificado
      </Badge>
    );
  };

  const getReputationStars = (reputation: number) => {
    return (
      <div className="flex items-center gap-1">
        <Star className="h-4 w-4 text-yellow-500 fill-current" />
        <span className="text-sm">{reputation}/5.0</span>
      </div>
    );
  };

  const filteredUsers = users.filter((user) => {
    // Map tab selection to user status
    let matchesTab = true;
    if (selectedTab === "active") {
      matchesTab = !user.banned;
    } else if (selectedTab === "suspended") {
      matchesTab = user.banned;
    } else if (selectedTab === "pending") {
      // For pending, we could check if user has no ganhaveis created yet
      matchesTab = user.total_ganhaveis === 0;
    }
    
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = !searchTerm || 
      (user.full_name?.toLowerCase().includes(searchLower)) ||
      (user.username?.toLowerCase().includes(searchLower));
    
    // Map selected status to user properties
    let matchesStatus = true;
    if (selectedStatus === "active") {
      matchesStatus = !user.banned;
    } else if (selectedStatus === "suspended") {
      matchesStatus = user.banned;
    } else if (selectedStatus === "pending") {
      matchesStatus = user.total_ganhaveis === 0;
    }
    
    return matchesTab && matchesSearch && matchesStatus;
  });

  const handleSuspend = (userId: string) => {
    console.log("Suspender usuário:", userId);
    // Implementar lógica de suspensão
  };

  const handleReactivate = (userId: string) => {
    console.log("Reativar usuário:", userId);
    // Implementar lógica de reativação
  };

  const handleVerify = (userId: string) => {
    console.log("Verificar usuário:", userId);
    // Implementar lógica de verificação
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Gestão de Usuários</h1>
        <p className="text-muted-foreground">
          Gerencie todos os usuários da plataforma
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Usuários</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Total cadastrado</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuários Ativos</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.active.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">{stats.total > 0 ? Math.round((stats.active / stats.total) * 100) : 0}% do total</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuários Verificados</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.verified.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">{stats.total > 0 ? Math.round((stats.verified / stats.total) * 100) : 0}% do total</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Novos Usuários</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.newThisWeek.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Esta semana</p>
          </CardContent>
        </Card>
      </div>

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
                  placeholder="Buscar por nome ou email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os status</SelectItem>
                  <SelectItem value="active">Ativo</SelectItem>
                  <SelectItem value="suspended">Suspenso</SelectItem>
                  <SelectItem value="pending">Pendente</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users List */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Usuários</CardTitle>
          <CardDescription>
            {filteredUsers.length} usuários encontrados
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading && (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                <p className="text-sm text-muted-foreground">Carregando usuários...</p>
              </div>
            </div>
          )}
          
          {error && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-md p-4 mb-4">
              <p className="text-destructive text-sm">Erro ao carregar usuários: {error}</p>
              <Button 
                onClick={loadUsers} 
                variant="outline" 
                size="sm" 
                className="mt-2"
              >
                Tentar novamente
              </Button>
            </div>
          )}

          {!loading && !error && (
            <Tabs value={selectedTab} onValueChange={setSelectedTab}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="todos">Todos</TabsTrigger>
                <TabsTrigger value="active">Ativos</TabsTrigger>
                <TabsTrigger value="suspended">Suspensos</TabsTrigger>
                <TabsTrigger value="pending">Pendentes</TabsTrigger>
              </TabsList>
              
              <TabsContent value={selectedTab} className="mt-6">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Usuário</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Verificação</TableHead>
                        <TableHead>Reputação</TableHead>
                        <TableHead>Ganhaveis</TableHead>
                        <TableHead>Cargo</TableHead>
                        <TableHead>Data de Cadastro</TableHead>
                        <TableHead>Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUsers.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{user.full_name || user.username || 'Sem nome'}</div>
                              <div className="text-sm text-muted-foreground">@{user.username}</div>
                            </div>
                          </TableCell>
                          <TableCell>{getStatusBadge(user)}</TableCell>
                          <TableCell>{getVerificationBadge(user)}</TableCell>
                          <TableCell>
                            {user.rating > 0 ? getReputationStars(user.rating) : "N/A"}
                          </TableCell>
                          <TableCell>{user.total_ganhaveis}</TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {user.role === 'admin' ? 'Administrador' : 
                               user.role === 'moderator' ? 'Moderador' : 'Usuário'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              {new Date(user.created_at).toLocaleDateString('pt-BR')}
                            </div>
                          </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => setSelectedUser(user)}
                                >
                                  <Eye className="h-3 w-3" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-2xl">
                                <DialogHeader>
                                  <DialogTitle>Detalhes do Usuário - {selectedUser?.full_name || selectedUser?.username}</DialogTitle>
                                  <DialogDescription>
                                    Informações completas do usuário
                                  </DialogDescription>
                                </DialogHeader>
                                {selectedUser && (
                                  <div className="space-y-4">
                                    <div className="grid gap-4 md:grid-cols-2">
                                      <div>
                                        <Label>Nome Completo</Label>
                                        <p className="text-sm">{selectedUser.full_name || 'Não informado'}</p>
                                      </div>
                                      <div>
                                        <Label>Nome de Usuário</Label>
                                        <p className="text-sm">@{selectedUser.username}</p>
                                      </div>
                                      <div>
                                        <Label>Localização</Label>
                                        <p className="text-sm">{selectedUser.location || 'Não informado'}</p>
                                      </div>
                                      <div>
                                        <Label>Data de Cadastro</Label>
                                        <p className="text-sm">{new Date(selectedUser.created_at).toLocaleDateString('pt-BR')}</p>
                                      </div>
                                      <div>
                                        <Label>Ganhaveis Criados</Label>
                                        <p className="text-sm">{selectedUser.total_ganhaveis}</p>
                                      </div>
                                      <div>
                                        <Label>Cargo</Label>
                                        <p className="text-sm">
                                          {selectedUser.role === 'admin' ? 'Administrador' : 
                                           selectedUser.role === 'moderator' ? 'Moderador' : 'Usuário'}
                                        </p>
                                      </div>
                                      <div>
                                        <Label>Reputação</Label>
                                        <p className="text-sm">{selectedUser.rating}/5.0</p>
                                      </div>
                                      <div>
                                        <Label>Status</Label>
                                        <p className="text-sm">{selectedUser.banned ? 'Suspenso' : 'Ativo'}</p>
                                      </div>
                                      {selectedUser.bio && (
                                        <div className="col-span-2">
                                          <Label>Bio</Label>
                                          <p className="text-sm">{selectedUser.bio}</p>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                )}
                              </DialogContent>
                            </Dialog>
                            
                            {user.role === 'usuario' && !user.banned && (
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="text-blue-600 hover:text-blue-700"
                                onClick={() => handleVerify(user.id)}
                              >
                                <Shield className="h-3 w-3" />
                              </Button>
                            )}
                            
                            {!user.banned ? (
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button 
                                    size="sm" 
                                    variant="outline" 
                                    className="text-red-600 hover:text-red-700"
                                  >
                                    <Ban className="h-3 w-3" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Suspender Usuário</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Tem certeza que deseja suspender o usuário "{user.full_name || user.username}"? Ele não poderá mais criar ou participar de ganhaveis.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleSuspend(user.id)}>
                                      Suspender
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            ) : user.banned ? (
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="text-green-600 hover:text-green-700"
                                onClick={() => handleReactivate(user.id)}
                              >
                                <CheckCircle className="h-3 w-3" />
                              </Button>
                            ) : null}
                          </div>
                        </TableCell>
                      </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
      </Card>
    </div>
  );
}