import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { 
  Search, 
  Heart, 
  User, 
  Calendar, 
  Clock, 
  Settings,
  ChevronDown,
  Shield,
  BarChart3,
  Eye,
  Menu
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import NotificationCenter from "@/components/NotificationCenter";
import LanguageSelector from "@/components/LanguageSelector";
import { useAuthContext } from "@/providers/AuthProvider";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useMyProfile } from "@/hooks/useMyProfile";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { getAvatarSrc } from '@/lib/avatarUtils';


export default function Navigation() {
  const { t } = useTranslation();
  const [selectedLottery, setSelectedLottery] = useState('br');
  const { user } = useAuthContext();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Unified profile and admin hooks
  const { data: me, error: meErr, status: meStatus } = useMyProfile();
  const { isAdmin, isLoading: adminLoading } = useIsAdmin();

  // Dev-only diagnostics
  if (import.meta.env.DEV) {
    console.group('[Navigation]');
    console.log({ uid: user?.id, profileStatus: meStatus, me, meErr, isAdmin });
    console.groupEnd();
  }

  const profileReady = !!me && !meErr;

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
                <Link to="/categorias" className="text-muted-foreground hover:text-foreground transition-colors">
                  {t('categories')}
                </Link>
                <Link to="/resultados" className="text-muted-foreground hover:text-foreground transition-colors">
                  {t('results')}
                </Link>
                <Link to="/como-funciona" className="text-muted-foreground hover:text-foreground transition-colors">
                  {t('howItWorks')}
                </Link>
                {import.meta.env.MODE !== 'production' && (
                  <Link to="/debug-token" className="text-muted-foreground hover:text-foreground transition-colors">
                    Debug Token
                  </Link>
                )}
              </div>
            </div>
            
            <div className="flex items-center space-x-2 md:space-x-4">
              {/* Mobile Menu */}
              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="sm" className="lg:hidden">
                    <Menu className="w-4 h-4" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-72">
                  <div className="flex flex-col space-y-4 mt-6">
                    <Link 
                      to="/descobrir" 
                      className="text-foreground hover:text-primary transition-colors py-2"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {t('discover')}
                    </Link>
                    <Link 
                      to="/categorias" 
                      className="text-foreground hover:text-primary transition-colors py-2"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {t('categories')}
                    </Link>
                    <Link 
                      to="/resultados" 
                      className="text-foreground hover:text-primary transition-colors py-2"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {t('results')}
                    </Link>
                    <Link 
                      to="/como-funciona" 
                      className="text-foreground hover:text-primary transition-colors py-2"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {t('howItWorks')}
                    </Link>
                    {isAdmin && (
                      <Link 
                        to="/admin" 
                        className="text-foreground hover:text-primary transition-colors py-2 flex items-center gap-2"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <Settings className="w-4 h-4" />
                        Admin
                      </Link>
                    )}
                    {!user && (
                      <Link 
                        to="/login" 
                        className="text-foreground hover:text-primary transition-colors py-2 flex items-center gap-2"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <User className="w-4 h-4" />
                        {t('login')}
                      </Link>
                    )}
                  </div>
                </SheetContent>
              </Sheet>

              {/* Search and Heart buttons hidden for now */}
              {/* <Button variant="ghost" size="sm" className="hidden sm:flex">
                <Search className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" className="hidden sm:flex">
                <Heart className="w-4 h-4" />
              </Button> */}
              <NotificationCenter />
              <LanguageSelector />
              
              
              {/* Admin dropdown menu - only show when user is confirmed admin */}
              {isAdmin === true && !adminLoading && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      className="flex items-center gap-2"
                    >
                      <Shield className="h-4 w-4" />
                      Admin
                      <ChevronDown className="h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem asChild>
                      <Link 
                        to="/admin" 
                        className="flex items-center gap-2"
                      >
                        <Settings className="h-4 w-4" />
                        Painel Principal
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link 
                        to="/admin-dashboard" 
                        className="flex items-center gap-2"
                      >
                        <BarChart3 className="h-4 w-4" />
                        Dashboard
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link 
                        to="/admin-visits" 
                        className="flex items-center gap-2"
                      >
                        <Eye className="h-4 w-4" />
                        Visitas Públicas
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
              {user ? (
                <Link 
                  to="/dashboard" 
                  className="inline-flex items-center cursor-pointer hover:opacity-80 transition-opacity"
                  data-testid="avatar-link"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage 
                      src={getAvatarSrc({ avatar_url: me?.avatar_url }, me?.id)} 
                      alt={me?.username ?? 'profile'} 
                    />
                    <AvatarFallback>
                      {(me?.username ?? user?.email ?? 'U').slice(0,2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Link>
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