import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Star, 
  Trophy, 
  Heart, 
  Plus, 
  MessageCircle,
  Globe,
  Instagram,
  Facebook,
  Twitter,
  Linkedin,
  MapPin,
  Calendar,
  UserPlus
} from "lucide-react";
import { Link } from "react-router-dom";
import ShareButton from "./ShareButton";
import FollowButton from '@/components/FollowButton';
import { useFollow } from '@/hooks/useFollow';
import { useAuth } from '@/hooks/useAuth';

interface DetalhesOrganizadorProps {
  organizer: {
    id: string;
    name: string;
    username: string;
    bio?: string;
    location?: string;
    memberSince: string;
    totalGanhaveisLancados: number;
    ganhaveisCompletos: number;
    totalGanhaveisParticipados: number;
    ganhaveisGanhos: number;
    avaliacaoMedia: number;
    totalAvaliacoes: number;
    avatar: string;
    updated_at?: string;
    website?: string;
    socialLinks?: {
      instagram?: string;
      facebook?: string;
      twitter?: string;
      linkedin?: string;
    };
  };
}

export default function DetalhesOrganizador({ organizer }: DetalhesOrganizadorProps) {
  const { user: currentUser } = useAuth();
  const { counts } = useFollow(organizer.id);
  const isMe = currentUser?.id === organizer.id;
  return (
    <Card>
      <CardHeader>
        <CardTitle>Detalhes do Organizador</CardTitle>
        <CardDescription>
          Informações sobre quem está organizando este ganhavel
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Profile Section */}
        <div className="flex items-start gap-4">
          <Avatar className="w-16 h-16">
            <AvatarImage src={organizer.avatar} />
            <AvatarFallback className="text-lg">
              {organizer.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1">
            <Link to={`/perfil/${organizer.username}`} className="block hover:opacity-80 transition-opacity">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-lg cursor-pointer">{organizer.name}</h3>
                <Badge variant="secondary">@{organizer.username}</Badge>
              </div>
              
              {organizer.bio && (
                <p className="text-sm text-muted-foreground mb-2 line-clamp-2 cursor-pointer">
                  {organizer.bio}
                </p>
              )}
            </Link>
            
            <div className="flex flex-wrap gap-3 text-xs text-muted-foreground mb-3">
              {organizer.location && (
                <div className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  <span>{organizer.location}</span>
                </div>
              )}
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                <span>Desde {organizer.memberSince}</span>
              </div>
            </div>

            {/* Social Links */}
            {organizer.socialLinks && (
              <div className="flex gap-2 mb-3">
                {organizer.website && (
                  <Button variant="ghost" size="sm" asChild className="h-7 w-7 p-0">
                    <a href={organizer.website} target="_blank" rel="noopener noreferrer">
                      <Globe className="h-3 w-3" />
                    </a>
                  </Button>
                )}
                {organizer.socialLinks.instagram && (
                  <Button variant="ghost" size="sm" asChild className="h-7 w-7 p-0">
                    <a href={`https://instagram.com/${organizer.socialLinks.instagram.replace('@', '')}`} target="_blank" rel="noopener noreferrer">
                      <Instagram className="h-3 w-3" />
                    </a>
                  </Button>
                )}
                {organizer.socialLinks.facebook && (
                  <Button variant="ghost" size="sm" asChild className="h-7 w-7 p-0">
                    <a href={`https://facebook.com/${organizer.socialLinks.facebook}`} target="_blank" rel="noopener noreferrer">
                      <Facebook className="h-3 w-3" />
                    </a>
                  </Button>
                )}
                {organizer.socialLinks.twitter && (
                  <Button variant="ghost" size="sm" asChild className="h-7 w-7 p-0">
                    <a href={`https://twitter.com/${organizer.socialLinks.twitter.replace('@', '')}`} target="_blank" rel="noopener noreferrer">
                      <Twitter className="h-3 w-3" />
                    </a>
                  </Button>
                )}
                {organizer.socialLinks.linkedin && (
                  <Button variant="ghost" size="sm" asChild className="h-7 w-7 p-0">
                    <a href={`https://linkedin.com/in/${organizer.socialLinks.linkedin}`} target="_blank" rel="noopener noreferrer">
                      <Linkedin className="h-3 w-3" />
                    </a>
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 py-4 border-t">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="text-xl font-bold text-primary">{organizer.avaliacaoMedia}</span>
            </div>
            <div className="text-xs text-muted-foreground">{organizer.totalAvaliacoes} avaliações</div>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Plus className="h-4 w-4 text-blue-500" />
              <span className="text-xl font-bold text-primary">{organizer.totalGanhaveisLancados}</span>
            </div>
            <div className="text-xs text-muted-foreground">Ganhaveis Lançados</div>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Trophy className="h-4 w-4 text-green-500" />
              <span className="text-xl font-bold text-primary">{organizer.ganhaveisCompletos}</span>
            </div>
            <div className="text-xs text-muted-foreground">Ganhaveis Completos</div>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Heart className="h-4 w-4 text-red-500" />
              <span className="text-xl font-bold text-primary">{organizer.totalGanhaveisParticipados}</span>
            </div>
            <div className="text-xs text-muted-foreground">Ganhaveis Participados</div>
          </div>
        </div>

        {/* Additional Stats Row */}
        <div className="grid grid-cols-1 gap-4 py-4 border-t">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Trophy className="h-4 w-4 text-yellow-500 fill-yellow-500" />
              <span className="text-xl font-bold text-primary">{organizer.ganhaveisGanhos}</span>
            </div>
            <div className="text-xs text-muted-foreground">Ganhou {organizer.ganhaveisGanhos} Vezes</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-4 border-t">
          {!isMe && (
            <FollowButton profileUserId={organizer.id} compact />
          )}
          
          <Button variant="outline" size="sm" className="flex-1">
            <MessageCircle className="h-4 w-4 mr-2" />
            Enviar Mensagem
          </Button>
          
          <Button variant="outline" size="sm" asChild>
            <Link to={`/perfil/${organizer.username}`}>
              Ver Perfil
            </Link>
          </Button>
          
          <ShareButton 
            url={`${window.location.origin}/perfil/${organizer.username}`}
            title={`Confira o perfil de ${organizer.name} na Ganhavel!`}
            description={organizer.bio || `${organizer.name} - Organizador de ganhaveis na Ganhavel`}
          />
        </div>
      </CardContent>
    </Card>
  );
}