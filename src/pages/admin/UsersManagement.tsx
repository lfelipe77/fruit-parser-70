import { useState } from "react";
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

const usersData = [
  {
    id: "U001",
    name: "João Silva",
    email: "joao@email.com",
    phone: "(11) 99999-9999",
    status: "active",
    registrationDate: "2024-01-15",
    rifasCreated: 3,
    rifasParticipated: 12,
    totalSpent: "R$ 1.450",
    totalEarned: "R$ 6.000",
    reputation: 4.8,
    isVerified: true,
    warnings: 0,
  },
  {
    id: "U002",
    name: "Maria Santos",
    email: "maria@email.com",
    phone: "(11) 88888-8888",
    status: "active",
    registrationDate: "2024-01-10",
    rifasCreated: 1,
    rifasParticipated: 8,
    totalSpent: "R$ 780",
    totalEarned: "R$ 120.000",
    reputation: 4.9,
    isVerified: true,
    warnings: 0,
  },
  {
    id: "U003",
    name: "Carlos Mendes",
    email: "carlos@email.com",
    phone: "(11) 77777-7777",
    status: "suspended",
    registrationDate: "2024-01-05",
    rifasCreated: 5,
    rifasParticipated: 15,
    totalSpent: "R$ 2.100",
    totalEarned: "R$ 8.500",
    reputation: 3.2,
    isVerified: false,
    warnings: 3,
  },
  {
    id: "U004",
    name: "Ana Costa",
    email: "ana@email.com",
    phone: "(11) 66666-6666",
    status: "pending",
    registrationDate: "2024-01-12",
    rifasCreated: 1,
    rifasParticipated: 2,
    totalSpent: "R$ 200",
    totalEarned: "R$ 0",
    reputation: 0,
    isVerified: false,
    warnings: 0,
  },
];

export default function UsersManagement() {
  const [selectedTab, setSelectedTab] = useState("todos");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("todos");
  const [selectedUser, setSelectedUser] = useState<any>(null);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge variant="outline" className="text-green-600 border-green-200"><CheckCircle className="h-3 w-3 mr-1" />Ativo</Badge>;
      case "suspended":
        return <Badge variant="outline" className="text-red-600 border-red-200"><Ban className="h-3 w-3 mr-1" />Suspenso</Badge>;
      case "pending":
        return <Badge variant="outline" className="text-orange-600 border-orange-200"><AlertTriangle className="h-3 w-3 mr-1" />Pendente</Badge>;
      default:
        return <Badge variant="outline">Desconhecido</Badge>;
    }
  };

  const getVerificationBadge = (isVerified: boolean) => {
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

  const filteredUsers = usersData.filter((user) => {
    const matchesTab = selectedTab === "todos" || user.status === selectedTab;
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === "todos" || user.status === selectedStatus;
    
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
            <div className="text-2xl font-bold">2,847</div>
            <p className="text-xs text-muted-foreground">+12% este mês</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuários Ativos</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2,654</div>
            <p className="text-xs text-muted-foreground">93% do total</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuários Verificados</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,890</div>
            <p className="text-xs text-muted-foreground">66% do total</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Novos Usuários</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">85</div>
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
                      <TableHead>Rifas Criadas</TableHead>
                      <TableHead>Total Gasto</TableHead>
                      <TableHead>Warnings</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{user.name}</div>
                            <div className="text-sm text-muted-foreground">{user.email}</div>
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(user.status)}</TableCell>
                        <TableCell>{getVerificationBadge(user.isVerified)}</TableCell>
                        <TableCell>
                          {user.reputation > 0 ? getReputationStars(user.reputation) : "N/A"}
                        </TableCell>
                        <TableCell>{user.rifasCreated}</TableCell>
                        <TableCell>{user.totalSpent}</TableCell>
                        <TableCell>
                          {user.warnings > 0 ? (
                            <Badge variant="outline" className="text-red-600 border-red-200">
                              {user.warnings}
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-green-600 border-green-200">
                              0
                            </Badge>
                          )}
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
                                  <DialogTitle>Detalhes do Usuário - {selectedUser?.name}</DialogTitle>
                                  <DialogDescription>
                                    Informações completas do usuário
                                  </DialogDescription>
                                </DialogHeader>
                                {selectedUser && (
                                  <div className="space-y-4">
                                    <div className="grid gap-4 md:grid-cols-2">
                                      <div>
                                        <Label>Nome</Label>
                                        <p className="text-sm">{selectedUser.name}</p>
                                      </div>
                                      <div>
                                        <Label>Email</Label>
                                        <p className="text-sm">{selectedUser.email}</p>
                                      </div>
                                      <div>
                                        <Label>Telefone</Label>
                                        <p className="text-sm">{selectedUser.phone}</p>
                                      </div>
                                      <div>
                                        <Label>Data de Registro</Label>
                                        <p className="text-sm">{selectedUser.registrationDate}</p>
                                      </div>
                                      <div>
                                        <Label>Rifas Criadas</Label>
                                        <p className="text-sm">{selectedUser.rifasCreated}</p>
                                      </div>
                                      <div>
                                        <Label>Rifas Participadas</Label>
                                        <p className="text-sm">{selectedUser.rifasParticipated}</p>
                                      </div>
                                      <div>
                                        <Label>Total Gasto</Label>
                                        <p className="text-sm">{selectedUser.totalSpent}</p>
                                      </div>
                                      <div>
                                        <Label>Total Ganho</Label>
                                        <p className="text-sm">{selectedUser.totalEarned}</p>
                                      </div>
                                      <div>
                                        <Label>Reputação</Label>
                                        <p className="text-sm">{selectedUser.reputation}/5.0</p>
                                      </div>
                                      <div>
                                        <Label>Warnings</Label>
                                        <p className="text-sm">{selectedUser.warnings}</p>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </DialogContent>
                            </Dialog>
                            
                            {!user.isVerified && user.status === "active" && (
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="text-blue-600 hover:text-blue-700"
                                onClick={() => handleVerify(user.id)}
                              >
                                <Shield className="h-3 w-3" />
                              </Button>
                            )}
                            
                            {user.status === "active" ? (
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
                                      Tem certeza que deseja suspender o usuário "{user.name}"? Ele não poderá mais criar ou participar de rifas.
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
                            ) : user.status === "suspended" ? (
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
        </CardContent>
      </Card>
    </div>
  );
}