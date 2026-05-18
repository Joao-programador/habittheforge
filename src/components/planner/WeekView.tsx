import { useMemo } from "react";
import { addDays, format, isSameDay, startOfWeek } from "date-fns";
import { ptBR } from "date-fns/locale";
import { EventBlock } from "./EventBlock";
import { getEventsForDay, type PlannerEvent } from "@/hooks/usePlanner";
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
      <div className="overflow-y-auto max-h-[calc(100vh-280px)]">
        <div className="grid grid-cols-[56px_repeat(7,minmax(0,1fr))]" style={{ height: HOUR_PX * 24 }}>
          {/* hour col */}
          <div className="relative border-r border-border/40">
            {HOURS.map((h) => (
              <div key={h} style={{ height: HOUR_PX }} className="text-[10px] font-mono text-muted-foreground text-right pr-2 pt-0.5">
                {h.toString().padStart(2, "0")}
              </div>
            ))}
          </div>
          {days.map((d) => {
            const dayEvents = getEventsForDay(events, d);
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
                {dayEvents.map((ev) => {
                  const top = (ev.startMinutes / 60) * HOUR_PX;
                  const height = Math.max(20, (ev.durationMinutes / 60) * HOUR_PX - 2);
                  const completed = ev.habit_id ? isHabitCompleted(ev.habit_id, d) : false;
                  return (
                    <div key={ev.id + d.toISOString()} className="absolute left-0.5 right-0.5 z-[5]" style={{ top, height }}>
                      <EventBlock
                        event={ev}
                        date={format(d, "yyyy-MM-dd")}
                        completed={completed}
                        compact={height < 36}
                        style={{ height: "100%" }}
                        onClick={() => onEventClick(ev)}
                        onToggleComplete={ev.habit_id ? () => onToggleHabit(ev.habit_id!, d) : undefined}
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
