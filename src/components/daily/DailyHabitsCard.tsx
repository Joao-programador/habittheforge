import { useMemo } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Link } from "react-router-dom";
import { Flame, Check, ArrowRight, Sparkles, CheckCircle2 } from "lucide-react";
import { useHabitsData } from "@/hooks/useHabitsData";
import { getStreak } from "@/lib/stats";
import { AddHabitDialog } from "@/components/AddHabitDialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  selectedDate?: Date;
}

export function DailyHabitsCard({ selectedDate = new Date() }: Props) {
  const { habits, completions, toggleCompletion, isCompleted, addHabit } = useHabitsData();

  const dateStr = useMemo(() => format(selectedDate, "yyyy-MM-dd"), [selectedDate]);

  const { completedCount, totalCount, percentage } = useMemo(() => {
    const total = habits.length;
    if (total === 0) return { completedCount: 0, totalCount: 0, percentage: 0 };
    const habitIds = new Set(habits.map((h) => h.id));
    const done = completions.filter((c) => c.date === dateStr && habitIds.has(c.habit_id)).length;
    const pct = Math.round((done / total) * 100);
    return { completedCount: done, totalCount: total, percentage: pct };
  }, [habits, completions, dateStr]);

  return (
    <div className="surface-card p-5 sm:p-6 flex flex-col justify-between space-y-5">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between gap-3 mb-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/15 text-primary flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-display text-lg tracking-tight">Hábitos de Hoje</h2>
              <p className="text-xs text-muted-foreground capitalize">
                {format(selectedDate, "EEEE, dd 'de' MMMM", { locale: ptBR })}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-mono text-xs px-2.5 py-1 rounded-md bg-secondary border border-border/40 font-semibold">
              {completedCount} / {totalCount} feitos
            </span>
          </div>
        </div>

        {/* Barra de Progresso Rápida */}
        <div className="w-full bg-secondary/50 rounded-full h-2 overflow-hidden border border-border/30 mt-3">
          <div
            className="bg-gradient-primary h-full transition-all duration-500 rounded-full"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      {/* Lista de Hábitos */}
      <div className="space-y-2.5 flex-1 min-h-[220px]">
        {habits.length === 0 ? (
          <div className="py-12 text-center text-muted-foreground space-y-3">
            <div className="text-4xl">🔥</div>
            <p className="text-sm">Nenhum hábito cadastrado ainda.</p>
            <p className="text-xs text-muted-foreground/80 max-w-xs mx-auto">
              Comece forjando o primeiro hábito para iniciar sua jornada de disciplina diária.
            </p>
            <AddHabitDialog onAdd={addHabit} />
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {habits.map((h) => {
              const done = isCompleted(h.id, selectedDate);
              const streak = getStreak(h.id, completions, selectedDate);

              return (
                <motion.div
                  key={h.id}
                  layout
                  className={cn(
                    "p-3.5 rounded-xl border transition-all flex items-center justify-between gap-3 group select-none",
                    done
                      ? "bg-secondary/40 border-border/50 text-muted-foreground"
                      : "bg-surface border-border/40 hover:border-primary/40 hover:bg-surface-elevated text-foreground"
                  )}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <button
                      type="button"
                      onClick={() => toggleCompletion(h.id, selectedDate)}
                      className={cn(
                        "w-9 h-9 rounded-xl flex items-center justify-center text-lg shrink-0 transition-transform active:scale-95 cursor-pointer",
                        done
                          ? "bg-primary/20 text-primary border border-primary/40 shadow-xs"
                          : "bg-secondary/60 hover:bg-secondary border border-border/50"
                      )}
                      style={{
                        borderColor: done ? h.color : undefined,
                        boxShadow: done ? `0 0 14px ${h.color}35` : undefined,
                      }}
                      title={done ? "Marcar como pendente" : "Concluir hábito"}
                    >
                      {done ? (
                        <Check className="w-5 h-5 text-white" strokeWidth={3} />
                      ) : (
                        <span>{h.emoji}</span>
                      )}
                    </button>

                    <div className="min-w-0">
                      <div
                        className={cn(
                          "font-medium text-sm truncate",
                          done && "line-through opacity-70"
                        )}
                      >
                        {h.name}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[11px] font-mono text-muted-foreground flex items-center gap-1">
                          <Flame className="w-3 h-3 text-orange-400" />
                          {streak}d streak
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => toggleCompletion(h.id, selectedDate)}
                    className={cn(
                      "text-xs px-3 py-1.5 rounded-lg border font-medium transition-all shrink-0 cursor-pointer",
                      done
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20"
                        : "bg-secondary/60 text-foreground hover:bg-primary hover:text-primary-foreground border-border/40"
                    )}
                  >
                    {done ? "Feito" : "Marcar"}
                  </button>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>

      {/* Footer com Links e Ações */}
      <div className="pt-3 border-t border-border/30 flex flex-wrap items-center justify-between gap-3">
        <AddHabitDialog onAdd={addHabit} />

        <Link
          to="/habits"
          className="inline-flex items-center gap-1.5 text-xs text-primary font-medium hover:underline transition-colors"
        >
          <span>Ver Matriz de 31 Dias</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
