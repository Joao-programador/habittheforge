import { NavLink, useLocation } from "react-router-dom";
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar, SidebarHeader, SidebarFooter } from "@/components/ui/sidebar";
import { LayoutDashboard, Trophy, Settings, Flame, CalendarRange, ListChecks, BellRing } from "lucide-react";

const items = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Planner", url: "/planner", icon: CalendarRange },
  { title: "To-Do", url: "/todos", icon: ListChecks },
  { title: "Lembretes", url: "/reminders", icon: BellRing },
  { title: "Conquistas", url: "/achievements", icon: Trophy },
  { title: "Configurações", url: "/settings", icon: Settings },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();

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

      <SidebarFooter className="p-3">
        {!collapsed && (
          <div className="px-2 py-1 text-[10px] text-muted-foreground italic leading-snug">
            Dados salvos localmente neste navegador.
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
