import { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { JournalPanel } from "@/components/JournalPanel";
import { useJournalData } from "@/hooks/useJournalData";
import { BookOpen } from "lucide-react";

export default function Journal() {
  const [currentMonth] = useState<Date>(new Date());
  const { selectedDate, setSelectedDate, allEntries } = useJournalData();

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs uppercase tracking-wider font-mono text-primary px-2 py-0.5 rounded bg-primary/10 border border-primary/20">
                Mindset & Autópsia Diária
              </span>
            </div>
            <h1 className="font-display text-3xl sm:text-4xl tracking-tight">Diário de Ascensão</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Documente sua ascensão diária, exponha desculpas de beto e registre vitórias.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="surface-card px-4 py-2 flex items-center gap-2.5">
              <BookOpen className="w-4 h-4 text-primary" />
              <div className="text-right">
                <div className="font-display text-lg leading-none">{allEntries.length}</div>
                <div className="text-[10px] uppercase tracking-wide text-muted-foreground">
                  {allEntries.length === 1 ? "Registro no Arquivo" : "Registros no Arquivo"}
                </div>
              </div>
            </div>
          </div>
        </div>

        <JournalPanel
          currentMonth={currentMonth}
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
        />
      </div>
    </AppLayout>
  );
}
