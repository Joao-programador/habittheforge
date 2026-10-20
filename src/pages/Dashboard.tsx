import { useState, useEffect, useMemo } from "react";
import { format, subDays, addDays, isToday } from "date-fns";
import { ptBR } from "date-fns/locale";
import { AppLayout } from "@/components/AppLayout";
import { WojakStatusBanner } from "@/components/WojakStatusBanner";
import { DailyHabitsCard } from "@/components/daily/DailyHabitsCard";
import { DailyTodosCard } from "@/components/daily/DailyTodosCard";
import { DailyJournalCard } from "@/components/daily/DailyJournalCard";
import { AuraMaximaModal } from "@/components/AuraMaximaModal";
import { useJournalData } from "@/hooks/useJournalData";
import { useHabitsData } from "@/hooks/useHabitsData";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";

export default function Dashboard() {
  const { selectedDate, setSelectedDate } = useJournalData();
  const { habits, completions } = useHabitsData();
  const [showAuraModal, setShowAuraModal] = useState(false);

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
      <div className="space-y-5">
        {/* Banner do Wojak / Beto */}
        <WojakStatusBanner onWatchAscend={() => setShowAuraModal(true)} />

        {/* Barra de Seleção de Dia do Cockpit */}
        <div className="surface-card p-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setSelectedDate(subDays(selectedDate, 1))}
              className="h-8 w-8"
              title="Dia anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>

            <div className="px-2 min-w-[170px] text-center">
              <span className="font-display text-sm tracking-tight capitalize block">
                {format(selectedDate, "EEEE, dd 'de' MMMM", { locale: ptBR })}
              </span>
              <span className="text-[10px] font-mono text-muted-foreground block">
                {isCurrentDay ? "Hoje" : format(selectedDate, "yyyy")}
              </span>
            </div>

            <Button
              variant="outline"
              size="icon"
              onClick={() => setSelectedDate(addDays(selectedDate, 1))}
              className="h-8 w-8"
              title="Próximo dia"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>

            {!isCurrentDay && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedDate(new Date())}
                className="ml-1 gap-1 h-8 text-xs font-mono"
              >
                <CalendarDays className="w-3.5 h-3.5" />
                Voltar para Hoje
              </Button>
            )}
          </div>

          <div className="text-xs text-muted-foreground font-mono px-2 hidden sm:block">
            Cockpit Diário · Execução no Presente
          </div>
        </div>

        {/* Bento Grid Diário */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* Coluna Esquerda: Hábitos de Hoje (7 colunas) */}
          <div className="lg:col-span-7">
            <DailyHabitsCard selectedDate={selectedDate} />
          </div>

          {/* Coluna Direita: To-Do do Dia e Diário Rápido (5 colunas) */}
          <div className="lg:col-span-5 space-y-5">
            <DailyTodosCard selectedDate={selectedDate} />
            <DailyJournalCard selectedDate={selectedDate} />
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
