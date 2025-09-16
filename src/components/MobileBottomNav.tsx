import { Link, useLocation } from "react-router-dom";
import { Home, Search, Plus, User, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthContext } from "@/providers/AuthProvider";
import { cn } from "@/lib/utils";

export default function MobileBottomNav() {
  const location = useLocation();
  const { user } = useAuthContext();
  
  const navItems = [
    {
      icon: Home,
      label: "Início",
      href: "/",
      isActive: location.pathname === "/"
    },
    {
      icon: Search,
      label: "Descobrir",
      href: "/descobrir",
      isActive: location.pathname === "/descobrir"
    },
    {
      icon: Plus,
      label: "Criar",
      href: "/lance-seu-ganhavel",
      isActive: location.pathname === "/lance-seu-ganhavel",
      isCreateButton: true
    },
    {
      icon: BarChart3,
      label: "Resultados",
      href: "/resultados", 
      isActive: location.pathname === "/resultados"
    },
    {
      icon: User,
      label: user ? "Conta" : "Entrar",
      href: user ? "/dashboard" : "/login",
      isActive: location.pathname === "/dashboard" || location.pathname === "/login"
    }
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t md:hidden">
      <div className="flex items-center justify-around py-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          
          if (item.isCreateButton) {
            return (
              <Button
                key={item.href}
                asChild
                variant="default"
                size="sm"
                className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-4 py-2 min-w-[60px] shadow-lg"
              >
                <Link to={item.href} className="flex flex-col items-center gap-1">
                  <Icon className="h-4 w-4" />
                  <span className="text-xs font-medium">{item.label}</span>
                </Link>
              </Button>
            );
          }

          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                "flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors min-w-[60px]",
                item.isActive 
                  ? "text-primary bg-primary/10" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              <span className="text-xs">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}