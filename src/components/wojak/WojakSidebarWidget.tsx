import { useState, useMemo } from "react";
import { format } from "date-fns";
import { Dices } from "lucide-react";
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

  const { percentage, stage } = useMemo(() => {
    const total = habits.length;
    if (total === 0) {
      return { percentage: 0, stage: getWojakStage(0, false) };
    }
    const habitIds = new Set(habits.map((h) => h.id));
    const doneToday = completions.filter((c) => c.date === todayStr && habitIds.has(c.habit_id)).length;
    const rawPct = Math.round((doneToday / total) * 100);
    const hasPenalty = checkHasStreakPenalty(habits, completions, today);
    const penaltyActive = hasPenalty && rawPct < 50;

    return {
      percentage: rawPct,
      stage: getWojakStage(rawPct, penaltyActive),
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
                "w-9 h-9 rounded-xl bg-white overflow-hidden border-2 cursor-pointer transition-transform hover:scale-110 flex items-center justify-center shadow-md",
                isChad ? "border-amber-400 shadow-amber-500/30" : stage.borderClass
              )}
            >
              <img
                src={stage.imageUrl}
                alt={stage.title}
                className={cn(
                  "w-full h-full select-none",
                  isDoomer
                    ? "object-cover scale-140 object-[center_20%]"
                    : isChad
                    ? "object-cover"
                    : "object-contain p-0.5"
                )}
              />
            </div>
          </TooltipTrigger>
          <TooltipContent side="right" className="font-mono text-xs p-2">
            <p className="font-bold text-foreground">{stage.title}</p>
            <p className="text-muted-foreground">{percentage}% concluído hoje</p>
          </TooltipContent>
        </Tooltip>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "mx-3 mb-2 p-3 rounded-xl surface-card border transition-all duration-300 relative overflow-hidden",
        isChad
          ? "border-amber-400/50 shadow-[0_0_20px_rgba(251,191,36,0.15)]"
          : stage.borderClass
      )}
    >
      {/* Glow de fundo */}
      <div
        className={cn(
          "absolute inset-0 bg-gradient-to-br pointer-events-none opacity-40",
          stage.glowClass
        )}
      />

      <div className="relative space-y-2">
        {/* Top: Avatar + Nome + % */}
        <div className="flex items-center gap-2.5">
          <div
            className={cn(
              "w-9 h-9 rounded-xl bg-white overflow-hidden border shrink-0 flex items-center justify-center shadow-sm",
              isChad ? "border-amber-400" : "border-white/40"
            )}
          >
            <img
              src={stage.imageUrl}
              alt={stage.title}
              className={cn(
                "w-full h-full select-none",
                isDoomer
                  ? "object-cover scale-140 object-[center_20%]"
                  : isChad
                  ? "object-cover"
                  : "object-contain p-0.5"
              )}
            />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-1">
              <span className="font-display text-xs tracking-tight truncate text-foreground">
                {stage.title}
              </span>
              <span
                className={cn(
                  "font-mono text-[9px] px-1.5 py-0.2 rounded-md font-bold uppercase",
                  stage.badgeColor
                )}
              >
                {percentage}%
              </span>
            </div>

            {/* Mini barra de progresso */}
            <div className="w-full bg-secondary/60 rounded-full h-1 overflow-hidden mt-1">
              <div
                className="bg-gradient-primary h-full transition-all duration-500 rounded-full"
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>
        </div>

        {/* Bottom: Frase + Trocar */}
        <div className="pt-1 border-t border-border/30 flex items-start justify-between gap-1 text-[10px] text-muted-foreground leading-tight">
          <p className="italic truncate line-clamp-2 max-h-7 flex-1">
            "{currentQuote}"
          </p>
          <button
            type="button"
            onClick={nextQuote}
            className="p-1 hover:text-foreground transition-colors shrink-0 rounded-md hover:bg-secondary/50 cursor-pointer"
            title="Trocar frase"
          >
            <Dices className="w-3 h-3 text-muted-foreground hover:text-primary" />
          </button>
        </div>
      </div>
    </div>
  );
}
