import { useHabitsData } from "@/hooks/useHabitsData";
import { Zap } from "lucide-react";

interface Props {
  onPick: (habitId: string) => void;
}

export function HabitQuickPanel({ onPick }: Props) {
  const { habits } = useHabitsData();

  return (
    <div className="surface-card p-4">
      <div className="flex items-center gap-2 mb-3">
        <Zap className="w-4 h-4 text-primary" />
        <h3 className="font-display text-sm tracking-tight">Alocar hábito</h3>
      </div>
      {habits.length === 0 ? (
        <p className="text-xs text-muted-foreground">
          Crie hábitos no Dashboard para alocá-los aqui rapidamente.
        </p>
      ) : (
        <div className="space-y-2">
          {habits.map((h) => (
            <button
              key={h.id}
              onClick={() => onPick(h.id)}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg bg-secondary/40 hover:bg-secondary transition text-left group border"
              style={{ borderColor: `${h.color}35` }}
            >
              <span className="text-base">{h.emoji}</span>
              <span className="text-sm font-medium truncate flex-1">{h.name}</span>
              <span className="text-[11px] text-muted-foreground/90 opacity-0 group-hover:opacity-100 transition">
                + bloco
              </span>
            </button>
          ))}
        </div>
      )}
      <p className="text-xs text-muted-foreground/80 mt-3 leading-relaxed">
        Clique para criar um bloco vinculado. Concluir aqui marca o check no Dashboard.
      </p>
    </div>
  );
}
