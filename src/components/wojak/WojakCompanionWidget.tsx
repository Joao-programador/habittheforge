import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { Dices, Minus, ChevronUp, Flame, ShieldAlert, Sparkles } from "lucide-react";
import { useHabitsData } from "@/hooks/useHabitsData";
import { getWojakStage, checkHasStreakPenalty } from "@/lib/wojakLore";
import { cn } from "@/lib/utils";

export function WojakCompanionWidget() {
  const { habits, completions } = useHabitsData();
  const [minimized, setMinimized] = useState(false);
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

  return (
    <div className="fixed bottom-5 right-5 z-50 select-none">
      <AnimatePresence mode="wait">
        {minimized ? (
          /* Modo Minimizado: Orbe flutuante compacto e tátil */
          <motion.button
            key="minimized"
            initial={{ scale: 0.8, opacity: 0, y: 15 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 15 }}
            transition={{ type: "spring", stiffness: 450, damping: 25 }}
            onClick={() => setMinimized(false)}
            className={cn(
              "group flex items-center gap-2.5 p-1.5 pr-3.5 rounded-full",
              "glass backdrop-blur-xl bg-card/90 border-2 shadow-2xl",
              "hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer",
              isChad
                ? "border-amber-400 shadow-[0_0_25px_rgba(251,191,36,0.3)]"
                : stage.borderClass
            )}
            title="Expandir Mascote da Forja"
          >
            <div className="w-10 h-10 rounded-full bg-white overflow-hidden border-2 border-white/60 shadow-sm flex items-center justify-center shrink-0">
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
            <div className="flex items-center gap-1.5">
              <span className="font-display text-xs font-bold text-foreground">
                {stage.title.split(" ")[1] || stage.title}
              </span>
              <span
                className={cn(
                  "font-mono text-[10px] px-2 py-0.5 rounded-full font-bold uppercase",
                  stage.badgeColor
                )}
              >
                {percentage}%
              </span>
            </div>
            <ChevronUp className="w-3.5 h-3.5 text-muted-foreground group-hover:text-foreground transition-colors ml-0.5" />
          </motion.button>
        ) : (
          /* Modo Expandido: Companheiro de RPG / Tamagotchi Completo */
          <motion.div
            key="expanded"
            initial={{ scale: 0.88, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.88, opacity: 0, y: 20 }}
            transition={{ type: "spring", stiffness: 400, damping: 28 }}
            className="flex flex-col items-end gap-2.5 max-w-[340px]"
          >
            {/* Balão de Fala HQ / VisionOS com Cauda */}
            <div
              className={cn(
                "relative p-3.5 rounded-2xl glass backdrop-blur-2xl bg-card/95 border-2 shadow-2xl",
                "text-left transition-all duration-300",
                isChad
                  ? "border-amber-400/80 shadow-[0_0_30px_rgba(251,191,36,0.2)]"
                  : stage.borderClass
              )}
            >
              {/* Header do Balão: Estágio + Controles */}
              <div className="flex items-center justify-between gap-2 pb-2 mb-2 border-b border-border/30">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-muted-foreground">
                    Companheiro da Forja
                  </span>
                  {isPenaltyActive && (
                    <span className="inline-flex items-center gap-1 text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-red-500/20 text-red-400 border border-red-500/40">
                      <ShieldAlert className="w-2.5 h-2.5" /> Punitivo
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={nextQuote}
                    className="p-1 rounded-md hover:bg-secondary/70 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                    title="Sortear nova frase do Beto"
                  >
                    <Dices className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setMinimized(true)}
                    className="p-1 rounded-md hover:bg-secondary/70 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                    title="Minimizar mascote"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Texto do Roast / Reflexão do Wojak */}
              <p className="text-xs text-foreground/90 italic leading-relaxed font-sans pr-1">
                "{currentQuote}"
              </p>

              {/* Cauda do Balão de Fala apontando para baixo */}
              <div
                className={cn(
                  "absolute -bottom-2 right-8 w-4 h-4 rotate-45 bg-card/95 border-r-2 border-b-2",
                  isChad ? "border-amber-400/80" : stage.borderClass
                )}
              />
            </div>

            {/* Base do Mascote: Avatar de 88px com Barra de Disciplina */}
            <div className="flex items-center gap-3 pr-2">
              <div className="text-right">
                <div className="font-display text-sm font-bold tracking-tight text-foreground">
                  {stage.title}
                </div>
                <div className="flex items-center justify-end gap-1.5 mt-0.5">
                  <span
                    className={cn(
                      "font-mono text-[10px] px-2 py-0.5 rounded-full font-bold uppercase",
                      stage.badgeColor
                    )}
                  >
                    {percentage}% hoje
                  </span>
                </div>
              </div>

              {/* Avatar com 88px de presença real */}
              <div
                className={cn(
                  "w-[88px] h-[88px] rounded-2xl bg-white overflow-hidden shrink-0 border-2 shadow-2xl",
                  "flex items-center justify-center relative",
                  "transition-transform duration-300 hover:scale-105",
                  isChad
                    ? "border-amber-400 shadow-[0_0_35px_rgba(251,191,36,0.35)] ring-2 ring-amber-400/40"
                    : "border-white/50 shadow-xl"
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
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
