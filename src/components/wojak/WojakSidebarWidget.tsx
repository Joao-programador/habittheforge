import { useState, useMemo } from "react";
import { format } from "date-fns";
import { Dices, ShieldAlert, Sparkles, Flame } from "lucide-react";
import { useHabitsData } from "@/hooks/useHabitsData";
import { getWojakStage, checkHasStreakPenalty } from "@/lib/wojakLore";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface Props {
  collapsed?: boolean;
}

export function WojakSidebarWidget({ collapsed }: Props) {
  const { habits, completions } = useHabitsData();
  const [quoteIndex, setQuoteIndex] = useState(0);

  const today = useMemo(() => new Date(), []);
  const todayStr = useMemo(() => format(today, "yyyy-MM-dd"), [today]);

  const { percentage, stage, isPenaltyActive } = useMemo(() => {
    const total = habits.length;
    if (total === 0) {
      return { percentage: 0, stage: getWojakStage(0, false), isPenaltyActive: false };
    }
    const habitIds = new Set(habits.map((h) => h.id));
    const doneToday = completions.filter((c) => c.date === todayStr && habitIds.has(c.habit_id)).length;
    const rawPct = Math.round((doneToday / total) * 100);
    const hasPenalty = checkHasStreakPenalty(habits, completions, today);
    const penalty = hasPenalty && rawPct < 50;

    return {
      percentage: rawPct,
      stage: getWojakStage(rawPct, penalty),
      isPenaltyActive: penalty,
    };
  }, [habits, completions, today, todayStr]);

  const isDoomer = stage.id === "doomer";
  const isChad = stage.id === "gigachad";

  const nextQuote = (e: React.MouseEvent) => {
    e.stopPropagation();
    setQuoteIndex((prev) => (prev + 1) % stage.quotes.length);
  };

  const currentQuote = stage.quotes[quoteIndex % stage.quotes.length] || stage.quotes[0];

  if (collapsed) {
    return (
      <div className="flex justify-center py-2 px-1">
        <Tooltip>
          <TooltipTrigger asChild>
            <div
              className={cn(
                "w-10 h-10 rounded-xl bg-white overflow-hidden border-2 cursor-pointer transition-transform hover:scale-110 flex items-center justify-center shadow-md",
                isChad ? "border-amber-400 shadow-amber-500/30" : stage.borderClass
              )}
            >
              <img
                src={stage.imageUrl}
                alt={stage.title}
                className={cn(
                  "w-full h-full select-none",
                  isDoomer
                    ? "object-cover scale-155 object-[center_20%]"
                    : isChad
                    ? "object-cover"
                    : "object-contain p-0.5"
                )}
              />
            </div>
          </TooltipTrigger>
          <TooltipContent side="right" className="font-mono text-xs p-2">
            <p className="font-bold text-foreground">{stage.title}</p>
            <p className="text-muted-foreground">{percentage}% de disciplina hoje</p>
          </TooltipContent>
        </Tooltip>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "mx-3 mb-3 p-3.5 rounded-2xl surface-card border-2 transition-all duration-300 relative overflow-hidden",
        isChad
          ? "border-amber-400/70 shadow-[0_0_25px_rgba(251,191,36,0.2)]"
          : stage.borderClass
      )}
    >
      {/* Glow de fundo do estágio */}
      <div
        className={cn(
          "absolute inset-0 bg-gradient-to-br pointer-events-none opacity-40",
          stage.glowClass
        )}
      />

      <div className="relative space-y-3">
        {/* Header estilo RPG */}
        <div className="flex items-center justify-between text-[10px] font-mono font-bold tracking-wider uppercase text-muted-foreground">
          <span>Estágio do Beto</span>
          {isPenaltyActive && (
            <span className="text-red-400 flex items-center gap-1 font-bold">
              <ShieldAlert className="w-3 h-3" /> Penalidade
            </span>
          )}
        </div>

        {/* Avatar Central em Destaque (76px) */}
        <div className="flex justify-center">
          <div
            className={cn(
              "w-[76px] h-[76px] rounded-2xl bg-white overflow-hidden border-2 flex items-center justify-center shadow-lg relative",
              isChad
                ? "border-amber-400 shadow-amber-500/25 ring-2 ring-amber-400/30"
                : "border-white/50"
            )}
          >
            <img
              src={stage.imageUrl}
              alt={stage.title}
              className={cn(
                "w-full h-full select-none",
                isDoomer
                  ? "object-cover scale-155 object-[center_20%]"
                  : isChad
                  ? "object-cover"
                  : "object-contain p-1"
              )}
            />
          </div>
        </div>

        {/* Título & Badge de XP */}
        <div className="text-center space-y-1">
          <div className="font-display text-sm font-bold tracking-tight text-foreground">
            {stage.title}
          </div>
          <div className="flex items-center justify-center gap-1.5">
            <span
              className={cn(
                "font-mono text-[10px] px-2 py-0.5 rounded-full font-bold uppercase",
                stage.badgeColor
              )}
            >
              {percentage}% concluído
            </span>
          </div>

          {/* Barra de XP de Disciplina */}
          <div className="w-full bg-secondary/70 rounded-full h-1.5 overflow-hidden mt-1.5 border border-border/30">
            <div
              className="bg-gradient-primary h-full transition-all duration-500 rounded-full"
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>

        {/* Caixa de Diálogo / Pensamento com Botão de Sortear */}
        <div className="pt-2 border-t border-border/40 flex items-start justify-between gap-1 text-[11px] text-muted-foreground leading-snug">
          <p className="italic line-clamp-3 flex-1 text-foreground/80 font-sans">
            "{currentQuote}"
          </p>
          <button
            type="button"
            onClick={nextQuote}
            className="p-1 hover:text-foreground transition-colors shrink-0 rounded-md hover:bg-secondary/60 cursor-pointer"
            title="Sortear nova frase"
          >
            <Dices className="w-3.5 h-3.5 text-muted-foreground hover:text-primary" />
          </button>
        </div>
      </div>
    </div>
  );
}
