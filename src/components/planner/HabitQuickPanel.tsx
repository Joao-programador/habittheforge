import { useHabitsData } from "@/hooks/useHabitsData";
import { Zap } from "lucide-react";

interface Props {
  onPick: (habitId: string) => void;
  compact?: boolean;
}

export function HabitQuickPanel({ onPick, compact = false }: Props) {
  const { habits } = useHabitsData();

  if (compact) {
    if (habits.length === 0) return null;
    return (
      <div className="surface-card p-2.5 flex items-center gap-2 overflow-x-auto scrollbar-hide overscroll-x-contain">
        <span className="text-[11px] font-mono text-muted-foreground shrink-0 inline-flex items-center gap-1 pl-1">
          <Zap className="w-3.5 h-3.5 text-primary" />
          Alocar:
        </span>
        {habits.map((h) => (
          <button
            key={h.id}
            type="button"
            onClick={() => onPick(h.id)}
            className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 min-h-[38px] rounded-full bg-secondary/50 hover:bg-secondary active:scale-95 transition text-xs font-medium border"
            style={{ borderColor: `${h.color}40` }}
          >
            <span>{h.emoji}</span>
            <span className="max-w-[120px] truncate">{h.name}</span>
            <span className="text-[10px] text-primary font-bold">+</span>
          </button>
        ))}
      </div>
    );
  }

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
              className="w-full min-h-[44px] flex items-center gap-2.5 px-3 py-2.5 rounded-lg bg-secondary/40 hover:bg-secondary active:scale-[0.99] transition text-left group border"
              style={{ borderColor: `${h.color}35` }}
            >
              <span className="text-base">{h.emoji}</span>
              <span className="text-sm font-medium truncate flex-1">{h.name}</span>
              <span className="text-[11px] text-muted-foreground/90 opacity-80 md:opacity-0 md:group-hover:opacity-100 transition">
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
