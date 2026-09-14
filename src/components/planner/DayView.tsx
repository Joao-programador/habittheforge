import { useMemo, useRef } from "react";
import { format, isSameDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { EventBlock } from "./EventBlock";
import { EventCluster } from "./EventCluster";
import { getEventsForDay, type PlannerEvent } from "@/hooks/usePlanner";
import { useTodos, getTodosForDay, type Todo } from "@/hooks/useTodos";
import { groupDayEvents } from "@/lib/eventLayout";
import { Check, ListChecks } from "lucide-react";
import { cn } from "@/lib/utils";

const HOUR_PX = 56;
const HOURS = Array.from({ length: 24 }, (_, i) => i);

interface Props {
  date: Date;
  events: PlannerEvent[];
  isHabitCompleted: (habitId: string, date: Date) => boolean;
  onSlotClick: (date: Date, minutes: number) => void;
  onEventClick: (ev: PlannerEvent) => void;
  onToggleHabit: (habitId: string, date: Date) => void;
}

export function DayView({ date, events, isHabitCompleted, onSlotClick, onEventClick, onToggleHabit }: Props) {
  const dayEvents = useMemo(() => getEventsForDay(events, date), [events, date]);
  const clusters = useMemo(() => groupDayEvents(dayEvents), [dayEvents]);
  const { todos, toggleTodo } = useTodos();
  const dayTodos = useMemo(() => getTodosForDay(todos, date), [todos, date]);
  const today = isSameDay(date, new Date());
  const now = new Date();
  const nowMinutes = today ? now.getHours() * 60 + now.getMinutes() : -1;
  const gridRef = useRef<HTMLDivElement>(null);

  return (
    <div className="surface-card overflow-hidden">
      <div className="px-5 py-3 border-b border-border/40 flex items-baseline gap-3">
        <span className="font-display text-2xl tracking-tight capitalize">
          {format(date, "EEEE", { locale: ptBR })}
        </span>
        <span className="text-sm text-muted-foreground font-mono">
          {format(date, "dd 'de' MMMM", { locale: ptBR })}
        </span>
      </div>

      {dayTodos.length > 0 && (
        <div className="px-5 py-2.5 border-b border-border/40 bg-secondary/20">
          <div className="flex items-center gap-2 mb-1.5">
            <ListChecks className="w-3.5 h-3.5 text-primary" />
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-mono">
              Prazos hoje
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {dayTodos.map((t) => (
              <TodoChip key={t.id} todo={t} onToggle={() => toggleTodo(t.id)} />
            ))}
          </div>
        </div>
      )}

      <div className="relative overflow-y-auto max-h-[calc(100dvh-420px)] md:max-h-[calc(100dvh-280px)]">
        <div ref={gridRef} className="relative grid grid-cols-[64px_1fr]" style={{ height: HOUR_PX * 24 }}>
          <div className="border-r border-border/40">
            {HOURS.map((h) => (
              <div key={h} style={{ height: HOUR_PX }} className="text-[10px] font-mono text-muted-foreground text-right pr-2 pt-0.5">
                {h.toString().padStart(2, "0")}:00
              </div>
            ))}
          </div>
          <div className="relative">
            {HOURS.map((h) => (
              <div
                key={h}
                style={{ height: HOUR_PX, top: h * HOUR_PX }}
                className="absolute left-0 right-0 border-t border-border/30 hover:bg-primary/5 cursor-pointer"
                onClick={() => onSlotClick(date, h * 60)}
              />
            ))}
            {today && nowMinutes >= 0 && (
              <div className="absolute left-0 right-0 z-20 pointer-events-none" style={{ top: (nowMinutes / 60) * HOUR_PX }}>
                <div className="h-px bg-primary glow-primary" />
                <div className="absolute -left-1 -top-1 w-2 h-2 rounded-full bg-primary" />
              </div>
            )}
            {clusters.map((cluster) => {
              const startMin = Math.min(...cluster.map(e => e.startMinutes));
              const maxEnd = Math.max(...cluster.map(e => e.startMinutes + e.durationMinutes));
              const top = (startMin / 60) * HOUR_PX;
              const height = Math.max(22, ((maxEnd - startMin) / 60) * HOUR_PX - 2);

              return (
                <div
                  key={"cluster-" + cluster[0].id + format(date, "yyyy-MM-dd")}
                  className="absolute px-0.5"
                  style={{
                    top,
                    height,
                    left: `4px`,
                    width: `calc(100% - 8px)`,
                  }}
                >
                  <EventCluster
                    cluster={cluster}
                    dateObj={date}
                    isHabitCompleted={isHabitCompleted}
                    onEventClick={onEventClick}
                    onToggleHabit={onToggleHabit}
                    compact={false}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function TodoChip({ todo, onToggle }: { todo: Todo; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      className={cn(
        "inline-flex items-center gap-1.5 text-xs px-2 py-1 rounded-md border transition",
        todo.completed
          ? "opacity-50 line-through border-border/40 bg-secondary/40"
          : "border-border/60 bg-card hover:border-primary/60"
      )}
      style={{ borderLeftColor: todo.color, borderLeftWidth: 3 }}
    >
      <span
        className={cn(
          "w-3.5 h-3.5 rounded-[4px] border flex items-center justify-center",
          todo.completed ? "bg-success border-success" : "border-foreground/40"
        )}
      >
        {todo.completed && <Check className="w-2.5 h-2.5 text-background" strokeWidth={4} />}
      </span>
      <span className="font-medium">{todo.title}</span>
    </button>
  );
}
