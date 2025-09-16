import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Link, useNavigate } from "react-router-dom";
import { MapPin } from "lucide-react";
import { appUrlFor } from "@/lib/urlHelpers";

interface ProjectCardProps {
  title: string;
  description: string;
  image: string;
  goal: number;
  raised: number;
  daysLeft: number;
  category: string;
  backers: number;
  organizer?: string;
  location?: string;
  raffleId?: string; // Raffle ID
  raffleSlug?: string; // Raffle slug for clean URLs
  status?: string; // Add status to determine button text
  raffleStatus?: string; // Raw raffle status from DB
  progress_pct_money?: number; // Progress percentage from DB
}

export default function ProjectCard({
  title,
  description,
  image,
  goal,
  raised,
  daysLeft,
  category,
  backers,
  organizer,
  location,
  raffleId,
  raffleSlug,
  status,
  raffleStatus,
  progress_pct_money,
}: ProjectCardProps) {
  // Use progress_pct_money if available, otherwise calculate from raised/goal
  const percentage = progress_pct_money !== undefined ? 
    Math.max(0, Math.min(100, progress_pct_money)) : 
    Math.round((raised / goal) * 100);
  const navigate = useNavigate();

  // Generate a recent purchase time (randomized between 1-30 minutes ago)
  const minutesAgo = Math.floor(Math.random() * 30) + 1;
  const lastPurchaseText = `${minutesAgo}min`;

  // Use clean URL helper
  const raffleUrl = raffleId ? appUrlFor({ id: raffleId, slug: raffleSlug }) : '#';

  // Dev safety checks
  if (import.meta.env.DEV) {
    if (!raffleId) console.error('[ProjectCard] Missing raffleId for:', title);
  }

  // Use raffleStatus for buy button logic, fallback to status
  const actualStatus = raffleStatus || status;
  // Allow buying until winner is selected (premiado), not just until goal reached
  const canBuy = actualStatus === 'active' || (actualStatus !== 'completed' && actualStatus !== 'premiado');
  const isCompleted = actualStatus === 'completed' || actualStatus === 'premiado';

  return (
    <Link to={raffleUrl} className="block">
      <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 animate-fade-in" data-testid="raffle-card">
      <div className="relative overflow-hidden rounded-t-lg">
        <img
          src={image}
          alt={title}
          className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <Badge className="absolute top-3 left-3 bg-white/90 text-foreground">
          {category}
        </Badge>
        {isCompleted && (
          <Badge className="absolute top-3 right-3 bg-success text-success-foreground">
            Completa!
          </Badge>
        )}
      </div>
      
      <CardContent className="p-6">
        <h3 className="font-semibold text-lg mb-2 line-clamp-2">{title}</h3>
        <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
          {description}
        </p>
        
        {location && (
          <div className="flex items-center gap-1 mb-3 text-sm text-muted-foreground">
            <MapPin className="h-3 w-3" />
            <span>{location}</span>
          </div>
        )}
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="font-medium">R$ {(raised * 1000).toLocaleString('pt-BR')}</span>
            <span className="text-muted-foreground">de R$ {(goal * 1000).toLocaleString('pt-BR')}</span>
          </div>
          <Progress value={percentage} className="h-2" data-testid="raffle-progress" />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>{percentage}% arrecadado</span>
            <span>{backers} participantes</span>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="px-6 pb-6 pt-0 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <span className="text-sm font-medium text-muted-foreground">
            Última compra: {lastPurchaseText}
          </span>
          {location && (
            <span className="text-sm text-muted-foreground flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {location}
            </span>
          )}
        </div>
        <Button variant={isCompleted ? "success" : "default"} size="sm" data-testid="buy-button" disabled={!canBuy}>
          {isCompleted ? "Ver Resultado" : canBuy ? "Comprar Bilhete" : "Ver Detalhes"}
        </Button>
      </CardFooter>
    </Card>
    </Link>
  );
}