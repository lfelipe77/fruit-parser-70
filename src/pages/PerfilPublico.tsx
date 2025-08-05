import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Link, useParams } from "react-router-dom";
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
  
  // Mock users database
  const users = {
    joaosilva: {
      name: "João Silva",
      username: "joaosilva",
      bio: "Empreendedor apaixonado por tecnologia e inovação. Ajudo pequenos negócios a crescerem através de rifas justas e transparentes.",
      location: "São Paulo, SP",
      memberSince: "Janeiro 2024",
      totalGanhaveisLancados: 8,
      totalGanhaveisParticipados: 15,
      ganhaveisCompletos: 5,
      avaliacaoMedia: 4.8,
      totalAvaliacoes: 24,
      seguidores: 1247,
      seguindo: 89,
      avatar: "",
      website: "https://joaosilva.com.br",
      videoApresentacao: "https://youtube.com/watch?v=dQw4w9WgXcQ",
      socialLinks: {
        instagram: "@joaosilva_oficial",
        facebook: "João Silva Oficial",
        twitter: "@joaosilva",
        linkedin: "joao-silva-empresario"
      }
    },
    mariasantos: {
      name: "Maria Santos",
      username: "mariasantos",
      bio: "Designer gráfica e organizadora de rifas beneficentes. Acredito no poder da comunidade para transformar vidas.",
      location: "Rio de Janeiro, RJ",
      memberSince: "Março 2024",
      totalGanhaveisLancados: 6,
      totalGanhaveisParticipados: 22,
      ganhaveisCompletos: 4,
      avaliacaoMedia: 4.9,
      totalAvaliacoes: 18,
      seguidores: 892,
      seguindo: 156,
      avatar: "",
      website: "https://mariasantos.com",
      videoApresentacao: "https://youtube.com/watch?v=abcd1234",
      socialLinks: {
        instagram: "@maria_designer",
        facebook: "Maria Santos Design",
        twitter: "@mariasantos",
        linkedin: "maria-santos-design"
      }
    },
    carlospereira: {
      name: "Carlos Pereira",
      username: "carlospereira",
      bio: "Desenvolvedor e entusiasta de tecnologia. Organizo rifas de gadgets e equipamentos eletrônicos.",
      location: "Belo Horizonte, MG",
      memberSince: "Fevereiro 2024",
      totalGanhaveisLancados: 12,
      totalGanhaveisParticipados: 8,
      ganhaveisCompletos: 9,
      avaliacaoMedia: 4.7,
      totalAvaliacoes: 31,
      seguidores: 1534,
      seguindo: 67,
      avatar: "",
      website: "",
      videoApresentacao: "",
      socialLinks: {
        instagram: "@carlosdev",
        facebook: "",
        twitter: "@carlospereira",
        linkedin: "carlos-pereira-dev"
      }
    }
  };

  // Get user data based on username, fallback to joaosilva if not found
  const user = users[username as keyof typeof users] || users.joaosilva;

  const ganhaveisLancados = [
    { 
      title: "iPhone 15 Pro Max", 
      description: "iPhone 15 Pro Max 256GB Titânio Natural",
      image: "/src/assets/iphone-15-pro-max.jpg",
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
      image: "/src/assets/dinheiro-50k.jpg",
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
      image: "/src/assets/yamaha-mt03-2024.jpg",
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
      image: "/src/assets/ps5-setup-gamer.jpg",
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
      image: "/src/assets/dinheiro-50k.jpg",
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
      image: "/src/assets/honda-civic-2024-realistic.jpg",
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
      image: "/src/assets/dinheiro-50k.jpg",
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
      image: "/src/assets/casa-alphaville.jpg",
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
      image: "/src/assets/honda-civic-2024.jpg",
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
      image: "/src/assets/casa-alphaville.jpg",
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
      image: "/src/assets/iphone-15-pro-max.jpg",
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
      image: "/src/assets/yamaha-mt03-2024.jpg",
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
      image: "/src/assets/ps5-setup-gamer.jpg",
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
      image: "/src/assets/dinheiro-50k.jpg",
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
      image: "/src/assets/dinheiro-50k.jpg",
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
      image: "/src/assets/honda-civic-2024-realistic.jpg",
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
