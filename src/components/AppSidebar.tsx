import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar, SidebarHeader, SidebarFooter } from "@/components/ui/sidebar";
import { LayoutDashboard, Trophy, Settings, Flame, CalendarRange, ListChecks, BookOpen, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";


const items = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
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
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-primary flex items-center justify-center glow-primary shrink-0">
            <Flame className="w-5 h-5 text-primary-foreground" strokeWidth={2.5} />
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <div className="font-display text-lg leading-none tracking-tight">FORGE</div>
              <div className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] mt-0.5">
                Discipline · Iron
              </div>
            </div>
          )}
        </div>
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
