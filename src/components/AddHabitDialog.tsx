import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";
import { useReminders } from "@/hooks/useReminders";

const EMOJI_OPTIONS = ["💪", "📚", "🏃", "🧘", "💧", "🥗", "😴", "✍️", "🎯", "🧠", "☀️", "🚿", "🙏", "💼", "🎸", "🌱", "🔥", "⚡", "🏆", "✨"];
const COLOR_OPTIONS = ["#4f46e5", "#8b5cf6", "#ec4899", "#f43f5e", "#f59e0b", "#10b981", "#06b6d4", "#3b82f6", "#facc15", "#ef4444"];

interface Props {
  onAdd: (h: { name: string; emoji: string; color: string }) => Promise<any> | any;
  trigger?: React.ReactNode;
}

export function AddHabitDialog({ onAdd, trigger }: Props) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [emoji, setEmoji] = useState("💪");
  const [color, setColor] = useState("#4f46e5");
  const { addReminder } = useReminders();

  const submit = async () => {
    if (!name.trim()) return;
    const created = await onAdd({ name: name.trim(), emoji, color });
    if (created?.id) {
      addReminder({
        title: `${emoji} ${name.trim()}`,
        message: "Hora de forjar esse hábito. Não negocia.",
        mode: "times",
        times: ["20:00"],
        habitId: created.id,
      });
    }
    setName(""); setEmoji("💪"); setColor("#4f46e5"); setOpen(false);
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
          <DialogTitle className="font-display text-2xl">Forjar novo hábito</DialogTitle>
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

          <Button onClick={submit} className="w-full bg-gradient-primary h-11 font-semibold" disabled={!name.trim()}>
            Forjar Hábito
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
