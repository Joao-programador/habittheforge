import { useMemo, useState, useEffect } from "react";
import { addDays, endOfMonth, endOfWeek, format, isSameDay, isSameMonth, startOfMonth, startOfWeek } from "date-fns";
import { ptBR } from "date-fns/locale";
import { getEventsForDay, type PlannerEvent } from "@/hooks/usePlanner";
import { useTodos, getTodosForDay } from "@/hooks/useTodos";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Check, ArrowUpRight } from "lucide-react";

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
  const [selectedDay, setSelectedDay] = useState<Date>(date);

  useEffect(() => {
    setSelectedDay(date);
  }, [date]);

  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(date), { weekStartsOn: 0 });
    const end = endOfWeek(endOfMonth(date), { weekStartsOn: 0 });
    const out: Date[] = [];
    let cursor = start;
    while (cursor <= end) { out.push(cursor); cursor = addDays(cursor, 1); }
    return out;
  }, [date]);

  const today = new Date();
  const selectedDayEvents = useMemo(() => getEventsForDay(events, selectedDay), [events, selectedDay]);
  const selectedDayTodos = useMemo(() => getTodosForDay(todos, selectedDay), [todos, selectedDay]);

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
          const isSelectedMobile = isSameDay(d, selectedDay);
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
              onClick={() => {
                if (typeof window !== "undefined" && window.innerWidth < 768) {
                  setSelectedDay(d);
                } else {
                  onDayClick(d);
                }
              }}
              className={cn(
                "min-h-[54px] md:min-h-[110px] cursor-pointer text-left p-1 md:p-1.5 border-r border-b border-border/20 transition hover:bg-primary/5 flex flex-col gap-1",
                !inMonth && "opacity-40",
                isToday && "bg-primary/10",
                isSelectedMobile && "ring-1 ring-inset ring-primary bg-primary/15 md:ring-0 md:bg-transparent",
                isToday && isSelectedMobile && "md:bg-primary/10"
              )}
            >
              <div className={cn("text-xs font-mono flex items-center justify-between", isToday && "text-primary font-bold")}>
                <span>{format(d, "dd")}</span>
                {dayTodos.length > 0 && (
                  <span className="hidden md:inline text-[9px] px-1 rounded bg-primary/20 text-primary font-bold">
                    {dayTodos.filter((t) => !t.completed).length || "✓"}
                  </span>
                )}
              </div>

              {/* Mobile: Dots coloridos limpos em vez de textos espremidos */}
              <div className="md:hidden flex flex-wrap gap-1 mt-0.5 justify-center items-center min-h-[14px]">
                {items.slice(0, 5).map((it, idx) => {
                  const color = it.kind === "todo" ? it.todo.color : it.event.color;
                  return (
                    <span
                      key={idx}
                      className="w-1.5 h-1.5 rounded-full shrink-0"
                      style={{ backgroundColor: color || "#818cf8" }}
                    />
                  );
                })}
                {totalItems > 5 && (
                  <span className="text-[8px] font-mono text-muted-foreground leading-none">
                    +{totalItems - 5}
                  </span>
                )}
              </div>

              {/* Desktop (md+): Blocos de texto completos preservados */}
              <div className="hidden md:block space-y-0.5 overflow-hidden flex-1">
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

      {/* Agenda do Dia Selecionado no Mobile (< md) */}
      <div className="md:hidden border-t border-border/40 p-3.5 space-y-2.5 bg-surface/60">
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            <div className="font-display text-sm capitalize truncate">
              {format(selectedDay, "EEEE, dd 'de' MMMM", { locale: ptBR })}
            </div>
            <div className="text-[11px] font-mono text-muted-foreground">
              {selectedDayEvents.length + selectedDayTodos.length} item(ns) neste dia
            </div>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onDayClick(selectedDay)}
            className="h-9 px-2.5 text-xs gap-1 shrink-0"
          >
            <span>Abrir dia</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Button>
        </div>

        {selectedDayTodos.length === 0 && selectedDayEvents.length === 0 ? (
          <p className="text-xs text-muted-foreground py-2">
            Nenhum bloco ou tarefa para esta data.
          </p>
        ) : (
          <div className="space-y-1.5">
            {selectedDayTodos.map((t) => (
              <button
                key={"m-t-" + t.id}
                type="button"
                onClick={() => toggleTodo(t.id)}
                className={cn(
                  "w-full min-h-[40px] px-3 py-2 rounded-xl text-left text-xs flex items-center gap-2.5 border transition",
                  t.completed && "opacity-55 line-through"
                )}
                style={{ background: `${t.color}18`, borderColor: `${t.color}40` }}
              >
                <span className={cn("w-4 h-4 rounded border flex items-center justify-center shrink-0", t.completed ? "bg-success border-success text-background" : "border-foreground/40")}>
                  {t.completed && <Check className="w-3 h-3" strokeWidth={3} />}
                </span>
                <span className="font-medium truncate">◇ {t.title}</span>
              </button>
            ))}

            {selectedDayEvents.map((ev) => {
              const completed = ev.habit_id ? isHabitCompleted(ev.habit_id, selectedDay) : false;
              const startH = Math.floor(ev.startMinutes / 60).toString().padStart(2, "0");
              const startM = (ev.startMinutes % 60).toString().padStart(2, "0");
              return (
                <button
                  key={"m-e-" + ev.id}
                  type="button"
                  onClick={() => onEventClick(ev)}
                  className={cn(
                    "w-full min-h-[40px] px-3 py-2 rounded-xl text-left text-xs flex items-center justify-between gap-2 border transition",
                    completed && "opacity-55 line-through"
                  )}
                  style={{ background: `${ev.color}22`, borderColor: `${ev.color}45` }}
                >
                  <span className="font-medium truncate">
                    {ev.emoji ? `${ev.emoji} ` : ""}{ev.title}
                  </span>
                  <span className="font-mono text-[10px] text-muted-foreground shrink-0">
                    {startH}:{startM}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
