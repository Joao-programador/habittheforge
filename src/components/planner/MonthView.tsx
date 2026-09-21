import { useMemo } from "react";
import { addDays, endOfMonth, endOfWeek, format, isSameDay, isSameMonth, startOfMonth, startOfWeek } from "date-fns";
import { getEventsForDay, type PlannerEvent } from "@/hooks/usePlanner";
import { useTodos, getTodosForDay } from "@/hooks/useTodos";
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
  const { todos, toggleTodo } = useTodos();
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
          const dayTodos = getTodosForDay(todos, d);
          const totalItems = dayEvents.length + dayTodos.length;
          const visible = 3;
          // Show todos first (they have deadlines = urgency), then events
          const items = [
            ...dayTodos.map((t) => ({ kind: "todo" as const, todo: t })),
            ...dayEvents.map((e) => ({ kind: "event" as const, event: e })),
          ];
          return (
            <div
              key={d.toISOString()}
              onClick={() => onDayClick(d)}
              className={cn(
                "min-h-[110px] cursor-pointer text-left p-1.5 border-r border-b border-border/20 transition hover:bg-primary/5 flex flex-col gap-1",
                !inMonth && "opacity-40",
                isToday && "bg-primary/10"
              )}
            >
              <div className={cn("text-xs font-mono flex items-center justify-between", isToday && "text-primary font-bold")}>
                <span>{format(d, "dd")}</span>
                {dayTodos.length > 0 && (
                  <span className="text-[9px] px-1 rounded bg-primary/20 text-primary font-bold">
                    {dayTodos.filter((t) => !t.completed).length || "✓"}
                  </span>
                )}
              </div>
              <div className="space-y-0.5 overflow-hidden flex-1">
                {items.slice(0, visible).map((it, idx) => {
                  if (it.kind === "todo") {
                    const t = it.todo;
                    return (
                      <div
                        key={"t" + t.id}
                        onClick={(e) => { e.stopPropagation(); toggleTodo(t.id); }}
                        className={cn(
                          "text-[10px] px-1.5 py-0.5 rounded truncate font-medium",
                          t.completed && "opacity-50 line-through"
                        )}
                        style={{ background: `${t.color}20`, border: `1px dashed ${t.color}40` }}
                        title={t.title}
                      >
                        ◇ {t.title}
                      </div>
                    );
                  }
                  const ev = it.event;
                  const completed = ev.habit_id ? isHabitCompleted(ev.habit_id, d) : false;
                  return (
                    <div
                      key={"e" + ev.id + idx}
                      onClick={(e) => { e.stopPropagation(); onEventClick(ev); }}
                      className={cn("text-[10px] px-1.5 py-0.5 rounded truncate font-medium", completed && "opacity-50 line-through")}
                      style={{ background: `${ev.color}25`, border: `1px solid ${ev.color}40` }}
                    >
                      {ev.emoji ? `${ev.emoji} ` : ""}{ev.title}
                    </div>
                  );
                })}
                {totalItems > visible && (
                  <div className="text-[10px] text-muted-foreground pl-1">+{totalItems - visible} mais</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
