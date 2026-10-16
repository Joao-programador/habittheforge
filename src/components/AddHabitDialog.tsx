import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";

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

  const isEditing = !!habitToEdit;

  useEffect(() => {
    if (open && habitToEdit) {
      setName(habitToEdit.name);
      setEmoji(habitToEdit.emoji);
      setColor(habitToEdit.color);
    } else if (open && !habitToEdit) {
      setName("");
      setEmoji("💪");
      setColor("#4f46e5");
    }
  }, [open, habitToEdit]);

  const submit = async () => {
    if (!name.trim()) return;
    
    if (isEditing && onUpdate && habitToEdit.id) {
      await onUpdate(habitToEdit.id, { name: name.trim(), emoji, color });
    } else if (onAdd) {
      await onAdd({ name: name.trim(), emoji, color });
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
            <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-2">
              {EMOJI_OPTIONS.map((e) => (
                <button
                  key={e}
                  type="button"
                  onClick={() => setEmoji(e)}
                  className={`aspect-square min-h-[44px] md:min-h-0 rounded-lg text-xl transition-all hover:scale-110 ${
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
                  className={`w-11 h-11 md:w-9 md:h-9 rounded-full transition-all hover:scale-110 ${
                    color === c ? "ring-2 ring-offset-2 ring-offset-background ring-foreground" : ""
                  }`}
                  style={{ background: c }}
                />
              ))}
            </div>
          </div>

          <Button onClick={submit} className="w-full bg-gradient-primary h-11 font-semibold" disabled={!name.trim()}>
            {isEditing ? "Salvar alterações" : "Forjar Hábito"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
