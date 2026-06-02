import { ReactNode } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { useBadgeWatcher } from "@/hooks/useBadgeWatcher";
import { useReminderEngine } from "@/hooks/useReminderEngine";
import { ReminderOverlay } from "./ReminderOverlay";

export function AppLayout({ children }: { children: ReactNode }) {
  useBadgeWatcher();
  const { current, dismissCurrent, queueSize } = useReminderEngine();
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-14 border-b border-border/40 flex items-center px-3 sticky top-0 z-30 bg-background/70 backdrop-blur-xl">
            <SidebarTrigger />
          </header>
          <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-[1480px] w-full mx-auto">
            {children}
          </main>
        </div>
      </div>
      <ReminderOverlay pending={current} onDismiss={dismissCurrent} remaining={queueSize} />
    </SidebarProvider>
  );
}
