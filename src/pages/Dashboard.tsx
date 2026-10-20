import { useState, useRef } from "react";
import { addMonths, format, subMonths } from "date-fns";
import { ptBR } from "date-fns/locale";
import { AppLayout } from "@/components/AppLayout";
import { WojakStatusBanner } from "@/components/WojakStatusBanner";
import { HabitGrid } from "@/components/HabitGrid";
import { StatsPanel } from "@/components/StatsPanel";
import { BadgesPanel } from "@/components/BadgesPanel";
import { JournalPanel } from "@/components/JournalPanel";
import { AddHabitDialog } from "@/components/AddHabitDialog";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Download, CalendarDays } from "lucide-react";
import { useHabitsData } from "@/hooks/useHabitsData";
import { useJournalData } from "@/hooks/useJournalData";
import { exportMonthPDF } from "@/lib/exportPdf";
import { toast } from "sonner";

export default function Dashboard() {
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
      toast.error("Falha ao exportar: " + e.message, { id: "pdf" });
    }
  };

  return (
    <AppLayout>
      <div ref={captureRef} className="space-y-5">
        <WojakStatusBanner />

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={() => setMonth(subMonths(month, 1))} className="h-10 w-10">
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <div className="px-3 min-w-[180px] text-center">
              <div className="font-display text-2xl tracking-tight leading-none capitalize">
                {format(month, "MMMM", { locale: ptBR })}
              </div>
              <div className="font-mono text-xs text-muted-foreground mt-1">
                {format(month, "yyyy")}
              </div>
            </div>
            <Button variant="outline" size="icon" onClick={() => setMonth(addMonths(month, 1))} className="h-10 w-10">
              <ChevronRight className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setMonth(new Date())} className="ml-1 gap-1.5">
              <CalendarDays className="w-3.5 h-3.5" />
              Hoje
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleExport} className="gap-2">
              <Download className="w-4 h-4" /> PDF
            </Button>
            <AddHabitDialog onAdd={addHabit} />
          </div>
        </div>

        <StatsPanel currentMonth={month} />

        <HabitGrid
          currentMonth={month}
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
        />

        <JournalPanel
          currentMonth={month}
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
        />

        <BadgesPanel />
      </div>
    </AppLayout>
  );
}
