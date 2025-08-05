
import Navigation from "@/components/Navigation";
import ProjectCard from "@/components/ProjectCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import hondaCivic from "@/assets/honda-civic-2024.jpg";
import iphone15ProMax from "@/assets/iphone-15-pro-max.jpg";
import casaAlphaville from "@/assets/casa-alphaville.jpg";
import yamahaMT03 from "@/assets/yamaha-mt03-2024.jpg";
import dinheiro50k from "@/assets/dinheiro-50k.jpg";
import ps5Setup from "@/assets/ps5-setup-gamer.jpg";

// Mock data para rifas de subcategorias
const subcategoryRifas: Record<string, any[]> = {
  celulares: [
    {
      title: "iPhone 15 Pro Max 256GB",
      description: "iPhone 15 Pro Max novo, lacrado, cor titânio natural com 256GB de armazenamento.",
      image: iphone15ProMax,
      goal: 500,
      raised: 312,
      daysLeft: 9,
      category: "Eletrônicos",
      backers: 312,
      organizer: "Maria Santos",
      location: "Online",
    },
    {
      title: "Samsung Galaxy S24 Ultra",
      description: "Samsung Galaxy S24 Ultra 256GB, cor preto, novo lacrado com garantia.",
      image: iphone15ProMax,
      goal: 450,
      raised: 278,
      daysLeft: 15,
      category: "Eletrônicos", 
      backers: 278,
      organizer: "João Silva",
      location: "Online",
    },
    {
      title: "Xiaomi 14 Pro",
      description: "Xiaomi 14 Pro 512GB, cor branco, importado com garantia internacional.",
      image: iphone15ProMax,
      goal: 300,
      raised: 189,
      daysLeft: 22,
      category: "Eletrônicos",
      backers: 189,
      organizer: "Ana Costa",
      location: "Online",
    }
  ],
  tablets: [
    {
      title: "iPad Pro M2 256GB",
      description: "iPad Pro com chip M2, tela de 12.9 polegadas, cor space gray.",
      image: iphone15ProMax,
      goal: 400,
      raised: 245,
      daysLeft: 12,
      category: "Eletrônicos",
      backers: 245,
      organizer: "Pedro Lima",
      location: "Online",
    },
    {
      title: "Samsung Galaxy Tab S9",
      description: "Samsung Galaxy Tab S9 256GB com S Pen inclusa, cor grafite.",
      image: iphone15ProMax,
      goal: 350,
      raised: 198,
      daysLeft: 18,
      category: "Eletrônicos",
      backers: 198,
      organizer: "Sofia Martins",
      location: "Online",
    }
  ],
  "carros-populares": [
    {
      title: "Honda Civic 0KM 2024",
      description: "Honda Civic LX CVT 2024 zero quilômetro, cor preta, com garantia de fábrica.",
      image: hondaCivic,
      goal: 1000,
      raised: 847,
      daysLeft: 18,
      category: "Carros",
      backers: 847,
      organizer: "João Silva",
      location: "São Paulo, SP",
    },
    {
      title: "Toyota Corolla XEI 2024",
      description: "Toyota Corolla XEI automático 2024, cor prata, zero quilômetro.",
      image: hondaCivic,
      goal: 950,
      raised: 623,
      daysLeft: 25,
      category: "Carros",
      backers: 623,
      organizer: "Maria Santos",
      location: "Belo Horizonte, MG",
    }
  ],
  playstation: [
    {
      title: "PlayStation 5 + Setup Gamer",
      description: "PS5 + TV 55' 4K + Headset + Controle extra + 5 jogos exclusivos.",
      image: ps5Setup,
      goal: 600,
      raised: 456,
      daysLeft: 28,
      category: "Games",
      backers: 456,
      organizer: "Lucas Ferreira",
      location: "Online",
    },
    {
      title: "PlayStation 5 Digital",
      description: "PlayStation 5 versão digital nova lacrada com garantia oficial.",
      image: ps5Setup,
      goal: 450,
      raised: 312,
      daysLeft: 14,
      category: "Games",
      backers: 312,
      organizer: "Carlos Gamer",
      location: "Online",
    },
    {
      title: "PlayStation 5 Standard + DualSense",
      description: "PlayStation 5 padrão com leitor de disco + controle DualSense extra azul cosmic.",
      image: ps5Setup,
      goal: 550,
      raised: 423,
      daysLeft: 19,
      category: "Games",
      backers: 423,
      organizer: "Rafael Games",
      location: "Online",
    },
    {
      title: "PlayStation Portal + Acessórios",
      description: "PlayStation Portal para Remote Play + case de proteção + película de vidro.",
      image: ps5Setup,
      goal: 250,
      raised: 187,
      daysLeft: 12,
      category: "Games",
      backers: 187,
      organizer: "GameStore BR",
      location: "Online",
    },
    {
      title: "Kit Gamer PS5 Completo",
      description: "PS5 + 3 jogos (Spider-Man 2, God of War, FIFA 24) + headset + suporte.",
      image: ps5Setup,
      goal: 750,
      raised: 534,
      daysLeft: 21,
      category: "Games",
      backers: 534,
      organizer: "Maria Gamer",
      location: "Online",
    },
    {
      title: "PlayStation VR2 + Horizon",
      description: "PlayStation VR2 novo lacrado + jogo Horizon Call of the Mountain incluído.",
      image: ps5Setup,
      goal: 400,
      raised: 198,
      daysLeft: 16,
      category: "Games",
      backers: 198,
      organizer: "TechWorld",
      location: "Online",
    },
    {
      title: "DualSense Edge + Cabo",
      description: "Controle PlayStation DualSense Edge profissional + cabo USB-C 3 metros.",
      image: ps5Setup,
      goal: 150,
      raised: 89,
      daysLeft: 8,
      category: "Games",
      backers: 89,
      organizer: "ProGamer SP",
      location: "São Paulo, SP",
    },
    {
      title: "PS5 + Monitor Gamer 27'",
      description: "PlayStation 5 + Monitor gamer 27' 144Hz + suporte articulado.",
      image: ps5Setup,
      goal: 800,
      raised: 612,
      daysLeft: 25,
      category: "Games",
      backers: 612,
      organizer: "Setup Dreams",
      location: "Online",
    }
  ],
  dinheiro: [
    {
      title: "R$ 50.000 em Dinheiro",
      description: "Prêmio de cinquenta mil reais depositados direto na sua conta bancária.",
      image: dinheiro50k,
      goal: 1000,
      raised: 835,
      daysLeft: 5,
      category: "Dinheiro",
      backers: 835,
      organizer: "Ana Silva",
      location: "Online",
    },
    {
      title: "R$ 25.000 em Dinheiro",
      description: "Prêmio de vinte e cinco mil reais para realizar seus sonhos.",
      image: dinheiro50k,
      goal: 500,
      raised: 367,
      daysLeft: 11,
      category: "Dinheiro",
      backers: 367,
      organizer: "Roberto Costa",
      location: "Online",
    }
  ]
};

const subcategoryNames: Record<string, string> = {
  celulares: "Celulares",
  tablets: "Tablets", 
  "carros-populares": "Carros Populares",
  playstation: "PlayStation",
  dinheiro: "Dinheiro"
};

export default function SubcategoriaRifas() {
  const { categoria, subcategoria } = useParams();
  const rifas = subcategoryRifas[subcategoria || ""] || [];
  const subcategoryName = subcategoryNames[subcategoria || ""] || subcategoria;

  if (!subcategoria || rifas.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Subcategoria não encontrada</h1>
            <Link to={`/categorias/${categoria}`}>
              <Button variant="outline">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar para Categoria
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Link to={`/categorias/${categoria}`}>
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar para {categoria}
            </Button>
          </Link>
          
          <div className="flex items-center gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold">{subcategoryName}</h1>
              <p className="text-muted-foreground">{rifas.length} rifas disponíveis</p>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {rifas.map((rifa, index) => (
            <ProjectCard key={index} {...rifa} />
          ))}
        </div>

        {/* Load More */}
        <div className="text-center mt-12">
          <Button variant="outline" size="lg">
            Carregar Mais Rifas
          </Button>
        </div>
      </div>
    </div>
  );
}
