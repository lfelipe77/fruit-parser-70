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
  MapPin,
  Calendar,
  Play,
  Eye,
  Globe,
  Instagram,
  Facebook,
  Twitter,
  Linkedin,
  Users,
  Star
} from "lucide-react";
import Navigation from "@/components/Navigation";
import ProjectCard from "@/components/ProjectCard";
import VideoModal from "@/components/VideoModal";
import { useAuth } from '@/hooks/useAuth';
import { getPublicLaunchedWithProgress } from "@/data/raffles";
import { useProfileStats } from "@/hooks/useProfileStats";
import { ProfileStats } from "@/components/ProfileStats";
import { getAvatarSrc } from '@/lib/avatarUtils';

export default function PerfilPublico() {
  const { username } = useParams();
  const { user: currentUser } = useAuth();
  const [showAllGanhaveis, setShowAllGanhaveis] = useState(false);
  const [showAllGanhaveisParticipados, setShowAllGanhaveisParticipados] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [ganhaveisLancados, setGanhaveisLancados] = useState<any[]>([]);
  const [ganhaveisParticipados, setGanhaveisParticipados] = useState<any[]>([]);
  const [loadingGanhaveis, setLoadingGanhaveis] = useState(true);
  
  // Get stats for this profile
  const profileUserId = profile?.id;
  const { data: stats, isLoading: statsLoading } = useProfileStats(profileUserId);
  const isMe = currentUser?.id === profileUserId;
  
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

  // Fetch user's ganhaveis data
  useEffect(() => {
    const fetchGanhaveisData = async () => {
      if (!profile?.id) return;
      
      try {
        setLoadingGanhaveis(true);
        
        // Check if viewer is the profile owner
        const { data: authRes } = await supabase.auth.getUser();
        const authUserId = authRes?.user?.id ?? null;
        
        // Support multiple possible shapes in the profile row
        const profileUserId = 
          profile?.user_id ??
          profile?.auth_user_id ??
          profile?.id ?? // if your public profile table actually uses the auth UUID as id
          null;
        
        const isOwner = Boolean(authUserId && profileUserId && authUserId === profileUserId);
        
        // DEV guard so we can see what's happening
        if (import.meta.env.DEV) {
          console.debug('[PerfilPublico] authUserId=', authUserId, 'profileUserId=', profileUserId, 'isOwner=', isOwner, 'slug=', profile?.username);
        }
        
        // Fetch ganhaveis lancados using shared helper
        try {
          const lancados = await getPublicLaunchedWithProgress(profile.id);
          
          if (import.meta.env.DEV && lancados?.some((r: any) => r.user_id !== profileUserId)) {
            console.error('⚠️ Escopo quebrado em Lançados (profile)', lancados);
          }
          
          setGanhaveisLancados(lancados);
          
          // Debug logging
          const debug = new URLSearchParams(location.hash.split('?')[1]).get('debug') === '1';
          if (debug) {
            console.log('[PerfilPublico] profile uid', profile.id, 'count', lancados.length);
            console.table(lancados.map(x => ({ id: x.id.slice(0,8), status: x.status, pct: x.progress_pct_money })));
          }
        } catch (lancadosError) {
          console.error('Error fetching launched ganhaveis:', lancadosError);
          setGanhaveisLancados([]);
        }

        // Fetch ganhaveis participados (public data)
        let participados: any[] = [];
        let participadosError: any = null;

        const { data, error } = await supabase
          .from('transactions')
          .select(`
            raffle_id,
            raffles!inner(title, image_url, draw_date),
            amount,
            status,
            numbers,
            created_at,
            buyer_user_id
          `)
          .eq('buyer_user_id', profileUserId)
          .eq('status', 'paid')
          .order('created_at', { ascending: false })
          .limit(200);

        participados = data ?? [];
        participadosError = error;

        if (import.meta.env.DEV) {
          if (!data) console.warn('[PerfilPublico] participados empty or null', error);
          if (participados.some(r => !r.raffle_id)) console.error('Participou row missing raffle_id', participados);
        }
          
        if (participadosError) {
          console.error('Error fetching participated ganhaveis:', participadosError);
        } else {
          // Group by raffle_id and aggregate ticket counts (one row per raffle)
          const groupedMap = new Map<string, any>();
          for (const row of participados) {
            const key = row.raffle_id;
            if (!key) continue;
            const existing = groupedMap.get(key);
            
            // Extract ticket count from numbers array
            const ticketCount = Array.isArray(row.numbers) ? row.numbers.length : 0;
            const purchasedNumbers = Array.isArray(row.numbers) ? row.numbers : [];
            
            if (existing) {
              existing.ticket_count += ticketCount;
              existing.purchased_numbers.push(...purchasedNumbers);
            } else {
              groupedMap.set(key, {
                raffle_id: row.raffle_id,
                raffle_title: row.raffles?.title || 'Raffle sem título',
                raffle_image_url: row.raffles?.image_url || '',
                goal_amount: 0, // We don't have this from transactions
                amount_raised: 0, // We don't have this from transactions
                progress_pct_money: 0, // We don't have this from transactions
                draw_date: row.raffles?.draw_date,
                ticket_count: ticketCount,
                purchased_numbers: [...purchasedNumbers],
              });
            }
          }

          // Fetch raffle statuses to drive button labels
          const raffleIds = Array.from(groupedMap.keys());
          let statusesById: Record<string, string> = {};
          if (raffleIds.length) {
            const { data: rStatus, error: rErr } = await supabase
              .from('raffles')
              .select('id,status')
              .in('id', raffleIds);
            if (rErr) {
              console.error('[PerfilPublico] Failed to fetch raffle statuses', rErr);
            } else {
              statusesById = Object.fromEntries((rStatus || []).map((r: any) => [r.id, r.status]));
            }
          }

          const grouped = raffleIds.map((id) => ({
            ...groupedMap.get(id),
            raffle_status: statusesById[id] || null,
          }));

          // DEV: check duplicate leaks
          if (import.meta.env.DEV) {
            const uniqueCount = new Set(participados.map(p => p.raffle_id).filter(Boolean)).size;
            if (grouped.length !== uniqueCount) {
              console.error('[PerfilPublico] Duplicate leak after grouping', { original: participados.length, unique: uniqueCount, grouped: grouped.length });
            } else {
              console.debug('[PerfilPublico] Participou grouped', { original: participados.length, grouped: grouped.length });
            }
          }
          
          setGanhaveisParticipados(grouped);
        }
        
      } catch (error) {
        console.error('Error fetching ganhaveis data:', error);
      } finally {
        setLoadingGanhaveis(false);
      }
    };
    
    fetchGanhaveisData();
  }, [profile?.id]);

  // Safe date formatter
  function dateBR(d: string | Date | null) {
    if (!d) return '—';
    const dt = typeof d === 'string' ? new Date(d) : d;
    if (Number.isNaN(dt.getTime())) return '—';
    return new Intl.DateTimeFormat('pt-BR', { 
      timeZone: 'America/Sao_Paulo', 
      month: 'long', 
      year: 'numeric' 
    }).format(dt);
  }

  // Fallback user data for display if profile not found
  const user = profile ? {
    name: profile.full_name || profile.display_name || 'Usuário',
    username: profile.username || 'usuario',
    bio: profile.bio || 'Usuário da plataforma',
    location: profile.location || 'Localização não informada',
    memberSince: dateBR(profile.created_at ?? profile.joined_at ?? null),
    totalGanhaveisLancados: ganhaveisLancados.length,
    totalGanhaveisParticipados: ganhaveisParticipados.length,
    ganhaveisCompletos: ganhaveisLancados.filter(g => g.status === 'completed' || g.status === 'finalizada').length,
    avaliacaoMedia: profile.rating || 0,
    totalAvaliacoes: 0,
    seguidores: 0,
    seguindo: 0,
    avatar: profile.avatar_url || '',
    website: profile.website_url || '',
    videoApresentacao: '',
    socialLinks: {
      instagram: profile.instagram || '',
      facebook: profile.facebook || '',
      twitter: profile.twitter || '',
      linkedin: profile.linkedin || ''
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

  // Convert ganhaveis lancados for display
  const displayGanhaveisLancados = ganhaveisLancados.map(g => ({
    title: g.title,
    description: g.title, // Use title as description since raffles doesn't have description
    image: g.image_url || '/placeholder.svg',
    goal: g.goal_amount || 0,
    raised: g.amount_raised || 0, // Now we have actual raised amount from the view
    daysLeft: 0, // Calculate based on draw_date if available
    category: 'Diversos',
    backers: 0, // Would need to calculate from transactions
    status: g.status === 'active' ? 'Em andamento' : g.status === 'completed' ? 'Finalizada' : 'Pendente',
    location: 'Online',
    raffleId: g.id, // Use proper raffle ID
    raffleStatus: g.status, // Raw status for ProjectCard
    progress_pct_money: g.progress_pct_money || 0 // Add progress percentage
  })).sort((a, b) => {
    // Sort by status (Em andamento first) and then by days left
    if (a.status === "Em andamento" && b.status === "Finalizada") return -1;
    if (a.status === "Finalizada" && b.status === "Em andamento") return 1;
    if (a.status === "Em andamento" && b.status === "Em andamento") {
      return a.daysLeft - b.daysLeft;
    }
    return 0;
  });

  const displayedGanhaveis = showAllGanhaveis ? displayGanhaveisLancados : displayGanhaveisLancados.slice(0, 6);

  // Convert ganhaveis participados for display
  const displayGanhaveisParticipados = ganhaveisParticipados.map(g => {
    // Dev safety check
    if (import.meta.env.DEV && !g.raffle_id) {
      console.error('[PerfilPublico] Participou card sem raffle_id', g);
    }
    
      return {
        title: g.raffle_title || g.title,
        description: g.raffle_title || g.title,
        image: g.raffle_image_url || g.image || '/placeholder.svg',
        goal: g.goal_amount || g.goal || 0,
        raised: g.amount_raised || g.raised || 0,
        daysLeft: g.daysLeft || 0,
        category: 'Diversos',
        backers: g.amount_raised || g.raised || 0,
        status: g.tx_status === 'paid' ? 'Em andamento' : 'Finalizada',
        numerosComprados: g.purchased_numbers || [],
        ticketCount: g.ticket_count || 0,
        location: 'Online',
        raffleId: g.raffle_id || g.id, // Use raffle_id from my_tickets_ext_v6
        raffleStatus: g.raffle_status, // actual raffle status to drive CTA
        progress_pct_money: g.progress_pct_money || 0 // Add progress percentage
      };
  }).sort((a, b) => {
    // Sort by status (Em andamento first) and then by days left
    if (a.status === "Em andamento" && b.status === "Finalizada") return -1;
    if (a.status === "Finalizada" && b.status === "Em andamento") return 1;
    if (a.status === "Em andamento" && b.status === "Em andamento") {
      return a.daysLeft - b.daysLeft;
    }
    return 0;
  });

  const displayedGanhaveisParticipados = showAllGanhaveisParticipados ? displayGanhaveisParticipados : displayGanhaveisParticipados.slice(0, 6);

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
                    <AvatarImage src={getAvatarSrc(profile, profile?.id)} data-testid="profile-avatar" />
                    <AvatarFallback className="text-2xl">
                      {user.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex flex-col gap-3">
                    <button
                      type="button"
                      className="rounded-xl border px-3 py-2 text-sm hover:bg-neutral-50"
                      onClick={() => {
                        const url = window.location.href;
                        navigator.clipboard?.writeText?.(url);
                      }}
                    >
                      Compartilhar
                    </button>
                    
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

                  {/* Estatísticas */}
                  {(console.debug('[ProfileStats] rpc', stats), null)}
                  <ProfileStats 
                    stats={{
                      launched: stats?.launched ?? 0,
                      participated: stats?.participating ?? 0,
                      // completed: omitted temporarily (feature flag controlled)
                      won: stats?.wins ?? 0,
                    }}
                    isLoading={statsLoading}
                    error={null}
                  />

                  {/* Redes Sociais */}
                  {(user.socialLinks.instagram || user.socialLinks.facebook || user.socialLinks.twitter || user.website) && (
                    <div className="flex flex-wrap gap-2 mt-4">
                      {user.website && (
                        <Button variant="outline" size="sm" asChild>
                          <a href={user.website} target="_blank" rel="noopener noreferrer">
                            <Globe className="h-4 w-4 mr-1" />
                            Site
                          </a>
                        </Button>
                      )}
                      {user.socialLinks.instagram && (
                        <Button variant="outline" size="sm" asChild>
                          <a href={`https://instagram.com/${user.socialLinks.instagram}`} target="_blank" rel="noopener noreferrer">
                            <Instagram className="h-4 w-4 mr-1" />
                            Instagram
                          </a>
                        </Button>
                      )}
                      {user.socialLinks.facebook && (
                        <Button variant="outline" size="sm" asChild>
                          <a href={`https://facebook.com/${user.socialLinks.facebook}`} target="_blank" rel="noopener noreferrer">
                            <Facebook className="h-4 w-4 mr-1" />
                            Facebook
                          </a>
                        </Button>
                      )}
                      {user.socialLinks.twitter && (
                        <Button variant="outline" size="sm" asChild>
                          <a href={`https://twitter.com/${user.socialLinks.twitter}`} target="_blank" rel="noopener noreferrer">
                            <Twitter className="h-4 w-4 mr-1" />
                            Twitter
                          </a>
                        </Button>
                      )}
                    </div>
                  )}
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
                   {loadingGanhaveis ? (
                     <div className="grid md:grid-cols-2 gap-6">
                       {[...Array(4)].map((_, i) => (
                         <div key={i} className="animate-pulse">
                           <div className="h-48 bg-muted rounded mb-4"></div>
                           <div className="h-4 bg-muted rounded mb-2"></div>
                           <div className="h-4 bg-muted rounded w-3/4"></div>
                         </div>
                       ))}
                     </div>
                   ) : displayedGanhaveis.length > 0 ? (
                     <>
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
                             raffleId={ganhavel.raffleId}
                             status={ganhavel.raffleStatus}
                           />
                        ))}
                      </div>
                       
                       {displayGanhaveisLancados.length > 6 && (
                         <div className="text-center mt-6">
                           <Button 
                             variant="outline" 
                             onClick={() => setShowAllGanhaveis(!showAllGanhaveis)}
                           >
                             {showAllGanhaveis ? 'Ver menos' : 'Ver mais'}
                           </Button>
                         </div>
                       )}
                     </>
                   ) : (
                     <div className="text-center py-8">
                       <p className="text-muted-foreground">Nenhum ganhável lançado ainda.</p>
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
                   {loadingGanhaveis ? (
                     <div className="grid md:grid-cols-2 gap-6">
                       {[...Array(4)].map((_, i) => (
                         <div key={i} className="animate-pulse">
                           <div className="h-48 bg-muted rounded mb-4"></div>
                           <div className="h-4 bg-muted rounded mb-2"></div>
                           <div className="h-4 bg-muted rounded w-3/4"></div>
                         </div>
                       ))}
                     </div>
                   ) : displayedGanhaveisParticipados.length > 0 ? (
                     <>
                       {displayedGanhaveisParticipados.length > 0 ? (
                         <>
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
                                   raffleId={ganhavel.raffleId}
                                   status={ganhavel.raffleStatus}
                                 />
                                <Badge className="absolute top-2 right-2 bg-background/90">
                                  {ganhavel.ticketCount} bilhetes
                                </Badge>
                              </div>
                            ))}
                          </div>
                           
                           {displayGanhaveisParticipados.length > 6 && (
                             <div className="text-center mt-6">
                               <Button 
                                 variant="outline" 
                                 onClick={() => setShowAllGanhaveisParticipados(!showAllGanhaveisParticipados)}
                               >
                                 {showAllGanhaveisParticipados ? 'Ver menos' : 'Ver mais'}
                               </Button>
                             </div>
                           )}
                         </>
                       ) : (
                         <div className="text-center py-8">
                           <p className="text-muted-foreground">Nenhuma participação ainda.</p>
                         </div>
                       )}
                     </>
                   ) : (
                     <div className="text-center py-8">
                       <p className="text-muted-foreground">Participações são privadas.</p>
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
