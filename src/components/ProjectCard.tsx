import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Link, useNavigate } from "react-router-dom";
import { MapPin } from "lucide-react";

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
}: ProjectCardProps) {
  const percentage = Math.round((raised / goal) * 100);
  const isCompleted = percentage >= 100;
  const navigate = useNavigate();

  // Generate a recent purchase time (randomized between 1-30 minutes ago)
  const minutesAgo = Math.floor(Math.random() * 30) + 1;
  const lastPurchaseText = `${minutesAgo}min`;

  // Map titles to actual ganhavel IDs
  const titleToIdMap: Record<string, string> = {
    "Honda Civic 0KM 2024": "honda-civic-0km-2024",
    "iPhone 15 Pro Max 256GB": "iphone-15-pro-max-256gb", 
    "Casa em Condomínio - Alphaville": "casa-em-condominio-alphaville",
    "Yamaha MT-03 0KM 2024": "yamaha-mt-03-0km-2024",
    "R$ 50.000 em Dinheiro": "r-50-000-em-dinheiro",
    "PlayStation 5 + Setup Gamer": "playstation-5-setup-gamer"
  };

  const ganhaveisId = titleToIdMap[title] || title.toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, '-');

  return (
    <Link to={`/ganhavel/${ganhaveisId}`} className="block">
      <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 animate-fade-in">
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
          <Progress value={percentage} className="h-2" />
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
        <Button variant={isCompleted ? "success" : "default"} size="sm">
          {isCompleted ? "Ver Resultado" : "Comprar Bilhete"}
        </Button>
      </CardFooter>
    </Card>
    </Link>
  );
}