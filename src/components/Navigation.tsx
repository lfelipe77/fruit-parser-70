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
  Menu,
  Plus
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
              {/* Mobile quick actions - streamlined */}
              <div className="lg:hidden flex items-center gap-2">
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/descobrir" className="text-xs">
                    <Search className="w-4 h-4" />
                  </Link>
                </Button>
                <Button variant="default" size="sm" asChild className="bg-primary hover:bg-primary/90 text-primary-foreground px-3">
                  <Link to="/lance-seu-ganhavel" className="text-xs font-medium">
                    <Plus className="w-4 h-4 mr-1" />
                    Criar
                  </Link>
                </Button>
              </div>
              
              {/* Mobile Menu - Simplified */}
              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="sm" className="lg:hidden">
                    <Menu className="w-4 h-4" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-72 bg-background">
                  <div className="flex flex-col space-y-1 mt-6">
                    {/* User section first if logged in */}
                    {user && (
                      <div className="border-b pb-4 mb-4">
                        <Link 
                          to="/dashboard" 
                          className="flex items-center gap-3 p-3 rounded-lg bg-primary/5 hover:bg-primary/10 transition-colors"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                            <User className="w-4 h-4 text-primary" />
                          </div>
                          <span className="font-medium">Minha Conta</span>
                        </Link>
                      </div>
                    )}
                    
                    {/* Main navigation */}
                    <Link 
                      to="/descobrir" 
                      className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-accent transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Search className="w-4 h-4 text-muted-foreground" />
                      <span>Descobrir Ganhaveis</span>
                    </Link>
                    
                    <Link 
                      to="/categorias" 
                      className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-accent transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <BarChart3 className="w-4 h-4 text-muted-foreground" />
                      <span>Categorias</span>
                    </Link>
                    
                    <Link 
                      to="/resultados" 
                      className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-accent transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span>Resultados Loteria</span>
                    </Link>
                    
                    <Link 
                      to="/como-funciona" 
                      className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-accent transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Eye className="w-4 h-4 text-muted-foreground" />
                      <span>Como Funciona</span>
                    </Link>
                    
                    {/* Create action button */}
                    <Button 
                      asChild 
                      className="mt-4 bg-primary hover:bg-primary/90 text-primary-foreground"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Link to="/lance-seu-ganhavel" className="flex items-center justify-center gap-2">
                        <Plus className="w-4 h-4" />
                        Lance seu Ganhavel
                      </Link>
                    </Button>
                    
                    {/* Admin section if admin */}
                    {isAdmin && (
                      <div className="border-t pt-4 mt-4">
                        <Link 
                          to="/admin" 
                          className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-accent transition-colors text-amber-600"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <Settings className="w-4 h-4" />
                          <span>Admin Panel</span>
                        </Link>
                      </div>
                    )}
                    
                    {/* Login button if not logged in */}
                    {!user && (
                      <Button 
                        variant="outline" 
                        asChild 
                        className="mt-4"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <Link to="/login" className="flex items-center justify-center gap-2">
                          <User className="w-4 h-4" />
                          Entrar / Cadastrar
                        </Link>
                      </Button>
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