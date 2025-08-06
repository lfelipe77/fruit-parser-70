import { Button } from "@/components/ui/button";
import { Search, Heart, User, Calendar, Clock, Settings } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import NotificationCenter from "@/components/NotificationCenter";
import LanguageSelector from "@/components/LanguageSelector";
import { useAdminCheck } from "@/hooks/useAdminCheck";
import { useAuth } from "@/hooks/useAuth";

export default function Navigation() {
  const { t } = useTranslation();
  const [selectedLottery, setSelectedLottery] = useState('br');
  const { isAdmin } = useAdminCheck();
  const { user } = useAuth();

  const lotteryDraws = [
    { id: 'br', flag: '🇧🇷', name: 'Mega-Sena', date: '10/08', time: '20:00' },
    { id: 'us', flag: '🇺🇸', name: 'Powerball', date: '12/08', time: '22:59' },
    { id: 'uk', flag: '🇬🇧', name: 'EuroMillions', date: '09/08', time: '21:00' },
    { id: 'eu', flag: '🇪🇺', name: 'EuroJackpot', date: '13/08', time: '20:00' }
  ];

  const selectedDraw = lotteryDraws.find(draw => draw.id === selectedLottery);
  
  return (
    <>
      <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4 md:space-x-8">
              <Link to="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
                <img 
                  src="/lovable-uploads/2b0ffd7d-9aa9-400e-b1b9-e07fd50af4a0.png" 
                  alt="Ganhavel" 
                  className="w-8 h-8 object-contain"
                />
                <span className="text-lg md:text-xl font-bold">Ganhavel</span>
              </Link>
              
              <div className="hidden lg:flex space-x-6">
                <Link to="/descobrir" className="text-muted-foreground hover:text-foreground transition-colors">
                  {t('discover')}
                </Link>
                <a href="/categorias" className="text-muted-foreground hover:text-foreground transition-colors">
                  {t('categories')}
                </a>
                <a href="/resultados" className="text-muted-foreground hover:text-foreground transition-colors">
                  {t('results')}
                </a>
                <Link to="/como-funciona" className="text-muted-foreground hover:text-foreground transition-colors">
                  {t('howItWorks')}
                </Link>
                {/* Admin link - only visible to admin users */}
                {isAdmin && (
                  <Link to="/admin" className="text-muted-foreground hover:text-foreground transition-colors">
                    <Settings className="w-4 h-4 inline mr-1" />
                    Admin
                  </Link>
                )}
              </div>
            </div>
            
            <div className="flex items-center space-x-2 md:space-x-4">
              <Button variant="ghost" size="sm" className="hidden sm:flex">
                <Search className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" className="hidden sm:flex">
                <Heart className="w-4 h-4" />
              </Button>
              <NotificationCenter />
              <LanguageSelector />
              {/* Admin quick access button for authenticated admin users */}
              {isAdmin && (
                <Button variant="ghost" size="sm" asChild className="hidden lg:flex">
                  <Link to="/admin">
                    <Settings className="w-4 h-4 mr-2" />
                    Admin
                  </Link>
                </Button>
              )}
              {user ? (
                <Button variant="outline" size="sm" asChild className="hidden md:flex">
                  <Link to="/dashboard">
                    <User className="w-4 h-4 mr-2" />
                    Dashboard
                  </Link>
                </Button>
              ) : (
                <Button variant="outline" size="sm" asChild className="hidden md:flex">
                  <Link to="/login">
                    <User className="w-4 h-4 mr-2" />
                    {t('login')}
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      </nav>

    </>
  );
}