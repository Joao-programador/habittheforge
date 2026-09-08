import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, BellRing } from "lucide-react";
import { useReminders } from "@/hooks/useReminders";

const EMOJI_OPTIONS = ["💪", "🏃", "💧", "🧘", "📚", "🧠", "🥗", "🏋️‍♂️", "💤", "💻", "🎸", "💸", "🧹", "☀️", "🌙", "💊", "🥦", "🔥", "🤝", "🎨"];
const COLOR_OPTIONS = ["#4f46e5", "#8b5cf6", "#ec4899", "#f43f5e", "#f59e0b", "#10b981", "#06b6d4", "#3b82f6", "#facc15", "#ef4444"];

interface Habit {
  id?: string;
  name: string;
  emoji: string;
  color: string;
}

interface Props {
  habitToEdit?: Habit;
  onAdd?: (h: Habit) => Promise<any> | any;
  onUpdate?: (id: string, h: Partial<Habit>) => Promise<any> | any;
  trigger?: React.ReactNode;
}

export function AddHabitDialog({ onAdd, onUpdate, habitToEdit, trigger }: Props) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [emoji, setEmoji] = useState("💪");
  const [color, setColor] = useState("#4f46e5");
  const [createReminder, setCreateReminder] = useState(false);
  const { addReminder } = useReminders();

  const isEditing = !!habitToEdit;

  useEffect(() => {
    if (open && habitToEdit) {
      setName(habitToEdit.name);
      setEmoji(habitToEdit.emoji);
      setColor(habitToEdit.color);
      setCreateReminder(false);
    } else if (open && !habitToEdit) {
      setName("");
      setEmoji("💪");
      setColor("#4f46e5");
      setCreateReminder(false);
    }
  }, [open, habitToEdit]);

  const submit = async () => {
    if (!name.trim()) return;
    
    if (isEditing && onUpdate && habitToEdit.id) {
      await onUpdate(habitToEdit.id, { name: name.trim(), emoji, color });
    } else if (onAdd) {
      const created = await onAdd({ name: name.trim(), emoji, color });
      if (created?.id && createReminder) {
        addReminder({
          title: `${emoji} ${name.trim()}`,
          message: "Hora de forjar esse hábito. Não negocia.",
          mode: "times",
          times: ["20:00"],
          habitId: created.id,
        });
      }
    }
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button className="bg-gradient-primary glow-primary gap-2">
            <Plus className="w-4 h-4" /> Novo Hábito
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">
            {isEditing ? "Editar hábito" : "Forjar novo hábito"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 pt-2">
          <div className="space-y-2">
            <Label>Nome</Label>
            <Input
              placeholder="Ex: 50 flexões diárias"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submit()}
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label>Emoji</Label>
            <div className="grid grid-cols-10 gap-2">
              {EMOJI_OPTIONS.map((e) => (
                <button
                  key={e}
                  type="button"
                  onClick={() => setEmoji(e)}
                  className={`aspect-square rounded-lg text-xl transition-all hover:scale-110 ${
                    emoji === e ? "bg-primary/20 ring-2 ring-primary" : "bg-secondary hover:bg-secondary/70"
                  }`}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Cor</Label>
            <div className="flex gap-2 flex-wrap">
              {COLOR_OPTIONS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-9 h-9 rounded-full transition-all hover:scale-110 ${
                    color === c ? "ring-2 ring-offset-2 ring-offset-background ring-foreground" : ""
                  }`}
                  style={{ background: c }}
                />
              ))}
            </div>
          </div>

          {!isEditing && (
            <label className="flex items-center gap-3 cursor-pointer bg-secondary/30 p-3 rounded-lg border border-border/40 hover:bg-secondary/50 transition">
              <input 
                type="checkbox" 
                checked={createReminder} 
                onChange={(e) => setCreateReminder(e.target.checked)} 
                className="w-4 h-4 rounded border-primary/50 text-primary focus:ring-primary"
              />
              <div className="flex items-center gap-2">
                <BellRing className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">Criar lembrete diário às 20h</span>
              </div>
            </label>
          )}

          <Button onClick={submit} className="w-full bg-gradient-primary h-11 font-semibold" disabled={!name.trim()}>
            {isEditing ? "Salvar alterações" : "Forjar Hábito"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
