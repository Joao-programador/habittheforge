import { useCallback, useState } from "react";
import { addDays, addMonths, addWeeks, endOfWeek, format, startOfWeek, subDays, subMonths, subWeeks } from "date-fns";
import { ptBR } from "date-fns/locale";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChevronLeft, ChevronRight, CalendarDays, Plus } from "lucide-react";
import { usePlanner, type PlannerEvent } from "@/hooks/usePlanner";
import { useHabitsData } from "@/hooks/useHabitsData";
import { DayView } from "@/components/planner/DayView";
import { WeekView } from "@/components/planner/WeekView";
import { MonthView } from "@/components/planner/MonthView";
import { HabitQuickPanel } from "@/components/planner/HabitQuickPanel";
import { EventDialog, buildDraft, draftToEventInput, eventToDraft, type EventDraft } from "@/components/planner/EventDialog";
import { toast } from "sonner";

type ViewMode = "day" | "week" | "month";

export default function Planner() {
  const [view, setView] = useState<ViewMode>("week");
  const [cursor, setCursor] = useState(new Date());
  const [dialogOpen, setDialogOpen] = useState(false);
  const [draft, setDraft] = useState<EventDraft | null>(null);

  const { events, addEvent, updateEvent, deleteEvent } = usePlanner();
  const { habits, isCompleted, toggleCompletion } = useHabitsData();

  const openNew = useCallback((partial: Partial<EventDraft> = {}) => {
    setDraft(buildDraft({ date: format(cursor, "yyyy-MM-dd"), ...partial }));
    setDialogOpen(true);
  }, [cursor]);

  const openEdit = useCallback((ev: PlannerEvent) => {
    setDraft(eventToDraft(ev));
    setDialogOpen(true);
  }, []);

  const handleSlotClick = (date: Date, minutes: number) => {
    openNew({ date: format(date, "yyyy-MM-dd"), startMinutes: minutes });
  };

  const handleDayClick = (date: Date) => {
    setCursor(date);
    setView("day");
  };

  const handlePickHabit = (habitId: string) => {
    const h = habits.find((x) => x.id === habitId);
    if (!h) return;
    openNew({
      title: h.name,
      emoji: h.emoji,
      color: h.color,
      habit_id: habitId,
      date: format(cursor, "yyyy-MM-dd"),
    });
  };

  const handleSave = (d: EventDraft) => {
    if (d.id) {
      updateEvent(d.id, draftToEventInput(d));
      toast.success("Bloco atualizado");
    } else {
      addEvent(draftToEventInput(d));
      toast.success("Bloco criado");
    }
    setDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    deleteEvent(id);
    toast.success("Bloco excluído");
  };

  const handleToggleHabit = (habitId: string, date: Date) => {
    toggleCompletion(habitId, date);
  };

  // Navigation
  const navigate = (dir: -1 | 1) => {
    if (view === "day") setCursor(dir === 1 ? addDays(cursor, 1) : subDays(cursor, 1));
    else if (view === "week") setCursor(dir === 1 ? addWeeks(cursor, 1) : subWeeks(cursor, 1));
    else setCursor(dir === 1 ? addMonths(cursor, 1) : subMonths(cursor, 1));
  };

  const headerLabel = () => {
    if (view === "day") return format(cursor, "dd 'de' MMMM yyyy", { locale: ptBR });
    if (view === "week") {
      const s = startOfWeek(cursor, { weekStartsOn: 0 });
      const e = endOfWeek(cursor, { weekStartsOn: 0 });
      return `${format(s, "dd MMM", { locale: ptBR })} – ${format(e, "dd MMM yyyy", { locale: ptBR })}`;
    }
    return format(cursor, "MMMM yyyy", { locale: ptBR });
  };

  return (
    <AppLayout>
      <div className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-display text-3xl tracking-tight">Planner</h1>
            <p className="text-sm text-muted-foreground">Forje seu tempo. Bloqueie. Execute.</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setCursor(new Date())} className="gap-1.5">
              <CalendarDays className="w-3.5 h-3.5" /> Hoje
            </Button>
            <Button className="bg-gradient-primary glow-primary gap-2" size="sm" onClick={() => openNew()}>
              <Plus className="w-4 h-4" /> Novo bloco
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={() => navigate(-1)} className="h-9 w-9">
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <div className="px-3 min-w-[200px] text-center font-display text-lg tracking-tight capitalize">
              {headerLabel()}
            </div>
            <Button variant="outline" size="icon" onClick={() => navigate(1)} className="h-9 w-9">
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>

          <Tabs value={view} onValueChange={(v) => setView(v as ViewMode)}>
            <TabsList>
              <TabsTrigger value="day">Dia</TabsTrigger>
              <TabsTrigger value="week">Semana</TabsTrigger>
              <TabsTrigger value="month">Mês</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_260px] gap-5">
          <div className="min-w-0">
            {view === "day" && (
              <DayView
                date={cursor}
                events={events}
                isHabitCompleted={isCompleted}
                onSlotClick={handleSlotClick}
                onEventClick={openEdit}
                onToggleHabit={handleToggleHabit}
              />
            )}
            {view === "week" && (
              <WeekView
                date={cursor}
                events={events}
                isHabitCompleted={isCompleted}
                onSlotClick={handleSlotClick}
                onEventClick={openEdit}
                onToggleHabit={handleToggleHabit}
              />
            )}
            {view === "month" && (
              <MonthView
                date={cursor}
                events={events}
                isHabitCompleted={isCompleted}
                onDayClick={handleDayClick}
                onEventClick={openEdit}
              />
            )}
          </div>

          <div className="space-y-4">
            <HabitQuickPanel onPick={handlePickHabit} />
          </div>
        </div>
      </div>

      <EventDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        draft={draft}
        onSave={handleSave}
        onDelete={handleDelete}
      />
    </AppLayout>
  );
}
