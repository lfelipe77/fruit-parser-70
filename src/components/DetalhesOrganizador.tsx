import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  MapPin,
  Calendar
} from "lucide-react";
import { Link } from "react-router-dom";
import { useProfileStats } from "@/hooks/useProfileStats";
import { ProfileStats } from "@/components/ProfileStats";

interface DetalhesOrganizadorProps {
  organizer: {
    id: string;
    name: string;
    username: string;
    bio?: string;
    location?: string;
    memberSince: string;
    avatar: string;
  };
}

export default function DetalhesOrganizador({ organizer }: DetalhesOrganizadorProps) {
  const { data: stats, isLoading, error, refetch } = useProfileStats(organizer?.id);
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

          </div>
        </div>

        {/* Stats Grid */}
        <div className="py-4 border-t">
          {(console.debug('[ProfileStats] rpc', stats), null)}
          <ProfileStats 
            stats={{
              launched: stats?.launched ?? 0,
              participated: stats?.participating ?? 0,
              // completed: omitted temporarily (feature flag controlled)
              won: stats?.wins ?? 0,
            }}
            isLoading={isLoading}
            error={error}
            onRetry={refetch}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-4 border-t">
          <a
            href={`/#/perfil/${organizer?.username ?? organizer?.id}`}
            className="rounded-xl border px-3 py-2 text-sm hover:bg-neutral-50 flex-1 text-center"
          >
            Ver Perfil
          </a>
          <button
            type="button"
            className="rounded-xl border px-3 py-2 text-sm hover:bg-neutral-50"
            onClick={() => {
              const url = window.location.origin + `/#/perfil/${organizer?.username ?? organizer?.id}`;
              navigator.clipboard?.writeText?.(url);
            }}
          >
            Compartilhar
          </button>
        </div>
      </CardContent>
    </Card>
  );
}