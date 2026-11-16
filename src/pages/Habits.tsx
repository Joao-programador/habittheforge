import { useState, useRef } from "react";
import { addMonths, format, subMonths } from "date-fns";
import { ptBR } from "date-fns/locale";
import { AppLayout } from "@/components/AppLayout";
import { HabitGrid } from "@/components/HabitGrid";
import { StatsPanel } from "@/components/StatsPanel";
import { BadgesPanel } from "@/components/BadgesPanel";
import { AddHabitDialog } from "@/components/AddHabitDialog";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Download, CalendarDays, Flame } from "lucide-react";
import { useHabitsData } from "@/hooks/useHabitsData";
import { useJournalData } from "@/hooks/useJournalData";
import { exportMonthPDF } from "@/lib/exportPdf";
import { toast } from "sonner";

export default function Habits() {
  const [month, setMonth] = useState(new Date());
  const { selectedDate, setSelectedDate } = useJournalData();
  const { addHabit, habits, completions, badges } = useHabitsData();
  const captureRef = useRef<HTMLDivElement>(null);

  const handleExport = async () => {
    toast.loading("Gerando PDF...", { id: "pdf" });
    try {
      await exportMonthPDF({ month, habits, completions, badges });
      toast.success("PDF exportado!", { id: "pdf" });
    } catch (e: any) {
      toast.error("Falha ao exportar: " + (e?.message || "Erro desconhecido"), { id: "pdf" });
    }
  };

  return (
    <AppLayout>
      <div ref={captureRef} className="space-y-4 sm:space-y-6">
        {/* Header da Tela de Hábitos */}
        <div className="flex flex-wrap items-center justify-between gap-3 sm:gap-4">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-primary/15 text-primary flex items-center justify-center glow-primary shrink-0">
              <Flame className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <h1 className="font-display text-xl sm:text-2xl tracking-tight">Matriz de Hábitos</h1>
              <p className="hidden sm:block text-xs text-muted-foreground">
                Visão mensal analítica, taxa de aderência e matriz de 31 dias.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExport}
              className="gap-1.5 h-10 md:h-9 px-3"
            >
              <Download className="w-4 h-4" /> PDF
            </Button>
            <AddHabitDialog onAdd={addHabit} />
          </div>
        </div>

        {/* Toolbar de Navegação Mensal */}
        <div className="surface-card p-2.5 sm:p-3 flex flex-wrap items-center justify-between gap-2 sm:gap-3">
          <div className="flex items-center gap-1.5 sm:gap-2 w-full sm:w-auto justify-between sm:justify-start">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setMonth(subMonths(month, 1))}
              className="h-10 w-10 md:h-9 md:w-9 shrink-0"
              aria-label="Mês anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <div className="px-2 sm:px-3 min-w-[120px] sm:min-w-[160px] text-center">
              <div className="font-display text-base sm:text-xl tracking-tight leading-none capitalize">
                {format(month, "MMMM", { locale: ptBR })}
              </div>
              <div className="font-mono text-[10px] sm:text-xs text-muted-foreground mt-0.5">
                {format(month, "yyyy")}
              </div>
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setMonth(addMonths(month, 1))}
              className="h-10 w-10 md:h-9 md:w-9 shrink-0"
              aria-label="Próximo mês"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMonth(new Date())}
              className="sm:ml-1 gap-1.5 h-10 md:h-9 px-2.5 bg-primary/10 sm:bg-transparent text-primary sm:text-foreground shrink-0"
            >
              <CalendarDays className="w-3.5 h-3.5" />
              Hoje
            </Button>
          </div>

          <div className="hidden sm:block text-xs font-mono text-muted-foreground px-2">
            {habits.length} hábito{habits.length !== 1 ? "s" : ""} monitorado{habits.length !== 1 ? "s" : ""}
          </div>
        </div>

        {/* Faixa de KPIs */}
        <StatsPanel currentMonth={month} mode="kpis" />

        {/* No mobile (< md), Hábitos vêm antes do Gráfico; no Desktop (md+) mantém Gráfico antes da Matriz */}
        <div className="flex flex-col gap-4 sm:gap-6">
          <div className="order-2 md:order-1">
            <StatsPanel currentMonth={month} mode="chart" />
          </div>
          <div className="order-1 md:order-2">
            <HabitGrid
              currentMonth={month}
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
            />
          </div>
        </div>

        {/* Conquistas da Forja */}
        <BadgesPanel />
      </div>
    </AppLayout>
  );
}
