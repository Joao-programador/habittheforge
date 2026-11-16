import { useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Flame,
  CalendarRange,
  BookOpen,
  LayoutGrid,
  ListChecks,
  Trophy,
  Settings,
  LogOut,
  Download,
  Share,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { usePwaInstall } from "@/hooks/usePwaInstall";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const PRIMARY_TABS = [
  { title: "Hoje", url: "/", icon: LayoutDashboard },
  { title: "Hábitos", url: "/habits", icon: Flame },
  { title: "Planner", url: "/planner", icon: CalendarRange },
  { title: "Diário", url: "/journal", icon: BookOpen },
];

const SECONDARY_ITEMS = [
  { title: "To-Do", subtitle: "Tarefas e prazos", url: "/todos", icon: ListChecks },
  { title: "Conquistas", subtitle: "Badges desbloqueados", url: "/achievements", icon: Trophy },
  { title: "Configurações", subtitle: "Tema, cores e hábitos", url: "/settings", icon: Settings },
];

export function MobileBottomNav() {
  const [moreOpen, setMoreOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { canPromptInstall, isIosInstallable, promptInstall } = usePwaInstall();

  const isSecondaryActive = SECONDARY_ITEMS.some((item) => location.pathname === item.url);

  const handleInstall = async () => {
    const accepted = await promptInstall();
    if (accepted) {
      toast.success("ASCEND instalado no seu dispositivo!");
      setMoreOpen(false);
    }
  };

  const handleSignOut = async () => {
    setMoreOpen(false);
    await signOut();
    navigate("/auth", { replace: true });
  };

  return (
    <>
      <nav
        aria-label="Navegação principal mobile"
        className="md:hidden fixed inset-x-0 bottom-0 z-40 border-t border-border/60 bg-background/90 backdrop-blur-xl pb-[env(safe-area-inset-bottom)] shadow-[0_-8px_30px_rgba(0,0,0,0.35)]"
      >
        <div className="flex items-stretch justify-around px-1 h-16 max-w-lg mx-auto">
          {PRIMARY_TABS.map((tab) => {
            const active = location.pathname === tab.url;
            const Icon = tab.icon;
            return (
              <NavLink
                key={tab.url}
                to={tab.url}
                end={tab.url === "/"}
                className={cn(
                  "relative flex-1 min-w-[48px] min-h-[44px] flex flex-col items-center justify-center gap-1 rounded-xl transition-transform active:scale-95 select-none",
                  active ? "text-primary" : "text-muted-foreground hover:text-foreground"
                )}
              >
                {active && (
                  <span
                    aria-hidden="true"
                    className="absolute top-0.5 w-6 h-0.5 rounded-full bg-primary"
                  />
                )}
                <Icon className={cn("w-5 h-5", active && "stroke-[2.4]")} />
                <span className={cn("text-[11px] leading-none tracking-tight", active ? "font-semibold" : "font-medium")}>
                  {tab.title}
                </span>
              </NavLink>
            );
          })}

          <button
            type="button"
            onClick={() => setMoreOpen(true)}
            aria-expanded={moreOpen}
            aria-label="Abrir mais opções"
            className={cn(
              "relative flex-1 min-w-[48px] min-h-[44px] flex flex-col items-center justify-center gap-1 rounded-xl transition-transform active:scale-95 select-none cursor-pointer",
              isSecondaryActive || moreOpen ? "text-primary" : "text-muted-foreground hover:text-foreground"
            )}
          >
            {isSecondaryActive && (
              <span
                aria-hidden="true"
                className="absolute top-0.5 w-6 h-0.5 rounded-full bg-primary"
              />
            )}
            <LayoutGrid className={cn("w-5 h-5", (isSecondaryActive || moreOpen) && "stroke-[2.4]")} />
            <span className={cn("text-[11px] leading-none tracking-tight", isSecondaryActive ? "font-semibold" : "font-medium")}>
              Mais
            </span>
          </button>
        </div>
      </nav>

      <Sheet open={moreOpen} onOpenChange={setMoreOpen}>
        <SheetContent
          side="bottom"
          className="rounded-t-3xl border-t border-border/60 bg-background/95 backdrop-blur-2xl px-5 pt-4 pb-[calc(1.5rem+env(safe-area-inset-bottom))] max-h-[85dvh] overflow-y-auto"
        >
          <div className="mx-auto w-10 h-1 rounded-full bg-border/80 mb-3" aria-hidden="true" />
          <SheetHeader className="text-left pb-3 border-b border-border/40">
            <SheetTitle className="font-display text-lg tracking-tight flex items-center gap-2.5">
              <img src="/assets/logo.png" alt="ASCEND" className="w-6 h-6 object-contain" />
              <span>Mais do ASCEND</span>
            </SheetTitle>
          </SheetHeader>

          <div className="py-4 space-y-2">
            {SECONDARY_ITEMS.map((item) => {
              const active = location.pathname === item.url;
              const Icon = item.icon;
              return (
                <button
                  key={item.url}
                  type="button"
                  onClick={() => {
                    setMoreOpen(false);
                    navigate(item.url);
                  }}
                  className={cn(
                    "w-full min-h-[52px] px-3.5 py-2.5 rounded-2xl border flex items-center gap-3.5 text-left transition-all active:scale-[0.99]",
                    active
                      ? "bg-primary/15 border-primary/40 text-foreground"
                      : "bg-surface border-border/40 text-foreground hover:bg-surface-elevated"
                  )}
                >
                  <div
                    className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                      active ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
                    )}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold text-sm leading-tight">{item.title}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{item.subtitle}</div>
                  </div>
                </button>
              );
            })}
          </div>

          {canPromptInstall && (
            <div className="pb-4">
              <Button
                type="button"
                onClick={handleInstall}
                className="w-full h-12 rounded-2xl bg-gradient-primary glow-primary gap-2 font-semibold"
              >
                <Download className="w-4 h-4" />
                <span>Instalar aplicativo no celular</span>
              </Button>
            </div>
          )}

          {isIosInstallable && (
            <div className="mb-4 p-3.5 rounded-2xl bg-primary/10 border border-primary/25 text-xs text-foreground/90 flex items-start gap-2.5">
              <Share className="w-4 h-4 text-primary shrink-0 mt-0.5" />
              <div className="leading-relaxed">
                Para instalar no iPhone: toque em <strong className="text-foreground">Compartilhar</strong> na barra do Safari e escolha <strong className="text-foreground">Adicionar à Tela de Início</strong>.
              </div>
            </div>
          )}

          <div className="pt-3 border-t border-border/40 flex items-center justify-between gap-3">
            <div className="min-w-0">
              {user?.email && (
                <div className="text-xs text-muted-foreground truncate">{user.email}</div>
              )}
              <div className="text-[11px] text-zinc-400 flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400/80 shrink-0" />
                <span>Dados sincronizados na nuvem</span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={handleSignOut}
              className="h-11 px-4 rounded-xl gap-2 text-muted-foreground hover:text-destructive hover:border-destructive/40 shrink-0"
            >
              <LogOut className="w-4 h-4" />
              <span>Sair</span>
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
