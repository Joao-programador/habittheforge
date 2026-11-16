import { ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { MobileBottomNav } from "./MobileBottomNav";
import { WojakCompanionWidget } from "@/components/wojak/WojakCompanionWidget";
import { useBadgeWatcher } from "@/hooks/useBadgeWatcher";

const ROUTE_TITLES: Record<string, string> = {
  "/": "Cockpit",
  "/habits": "Hábitos",
  "/planner": "Planner",
  "/todos": "To-Do",
  "/journal": "Diário",
  "/achievements": "Conquistas",
  "/settings": "Configurações",
};

export function AppLayout({ children }: { children: ReactNode }) {
  useBadgeWatcher();
  const { pathname } = useLocation();
  const pageTitle = ROUTE_TITLES[pathname] ?? "ASCEND";

  return (
    <SidebarProvider>
      <div className="min-h-[100dvh] flex w-full bg-background overflow-x-hidden relative">
        <WojakCompanionWidget />
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
          <header className="hidden md:flex h-14 border-b border-border/40 items-center px-3 sticky top-0 z-30 bg-background/70 backdrop-blur-xl">
            <SidebarTrigger className="h-9 w-9" />
          </header>

          <header className="md:hidden pt-[env(safe-area-inset-top)] border-b border-border/30 bg-background/80 backdrop-blur-md">
            <div className="h-12 px-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <img
                  src="/assets/logo.png"
                  alt="ASCEND Logo"
                  className="h-6 w-6 object-contain select-none"
                />
                <span className="font-display text-sm tracking-tight text-foreground">
                  ASCEND
                </span>
              </div>
              <span className="text-xs font-mono text-muted-foreground">
                {pageTitle}
              </span>
            </div>
          </header>

          <main className="flex-1 p-3 sm:p-4 md:p-6 lg:p-8 pb-[calc(9.25rem+env(safe-area-inset-bottom))] md:pb-8 max-w-[1480px] w-full mx-auto overflow-x-hidden">
            {children}
          </main>
        </div>
        <MobileBottomNav />
      </div>
    </SidebarProvider>
  );
}
