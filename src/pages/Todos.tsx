import { useMemo, useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Trash2, Calendar as CalIcon, Flag } from "lucide-react";
import { useTodos, type Todo } from "@/hooks/useTodos";
import { format, isPast, isToday, parseISO, differenceInCalendarDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const COLOR_OPTIONS = ["#818cf8", "#4f46e5", "#ec4899", "#f43f5e", "#f59e0b", "#10b981", "#06b6d4"];

type Filter = "open" | "done" | "all";

export default function Todos() {
  const { todos, addTodo, updateTodo, toggleTodo, deleteTodo } = useTodos();
  const [filter, setFilter] = useState<Filter>("open");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Todo | null>(null);
  const [form, setForm] = useState({ title: "", notes: "", due_date: "", color: COLOR_OPTIONS[0] });

  const filtered = useMemo(() => {
    const list = todos.filter((t) =>
      filter === "open" ? !t.completed : filter === "done" ? t.completed : true
    );
    return list.sort((a, b) => {
      if (a.completed !== b.completed) return a.completed ? 1 : -1;
      const aD = a.due_date ? parseISO(a.due_date).getTime() : Infinity;
      const bD = b.due_date ? parseISO(b.due_date).getTime() : Infinity;
      return aD - bD;
    });
  }, [todos, filter]);

  const openNew = () => {
    setEditing(null);
    setForm({ title: "", notes: "", due_date: "", color: COLOR_OPTIONS[0] });
    setOpen(true);
  };
  const openEdit = (t: Todo) => {
    setEditing(t);
    setForm({ title: t.title, notes: t.notes ?? "", due_date: t.due_date ?? "", color: t.color });
    setOpen(true);
  };
  const save = () => {
    if (!form.title.trim()) return;
    if (editing) {
      updateTodo(editing.id, {
        title: form.title.trim(),
        notes: form.notes,
        due_date: form.due_date || null,
        color: form.color,
      });
      toast.success("Tarefa atualizada");
    } else {
      addTodo({
        title: form.title,
        notes: form.notes,
        due_date: form.due_date || null,
        color: form.color,
      });
      toast.success("Tarefa criada: sem desculpas");
    }
    setOpen(false);
  };

  const dueLabel = (t: Todo) => {
    if (!t.due_date) return { text: "Sem prazo", tone: "muted" as const };
    const d = parseISO(t.due_date);
    if (isToday(d)) return { text: "Hoje", tone: "primary" as const };
    if (isPast(d) && !t.completed) {
      const days = Math.abs(differenceInCalendarDays(d, new Date()));
      return { text: `Atrasada ${days}d`, tone: "danger" as const };
    }
    const diff = differenceInCalendarDays(d, new Date());
    if (diff > 0 && diff <= 7) return { text: `Em ${diff}d`, tone: "warn" as const };
    return { text: format(d, "dd MMM", { locale: ptBR }), tone: "muted" as const };
  };

  const openCount = todos.filter((t) => !t.completed).length;
  const overdue = todos.filter((t) => !t.completed && t.due_date && isPast(parseISO(t.due_date)) && !isToday(parseISO(t.due_date))).length;

  return (
    <AppLayout>
      <div className="space-y-6 max-w-4xl">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="font-display text-3xl tracking-tight">To-Do</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {openCount} abertas{overdue > 0 ? ` · ${overdue} atrasadas` : ""}. Prazo = palavra empenhada.
            </p>
          </div>
          <Button onClick={openNew} className="bg-gradient-primary glow-primary gap-2">
            <Plus className="w-4 h-4" /> Nova tarefa
          </Button>
        </div>

        <Tabs value={filter} onValueChange={(v) => setFilter(v as Filter)}>
          <TabsList className="bg-surface-elevated/60 border border-white/5">
            <TabsTrigger value="open">Abertas</TabsTrigger>
            <TabsTrigger value="done">Feitas</TabsTrigger>
            <TabsTrigger value="all">Todas</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="space-y-2.5">
          {filtered.length === 0 && (
            <div className="surface-card p-12 text-center border-dashed border-white/10 rounded-2xl">
              <div className="w-12 h-12 rounded-2xl bg-surface-elevated/60 border border-white/5 flex items-center justify-center mx-auto mb-3">
                <Flag className="w-5 h-5 text-muted-foreground" />
              </div>
              <p className="font-display text-lg tracking-tight">
                {filter === "done" ? "Nenhuma tarefa concluída ainda" : "Tudo em dia por aqui"}
              </p>
              <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
                {filter === "done"
                  ? "Marque as caixas de tarefas à medida que for completando suas metas."
                  : "Nenhuma tarefa pendente na fila. Aproveite o momento ou planeje a próxima entrega."}
              </p>
            </div>
          )}
          {filtered.map((t) => {
            const due = dueLabel(t);
            return (
              <div
                key={t.id}
                className={cn(
                  "surface-card p-4 flex items-center gap-3.5 group transition-all duration-200 hover:border-border/80 rounded-xl",
                  t.completed && "opacity-60",
                  t.notes && "items-start"
                )}
                style={{ borderColor: `${t.color}35` }}
              >
                <Checkbox
                  checked={t.completed}
                  onCheckedChange={() => toggleTodo(t.id)}
                  className={cn("mt-0.5", t.notes && "mt-1")}
                />
                <button onClick={() => openEdit(t)} className="flex-1 min-w-0 text-left">
                  <div className={cn("font-medium text-sm sm:text-base leading-snug", t.completed && "line-through text-muted-foreground")}>
                    {t.title}
                  </div>
                  {t.notes && (
                    <div className="text-xs text-muted-foreground/80 mt-1 line-clamp-2 leading-relaxed">{t.notes}</div>
                  )}
                  <div className="flex items-center gap-2 mt-2">
                    <span
                      className={cn(
                        "inline-flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded-md",
                        due.tone === "primary" && "bg-primary/15 text-primary border border-primary/20",
                        due.tone === "warn" && "bg-amber-500/15 text-amber-400 border border-amber-500/20",
                        due.tone === "danger" && "bg-destructive/15 text-destructive border border-destructive/20",
                        due.tone === "muted" && "bg-secondary/60 text-muted-foreground"
                      )}
                    >
                      <CalIcon className="w-3 h-3" />
                      {due.text}
                    </span>
                  </div>
                </button>
                <button
                  onClick={() => {
                    deleteTodo(t.id);
                    toast.success("Tarefa removida");
                  }}
                  className="opacity-100 md:opacity-0 md:group-hover:opacity-100 transition p-2 -m-0.5 text-muted-foreground hover:text-destructive"
                  title="Excluir tarefa"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl tracking-tight">
              {editing ? "Editar tarefa" : "Nova tarefa"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label>Título</Label>
              <Input
                autoFocus
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="O que precisa ser feito?"
              />
            </div>
            <div className="space-y-2">
              <Label>Prazo (opcional)</Label>
              <Input
                type="date"
                value={form.due_date}
                onChange={(e) => setForm({ ...form, due_date: e.target.value })}
              />
              <p className="text-[11px] text-muted-foreground">
                Com prazo, aparece automaticamente no Planner mensal.
              </p>
            </div>
            <div className="space-y-2">
              <Label>Notas</Label>
              <Textarea
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                rows={3}
                placeholder="Detalhes, contexto..."
              />
            </div>
            <div className="space-y-2">
              <Label>Cor</Label>
              <div className="flex gap-2 flex-wrap">
                {COLOR_OPTIONS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setForm({ ...form, color: c })}
                    className={cn(
                      "w-8 h-8 rounded-full transition-all hover:scale-110",
                      form.color === c && "ring-2 ring-offset-2 ring-offset-background ring-foreground"
                    )}
                    style={{ background: c }}
                  />
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button className="bg-gradient-primary" onClick={save} disabled={!form.title.trim()}>
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
