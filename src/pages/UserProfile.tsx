import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import ShareButton from "@/components/ShareButton";
import { useMyProfile } from "@/hooks/useMyProfile";
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Trophy, 
  Heart, 
  Settings,
  Camera,
  Globe,
  Instagram,
  Facebook,
  Twitter,
  Linkedin,
  Plus,
  Edit,
  Save,
  X
} from "lucide-react";
import Navigation from "@/components/Navigation";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function UserProfile() {
  const navigate = useNavigate();
  const { profile, loading, updateProfile } = useMyProfile();
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileFormData, setProfileFormData] = useState({
    full_name: "",
    username: "",
    bio: "", 
    location: "",
    avatar_url: ""
  });

  useEffect(() => {
    if (profile) {
      setProfileFormData({
        full_name: profile.full_name || "",
        username: profile.username || "",
        bio: profile.bio || "",
        location: profile.location || "",
        avatar_url: profile.avatar_url || ""
      });
    }
  }, [profile]);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const result = await updateProfile(profileFormData);
    
    if (result.error) {
      toast.error("Erro ao atualizar perfil");
    } else {
      toast.success("Perfil atualizado com sucesso!");
      setIsEditingProfile(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Carregando perfil...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <p className="text-muted-foreground">Perfil não encontrado</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Profile Header */}
          <Card className="mb-8">
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="relative">
                  <Avatar className="w-24 h-24">
                    <AvatarImage src={profile.avatar_url} />
                    <AvatarFallback className="text-2xl">
                      {profile.full_name?.split(' ').map(n => n[0]).join('') || 
                       profile.username?.[0]?.toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full bg-background border shadow-md"
                  >
                    <Camera className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="text-center md:text-left flex-1">
                  <h1 className="text-2xl font-bold">{profile.full_name || profile.username || 'Usuário'}</h1>
                  {profile.username && (
                    <p className="text-muted-foreground">@{profile.username}</p>
                  )}
                  {profile.location && (
                    <p className="text-sm text-muted-foreground flex items-center gap-1 justify-center md:justify-start mt-1">
                      <MapPin className="h-4 w-4" />
                      {profile.location}
                    </p>
                  )}
                  
                  <div className="flex flex-wrap gap-4 mt-4 justify-center md:justify-start">
                    <div className="flex items-center gap-2 text-sm">
                      <Plus className="h-4 w-4 text-blue-500" />
                      <span>{profile.total_ganhaveis || 0} ganhaveis criados</span>
                    </div>
                    {profile.role === 'admin' && (
                      <Badge variant="secondary">Administrador</Badge>
                    )}
                  </div>
                </div>
                
                <div className="flex gap-2">
                  {profile.username && (
                    <ShareButton 
                      url={`${window.location.origin}/perfil/${profile.username}`}
                      title={`Confira o perfil de ${profile.full_name || profile.username} na Ganhavel!`}
                      variant="outline"
                      size="sm"
                    />
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditingProfile(!isEditingProfile)}
                  >
                    {isEditingProfile ? <X className="h-4 w-4" /> : <Edit className="h-4 w-4" />}
                    {isEditingProfile ? 'Cancelar' : 'Editar'}
                  </Button>
                </div>
              </div>
              
              {profile.bio && (
                <div className="mt-6 pt-6 border-t">
                  <p className="text-muted-foreground">{profile.bio}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Edit Profile Form */}
          {isEditingProfile && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Editar Perfil</CardTitle>
                <CardDescription>
                  Atualize suas informações pessoais
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleProfileUpdate} className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="full_name">Nome completo</Label>
                      <Input
                        id="full_name"
                        value={profileFormData.full_name}
                        onChange={(e) => setProfileFormData(prev => ({
                          ...prev,
                          full_name: e.target.value
                        }))}
                        placeholder="Seu nome completo"
                      />
                    </div>
                    <div>
                      <Label htmlFor="username">Nome de usuário</Label>
                      <Input
                        id="username"
                        value={profileFormData.username}
                        onChange={(e) => setProfileFormData(prev => ({
                          ...prev,
                          username: e.target.value
                        }))}
                        placeholder="@seuusername"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="location">Localização</Label>
                    <Input
                      id="location"
                      value={profileFormData.location}
                      onChange={(e) => setProfileFormData(prev => ({
                        ...prev,
                        location: e.target.value
                      }))}
                      placeholder="Sua cidade, estado"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="bio">Biografia</Label>
                    <Input
                      id="bio"
                      value={profileFormData.bio}
                      onChange={(e) => setProfileFormData(prev => ({
                        ...prev,
                        bio: e.target.value
                      }))}
                      placeholder="Conte um pouco sobre você..."
                    />
                  </div>
                  
                  <div className="flex gap-2">
                    <Button type="submit">
                      <Save className="h-4 w-4 mr-2" />
                      Salvar
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline"
                      onClick={() => setIsEditingProfile(false)}
                    >
                      Cancelar
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Main Content Tabs */}
          <Tabs defaultValue="ganhaveis" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="ganhaveis">Meus Ganhaveis</TabsTrigger>
              <TabsTrigger value="publico">Perfil Público</TabsTrigger>
              <TabsTrigger value="configuracoes">Configurações</TabsTrigger>
              <TabsTrigger value="seguranca">Segurança</TabsTrigger>
            </TabsList>

            {/* Meus Ganhaveis Tab */}
            <TabsContent value="ganhaveis" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Ganhaveis Criados</CardTitle>
                  <CardDescription>
                    Ganhaveis que você organizou
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <p className="text-muted-foreground mb-4">
                      Você ainda não criou nenhum ganhavel
                    </p>
                    <Button asChild>
                      <Link to="/lance-seu-ganhavel">
                        <Plus className="h-4 w-4 mr-2" />
                        Criar Ganhavel
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Perfil Público Tab */}
            <TabsContent value="publico" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Visualização Pública</CardTitle>
                  <CardDescription>
                    Como outros usuários veem seu perfil
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {profile.username ? (
                    <div className="space-y-4">
                      <p className="text-sm text-muted-foreground">
                        Seu perfil público está disponível em:
                      </p>
                      <div className="p-3 bg-muted rounded-lg font-mono text-sm">
                        {window.location.origin}/perfil/{profile.username}
                      </div>
                      <div className="flex gap-2">
                        <Button asChild variant="outline">
                          <Link to={`/perfil/${profile.username}`} target="_blank">
                            <Globe className="h-4 w-4 mr-2" />
                            Ver Perfil Público
                          </Link>
                        </Button>
                        <ShareButton 
                          url={`${window.location.origin}/perfil/${profile.username}`}
                          title={`Confira o perfil de ${profile.full_name || profile.username} na Ganhavel!`}
                          variant="outline"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground mb-4">
                        Você precisa definir um nome de usuário para ter um perfil público
                      </p>
                      <Button onClick={() => setIsEditingProfile(true)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Editar Perfil
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Configurações Tab */}
            <TabsContent value="configuracoes" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Configurações da Conta</CardTitle>
                  <CardDescription>
                    Gerencie suas preferências
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button variant="outline" asChild>
                    <Link to="/alterar-senha">
                      <Settings className="h-4 w-4 mr-2" />
                      Alterar Senha
                    </Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <Link to="/gerenciar-cartoes-e-pix">
                      <Settings className="h-4 w-4 mr-2" />
                      Gerenciar Pagamentos
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Segurança Tab */}
            <TabsContent value="seguranca" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Segurança</CardTitle>
                  <CardDescription>
                    Configurações de segurança da sua conta
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Autenticação de dois fatores</h4>
                        <p className="text-sm text-muted-foreground">
                          Adicione uma camada extra de segurança
                        </p>
                      </div>
                      <Button variant="outline" disabled>
                        Configurar
                      </Button>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Sessões ativas</h4>
                        <p className="text-sm text-muted-foreground">
                          Gerencie dispositivos conectados
                        </p>
                      </div>
                      <Button variant="outline" disabled>
                        Ver sessões
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}