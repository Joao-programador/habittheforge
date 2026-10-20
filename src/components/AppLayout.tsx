import { ReactNode } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { WojakFloatingIsland } from "@/components/wojak/WojakFloatingIsland";
import { useBadgeWatcher } from "@/hooks/useBadgeWatcher";

export function AppLayout({ children }: { children: ReactNode }) {
  useBadgeWatcher();
  return (
    <SidebarProvider>
      <div className="min-h-[100dvh] flex w-full bg-background overflow-x-hidden relative">
        <WojakFloatingIsland />
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <header className="h-14 border-b border-border/40 flex items-center px-3 sticky top-0 z-30 bg-background/70 backdrop-blur-xl">
            <SidebarTrigger className="h-11 w-11 md:h-9 md:w-9" />
          </header>
          <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-[1480px] w-full mx-auto overflow-x-hidden">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
