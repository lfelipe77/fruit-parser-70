import Navigation from "@/components/Navigation";
import ProjectCard from "@/components/ProjectCard";
import { DescobrirSEO } from "@/components/SEOPages";
import LocationFilter from "@/components/LocationFilter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Search, Filter, SlidersHorizontal } from "lucide-react";
import { useState } from "react";
import { useLocationFilter } from "@/hooks/useLocationFilter";
import hondaCivic from "@/assets/honda-civic-2024.jpg";
import iphone15ProMax from "@/assets/iphone-15-pro-max.jpg";
import casaAlphaville from "@/assets/casa-alphaville.jpg";
import yamahaMT03 from "@/assets/yamaha-mt03-2024.jpg";
import dinheiro50k from "@/assets/dinheiro-50k.jpg";
import ps5Setup from "@/assets/ps5-setup-gamer.jpg";

// Mock data for all raffles - expandido com mais localizações
const allRifas = [
  {
    title: "Honda Civic 0KM 2024",
    description: "Honda Civic LX CVT 2024 zero quilômetro, cor preta, com garantia de fábrica.",
    image: hondaCivic,
    goal: 1000,
    raised: 847,
    daysLeft: 18,
    category: "Carros & Motos",
    backers: 847,
    organizer: "João Silva",
    location: "São Paulo, SP",
  },
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
    title: "Casa em Condomínio - Alphaville",
    description: "Casa nova de 3 quartos em condomínio fechado com área de lazer completa.",
    image: casaAlphaville,
    goal: 2000,
    raised: 1450,
    daysLeft: 22,
    category: "Diversos",
    backers: 1450,
    organizer: "Carlos Oliveira",
    location: "Barueri, SP",
  },
  {
    title: "Yamaha MT-03 0KM 2024",
    description: "Moto Yamaha MT-03 zero quilômetro, cor azul, com garantia de fábrica e documentação inclusa.",
    image: yamahaMT03,
    goal: 800,
    raised: 672,
    daysLeft: 14,
    category: "Carros & Motos",
    backers: 672,
    organizer: "Pedro Costa",
    location: "Rio de Janeiro, RJ",
  },
  {
    title: "R$ 50.000 em Dinheiro",
    description: "Prêmio de cinquenta mil reais depositados direto na sua conta bancária.",
    image: dinheiro50k,
    goal: 1000,
    raised: 835,
    daysLeft: 5,
    category: "Gift Cards",
    backers: 835,
    organizer: "Ana Silva",
    location: "Online",
  },
  {
    title: "PlayStation 5 + Setup Gamer",
    description: "PS5 + TV 55' 4K + Headset + Controle extra + 5 jogos exclusivos.",
    image: ps5Setup,
    goal: 600,
    raised: 456,
    daysLeft: 28,
    category: "Games & Consoles",
    backers: 456,
    organizer: "Lucas Ferreira",
    location: "Online",
  },
  {
    title: "Apartamento 2 Quartos",
    description: "Apartamento novo de 2 quartos em Belo Horizonte com área de lazer.",
    image: casaAlphaville,
    goal: 1500,
    raised: 890,
    daysLeft: 30,
    category: "Diversos",
    backers: 445,
    organizer: "Marina Costa",
    location: "Belo Horizonte, MG",
  },
  {
    title: "Notebook Gamer RTX 4070",
    description: "Notebook gamer com RTX 4070, 32GB RAM, ideal para games e trabalho.",
    image: iphone15ProMax,
    goal: 400,
    raised: 267,
    daysLeft: 12,
    category: "Eletrônicos",
    backers: 134,
    organizer: "Tech Store",
    location: "Curitiba, PR",
  }
];

const categories = [
  "Todos", 
  "Eletrônicos", 
  "Celulares & Smartwatches", 
  "Games & Consoles", 
  "Eletrodomésticos", 
  "Gift Cards", 
  "Carros & Motos", 
  "Produtos Virais", 
  "Diversos"
];

export default function Descobrir() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [sortBy, setSortBy] = useState("popularity");
  
  // Usar o hook de filtro de localização
  const { filter: locationFilter, filteredRifas: locationFilteredRifas, updateFilter, clearFilters } = useLocationFilter(allRifas);

  // Aplicar filtros adicionais (busca e categoria) nas rifas já filtradas por localização
  const filteredRifas = locationFilteredRifas.filter(rifa => {
    const matchesSearch = rifa.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         rifa.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "Todos" || rifa.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const sortedRifas = [...filteredRifas].sort((a, b) => {
    switch (sortBy) {
      case "ending-soon":
        return a.daysLeft - b.daysLeft;
      case "newest":
        return b.daysLeft - a.daysLeft;
      case "popularity":
        return b.backers - a.backers;
      case "goal":
        return b.goal - a.goal;
      default:
        return 0;
    }
  });

  const clearAllFilters = () => {
    setSearchTerm("");
    setSelectedCategory("Todos");
    clearFilters();
  };

  return (
    <div className="min-h-screen bg-background">
      <DescobrirSEO />
      <Navigation />
      
      {/* Header */}
      <div className="bg-gradient-hero py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl lg:text-6xl font-bold mb-4">
              Descobrir Ganhaveis
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Explore milhares de ganhaveis incríveis e encontre seu próximo prêmio dos sonhos
            </p>
            
            {/* Search Bar */}
            <div className="flex gap-4 max-w-2xl mx-auto">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Pesquisar ganhaveis..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-12"
                />
              </div>
              <Button size="lg" className="h-12 px-8">
                <Search className="w-4 h-4 mr-2" />
                Buscar
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <Badge
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  className="cursor-pointer hover:bg-primary/80 transition-colors"
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </Badge>
              ))}
            </div>
            
            <div className="flex gap-4 items-center">
              {/* Filtro de Localização em Sheet */}
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Filter className="w-4 h-4 mr-2" />
                    Localização
                    {(locationFilter.state || locationFilter.city || locationFilter.showOnlineOnly) && (
                      <Badge variant="secondary" className="ml-2 h-4 w-4 p-0 text-xs">
                        •
                      </Badge>
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent>
                  <SheetHeader>
                    <SheetTitle>Filtrar por Localização</SheetTitle>
                    <SheetDescription>
                      Encontre ganhaveis na sua região ou ganhaveis online
                    </SheetDescription>
                  </SheetHeader>
                  <div className="mt-6">
                    <LocationFilter
                      rifas={allRifas}
                      filter={locationFilter}
                      onFilterChange={updateFilter}
                      onClearFilters={clearFilters}
                    />
                  </div>
                </SheetContent>
              </Sheet>
              
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4" />
                <span className="text-sm font-medium">Ordenar por:</span>
              </div>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="popularity">Mais Populares</SelectItem>
                  <SelectItem value="ending-soon">Encerrando em Breve</SelectItem>
                  <SelectItem value="newest">Mais Recentes</SelectItem>
                  <SelectItem value="goal">Maior Valor</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      {/* Results */}
      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-2xl font-bold mb-2">
                {selectedCategory === "Todos" ? "Todos os Ganhaveis" : `Ganhaveis de ${selectedCategory}`}
              </h2>
              <p className="text-muted-foreground">
                {sortedRifas.length} ganhaveis encontrados
                {searchTerm && ` para "${searchTerm}"`}
              </p>
            </div>
          </div>

          {sortedRifas.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {sortedRifas.map((rifa, index) => (
                <ProjectCard key={index} {...rifa} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="max-w-md mx-auto">
                <Filter className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Nenhum ganhavel encontrado</h3>
                <p className="text-muted-foreground mb-6">
                  Tente ajustar seus filtros ou termo de busca para encontrar ganhaveis
                </p>
                <Button 
                  variant="outline" 
                  onClick={clearAllFilters}
                >
                  Limpar Filtros
                </Button>
              </div>
            </div>
          )}

          {/* Load More */}
          {sortedRifas.length > 0 && (
            <div className="text-center mt-12">
              <Button variant="outline" size="lg">
                Carregar Mais Ganhaveis
              </Button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}