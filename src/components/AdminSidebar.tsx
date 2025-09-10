import { NavLink, useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  LayoutDashboard,
  Gift,
  Users,
  DollarSign,
  BarChart3,
  Settings,
  Shield,
  AlertTriangle,
  CheckCircle,
  Clock,
  FileText,
  Trophy,
} from "lucide-react";

const mainItems = [
  {
    title: "Dashboard",
    url: "/admin",
    icon: LayoutDashboard,
  },
  {
    title: "Gestão de Ganhaveis",
    url: "/admin/ganhaveis",
    icon: Gift,
  },
  {
    title: "Rifas (CRUD)",
    url: "/admin/rifas",
    icon: Gift,
  },
  {
    title: "Ganhadores",
    url: "/admin/ganhadores",
    icon: Trophy,
  },
  {
    title: "Ganhaveis Concluídos",
    url: "/admin/ganhaveis-concluidos",
    icon: CheckCircle,
  },
  {
    title: "Gestão de Usuários",
    url: "/admin/usuarios",
    icon: Users,
  },
  {
    title: "Controle Financeiro",
    url: "/admin/financeiro",
    icon: DollarSign,
  },
  {
    title: "Analytics",
    url: "/admin/analytics",
    icon: BarChart3,
  },
  {
    title: "Audit Logs",
    url: "/admin/audit-logs",
    icon: FileText,
  },
];

const configItems = [
  {
    title: "Configurações",
    url: "/admin/configuracoes",
    icon: Settings,
  },
];

export function AdminSidebar() {
  // Move all hooks to top level
  const { open } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;
  const collapsed = !open;

  const isActive = (path: string) => {
    if (path === "/admin") {
      return currentPath === "/admin";
    }
    return currentPath.startsWith(path);
  };

  const getNavClass = (path: string) => {
    return isActive(path)
      ? "bg-primary text-primary-foreground font-medium"
      : "hover:bg-muted/50";
  };

  return (
    <Sidebar className={collapsed ? "w-14" : "w-60"} collapsible="icon">
      <SidebarContent>
        {/* Header */}
        <div className="p-4 border-b">
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            {!collapsed && (
              <div>
                <h2 className="font-semibold text-lg">Admin Panel</h2>
                <p className="text-xs text-muted-foreground">Sistema de Ganhaveis</p>
              </div>
            )}
          </div>
        </div>

        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel>Principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {(mainItems || []).map((item) => {
                const IconComponent = item.icon;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink to={item.url} className={getNavClass(item.url)}>
                        <IconComponent className="h-4 w-4" />
                        {!collapsed && <span>{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Configuration */}
        <SidebarGroup>
          <SidebarGroupLabel>Sistema</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {(configItems || []).map((item) => {
                const IconComponent = item.icon;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink to={item.url} className={getNavClass(item.url)}>
                        <IconComponent className="h-4 w-4" />
                        {!collapsed && <span>{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Quick Stats (when expanded) */}
        {!collapsed && (
          <SidebarGroup>
            <SidebarGroupLabel>Status Rápido</SidebarGroupLabel>
            <SidebarGroupContent>
              <div className="space-y-2 px-2">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3 text-orange-500" />
                    <span>Pendentes</span>
                  </div>
                  <span className="font-medium">12</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1">
                    <CheckCircle className="h-3 w-3 text-green-500" />
                    <span>Aprovadas</span>
                  </div>
                  <span className="font-medium">45</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3 text-blue-500" />
                    <span>Ativas</span>
                  </div>
                  <span className="font-medium">28</span>
                </div>
              </div>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
    </Sidebar>
  );
}