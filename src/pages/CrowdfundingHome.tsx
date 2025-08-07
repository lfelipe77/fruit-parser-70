import CaixaLotterySection from "@/components/CaixaLotterySection";
import Navigation from "@/components/Navigation";
import HeroSection from "@/components/HeroSection";

import CategoriesSection from "@/components/CategoriesSection";
import ProjectCard from "@/components/ProjectCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { getAllGanhaveis } from "@/data/ganhaveisData";

// Get the first 3 ganhaveis as featured
let featuredGanhaveis = [];
let trendingGanhaveis = [];

try {
  const allGanhaveis = getAllGanhaveis();
  console.log('Ganhaveis loaded successfully:', allGanhaveis.length);
  featuredGanhaveis = allGanhaveis.slice(0, 3);
  trendingGanhaveis = allGanhaveis.slice(3, 6);
} catch (error) {
  console.error('Error loading ganhaveis data:', error);
  // Use empty arrays as fallback
}

export default function CrowdfundingHome() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <HeroSection />
      <CaixaLotterySection />
      
      
      {/* Featured Projects Section */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-8 md:mb-12 text-center md:text-left">
            <div className="mb-4 md:mb-0">
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-2 md:mb-4">
                Ganhaveis em Destaque
              </h2>
              <p className="text-lg md:text-xl text-muted-foreground">
                Os ganhaveis mais populares selecionados pela nossa equipe
              </p>
            </div>
            <Badge variant="secondary" className="hidden md:block">
              Seleção da Casa
            </Badge>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {featuredGanhaveis.map((ganhavel, index) => (
              <ProjectCard key={index} {...ganhavel} />
            ))}
          </div>
        </div>
      </section>
      
      <CategoriesSection />
      
      {/* Trending Projects Section */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-8 md:mb-12 text-center md:text-left">
            <div className="mb-4 md:mb-0">
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-2 md:mb-4">
                Ganhaveis em Alta
              </h2>
              <p className="text-lg md:text-xl text-muted-foreground">
                Ganhaveis que estão bombando e vendendo rápido
              </p>
            </div>
            <Button variant="outline" asChild className="hidden md:flex">
              <Link to="/descobrir">Ver Todos os Ganhaveis</Link>
            </Button>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {trendingGanhaveis.map((ganhavel, index) => (
              <ProjectCard key={index} {...ganhavel} />
            ))}
          </div>
        </div>
      </section>
      
      {/* Call to Action Section */}
      <section className="py-16 md:py-20 bg-gradient-hero">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl text-center">
          <div className="space-y-6 md:space-y-8">
            <h2 className="text-2xl md:text-3xl lg:text-5xl font-bold">
              Pronto para Lançar seu Ganhavel?
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground">
              Junte-se a milhares de pessoas que já realizaram seus sonhos com ganhaveis justos e transparentes
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="hero" size="lg" className="text-base md:text-lg px-6 md:px-8" asChild>
                <Link to="/lance-seu-ganhavel">Lance seu Ganhavel</Link>
              </Button>
              <Button variant="outline" size="lg" className="text-base md:text-lg px-6 md:px-8" asChild>
                <Link to="/como-funciona">Saiba Mais</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="bg-card border-t py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <Link to="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
                <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">G</span>
                </div>
                <span className="text-xl font-bold">Ganhavel</span>
              </Link>
              <p className="text-muted-foreground">
                Realizando sonhos com ganhaveis transparentes e seguindo sempre a loteria federal.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Para Criadores</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li><Link to="/lance-seu-ganhavel" className="hover:text-foreground transition-colors">Lance seu Ganhavel</Link></li>
                <li><Link to="/guia-do-criador" className="hover:text-foreground transition-colors">Guia do Criador</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Para Participantes</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">Descobrir Ganhaveis</a></li>
                <li><Link to="/confianca-seguranca" className="hover:text-foreground transition-colors">Confiança & Segurança</Link></li>
                <li><Link to="/central-de-ajuda" className="hover:text-foreground transition-colors">Central de Ajuda</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Empresa</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li><Link to="/sobre-nos" className="hover:text-foreground transition-colors">Sobre Nós</Link></li>
                <li><Link to="/trabalhe-conosco" className="hover:text-foreground transition-colors">Trabalhe Conosco</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t mt-12 pt-8 text-center text-muted-foreground">
            <p>&copy; 2024 Ganhavel. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}