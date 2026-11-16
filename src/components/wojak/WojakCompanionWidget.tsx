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
    <div
      className={cn(
        "fixed z-30 select-none",
        minimized
          ? "bottom-[calc(4.5rem+env(safe-area-inset-bottom))] right-3 md:bottom-5 md:right-5"
          : "left-3 right-3 bottom-[calc(4.35rem+env(safe-area-inset-bottom))] md:left-auto md:bottom-5 md:right-5"
      )}
    >
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
              "group flex items-center gap-2 sm:gap-2.5 p-1.5 pr-3 sm:pr-3.5 min-h-[42px] sm:min-h-[44px] rounded-full",
              "glass backdrop-blur-xl bg-card/90 border-2 shadow-2xl",
              "hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer",
              isChad
                ? "border-amber-400 shadow-[0_0_25px_rgba(251,191,36,0.3)]"
                : stage.borderClass
            )}
            title="Expandir Radar de Ascensão"
          >
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white overflow-hidden border-2 border-white/60 shadow-sm flex items-center justify-center shrink-0">
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
          /* Modo Expandido: Dock Horizontal no Mobile + Tamagotchi Vertical no Desktop */
          <motion.div
            key="expanded"
            initial={{ scale: 0.92, opacity: 0, y: 16 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.92, opacity: 0, y: 16 }}
            transition={{ type: "spring", stiffness: 400, damping: 28 }}
          >
            {/* Mobile (< md): Horizontal Companion Dock Bar (64px compacto) */}
            <div
              className={cn(
                "md:hidden p-2.5 rounded-2xl glass backdrop-blur-2xl bg-card/95 border-2 shadow-2xl flex items-center gap-2.5",
                isChad
                  ? "border-amber-400/80 shadow-[0_0_24px_rgba(251,191,36,0.2)]"
                  : stage.borderClass
              )}
            >
              <div className="w-12 h-12 rounded-xl bg-white overflow-hidden shrink-0 border border-white/60 shadow-sm relative flex items-center justify-center">
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

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="font-display text-xs font-bold truncate text-foreground">
                    {stage.title}
                  </span>
                  <span
                    className={cn(
                      "font-mono text-[10px] px-1.5 py-0.2 rounded-full font-bold uppercase shrink-0",
                      stage.badgeColor
                    )}
                  >
                    {percentage}%
                  </span>
                  {isPenaltyActive && (
                    <span className="inline-flex items-center gap-0.5 text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-red-500/20 text-red-400 border border-red-500/40 shrink-0">
                      <ShieldAlert className="w-2.5 h-2.5" /> Em Queda
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-foreground/90 italic leading-snug line-clamp-2 mt-0.5 font-sans">
                  "{currentQuote}"
                </p>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={nextQuote}
                  className="w-9 h-9 rounded-lg bg-secondary/60 hover:bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground active:scale-95 transition-all cursor-pointer"
                  title="Sortear nova frase"
                  aria-label="Sortear nova frase"
                >
                  <Dices className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setMinimized(true)}
                  className="w-9 h-9 rounded-lg bg-secondary/60 hover:bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground active:scale-95 transition-all cursor-pointer"
                  title="Minimizar radar"
                  aria-label="Minimizar radar"
                >
                  <Minus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Desktop (md+): Companheiro de RPG / Tamagotchi Vertical Preservado */}
            <div className="hidden md:flex flex-col items-end gap-2.5 max-w-[340px]">
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
                      Radar de Ascensão
                    </span>
                    {isPenaltyActive && (
                      <span className="inline-flex items-center gap-1 text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-red-500/20 text-red-400 border border-red-500/40">
                        <ShieldAlert className="w-2.5 h-2.5" /> Em Queda
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={nextQuote}
                      className="p-1 rounded-md hover:bg-secondary/70 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                      title="Sortear nova frase"
                      aria-label="Sortear nova frase"
                    >
                      <Dices className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setMinimized(true)}
                      className="p-1 rounded-md hover:bg-secondary/70 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                      title="Minimizar radar"
                      aria-label="Minimizar radar"
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

              {/* Base do Mascote: Avatar de 88px */}
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
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
