import { ReactNode } from "react";
import { useLocation } from "react-router-dom";
import MobileBottomNav from "./MobileBottomNav";

interface LayoutProps {
  children: ReactNode;
  showMobileNav?: boolean;
}

export default function Layout({ children, showMobileNav = true }: LayoutProps) {
  const location = useLocation();
  
  // Pages that should show mobile navigation
  const pagesWithMobileNav = [
    "/",
    "/descobrir", 
    "/categorias",
    "/resultados",
    "/como-funciona",
    "/dashboard",
    "/profile",
    "/my-tickets",
    "/raffles"
  ];
  
  // Check if current page should show mobile nav
  const shouldShowMobileNav = showMobileNav && (
    pagesWithMobileNav.includes(location.pathname) ||
    location.pathname.startsWith("/ganhavel/") ||
    location.pathname.startsWith("/categorias/") ||
    location.pathname.startsWith("/perfil/")
  );
  
  return (
    <div className={shouldShowMobileNav ? "pb-16 md:pb-0" : ""}>
      {children}
      {shouldShowMobileNav && <MobileBottomNav />}
    </div>
  );
}