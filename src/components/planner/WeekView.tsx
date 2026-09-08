import { useMemo } from "react";
import { addDays, format, isSameDay, startOfWeek } from "date-fns";
import { ptBR } from "date-fns/locale";
import { EventBlock } from "./EventBlock";
import { EventCluster } from "./EventCluster";
import { getEventsForDay, type PlannerEvent } from "@/hooks/usePlanner";
import { useTodos, getTodosForDay } from "@/hooks/useTodos";
import { layoutDayEvents, groupDayEvents } from "@/lib/eventLayout";
import { cn } from "@/lib/utils";

const HOUR_PX = 44;
const HOURS = Array.from({ length: 24 }, (_, i) => i);

interface Props {
  date: Date;
  events: PlannerEvent[];
  isHabitCompleted: (habitId: string, date: Date) => boolean;
  onSlotClick: (date: Date, minutes: number) => void;
  onEventClick: (ev: PlannerEvent) => void;
  onToggleHabit: (habitId: string, date: Date) => void;
}

export function WeekView({ date, events, isHabitCompleted, onSlotClick, onEventClick, onToggleHabit }: Props) {
  const weekStart = useMemo(() => startOfWeek(date, { weekStartsOn: 0 }), [date]);
  const days = useMemo(() => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)), [weekStart]);
  const today = new Date();
  const { todos, toggleTodo } = useTodos();

  const hasAnyTodo = useMemo(
    () => days.some((d) => getTodosForDay(todos, d).length > 0),
    [days, todos]
  );

  return (
    <div className="surface-card overflow-hidden">
      <div className="grid grid-cols-[56px_repeat(7,minmax(0,1fr))] border-b border-border/40 sticky top-0 bg-card/95 backdrop-blur-md z-20">
        <div />
        {days.map((d) => {
          const isToday = isSameDay(d, today);
          return (
            <div key={d.toISOString()} className={cn("py-2 text-center border-l border-border/30", isToday && "bg-primary/10")}>
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
                {format(d, "EEE", { locale: ptBR })}
              </div>
              <div className={cn("font-display text-xl leading-none mt-1", isToday && "text-primary")}>
                {format(d, "dd")}
              </div>
            </div>
          );
        })}
      </div>

      {hasAnyTodo && (
        <div className="grid grid-cols-[56px_repeat(7,minmax(0,1fr))] border-b border-border/40 bg-secondary/20">
          <div className="text-[9px] uppercase tracking-widest text-muted-foreground font-mono text-right pr-2 pt-1.5">
            Prazos
          </div>
          {days.map((d) => {
            const dt = getTodosForDay(todos, d);
            return (
              <div key={d.toISOString()} className="border-l border-border/30 p-1 space-y-1 min-h-[28px]">
                {dt.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => toggleTodo(t.id)}
                    className={cn(
                      "w-full text-left text-[10px] px-1.5 py-0.5 rounded truncate font-medium transition hover:brightness-125",
                      t.completed && "line-through opacity-50"
                    )}
                    style={{ background: `${t.color}33`, borderLeft: `2px solid ${t.color}` }}
                    title={t.title}
                  >
                    ◇ {t.title}
                  </button>
                ))}
              </div>
            );
          })}
        </div>
      )}

      <div className="overflow-y-auto max-h-[calc(100vh-280px)]">
        <div className="grid grid-cols-[56px_repeat(7,minmax(0,1fr))]" style={{ height: HOUR_PX * 24 }}>
          <div className="relative border-r border-border/40">
            {HOURS.map((h) => (
              <div key={h} style={{ height: HOUR_PX }} className="text-[10px] font-mono text-muted-foreground text-right pr-2 pt-0.5">
                {h.toString().padStart(2, "0")}
              </div>
            ))}
          </div>
          {days.map((d) => {
            const dayEvents = getEventsForDay(events, d);
            const clusters = groupDayEvents(dayEvents);
            const isToday = isSameDay(d, today);
            const nowMin = isToday ? today.getHours() * 60 + today.getMinutes() : -1;
            return (
              <div key={d.toISOString()} className="relative border-l border-border/30">
                {HOURS.map((h) => (
                  <div key={h} style={{ height: HOUR_PX, top: h * HOUR_PX }}
                    className="absolute left-0 right-0 border-t border-border/20 hover:bg-primary/5 cursor-pointer"
                    onClick={() => onSlotClick(d, h * 60)} />
                ))}
                {nowMin >= 0 && (
                  <div className="absolute left-0 right-0 z-10 pointer-events-none" style={{ top: (nowMin / 60) * HOUR_PX }}>
                    <div className="h-px bg-primary" />
                  </div>
                )}
                {clusters.map((cluster) => {
                  const startMin = Math.min(...cluster.map(e => e.startMinutes));
                  const maxEnd = Math.max(...cluster.map(e => e.startMinutes + e.durationMinutes));
                  const top = (startMin / 60) * HOUR_PX;
                  const height = Math.max(20, ((maxEnd - startMin) / 60) * HOUR_PX - 2);

                  return (
                    <div
                      key={"cluster-" + cluster[0].id + d.toISOString()}
                      className="absolute z-[5]"
                      style={{
                        top,
                        height,
                        left: `2px`,
                        width: `calc(100% - 4px)`,
                      }}
                    >
                      <EventCluster
                        cluster={cluster}
                        dateObj={d}
                        isHabitCompleted={isHabitCompleted}
                        onEventClick={onEventClick}
                        onToggleHabit={onToggleHabit}
                        compact={true}
                      />
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
