import { useMemo } from "react";
import { addDays, endOfMonth, endOfWeek, format, isSameDay, isSameMonth, startOfMonth, startOfWeek } from "date-fns";
import { ptBR } from "date-fns/locale";
import { getEventsForDay, type PlannerEvent } from "@/hooks/usePlanner";
import { cn } from "@/lib/utils";

interface Props {
  date: Date;
  events: PlannerEvent[];
  isHabitCompleted: (habitId: string, date: Date) => boolean;
  onDayClick: (date: Date) => void;
  onEventClick: (ev: PlannerEvent) => void;
}

const DOW = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

export function MonthView({ date, events, isHabitCompleted, onDayClick, onEventClick }: Props) {
  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(date), { weekStartsOn: 0 });
    const end = endOfWeek(endOfMonth(date), { weekStartsOn: 0 });
    const out: Date[] = [];
    let cursor = start;
    while (cursor <= end) { out.push(cursor); cursor = addDays(cursor, 1); }
    return out;
  }, [date]);

  const today = new Date();

  return (
    <div className="surface-card overflow-hidden">
      <div className="grid grid-cols-7 border-b border-border/40">
        {DOW.map((d) => (
          <div key={d} className="py-2 text-center text-[10px] uppercase tracking-widest text-muted-foreground">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 auto-rows-fr">
        {days.map((d) => {
          const inMonth = isSameMonth(d, date);
          const isToday = isSameDay(d, today);
          const dayEvents = getEventsForDay(events, d);
          return (
            <button
              key={d.toISOString()}
              onClick={() => onDayClick(d)}
              className={cn(
                "min-h-[110px] text-left p-1.5 border-r border-b border-border/20 transition hover:bg-primary/5 flex flex-col gap-1",
                !inMonth && "opacity-40",
                isToday && "bg-primary/10"
              )}
            >
              <div className={cn("text-xs font-mono", isToday && "text-primary font-bold")}>
                {format(d, "dd")}
              </div>
              <div className="space-y-0.5 overflow-hidden flex-1">
                {dayEvents.slice(0, 3).map((ev) => {
                  const completed = ev.habit_id ? isHabitCompleted(ev.habit_id, d) : false;
                  return (
                    <div
                      key={ev.id + d.toISOString()}
                      onClick={(e) => { e.stopPropagation(); onEventClick(ev); }}
                      className={cn("text-[10px] px-1.5 py-0.5 rounded truncate font-medium", completed && "opacity-50 line-through")}
                      style={{ background: `${ev.color}33`, borderLeft: `2px solid ${ev.color}` }}
                    >
                      {ev.emoji ? `${ev.emoji} ` : ""}{ev.title}
                    </div>
                  );
                })}
                {dayEvents.length > 3 && (
                  <div className="text-[10px] text-muted-foreground pl-1">+{dayEvents.length - 3} mais</div>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
