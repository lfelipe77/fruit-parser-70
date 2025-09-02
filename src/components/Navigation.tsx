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
import { useState, useEffect } from "react";
import NotificationCenter from "@/components/NotificationCenter";
import LanguageSelector from "@/components/LanguageSelector";
import { useAdminCheck } from "@/hooks/useAdminCheck";
import { useAuth } from "@/hooks/useAuth";
import { useAuthContext } from "@/providers/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getAvatarSrc } from "@/lib/avatarUtils";
import { useUnifiedProfile } from "@/hooks/useUnifiedProfile";
import ProfileErrorState from "@/components/ProfileErrorState";

function useIsAdmin() {
  const { user, initializing } = useAuthContext();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  
  useEffect(() => {
    if (initializing) return; // Wait for auth to initialize
    
    if (!user) {
      console.log('[useIsAdmin] No user found');
      setIsAdmin(false);
      return;
    }
    
    const checkAdmin = async () => {
      console.log('[useIsAdmin] Checking admin status for user:', user.id);
      try {
        const { data } = await supabase
          .from("user_profiles")
          .select("role")
          .eq("id", user.id)
          .maybeSingle();
        
        console.log('[useIsAdmin] Profile data:', data);
        const adminStatus = ((data?.role ?? "") as string).toLowerCase() === "admin";
        console.log('[useIsAdmin] Admin status:', adminStatus);
        setIsAdmin(adminStatus);
      } catch (error) {
        console.error('[useIsAdmin] Error:', error);
        setIsAdmin(false);
      }
    };
    
    checkAdmin();
  }, [user, initializing]);
  
  return isAdmin;
}

export default function Navigation() {
  const { t } = useTranslation();
  const [selectedLottery, setSelectedLottery] = useState('br');
  const { isAdmin: legacyIsAdmin } = useAdminCheck();
  const { user } = useAuth();
  const { user: authUser, initializing } = useAuthContext();
  const { profile, isLoading: profileLoading, error: profileError, isAdmin } = useUnifiedProfile();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Get user role from profile hook (simplified) - handle both profile types
  const userRole = (profile as any)?.role || "";
  
  // Legacy admin check that's still needed for some fallback cases
  const useIsAdmin = () => {
    const { user, initializing } = useAuthContext();
    const [isAdminState, setIsAdminState] = useState<boolean | null>(null);
    
    useEffect(() => {
      if (initializing) return;
      
      if (!user) {
        setIsAdminState(false);
        return;
      }
      
      const checkAdmin = async () => {
        try {
          const { data } = await supabase
            .from("user_profiles")
            .select("role")
            .eq("id", user.id)
            .maybeSingle();
          
          const adminStatus = ((data?.role ?? "") as string).toLowerCase() === "admin";
          setIsAdminState(adminStatus);
        } catch (error) {
          console.error('[useIsAdmin] Error:', error);
          setIsAdminState(false);
        }
      };
      
      checkAdmin();
    }, [user, initializing]);
    
    return isAdminState;
  };
  
  const legacyIsAdminResult = useIsAdmin();

  const lotteryDraws = [
    { id: 'br', flag: '🇧🇷', name: 'Mega-Sena', date: '10/08', time: '20:00' },
    { id: 'us', flag: '🇺🇸', name: 'Powerball', date: '12/08', time: '22:59' },
    { id: 'uk', flag: '🇬🇧', name: 'EuroMillions', date: '09/08', time: '21:00' },
    { id: 'eu', flag: '🇪🇺', name: 'EuroJackpot', date: '13/08', time: '20:00' }
  ];

  const selectedDraw = lotteryDraws.find(draw => draw.id === selectedLottery);

  // Debug logging for admin status
  console.log('[Navigation] Current user:', user?.id);
  console.log('[Navigation] Current userRole:', userRole);
  console.log('[Navigation] legacyIsAdmin hook result:', legacyIsAdmin);
  console.log('[Navigation] useUnifiedProfile isAdmin result:', isAdmin);
  console.log('[Navigation] Admin dropdown visible:', userRole === "admin");
  console.log('[Navigation] Direct admin link visible:', isAdmin === true);
  
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
              
              {/* Direct Admin Link - Primary Method */}
              {isAdmin && (
                <Link
                  to="/admin"
                  className="px-3 py-2 text-sm font-medium hover:opacity-80 flex items-center gap-2 bg-primary/10 text-primary rounded-md transition-colors"
                  data-testid="nav-admin-link"
                  onClick={() => console.log('[Navigation] Direct admin link clicked')}
                >
                  <Shield className="h-4 w-4" />
                  Admin
                </Link>
              )}
              
              {/* Legacy Admin dropdown menu - Fallback */}
              {userRole === "admin" && !isAdmin && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      className="flex items-center gap-2"
                      onClick={() => console.log('[Navigation] Legacy admin dropdown clicked, userRole:', userRole, 'isAdmin:', legacyIsAdminResult)}
                    >
                      <Shield className="h-4 w-4" />
                      Admin (Legacy)
                      <ChevronDown className="h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem asChild>
                      <Link 
                        to="/admin" 
                        className="flex items-center gap-2"
                        onClick={() => console.log('[Navigation] Clicking admin main panel link')}
                      >
                        <Settings className="h-4 w-4" />
                        Painel Principal
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link 
                        to="/admin-dashboard" 
                        className="flex items-center gap-2"
                        onClick={() => console.log('[Navigation] Clicking admin dashboard link')}
                      >
                        <BarChart3 className="h-4 w-4" />
                        Dashboard
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link 
                        to="/admin-visits" 
                        className="flex items-center gap-2"
                        onClick={() => console.log('[Navigation] Clicking admin visits link')}
                      >
                        <Eye className="h-4 w-4" />
                        Visitas Públicas
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
              {user ? (
                profileLoading ? (
                  <div className="w-8 h-8 rounded-full bg-muted animate-pulse" />
                ) : profileError ? (
                  <div className="w-8 h-8 rounded-full bg-destructive/10 flex items-center justify-center">
                    <User className="w-4 h-4 text-destructive" />
                  </div>
                ) : (
                  <Link to="/dashboard">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={getAvatarSrc(profile, user?.id)} data-testid="profile-avatar" />
                      <AvatarFallback>
                        {user?.email?.charAt(0).toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                  </Link>
                )
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