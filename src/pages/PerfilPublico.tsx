import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Link, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { PublicProfile } from "@/types/public-views";
import { 
  Trophy, 
  Heart, 
  MessageCircle,
  Share2,
  Star,
  Globe,
  Instagram,
  Facebook,
  Twitter,
  Linkedin,
  MapPin,
  Calendar,
  UserPlus,
  UserCheck,
  Users,
  Play,
  Bell,
  Eye
} from "lucide-react";
import Navigation from "@/components/Navigation";
import ProjectCard from "@/components/ProjectCard";
import VideoModal from "@/components/VideoModal";

export default function PerfilPublico() {
  const { username } = useParams();
  const [showAllGanhaveis, setShowAllGanhaveis] = useState(false);
  const [showAllGanhaveisParticipados, setShowAllGanhaveisParticipados] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchProfile = async () => {
      if (!username) return;
      
      try {
        // Try to find by username first, then by ID
        let { data, error } = await (supabase as any)
          .from('user_profiles_public')
          .select('id,username,full_name,avatar_url,bio,location,website_url,instagram,twitter,facebook,youtube,tiktok,whatsapp,telegram')
          .eq('username', username)
          .maybeSingle();
          
        if (!data && error?.code === 'PGRST116') {
          // Not found by username, try by ID
          const { data: dataById, error: errorById } = await (supabase as any)
            .from('user_profiles_public')
            .select('id,username,full_name,avatar_url,bio,location,website_url,instagram,twitter,facebook,youtube,tiktok,whatsapp,telegram')
            .eq('id', username)
            .maybeSingle();
            
          data = dataById;
          error = errorById;
        }
        
        if (error) {
          console.error('Error fetching profile:', error);
        } else {
          setProfile(data as PublicProfile | null);
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProfile();
  }, [username]);

  // Fallback user data for display if profile not found
  const user = profile ? {
    name: profile.full_name || profile.display_name || 'Usuário',
    username: profile.username || 'usuario',
    bio: profile.bio || 'Usuário da plataforma',
    location: profile.location || 'Localização não informada',
    memberSince: new Date(profile.created_at).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }),
    totalGanhaveisLancados: profile.total_ganhaveis || 0,
    totalGanhaveisParticipados: 0,
    ganhaveisCompletos: 0,
    avaliacaoMedia: profile.rating || 0,
    totalAvaliacoes: 0,
    seguidores: 0,
    seguindo: 0,
    avatar: profile.avatar_url || '',
    website: profile.social_links?.website || '',
    videoApresentacao: '',
    socialLinks: {
      instagram: profile.social_links?.instagram || '',
      facebook: profile.social_links?.facebook || '',
      twitter: profile.social_links?.twitter || '',
      linkedin: profile.social_links?.linkedin || ''
    }
  } : {
    name: "Usuário não encontrado",
    username: "usuario",
    bio: "Este perfil não foi encontrado.",
    location: "",
    memberSince: "",
    totalGanhaveisLancados: 0,
    totalGanhaveisParticipados: 0,
    ganhaveisCompletos: 0,
    avaliacaoMedia: 0,
    totalAvaliacoes: 0,
    seguidores: 0,
    seguindo: 0,
    avatar: '',
    website: '',
    videoApresentacao: '',
    socialLinks: {
      instagram: '',
      facebook: '',
      twitter: '',
      linkedin: ''
    }
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="animate-pulse space-y-4">
              <div className="h-32 bg-muted rounded"></div>
              <div className="h-8 bg-muted rounded w-48"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const ganhaveisLancados = [
    { 
      title: "iPhone 15 Pro Max", 
      description: "iPhone 15 Pro Max 256GB Titânio Natural",
      image: "/placeholder.svg",
      goal: 120,
      raised: 95,
      daysLeft: 5,
      category: "Eletrônicos",
      backers: 89,
      status: "Em andamento",
      location: "Online"
    },
    { 
      title: "R$ 50.000", 
      description: "Cinquenta mil reais em dinheiro",
      image: "/placeholder.svg",
      goal: 100,
      raised: 100,
      daysLeft: 0,
      category: "Dinheiro",
      backers: 100,
      status: "Finalizada",
      location: "Online"
    },
    { 
      title: "Yamaha MT-03 2024", 
      description: "Yamaha MT-03 2024 zero quilômetro",
      image: "/placeholder.svg",
      goal: 150,
      raised: 120,
      daysLeft: 8,
      category: "Motos",
      backers: 120,
      status: "Em andamento",
      location: "São Paulo, SP"
    },
    { 
      title: "PlayStation 5 + Setup", 
      description: "PS5 completo com jogos e acessórios",
      image: "/placeholder.svg",
      goal: 80,
      raised: 65,
      daysLeft: 12,
      category: "Eletrônicos",
      backers: 65,
      status: "Em andamento",
      location: "Online"
    },
    { 
      title: "R$ 25.000", 
      description: "Vinte e cinco mil reais em dinheiro",
      image: "/placeholder.svg",
      goal: 50,
      raised: 50,
      daysLeft: 0,
      category: "Dinheiro",
      backers: 50,
      status: "Finalizada",
      location: "Online"
    },
    { 
      title: "Honda Civic 2024", 
      description: "Honda Civic Touring 2024 completo",
      image: "/placeholder.svg",
      goal: 200,
      raised: 45,
      daysLeft: 20,
      category: "Carros",
      backers: 45,
      status: "Em andamento",
      location: "São Paulo, SP"
    },
    { 
      title: "R$ 10.000", 
      description: "Dez mil reais em dinheiro",
      image: "/placeholder.svg",
      goal: 20,
      raised: 20,
      daysLeft: 0,
      category: "Dinheiro",
      backers: 20,
      status: "Finalizada",
      location: "Online"
    },
    { 
      title: "Casa em Alphaville", 
      description: "Casa de 300m² em condomínio fechado",
      image: "/placeholder.svg",
      goal: 800,
      raised: 200,
      daysLeft: 25,
      category: "Imóveis",
      backers: 200,
      status: "Em andamento",
      location: "Barueri, SP"
    },
  ].sort((a, b) => {
    // Sort by status (Em andamento first) and then by days left
    if (a.status === "Em andamento" && b.status === "Finalizada") return -1;
    if (a.status === "Finalizada" && b.status === "Em andamento") return 1;
    if (a.status === "Em andamento" && b.status === "Em andamento") {
      return a.daysLeft - b.daysLeft;
    }
    return 0;
  });

  const displayedGanhaveis = showAllGanhaveis ? ganhaveisLancados : ganhaveisLancados.slice(0, 6);

  const ganhaveisParticipados = [
    { 
      title: "Honda Civic 2024", 
      description: "Honda Civic Touring 2024 completo",
      image: "/placeholder.svg",
      goal: 200,
      raised: 150,
      daysLeft: 12,
      category: "Carros",
      backers: 150,
      status: "Em andamento",
      numerosComprados: [123, 456],
      location: "São Paulo, SP"
    },
    { 
      title: "Casa em Alphaville", 
      description: "Casa de 300m² em condomínio fechado",
      image: "/placeholder.svg",
      goal: 800,
      raised: 650,
      daysLeft: 8,
      category: "Imóveis",
      backers: 650,
      status: "Em andamento",
      numerosComprados: [789, 12, 345],
      location: "Barueri, SP"
    },
    { 
      title: "iPhone 15 Pro Max", 
      description: "iPhone 15 Pro Max 256GB Titânio Natural",
      image: "/placeholder.svg",
      goal: 120,
      raised: 95,
      daysLeft: 5,
      category: "Eletrônicos",
      backers: 89,
      status: "Em andamento",
      numerosComprados: [45, 78],
      location: "Online"
    },
    { 
      title: "Yamaha MT-03 2024", 
      description: "Yamaha MT-03 2024 zero quilômetro",
      image: "/placeholder.svg",
      goal: 150,
      raised: 120,
      daysLeft: 15,
      category: "Motos",
      backers: 120,
      status: "Em andamento",
      numerosComprados: [234],
      location: "Rio de Janeiro, RJ"
    },
    { 
      title: "PlayStation 5 + Setup", 
      description: "PS5 completo com jogos e acessórios",
      image: "/placeholder.svg",
      goal: 80,
      raised: 80,
      daysLeft: 0,
      category: "Eletrônicos",
      backers: 80,
      status: "Finalizada",
      numerosComprados: [67, 89, 123],
      location: "Online"
    },
    { 
      title: "R$ 25.000", 
      description: "Vinte e cinco mil reais em dinheiro",
      image: "/placeholder.svg",
      goal: 50,
      raised: 50,
      daysLeft: 0,
      category: "Dinheiro",
      backers: 50,
      status: "Finalizada",
      numerosComprados: [23, 44],
      location: "Online"
    },
    { 
      title: "R$ 10.000", 
      description: "Dez mil reais em dinheiro",
      image: "/placeholder.svg",
      goal: 20,
      raised: 20,
      daysLeft: 0,
      category: "Dinheiro",
      backers: 20,
      status: "Finalizada",
      numerosComprados: [156],
      location: "Online"
    },
    { 
      title: "Honda Civic 2023", 
      description: "Honda Civic Touring 2023 usado",
      image: "/placeholder.svg",
      goal: 180,
      raised: 180,
      daysLeft: 0,
      category: "Carros",
      backers: 180,
      status: "Finalizada",
      numerosComprados: [12, 34, 56, 78],
      location: "Belo Horizonte, MG"
    },
  ].sort((a, b) => {
    // Sort by status (Em andamento first) and then by days left
    if (a.status === "Em andamento" && b.status === "Finalizada") return -1;
    if (a.status === "Finalizada" && b.status === "Em andamento") return 1;
    if (a.status === "Em andamento" && b.status === "Em andamento") {
      return a.daysLeft - b.daysLeft;
    }
    return 0;
  });

  const displayedGanhaveisParticipados = showAllGanhaveisParticipados ? ganhaveisParticipados : ganhaveisParticipados.slice(0, 6);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Profile Header */}
          <Card className="mb-8">
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row items-start gap-6">
                <div className="flex flex-col items-center">
                  <Avatar className="w-24 h-24 mb-4">
                    <AvatarImage src={user.avatar} />
                    <AvatarFallback className="text-2xl">
                      {user.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex flex-col gap-3">
                    <Button 
                      variant={isFollowing ? "secondary" : "hero"} 
                      size="sm"
                      onClick={() => setIsFollowing(!isFollowing)}
                      className="w-full"
                    >
                      {isFollowing ? (
                        <>
                          <UserCheck className="h-4 w-4 mr-2" />
                          Seguindo
                        </>
                      ) : (
                        <>
                          <UserPlus className="h-4 w-4 mr-2" />
                          Seguir
                        </>
                      )}
                    </Button>
                    
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        <MessageCircle className="h-4 w-4 mr-2" />
                        Mensagem
                      </Button>
                      <Button variant="outline" size="sm">
                        <Share2 className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    {user.videoApresentacao && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => setShowVideoModal(true)}
                        className="w-full"
                      >
                        <Play className="h-4 w-4 mr-2" />
                        Ver Vídeo de Apresentação
                      </Button>
                    )}
                  </div>
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h1 className="text-2xl font-bold">{user.name}</h1>
                    <Badge variant="secondary">@{user.username}</Badge>
                  </div>
                  
                  <p className="text-muted-foreground mb-4">{user.bio}</p>
                  
                  <div className="flex flex-wrap gap-4 mb-4 text-sm">
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>{user.location}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>Membro desde {user.memberSince}</span>
                    </div>
                  </div>

                  {/* Social Links */}
                  <div className="flex gap-3 mb-4">
                    {user.website && (
                      <Button variant="ghost" size="sm" asChild>
                        <a href={user.website} target="_blank" rel="noopener noreferrer">
                          <Globe className="h-4 w-4" />
                        </a>
                      </Button>
                    )}
                    {user.socialLinks.instagram && (
                      <Button variant="ghost" size="sm" asChild>
                        <a href={`https://instagram.com/${user.socialLinks.instagram.replace('@', '')}`} target="_blank" rel="noopener noreferrer">
                          <Instagram className="h-4 w-4" />
                        </a>
                      </Button>
                    )}
                    {user.socialLinks.facebook && (
                      <Button variant="ghost" size="sm" asChild>
                        <a href={`https://facebook.com/${user.socialLinks.facebook}`} target="_blank" rel="noopener noreferrer">
                          <Facebook className="h-4 w-4" />
                        </a>
                      </Button>
                    )}
                    {user.socialLinks.twitter && (
                      <Button variant="ghost" size="sm" asChild>
                        <a href={`https://twitter.com/${user.socialLinks.twitter.replace('@', '')}`} target="_blank" rel="noopener noreferrer">
                          <Twitter className="h-4 w-4" />
                        </a>
                      </Button>
                    )}
                    {user.socialLinks.linkedin && (
                      <Button variant="ghost" size="sm" asChild>
                        <a href={`https://linkedin.com/in/${user.socialLinks.linkedin}`} target="_blank" rel="noopener noreferrer">
                          <Linkedin className="h-4 w-4" />
                        </a>
                      </Button>
                    )}
                  </div>
                  
                   {/* Followers/Following Stats */}
                   <div className="flex gap-6 mb-4">
                     <div className="flex items-center gap-1">
                       <Users className="h-4 w-4 text-muted-foreground" />
                       <span className="font-bold">{user.seguidores.toLocaleString()}</span>
                       <span className="text-muted-foreground">seguidores</span>
                     </div>
                     <div className="flex items-center gap-1">
                       <Eye className="h-4 w-4 text-muted-foreground" />
                       <span className="font-bold">{user.seguindo}</span>
                       <span className="text-muted-foreground">seguindo</span>
                     </div>
                   </div>

                   {/* Stats */}
                   <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-primary">{ganhaveisLancados.length}</div>
                        <div className="text-sm text-muted-foreground">Ganhaveis Lançados</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-primary">{user.ganhaveisCompletos}</div>
                        <div className="text-sm text-muted-foreground">Ganhaveis Completos</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-primary">{user.totalGanhaveisParticipados}</div>
                        <div className="text-sm text-muted-foreground">Ganhaveis Participou</div>
                      </div>
                     <div className="text-center">
                       <div className="flex items-center justify-center gap-1">
                         <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                         <span className="text-2xl font-bold text-primary">{user.avaliacaoMedia}</span>
                       </div>
                       <div className="text-sm text-muted-foreground">{user.totalAvaliacoes} avaliações</div>
                     </div>
                   </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Main Content */}
          <Tabs defaultValue="ganhaveis-lancados" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="ganhaveis-lancados">Ganhaveis Lançados</TabsTrigger>
              <TabsTrigger value="ganhaveis-participados">Ganhaveis Participou</TabsTrigger>
            </TabsList>

            {/* Ganhaveis Lançados Tab */}
            <TabsContent value="ganhaveis-lancados" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Ganhaveis Lançados por {user.name}</CardTitle>
                  <CardDescription>
                    Ganhaveis organizados por este usuário
                  </CardDescription>
                </CardHeader>
                 <CardContent>
                   <div className="grid md:grid-cols-2 gap-6">
                     {displayedGanhaveis.map((ganhavel, index) => (
                      <ProjectCard
                        key={index}
                        title={ganhavel.title}
                        description={ganhavel.description}
                        image={ganhavel.image}
                        goal={ganhavel.goal}
                        raised={ganhavel.raised}
                        daysLeft={ganhavel.daysLeft}
                        category={ganhavel.category}
                        backers={ganhavel.backers}
                        location={ganhavel.location}
                      />
                    ))}
                  </div>
                   
                   {ganhaveisLancados.length > 6 && (
                     <div className="text-center mt-6">
                       <Button 
                         variant="outline" 
                         onClick={() => setShowAllGanhaveis(!showAllGanhaveis)}
                       >
                         {showAllGanhaveis ? 'Ver menos' : 'Ver mais'}
                       </Button>
                     </div>
                   )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Ganhaveis Participados Tab */}
            <TabsContent value="ganhaveis-participados" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Ganhaveis que {user.name} Participou</CardTitle>
                  <CardDescription>
                    Ganhaveis onde este usuário comprou bilhetes
                  </CardDescription>
                </CardHeader>
                 <CardContent>
                   <div className="grid md:grid-cols-2 gap-6">
                     {displayedGanhaveisParticipados.map((ganhavel, index) => (
                      <div key={index} className="relative">
                        <ProjectCard
                          title={ganhavel.title}
                          description={ganhavel.description}
                          image={ganhavel.image}
                          goal={ganhavel.goal}
                          raised={ganhavel.raised}
                          daysLeft={ganhavel.daysLeft}
                          category={ganhavel.category}
                          backers={ganhavel.backers}
                          location={ganhavel.location}
                        />
                        <Badge className="absolute top-2 right-2 bg-background/90">
                          {ganhavel.numerosComprados.length} bilhetes
                        </Badge>
                      </div>
                    ))}
                  </div>
                   
                   {ganhaveisParticipados.length > 6 && (
                     <div className="text-center mt-6">
                       <Button 
                         variant="outline" 
                         onClick={() => setShowAllGanhaveisParticipados(!showAllGanhaveisParticipados)}
                       >
                         {showAllGanhaveisParticipados ? 'Ver menos' : 'Ver mais'}
                       </Button>
                     </div>
                   )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      
      {/* Video Modal */}
      <VideoModal
        isOpen={showVideoModal}
        onClose={() => setShowVideoModal(false)}
        videoUrl={user.videoApresentacao}
        userName={user.name}
      />
    </div>
  );
}
