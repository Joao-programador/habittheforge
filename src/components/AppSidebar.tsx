import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar, SidebarHeader, SidebarFooter } from "@/components/ui/sidebar";
import { LayoutDashboard, Trophy, Settings, Flame, CalendarRange, ListChecks, BookOpen, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";


const items = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Hábitos", url: "/habits", icon: Flame },
  { title: "Planner", url: "/planner", icon: CalendarRange },
  { title: "To-Do", url: "/todos", icon: ListChecks },
  { title: "Diário", url: "/journal", icon: BookOpen },
  { title: "Conquistas", url: "/achievements", icon: Trophy },
  { title: "Configurações", url: "/settings", icon: Settings },
];

export function AppSidebar() {
  const { state, isMobile } = useSidebar();
  const collapsed = !isMobile && state === "collapsed";
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth", { replace: true });
  };


  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border/60">
      <SidebarHeader className="p-4 border-b border-sidebar-border/40">
        {!collapsed ? (
          <div className="flex flex-col items-center text-center gap-2">
            <img
              src="/assets/logo.png"
              alt="Forge Logo"
              className="h-16 w-auto object-contain select-none"
            />
            <div className="overflow-hidden">
              <div className="font-display text-lg leading-none tracking-tight">FORGE</div>
              <div className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] mt-1">
                Discipline · Iron
              </div>
            </div>
          </div>
        ) : (
          <div className="flex justify-center items-center py-1">
            <img
              src="/assets/logo.png"
              alt="Forge Logo"
              className="w-8 h-8 object-contain select-none"
            />
          </div>
        )}
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => {
                const active = location.pathname === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={active}>
                      <NavLink to={item.url} end className="gap-3">
                        <item.icon className="w-4 h-4" />
                        {!collapsed && <span className="font-medium">{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-3 gap-2">
        {!collapsed && user?.email && (
          <div className="px-2 text-[10px] text-muted-foreground truncate">{user.email}</div>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleSignOut}
          className="justify-start gap-3 text-muted-foreground hover:text-foreground"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          {!collapsed && <span>Sair</span>}
        </Button>
        {!collapsed && (
          <div className="px-2 text-[11px] text-zinc-400 leading-snug flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400/80 shrink-0" />
            <span>Dados sincronizados na nuvem</span>
          </div>
        )}
      </SidebarFooter>

    </Sidebar>
  );
}
