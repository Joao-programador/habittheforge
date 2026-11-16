import { useRef, useEffect, useCallback, useState, useMemo } from "react";
import { format, isSameDay, isSameMonth, isToday, isFuture, startOfWeek, startOfMonth, addDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useHabitsData } from "@/hooks/useHabitsData";
import { getMonthDays, getStreak, getMonthCompletions } from "@/lib/stats";
import { HabitCheck } from "@/components/HabitCheck";
import { Button } from "@/components/ui/button";
import { Trash2, Flame, CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { AddHabitDialog } from "@/components/AddHabitDialog";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useJournalData } from "@/hooks/useJournalData";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

interface Props {
  currentMonth: Date;
  selectedDate?: Date;
  onSelectDate?: (d: Date) => void;
}

export function HabitGrid({ currentMonth, selectedDate, onSelectDate }: Props) {
  const { habits, isCompleted, toggleCompletion, addHabit, updateHabit, deleteHabit, completions } = useHabitsData();
  const { hasEntry } = useJournalData();
  const days = getMonthDays(currentMonth);
  const today = new Date();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const todayColRef = useRef<HTMLButtonElement>(null);
  const showingCurrentMonth = isSameMonth(currentMonth, today);
  const [mobileMode, setMobileMode] = useState<"week" | "month">("week");
  const [weekOffset, setWeekOffset] = useState(0);

  useEffect(() => {
    setWeekOffset(0);
  }, [currentMonth]);

  const mobileWeekDays = useMemo(() => {
    const anchor = isSameMonth(currentMonth, today) ? today : startOfMonth(currentMonth);
    const start = startOfWeek(addDays(anchor, weekOffset * 7), { weekStartsOn: 1 });
    return Array.from({ length: 7 }, (_, i) => addDays(start, i));
  }, [currentMonth, today, weekOffset]);

  const scrollToToday = useCallback(() => {
    if (!scrollContainerRef.current || !todayColRef.current) return;
    const container = scrollContainerRef.current;
    const el = todayColRef.current;
    const stickyOffset = window.innerWidth < 640 ? 128 : 224;
    container.scrollTo({
      left: Math.max(0, el.offsetLeft - stickyOffset - 24),
      behavior: "smooth",
    });
  }, []);

  useEffect(() => {
    if (!showingCurrentMonth) return;
    const timer = setTimeout(scrollToToday, 120);
    return () => clearTimeout(timer);
  }, [showingCurrentMonth, scrollToToday, mobileMode]);

  if (!habits.length) {
    return (
      <div className="surface-card p-10 sm:p-12 text-center">
        <div className="text-5xl sm:text-6xl mb-4">🔥</div>
        <h3 className="font-display text-xl sm:text-2xl mb-2">Comece sua jornada</h3>
        <p className="text-sm text-muted-foreground mb-6">Adicione seu primeiro hábito e comece a forjar disciplina hoje.</p>
        <AddHabitDialog onAdd={addHabit} />
      </div>
    );
  }

  return (
    <div className="surface-card overflow-hidden">
      {/* Toolbar exclusiva Mobile (< md): Alternador Semana 7d vs Matriz 31d */}
      <div className="md:hidden p-2.5 border-b border-border/30 space-y-2 bg-secondary/20">
        <div className="grid grid-cols-2 gap-1 p-1 rounded-xl bg-background/70 border border-border/40">
          <button
            type="button"
            onClick={() => setMobileMode("week")}
            className={cn(
              "h-9 rounded-lg text-xs font-medium transition-all cursor-pointer",
              mobileMode === "week"
                ? "bg-primary text-primary-foreground font-semibold shadow-sm"
                : "text-muted-foreground"
            )}
          >
            Semana (7d)
          </button>
          <button
            type="button"
            onClick={() => setMobileMode("month")}
            className={cn(
              "h-9 rounded-lg text-xs font-medium transition-all cursor-pointer",
              mobileMode === "month"
                ? "bg-primary text-primary-foreground font-semibold shadow-sm"
                : "text-muted-foreground"
            )}
          >
            Matriz (31d)
          </button>
        </div>

        {mobileMode === "week" ? (
          <div className="flex items-center justify-between gap-2 px-1">
            <button
              type="button"
              onClick={() => setWeekOffset((w) => w - 1)}
              className="h-9 w-9 rounded-lg border border-border/40 bg-background/60 flex items-center justify-center text-muted-foreground active:scale-95"
              aria-label="Semana anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="text-center">
              <span className="text-xs font-mono font-semibold text-foreground capitalize">
                {format(mobileWeekDays[0], "dd MMM", { locale: ptBR })} a {format(mobileWeekDays[6], "dd MMM", { locale: ptBR })}
              </span>
              {weekOffset !== 0 && (
                <button
                  type="button"
                  onClick={() => setWeekOffset(0)}
                  className="ml-2 text-[11px] font-mono text-primary underline"
                >
                  Atual
                </button>
              )}
            </div>
            <button
              type="button"
              onClick={() => setWeekOffset((w) => w + 1)}
              className="h-9 w-9 rounded-lg border border-border/40 bg-background/60 flex items-center justify-center text-muted-foreground active:scale-95"
              aria-label="Próxima semana"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        ) : showingCurrentMonth ? (
          <div className="flex items-center justify-between gap-2 px-1">
            <span className="text-[11px] font-mono text-muted-foreground">
              Deslize os dias para marcar
            </span>
            <button
              type="button"
              onClick={scrollToToday}
              className="inline-flex items-center gap-1 text-[11px] font-mono text-primary font-semibold px-2.5 py-1 rounded-lg bg-primary/10 active:scale-95 transition-transform"
            >
              <CalendarDays className="w-3 h-3" /> Ir para hoje
            </button>
          </div>
        ) : null}
      </div>

      {/* Visão Semanal Mobile (7 dias completos na largura da tela, sem scroll horizontal) */}
      {mobileMode === "week" && (
        <div className="md:hidden divide-y divide-border/30">
          {habits.map((habit) => {
            const streak = getStreak(habit.id, completions, today);
            const monthCount = getMonthCompletions(habit.id, completions, currentMonth);
            return (
              <div key={habit.id} className="p-3 space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <AddHabitDialog
                    habitToEdit={habit}
                    onUpdate={updateHabit}
                    trigger={
                      <button type="button" className="flex items-center gap-2.5 min-w-0 flex-1 text-left">
                        <div
                          className="w-9 h-9 rounded-xl flex items-center justify-center text-lg shrink-0"
                          style={{ background: `${habit.color}25`, border: `1px solid ${habit.color}55` }}
                        >
                          {habit.emoji}
                        </div>
                        <div className="min-w-0">
                          <div className="font-semibold text-sm truncate">{habit.name}</div>
                          <div className="flex items-center gap-2 text-[11px] font-mono text-muted-foreground">
                            <span className="inline-flex items-center gap-0.5">
                              <Flame className="w-3 h-3 text-orange-400" />
                              {streak}d
                            </span>
                            <span>·</span>
                            <span style={{ color: habit.color }}>
                              {monthCount}/{days.length} no mês
                            </span>
                          </div>
                        </div>
                      </button>
                    }
                  />

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-destructive shrink-0">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Apagar "{habit.name}"?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Todo o histórico deste hábito será permanentemente removido. Esta ação não pode ser desfeita.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={() => deleteHabit(habit.id)} className="bg-destructive text-destructive-foreground">
                          Apagar
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>

                <div className="grid grid-cols-7 gap-1 pt-0.5">
                  {mobileWeekDays.map((d) => {
                    const done = isCompleted(habit.id, d);
                    const future = isFuture(d) && !isToday(d);
                    const isTodayDay = isToday(d);
                    return (
                      <div
                        key={d.toISOString()}
                        className={cn(
                          "flex flex-col items-center gap-1 py-1.5 rounded-xl",
                          isTodayDay && "bg-primary/10 border border-primary/25"
                        )}
                      >
                        <span className={cn("text-[10px] font-mono uppercase leading-none", isTodayDay ? "text-primary font-bold" : "text-muted-foreground")}>
                          {format(d, "EEEEE", { locale: ptBR })}
                        </span>
                        <span className={cn("text-[10px] font-mono leading-none", isTodayDay ? "text-primary font-bold" : "text-foreground/80")}>
                          {format(d, "d")}
                        </span>
                        <HabitCheck
                          done={done}
                          color={habit.color}
                          onClick={() => toggleCompletion(habit.id, d)}
                          size="sm"
                          disabled={future}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Header row with day numbers (Matriz 31d: sempre visível em md+, e no mobile quando mobileMode === "month") */}
      <div
        ref={scrollContainerRef}
        className={cn(
          "overflow-x-auto scrollbar-hide overscroll-x-contain [-webkit-overflow-scrolling:touch]",
          mobileMode === "week" ? "hidden md:block" : "block"
        )}
      >
        <div className="min-w-max">
          <div className="flex items-center sticky top-0 z-20 bg-background border-b border-border/20">
            <div className="w-32 sm:w-48 md:w-56 shrink-0 p-3 md:p-4 font-semibold text-xs text-muted-foreground sticky left-0 z-20 bg-background border-r border-border/20 tracking-normal">
              Hábito
            </div>
            <div className="flex">
              {days.map((d) => {
                const isTodayDay = isToday(d);
                const dayOfWeek = d.getDay();
                const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
                const dateKey = format(d, "yyyy-MM-dd");
                const hasJournal = hasEntry(dateKey);
                const isSelected = selectedDate ? isSameDay(d, selectedDate) : false;

                return (
                  <button
                    ref={isTodayDay ? todayColRef : undefined}
                    type="button"
                    key={d.toISOString()}
                    onClick={() => {
                      onSelectDate?.(d);
                      const el = document.getElementById("journal-panel");
                      if (el) el.scrollIntoView({ behavior: "smooth" });
                    }}
                    className={cn(
                      "w-10 md:w-10 h-14 flex flex-col items-center justify-center text-xs font-mono transition-colors group cursor-pointer relative select-none",
                      isWeekend && !isTodayDay && "bg-white/[0.015]",
                      isSelected && "bg-primary/10"
                    )}
                    title={hasJournal ? "Possui anotação no diário (clique para abrir)" : "Clique para abrir no diário"}
                  >
                    <span
                      className={cn(
                        "text-[10px] font-medium uppercase",
                        isTodayDay
                          ? "text-primary font-bold"
                          : isWeekend
                          ? "text-muted-foreground/40 font-semibold"
                          : "text-muted-foreground/70"
                      )}
                    >
                      {format(d, "EEEEE", { locale: ptBR })}
                    </span>
                    {isTodayDay ? (
                      <span className="mt-0.5 w-6 h-6 rounded-full bg-primary text-primary-foreground font-bold flex items-center justify-center text-xs shadow-sm shadow-primary/40">
                        {format(d, "d")}
                      </span>
                    ) : (
                      <span
                        className={cn(
                          "mt-0.5 transition-colors group-hover:text-primary",
                          isSelected
                            ? "text-primary font-bold"
                            : isWeekend
                            ? "text-foreground/75"
                            : "text-foreground/90"
                        )}
                      >
                        {format(d, "d")}
                      </span>
                    )}

                    {/* Indicador visual de Diário */}
                    {hasJournal && (
                      <span
                        className="absolute bottom-1 w-1.5 h-1.5 rounded-full bg-amber-400 shadow-sm shadow-amber-400/80 animate-pulse"
                        title="Possui anotação no diário"
                      />
                    )}
                  </button>
                );
              })}
            </div>
            <div className="hidden sm:block w-28 shrink-0 p-4 text-center font-semibold text-xs text-muted-foreground tracking-normal">
              Streak
            </div>
            <div className="hidden sm:block w-20 shrink-0 p-4 text-center font-semibold text-xs text-muted-foreground tracking-normal">
              Mês
            </div>
            <div className="w-12 shrink-0" />
          </div>

          {habits.map((habit, i) => {
            const streak = getStreak(habit.id, completions, today);
            const monthCount = getMonthCompletions(habit.id, completions, currentMonth);
            return (
              <motion.div
                key={habit.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                className="flex items-center border-b border-border/30 bg-background hover:bg-surface-elevated transition-colors group"
              >
                <div className="w-32 sm:w-48 md:w-56 shrink-0 p-2.5 sm:p-3 md:p-4 sticky left-0 z-30 bg-background border-r border-border/20 group-hover:bg-surface-elevated transition-colors">
                  <AddHabitDialog
                    habitToEdit={habit}
                    onUpdate={updateHabit}
                    trigger={
                      <button className="flex items-center gap-2 sm:gap-3 w-full text-left hover:opacity-75 transition group min-h-[44px]">
                        <div
                          className="w-8 h-8 md:w-10 md:h-10 rounded-xl flex items-center justify-center text-base sm:text-lg md:text-xl shrink-0 transition-transform group-hover:scale-105"
                          style={{ background: `${habit.color}25`, border: `1px solid ${habit.color}55` }}
                        >
                          {habit.emoji}
                        </div>
                        <div className="min-w-0">
                          <div className="font-semibold truncate text-xs md:text-sm">{habit.name}</div>
                          <div className="hidden sm:block text-[11px] text-zinc-400 opacity-80 group-hover:opacity-100 transition">Editar hábito</div>
                          <div className="sm:hidden flex items-center gap-1.5 text-[10px] font-mono text-muted-foreground mt-0.5">
                            <span className="inline-flex items-center gap-0.5">
                              <Flame className="w-2.5 h-2.5 text-orange-400" />
                              {streak}d
                            </span>
                            <span>·</span>
                            <span style={{ color: habit.color }}>{monthCount}/{days.length}</span>
                          </div>
                        </div>
                      </button>
                    }
                  />
                </div>
                <div className="flex">
                  {days.map((d) => {
                    const done = isCompleted(habit.id, d);
                    const future = isFuture(d) && !isToday(d);
                    return (
                      <div key={d.toISOString()} className="w-10 h-14 flex items-center justify-center">
                        <HabitCheck
                          done={done}
                          color={habit.color}
                          onClick={() => toggleCompletion(habit.id, d)}
                          size="sm"
                          disabled={future}
                        />
                      </div>
                    );
                  })}
                </div>
                <div className="hidden sm:block w-28 shrink-0 px-4 text-center">
                  <div className="inline-flex items-center gap-1 font-mono">
                    {streak > 0 && <Flame className="w-3.5 h-3.5 text-orange-400" />}
                    <span className="font-bold">{streak}</span>
                    <span className="text-xs text-muted-foreground">d</span>
                  </div>
                </div>
                <div className="hidden sm:block w-20 shrink-0 px-4 text-center">
                  <span className="font-mono font-bold" style={{ color: habit.color }}>
                    {monthCount}
                  </span>
                  <span className="text-xs text-muted-foreground">/{days.length}</span>
                </div>
                <div className="w-12 shrink-0 px-1 sm:px-2 flex justify-center">
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-10 w-10 md:h-8 md:w-8 text-muted-foreground hover:text-destructive">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Apagar "{habit.name}"?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Todo o histórico deste hábito será permanentemente removido. Esta ação não pode ser desfeita.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={() => deleteHabit(habit.id)} className="bg-destructive text-destructive-foreground">
                          Apagar
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
