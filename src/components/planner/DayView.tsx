import { useMemo, useRef } from "react";
import { format, isSameDay, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { EventBlock } from "./EventBlock";
import { getEventsForDay, type PlannerEvent } from "@/hooks/usePlanner";

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
      <div className="relative overflow-y-auto max-h-[calc(100vh-280px)]">
        <div ref={gridRef} className="relative grid grid-cols-[64px_1fr]" style={{ height: HOUR_PX * 24 }}>
          {/* Hour labels */}
          <div className="border-r border-border/40">
            {HOURS.map((h) => (
              <div key={h} style={{ height: HOUR_PX }} className="text-[10px] font-mono text-muted-foreground text-right pr-2 pt-0.5">
                {h.toString().padStart(2, "0")}:00
              </div>
            ))}
          </div>
          {/* Slot area */}
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
              <div className="absolute left-0 right-0 z-10 pointer-events-none" style={{ top: (nowMinutes / 60) * HOUR_PX }}>
                <div className="h-px bg-primary glow-primary" />
                <div className="absolute -left-1 -top-1 w-2 h-2 rounded-full bg-primary" />
              </div>
            )}
            {dayEvents.map((ev) => {
              const top = (ev.startMinutes / 60) * HOUR_PX;
              const height = Math.max(22, (ev.durationMinutes / 60) * HOUR_PX - 2);
              const completed = ev.habit_id ? isHabitCompleted(ev.habit_id, date) : false;
              return (
                <div key={ev.id + format(date, "yyyy-MM-dd")} className="absolute left-1 right-2 z-[5]" style={{ top, height }}>
                  <EventBlock
                    event={ev}
                    date={format(date, "yyyy-MM-dd")}
                    completed={completed}
                    style={{ height: "100%" }}
                    onClick={() => onEventClick(ev)}
                    onToggleComplete={ev.habit_id ? () => onToggleHabit(ev.habit_id!, date) : undefined}
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
