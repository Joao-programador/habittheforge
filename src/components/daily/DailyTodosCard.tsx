import { useState, useMemo } from "react";
import { format, parseISO, isSameDay, isToday } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Link } from "react-router-dom";
import { ListChecks, Plus, Check, ArrowRight, Circle } from "lucide-react";
import { useTodos, type Todo } from "@/hooks/useTodos";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  selectedDate?: Date;
}

export function DailyTodosCard({ selectedDate = new Date() }: Props) {
  const { todos, addTodo, toggleTodo } = useTodos();
  const [newTitle, setNewTitle] = useState("");

  const dateStr = useMemo(() => format(selectedDate, "yyyy-MM-dd"), [selectedDate]);

  // Tarefas para o dia selecionado (ou pendentes prioritárias se for hoje)
  const dayTodos = useMemo(() => {
    return todos.filter((t) => {
      if (!t.due_date) return false;
      return isSameDay(parseISO(t.due_date), selectedDate);
    });
  }, [todos, selectedDate]);

  const { pendingCount, completedCount } = useMemo(() => {
    const pending = dayTodos.filter((t) => !t.completed).length;
    const completed = dayTodos.filter((t) => t.completed).length;
    return { pendingCount: pending, completedCount: completed };
  }, [dayTodos]);

  const handleAdd = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newTitle.trim()) return;

    addTodo({
      title: newTitle.trim(),
      due_date: dateStr,
      color: "#818cf8",
    });

    setNewTitle("");
    toast.success("Tarefa adicionada para hoje!");
  };

  return (
    <div className="surface-card p-5 sm:p-6 flex flex-col justify-between space-y-4">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between gap-3 mb-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/15 text-indigo-400 flex items-center justify-center">
              <ListChecks className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-display text-lg tracking-tight">To-Do do Dia</h2>
              <p className="text-xs text-muted-foreground capitalize">
                {format(selectedDate, "EEEE, dd 'de' MMMM", { locale: ptBR })}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 font-mono text-xs">
            <span className="px-2 py-0.5 rounded-md bg-secondary border border-border/40 text-muted-foreground">
              {pendingCount} pendente{pendingCount !== 1 ? "s" : ""}
            </span>
          </div>
        </div>

        {/* Inline Add Task */}
        <form onSubmit={handleAdd} className="flex items-center gap-2 mt-3">
          <Input
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Nova missão para hoje..."
            className="h-9 text-xs bg-surface border-border/40 focus-visible:ring-indigo-500"
          />
          <Button
            type="submit"
            size="sm"
            disabled={!newTitle.trim()}
            className="h-9 px-3 gap-1 shrink-0 bg-indigo-600 hover:bg-indigo-500 text-white"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline text-xs">Adicionar</span>
          </Button>
        </form>
      </div>

      {/* Lista de To-Dos do Dia */}
      <div className="space-y-2 flex-1 min-h-[140px] max-h-[220px] overflow-y-auto pr-1">
        {dayTodos.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground space-y-1.5">
            <p className="text-xs font-medium">Nenhuma tarefa agendada para este dia.</p>
            <p className="text-[11px] text-muted-foreground/70">
              Digite acima para adicionar uma missão rápida ou organize pelo quadro geral.
            </p>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {dayTodos.map((t) => (
              <motion.div
                key={t.id}
                layout
                className={cn(
                  "p-2.5 rounded-lg border transition-all flex items-center justify-between gap-3 text-xs",
                  t.completed
                    ? "bg-secondary/30 border-border/40 text-muted-foreground"
                    : "bg-surface border-border/40 hover:border-indigo-500/40 text-foreground"
                )}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <button
                    type="button"
                    onClick={() => toggleTodo(t.id)}
                    className={cn(
                      "w-5 h-5 rounded-md flex items-center justify-center transition-colors cursor-pointer shrink-0",
                      t.completed
                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                        : "border border-border/60 hover:border-indigo-400 bg-secondary/40"
                    )}
                  >
                    {t.completed ? <Check className="w-3.5 h-3.5" /> : null}
                  </button>
                  <span
                    className={cn(
                      "truncate font-medium",
                      t.completed && "line-through opacity-70"
                    )}
                  >
                    {t.title}
                  </span>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: t.color || "#818cf8" }}
                  />
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>

      {/* Footer */}
      <div className="pt-2 border-t border-border/30 flex items-center justify-between text-xs">
        <span className="text-[11px] text-muted-foreground font-mono">
          {completedCount} concluída{completedCount !== 1 ? "s" : ""}
        </span>
        <Link
          to="/todos"
          className="inline-flex items-center gap-1.5 text-indigo-400 hover:text-indigo-300 font-medium hover:underline transition-colors"
        >
          <span>Abrir quadro completo</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
