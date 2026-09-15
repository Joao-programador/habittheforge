import { format, isSameDay, isToday, isFuture } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useHabitsData } from "@/hooks/useHabitsData";
import { getMonthDays, getStreak, getMonthCompletions } from "@/lib/stats";
import { HabitCheck } from "@/components/HabitCheck";
import { Button } from "@/components/ui/button";
import { Trash2, Flame } from "lucide-react";
import { AddHabitDialog } from "@/components/AddHabitDialog";
import { motion } from "framer-motion";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

interface Props {
  currentMonth: Date;
}

export function HabitGrid({ currentMonth }: Props) {
  const { habits, isCompleted, toggleCompletion, addHabit, updateHabit, deleteHabit, completions } = useHabitsData();
  const days = getMonthDays(currentMonth);
  const today = new Date();

  if (!habits.length) {
    return (
      <div className="surface-card p-12 text-center">
        <div className="text-6xl mb-4">🔥</div>
        <h3 className="font-display text-2xl mb-2">Comece sua jornada</h3>
        <p className="text-muted-foreground mb-6">Adicione seu primeiro hábito e comece a forjar disciplina hoje.</p>
        <AddHabitDialog onAdd={addHabit} />
      </div>
    );
  }

  return (
    <div className="surface-card overflow-hidden">
      {/* Header row with day numbers */}
      <div className="overflow-x-auto scrollbar-hide overscroll-x-contain [-webkit-overflow-scrolling:touch]">
        <div className="min-w-max">
          <div className="flex items-center sticky top-0 z-20 bg-transparent backdrop-blur-2xl border-b border-border/20">
            <div className="w-40 md:w-56 shrink-0 p-3 md:p-4 font-display text-xs uppercase tracking-widest text-muted-foreground sticky left-0 z-20 bg-transparent backdrop-blur-2xl border-r border-border/20">
              Hábito
            </div>
            <div className="flex">
              {days.map((d) => {
                const isTodayDay = isToday(d);
                return (
                  <div
                    key={d.toISOString()}
                    className={`w-10 md:w-10 h-14 flex flex-col items-center justify-center text-xs font-mono ${
                      isTodayDay ? "text-primary font-bold" : "text-muted-foreground"
                    }`}
                  >
                    <span className="text-[10px] uppercase opacity-60">
                      {format(d, "EEEEE", { locale: ptBR })}
                    </span>
                    <span className={`mt-0.5 ${isTodayDay ? "text-base" : ""}`}>{format(d, "d")}</span>
                  </div>
                );
              })}
            </div>
            <div className="hidden sm:block w-28 shrink-0 p-4 text-center font-display text-xs uppercase tracking-widest text-muted-foreground">
              Streak
            </div>
            <div className="hidden sm:block w-20 shrink-0 p-4 text-center font-display text-xs uppercase tracking-widest text-muted-foreground">
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
                className="flex items-center border-b border-border/30 hover:bg-secondary/30 transition-colors group"
              >
                <div className="w-40 md:w-56 shrink-0 p-3 md:p-4 sticky left-0 z-10 bg-transparent backdrop-blur-2xl border-r border-border/20 group-hover:bg-secondary/20 transition-colors">
                  <AddHabitDialog
                    habitToEdit={habit}
                    onUpdate={updateHabit}
                    trigger={
                      <button className="flex items-center gap-3 w-full text-left hover:opacity-75 transition group">
                        <div
                          className="w-8 h-8 md:w-10 md:h-10 rounded-xl flex items-center justify-center text-lg md:text-xl shrink-0 transition-transform group-hover:scale-105"
                          style={{ background: `${habit.color}25`, border: `1px solid ${habit.color}55` }}
                        >
                          {habit.emoji}
                        </div>
                        <div className="min-w-0">
                          <div className="font-semibold truncate text-xs md:text-sm">{habit.name}</div>
                          <div className="text-[10px] text-muted-foreground opacity-0 group-hover:opacity-100 transition">Editar hábito</div>
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
                <div className="w-12 shrink-0 px-2">
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive">
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
