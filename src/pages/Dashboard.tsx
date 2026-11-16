import { useState, useEffect, useMemo } from "react";
import { format, subDays, addDays, isToday } from "date-fns";
import { ptBR } from "date-fns/locale";
import { AppLayout } from "@/components/AppLayout";
import { WojakStatusBanner } from "@/components/WojakStatusBanner";
import { DailyHabitsCard } from "@/components/daily/DailyHabitsCard";
import { DailyWaterCard } from "@/components/daily/DailyWaterCard";
import { DailyTodosCard } from "@/components/daily/DailyTodosCard";
import { DailyJournalCard } from "@/components/daily/DailyJournalCard";
import { AuraMaximaModal } from "@/components/AuraMaximaModal";
import { useJournalData } from "@/hooks/useJournalData";
import { useHabitsData } from "@/hooks/useHabitsData";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, CalendarDays, Flame, ListChecks, BookOpen } from "lucide-react";

type MobileCockpitTab = "protocol" | "todos" | "journal";

export default function Dashboard() {
  const { selectedDate, setSelectedDate } = useJournalData();
  const { habits, completions } = useHabitsData();
  const [showAuraModal, setShowAuraModal] = useState(false);
  const [mobileSection, setMobileSection] = useState<MobileCockpitTab>("protocol");

  const isCurrentDay = useMemo(() => isToday(selectedDate), [selectedDate]);
  const todayStr = useMemo(() => format(new Date(), "yyyy-MM-dd"), []);

  // Check if today has 100% completion
  const isTodayComplete = useMemo(() => {
    if (habits.length === 0) return false;
    const habitIds = new Set(habits.map((h) => h.id));
    const doneToday = completions.filter(
      (c) => c.date === todayStr && habitIds.has(c.habit_id)
    ).length;
    return doneToday === habits.length;
  }, [habits, completions, todayStr]);

  // Auto-trigger celebration on first 100% completion of the day
  useEffect(() => {
    if (isTodayComplete) {
      const key = `ascend_celebrated_${todayStr}`;
      const hasCelebrated = localStorage.getItem(key);
      if (!hasCelebrated) {
        setShowAuraModal(true);
        localStorage.setItem(key, "true");
      }
    }
  }, [isTodayComplete, todayStr]);

  return (
    <AppLayout>
      <div className="space-y-3.5 sm:space-y-5">
        {/* Banner do Wojak / Beto */}
        <WojakStatusBanner onWatchAscend={() => setShowAuraModal(true)} />

        {/* Barra de Seleção de Dia do Cockpit (Linha Única no Mobile) */}
        <div className="surface-card p-2 sm:p-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 sm:gap-2 flex-1 sm:flex-none justify-between sm:justify-start min-w-0">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setSelectedDate(subDays(selectedDate, 1))}
              className="h-9 w-9 md:h-8 md:w-8 shrink-0"
              title="Dia anterior"
              aria-label="Dia anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>

            <div className="px-1.5 sm:px-2 min-w-0 sm:min-w-[170px] text-center truncate">
              <span className="font-display text-xs sm:text-sm tracking-tight capitalize block truncate">
                {format(selectedDate, "EEE, dd 'de' MMM", { locale: ptBR })}
              </span>
              <span className="text-[10px] font-mono text-muted-foreground block">
                {isCurrentDay ? "Hoje" : format(selectedDate, "yyyy")}
              </span>
            </div>

            <Button
              variant="outline"
              size="icon"
              onClick={() => setSelectedDate(addDays(selectedDate, 1))}
              className="h-9 w-9 md:h-8 md:w-8 shrink-0"
              title="Próximo dia"
              aria-label="Próximo dia"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>

            {!isCurrentDay && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedDate(new Date())}
                className="sm:ml-1 gap-1 h-9 md:h-8 px-2.5 text-xs font-mono bg-primary/15 sm:bg-transparent text-primary sm:text-foreground shrink-0"
              >
                <CalendarDays className="w-3.5 h-3.5" />
                <span className="sm:hidden">Hoje</span>
                <span className="hidden sm:inline">Voltar para Hoje</span>
              </Button>
            )}
          </div>

          <div className="text-xs text-muted-foreground font-mono px-2 hidden sm:block">
            Cockpit Diário · Execução no Presente
          </div>
        </div>

        {/* Seletor Segmentado Exclusivo Mobile (< lg) */}
        <div
          role="tablist"
          aria-label="Seções do Cockpit Diário"
          className="lg:hidden grid grid-cols-3 gap-1 p-1 rounded-2xl bg-surface border border-border/50"
        >
          {[
            { id: "protocol" as const, label: "Protocolo", icon: Flame },
            { id: "todos" as const, label: "Missões", icon: ListChecks },
            { id: "journal" as const, label: "Diário", icon: BookOpen },
          ].map((tab) => {
            const active = mobileSection === tab.id;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setMobileSection(tab.id)}
                className={cn(
                  "min-h-[40px] rounded-xl flex items-center justify-center gap-1.5 text-xs font-medium transition-all cursor-pointer",
                  active
                    ? "bg-primary text-primary-foreground shadow-sm font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Bento Grid Diário */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5 items-start">
          {/* Coluna Esquerda: Hábitos de Hoje (7 colunas) */}
          <div className={cn("lg:col-span-7 space-y-4 sm:space-y-5", mobileSection !== "protocol" && "hidden lg:block")}>
            <DailyHabitsCard selectedDate={selectedDate} />
          </div>

          {/* Coluna Direita: Hidratação 3D, To-Do do Dia e Diário Rápido (5 colunas) */}
          <div className="lg:col-span-5 space-y-4 sm:space-y-5">
            <div className={cn(mobileSection !== "protocol" && "hidden lg:block")}>
              <DailyWaterCard selectedDate={selectedDate} />
            </div>
            <div className={cn(mobileSection !== "todos" && "hidden lg:block")}>
              <DailyTodosCard selectedDate={selectedDate} />
            </div>
            <div className={cn(mobileSection !== "journal" && "hidden lg:block")}>
              <DailyJournalCard selectedDate={selectedDate} />
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Celebração de 100% / Aura Máxima */}
      <AuraMaximaModal
        isOpen={showAuraModal}
        onClose={() => setShowAuraModal(false)}
      />
    </AppLayout>
  );
}
