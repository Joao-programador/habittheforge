import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2 } from "lucide-react";
import type { PlannerEvent, RecurrenceType } from "@/hooks/usePlanner";
import { format, parseISO } from "date-fns";
import { useHabitsData, type Habit } from "@/hooks/useHabitsData";

const COLOR_OPTIONS = ["#4f46e5", "#8b5cf6", "#ec4899", "#f43f5e", "#f59e0b", "#10b981", "#06b6d4", "#3b82f6"];
const DOW = ["D", "S", "T", "Q", "Q", "S", "S"];

export interface EventDraft {
  id?: string;
  title: string;
  emoji?: string;
  color: string;
  date: string;
  startMinutes: number;
  durationMinutes: number;
  habit_id?: string | null;
  recurrenceType: RecurrenceType;
  recurrenceDays: number[];
  recurrenceUntil: string | null;
  notes?: string;
}

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  draft: EventDraft | null;
  onSave: (d: EventDraft) => void;
  onDelete?: (id: string) => void;
}

function toTimeStr(min: number) {
  const h = Math.floor(min / 60).toString().padStart(2, "0");
  const m = (min % 60).toString().padStart(2, "0");
  return `${h}:${m}`;
}
function fromTimeStr(s: string) {
  const [h, m] = s.split(":").map(Number);
  return h * 60 + (m || 0);
}

export function EventDialog({ open, onOpenChange, draft, onSave, onDelete }: Props) {
  const { habits } = useHabitsData();
  const [d, setD] = useState<EventDraft | null>(draft);

  useEffect(() => { setD(draft); }, [draft]);
  if (!d) return null;

  const update = (patch: Partial<EventDraft>) => setD({ ...d, ...patch });

  const pickHabit = (id: string) => {
    if (id === "__none__") {
      update({ habit_id: null });
      return;
    }
    const h = habits.find((x: Habit) => x.id === id);
    if (h) update({ habit_id: id, title: h.name, emoji: h.emoji, color: h.color });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl tracking-tight">
            {d.id ? "Editar bloco" : "Novo bloco"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label>Vincular a hábito (opcional)</Label>
            <Select value={d.habit_id ?? "__none__"} onValueChange={pickHabit}>
              <SelectTrigger><SelectValue placeholder="Nenhum" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__">Nenhum (evento avulso)</SelectItem>
                {habits.map((h) => (
                  <SelectItem key={h.id} value={h.id}>{h.emoji} {h.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {d.habit_id && (
              <p className="text-xs text-muted-foreground">
                Concluir aqui marca o check no Dashboard automaticamente.
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Título</Label>
            <Input value={d.title} onChange={(e) => update({ title: e.target.value })} placeholder="O que vai forjar?" autoFocus />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-2">
              <Label>Data</Label>
              <Input type="date" value={d.date} onChange={(e) => update({ date: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Início</Label>
              <Input type="time" value={toTimeStr(d.startMinutes)} onChange={(e) => update({ startMinutes: fromTimeStr(e.target.value) })} />
            </div>
            <div className="space-y-2">
              <Label>Duração (min)</Label>
              <Input type="number" min={5} step={5} value={d.durationMinutes} onChange={(e) => update({ durationMinutes: Math.max(5, Number(e.target.value) || 60) })} />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Cor</Label>
            <div className="flex gap-2 flex-wrap">
              {COLOR_OPTIONS.map((c) => (
                <button key={c} type="button" onClick={() => update({ color: c })}
                  className={`w-10 h-10 sm:w-8 sm:h-8 rounded-full transition-all hover:scale-110 ${d.color === c ? "ring-2 ring-offset-2 ring-offset-background ring-foreground" : ""}`}
                  style={{ background: c }} />
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Recorrência</Label>
            <Select value={d.recurrenceType} onValueChange={(v) => update({ recurrenceType: v as RecurrenceType })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Sem repetição</SelectItem>
                <SelectItem value="daily">Todo dia</SelectItem>
                <SelectItem value="weekly">Toda semana (mesmo dia)</SelectItem>
                <SelectItem value="custom">Dias específicos</SelectItem>
              </SelectContent>
            </Select>

            {d.recurrenceType === "custom" && (
              <div className="flex gap-1.5 pt-1">
                {DOW.map((lbl, i) => {
                  const active = d.recurrenceDays.includes(i);
                  return (
                    <button key={i} type="button"
                      onClick={() => update({
                        recurrenceDays: active ? d.recurrenceDays.filter((x) => x !== i) : [...d.recurrenceDays, i].sort()
                      })}
                      className={`flex-1 h-11 sm:h-9 rounded-md text-xs font-semibold transition ${active ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:bg-secondary/70"}`}>
                      {lbl}
                    </button>
                  );
                })}
              </div>
            )}

            {d.recurrenceType !== "none" && (
              <div className="pt-2">
                <Label className="text-xs text-muted-foreground">Repetir até (opcional)</Label>
                <Input type="date" value={d.recurrenceUntil ?? ""} onChange={(e) => update({ recurrenceUntil: e.target.value || null })} />
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-2 pt-2">
          {d.id && onDelete && (
            <Button variant="destructive" size="sm" onClick={() => { onDelete(d.id!); onOpenChange(false); }} className="mr-auto gap-1.5">
              <Trash2 className="w-4 h-4" /> Excluir
            </Button>
          )}
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button className="bg-gradient-primary" onClick={() => { if (d.title.trim()) onSave(d); }} disabled={!d.title.trim()}>
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function buildDraft(partial: Partial<EventDraft> = {}): EventDraft {
  const today = format(new Date(), "yyyy-MM-dd");
  return {
    title: "",
    color: "#4f46e5",
    date: today,
    startMinutes: 9 * 60,
    durationMinutes: 60,
    habit_id: null,
    recurrenceType: "none",
    recurrenceDays: [],
    recurrenceUntil: null,
    ...partial,
  };
}

export function eventToDraft(ev: PlannerEvent): EventDraft {
  return {
    id: ev.id,
    title: ev.title,
    emoji: ev.emoji,
    color: ev.color,
    date: ev.date,
    startMinutes: ev.startMinutes,
    durationMinutes: ev.durationMinutes,
    habit_id: ev.habit_id ?? null,
    recurrenceType: ev.recurrence.type,
    recurrenceDays: ev.recurrence.daysOfWeek ?? [],
    recurrenceUntil: ev.recurrence.until ?? null,
    notes: ev.notes,
  };
}

export function draftToEventInput(d: EventDraft) {
  return {
    title: d.title.trim(),
    emoji: d.emoji,
    color: d.color,
    date: d.date,
    startMinutes: d.startMinutes,
    durationMinutes: d.durationMinutes,
    habit_id: d.habit_id ?? null,
    notes: d.notes,
    recurrence: {
      type: d.recurrenceType,
      daysOfWeek: d.recurrenceType === "custom" ? d.recurrenceDays : undefined,
      until: d.recurrenceUntil,
    },
  };
}
