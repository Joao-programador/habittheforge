import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, Plus } from "lucide-react";
import { Reminder, ReminderMode } from "@/hooks/useReminders";
import { useHabitsData } from "@/hooks/useHabitsData";

const NO_HABIT = "__none__";

interface Props {
  trigger: React.ReactNode;
  initial?: Reminder;
  onSave: (data: {
    title: string;
    message: string;
    mode: ReminderMode;
    intervalMinutes?: number;
    times?: string[];
    habitId?: string;
  }) => void;
}

export function ReminderDialog({ trigger, initial, onSave }: Props) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState(initial?.title ?? "");
  const [message, setMessage] = useState(initial?.message ?? "");
  const [mode, setMode] = useState<ReminderMode>(initial?.mode ?? "interval");
  const [intervalMinutes, setIntervalMinutes] = useState<number>(initial?.intervalMinutes ?? 60);
  const [times, setTimes] = useState<string[]>(initial?.times ?? []);
  const [newTime, setNewTime] = useState("09:00");
  const [habitId, setHabitId] = useState<string>(initial?.habitId ?? NO_HABIT);
  const { habits } = useHabitsData();

  useEffect(() => {
    if (open && initial) {
      setTitle(initial.title);
      setMessage(initial.message);
      setMode(initial.mode);
      setIntervalMinutes(initial.intervalMinutes ?? 60);
      setTimes(initial.times ?? []);
      setHabitId(initial.habitId ?? NO_HABIT);
    }
  }, [open, initial]);

  const addTime = () => {
    if (!newTime || times.includes(newTime)) return;
    setTimes([...times, newTime].sort());
  };

  const handleSave = () => {
    if (!message.trim() && !title.trim()) return;
    onSave({
      title: title.trim(),
      message: message.trim(),
      mode,
      intervalMinutes: mode === "interval" ? intervalMinutes : undefined,
      times: mode === "times" ? times : undefined,
      habitId: habitId === NO_HABIT ? undefined : habitId,
    });
    setOpen(false);
    if (!initial) {
      setTitle("");
      setMessage("");
      setTimes([]);
      setHabitId(NO_HABIT);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display tracking-tight text-2xl uppercase">
            {initial ? "Editar lembrete" : "Novo lembrete"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label className="text-xs uppercase tracking-widest text-muted-foreground">Título</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Hidrate-se"
              className="mt-1.5"
            />
          </div>

          <div>
            <Label className="text-xs uppercase tracking-widest text-muted-foreground">Mensagem</Label>
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="O que esse lembrete deve gritar na sua cara?"
              rows={3}
              className="mt-1.5"
            />
          </div>

          <div>
            <Label className="text-xs uppercase tracking-widest text-muted-foreground">Hábito vinculado (opcional)</Label>
            <Select value={habitId} onValueChange={setHabitId}>
              <SelectTrigger className="mt-1.5">
                <SelectValue placeholder="Nenhum" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NO_HABIT}>Nenhum</SelectItem>
                {habits.map((h) => (
                  <SelectItem key={h.id} value={h.id}>
                    <span className="mr-2">{h.emoji}</span>
                    {h.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {habitId !== NO_HABIT && (
              <p className="text-[11px] text-muted-foreground mt-1.5">
                Silenciado nos dias em que o hábito já estiver concluído.
              </p>
            )}
          </div>


          <div>
            <Label className="text-xs uppercase tracking-widest text-muted-foreground mb-2 block">Modo</Label>
            <RadioGroup value={mode} onValueChange={(v) => setMode(v as ReminderMode)} className="grid grid-cols-2 gap-2">
              <label className={`flex items-center gap-2 p-3 rounded-xl border cursor-pointer transition-colors ${mode === "interval" ? "border-primary bg-primary/10" : "border-border/40 bg-secondary/30"}`}>
                <RadioGroupItem value="interval" />
                <span className="text-sm font-medium">Intervalo fixo</span>
              </label>
              <label className={`flex items-center gap-2 p-3 rounded-xl border cursor-pointer transition-colors ${mode === "times" ? "border-primary bg-primary/10" : "border-border/40 bg-secondary/30"}`}>
                <RadioGroupItem value="times" />
                <span className="text-sm font-medium">Horários fixos</span>
              </label>
            </RadioGroup>
          </div>

          {mode === "interval" && (
            <div>
              <Label className="text-xs uppercase tracking-widest text-muted-foreground">A cada (minutos)</Label>
              <Input
                type="number"
                min={1}
                value={intervalMinutes}
                onChange={(e) => setIntervalMinutes(Math.max(1, Number(e.target.value) || 1))}
                className="mt-1.5"
              />
              <div className="flex gap-1.5 mt-2 flex-wrap">
                {[15, 30, 60, 90, 120].map((m) => (
                  <button
                    key={m}
                    onClick={() => setIntervalMinutes(m)}
                    className="text-xs px-2.5 py-1 rounded-md bg-secondary/50 hover:bg-secondary border border-border/40"
                  >
                    {m}min
                  </button>
                ))}
              </div>
            </div>
          )}

          {mode === "times" && (
            <div>
              <Label className="text-xs uppercase tracking-widest text-muted-foreground">Horários</Label>
              <div className="flex gap-2 mt-1.5">
                <Input type="time" value={newTime} onChange={(e) => setNewTime(e.target.value)} className="w-32" />
                <Button type="button" onClick={addTime} variant="secondary" size="sm">
                  <Plus className="w-4 h-4 mr-1" /> Adicionar
                </Button>
              </div>
              <div className="flex gap-1.5 mt-3 flex-wrap min-h-[28px]">
                {times.length === 0 && (
                  <span className="text-xs text-muted-foreground italic">Nenhum horário ainda.</span>
                )}
                {times.map((t) => (
                  <span
                    key={t}
                    className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-md bg-primary/15 text-primary border border-primary/30"
                  >
                    {t}
                    <button onClick={() => setTimes(times.filter((x) => x !== t))}>
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button>
          <Button onClick={handleSave}>Salvar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
