import CaixaLotterySection from "@/components/CaixaLotterySection";
import Navigation from "@/components/Navigation";
import HeroSection from "@/components/HeroSection";
import AsaasPartnershipSection from "@/components/AsaasPartnershipSection";
import CategoriesSection from "@/components/CategoriesSection";
import EmAltaRecentesSection from "@/components/EmAltaRecentes";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import MobileBottomNav from "@/components/MobileBottomNav";

export default function CrowdfundingHome() {
  return (
    <div className="min-h-screen bg-background pb-16 md:pb-0">
      <Navigation />
      <HeroSection />
      
      {/* Ganhaveis em Alta - moved up right after hero */}
      <EmAltaRecentesSection />
      
      {/* Loteria da Caixa - moved down */}
      <CaixaLotterySection />
      
      {/* Categorias */}
      <CategoriesSection />
      
      {/* Asaas Partnership Section */}
      <AsaasPartnershipSection />
      
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
                <li><Link to="/descobrir" className="hover:text-foreground transition-colors">Descobrir Ganhaveis</Link></li>
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
            
            <div>
              <h3 className="font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li><Link to="/termos-e-condicoes" className="hover:text-foreground transition-colors">Termos e Condições</Link></li>
                <li><Link to="/politica-de-privacidade" className="hover:text-foreground transition-colors">Política de Privacidade</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t mt-12 pt-8 text-center text-muted-foreground">
            <p>&copy; 2024 Ganhavel. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
      
      <MobileBottomNav />
    </div>
  );
}