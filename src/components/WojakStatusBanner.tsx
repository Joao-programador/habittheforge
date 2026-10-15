import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { Dices, AlertTriangle, Sparkles, Flame } from "lucide-react";
import { useHabitsData } from "@/hooks/useHabitsData";
import { getWojakStage, checkHasStreakPenalty, type WojakStage } from "@/lib/wojakLore";
import { cn } from "@/lib/utils";

export function WojakStatusBanner() {
  const { habits, completions } = useHabitsData();
  const today = useMemo(() => new Date(), []);
  const todayStr = useMemo(() => format(today, "yyyy-MM-dd"), [today]);

  // Calculate today's metrics
  const { completedCount, totalHabits, percentage, isPenaltyActive } = useMemo(() => {
    const total = habits.length;
    if (total === 0) {
      return { completedCount: 0, totalHabits: 0, percentage: 0, isPenaltyActive: false };
    }

    const habitIds = new Set(habits.map((h) => h.id));
    const doneToday = completions.filter((c) => c.date === todayStr && habitIds.has(c.habit_id)).length;
    const rawPct = Math.round((doneToday / total) * 100);

    const hasPenalty = checkHasStreakPenalty(habits, completions, today);
    const penaltyActive = hasPenalty && rawPct < 50;

    return {
      completedCount: doneToday,
      totalHabits: total,
      percentage: rawPct,
      isPenaltyActive: penaltyActive,
    };
  }, [habits, completions, today, todayStr]);

  const currentStage: WojakStage = useMemo(() => {
    return getWojakStage(percentage, isPenaltyActive);
  }, [percentage, isPenaltyActive]);

  // Quote rotation per stage
  const [quoteIndex, setQuoteIndex] = useState(0);

  // Reset or pick random quote on stage change
  useEffect(() => {
    if (currentStage.quotes.length > 0) {
      const randomIndex = Math.floor(Math.random() * currentStage.quotes.length);
      setQuoteIndex(randomIndex);
    }
  }, [currentStage.id]);

  const handleShuffleQuote = () => {
    if (currentStage.quotes.length <= 1) return;
    setQuoteIndex((prev) => {
      let next = Math.floor(Math.random() * currentStage.quotes.length);
      if (next === prev) {
        next = (prev + 1) % currentStage.quotes.length;
      }
      return next;
    });
  };

  const currentQuote = currentStage.quotes[quoteIndex] || currentStage.quotes[0] || "";

  const isDoomer = currentStage.id === "doomer";
  const isChad = currentStage.id === "gigachad";

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={cn(
        "relative overflow-hidden surface-card p-4 sm:p-5 md:p-6 transition-all duration-700",
        currentStage.borderClass,
        isChad && "animate-pulse-glow"
      )}
    >
      {/* Dynamic Glow Shift ambient background */}
      <div
        className={cn(
          "absolute inset-0 bg-gradient-to-br pointer-events-none transition-all duration-1000",
          currentStage.glowClass
        )}
      />
      {isChad && <div className="absolute inset-0 opacity-20 animate-shimmer pointer-events-none" />}

      <div className="relative flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6">
        {/* Wojak Avatar Frame */}
        <div className="relative shrink-0">
          <div
            className={cn(
              "w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-2xl overflow-hidden",
              "bg-background/60 backdrop-blur-xl border flex items-center justify-center shadow-lg transition-all duration-500",
              isChad ? "border-amber-400/50 shadow-amber-500/10" : "border-white/10",
              isDoomer && percentage === 0 && "grayscale opacity-85"
            )}
          >
            <AnimatePresence mode="wait">
              <motion.img
                key={currentStage.id}
                src={currentStage.imageUrl}
                alt={currentStage.title}
                initial={{ scale: 0.75, opacity: 0, rotate: -6 }}
                animate={{ scale: 1, opacity: 1, rotate: 0 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ type: "spring", stiffness: 350, damping: 22 }}
                className="w-full h-full object-contain p-1.5 drop-shadow-md select-none"
              />
            </AnimatePresence>
          </div>

          {/* Level indicator pill on avatar bottom */}
          <div className="absolute -bottom-2 inset-x-0 flex justify-center">
            <span
              className={cn(
                "px-2 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-tight border shadow-sm backdrop-blur-md",
                currentStage.badgeColor
              )}
            >
              {percentage}%
            </span>
          </div>
        </div>

        {/* Content & Progress Area */}
        <div className="flex-1 min-w-0 flex flex-col justify-between w-full">
          {/* Header Row: Stage title & Status Badge */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-display text-lg sm:text-xl tracking-tight leading-none text-foreground">
                  {currentStage.title}
                </h2>
                {isChad && (
                  <span className="flex items-center gap-1 text-[11px] font-mono uppercase tracking-wider text-amber-300 font-bold bg-amber-500/15 border border-amber-400/40 px-2 py-0.5 rounded-full">
                    <Sparkles className="w-3 h-3 text-amber-400" /> Aura Máxima
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">{currentStage.subtitle}</p>
            </div>

            {/* Quick quote shuffle trigger */}
            <button
              onClick={handleShuffleQuote}
              title="Girar frases deste estágio"
              className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground px-2.5 py-1 rounded-lg bg-surface-elevated/40 hover:bg-surface-elevated border border-white/5 transition-colors"
            >
              <Dices className="w-3.5 h-3.5" />
              <span className="hidden sm:inline text-[11px] font-medium">Trocar frase</span>
            </button>
          </div>

          {/* Penalty Notice (if triggered) */}
          {isPenaltyActive && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="mt-2.5 px-3 py-1.5 rounded-xl bg-destructive/15 border border-destructive/30 text-destructive-foreground text-xs flex items-center gap-2"
            >
              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
              <span className="leading-tight font-medium">
                <strong>PENALIDADE DE STREAK:</strong> 2 dias sem forjar hábitos. Conclua pelo menos 50% hoje para
                destravar a evolução!
              </span>
            </motion.div>
          )}

          {/* Dynamic Meme Quote */}
          <div className="my-2.5 min-h-[2.5rem] flex items-center">
            <AnimatePresence mode="wait">
              <motion.p
                key={`${currentStage.id}-${quoteIndex}`}
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 6 }}
                transition={{ duration: 0.25 }}
                className="font-display text-sm sm:text-base tracking-tight text-foreground/90 italic leading-snug"
              >
                "{currentQuote}"
              </motion.p>
            </AnimatePresence>
          </div>

          {/* Daily Progress Bar */}
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between text-xs font-mono text-muted-foreground">
              <span className="flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 text-orange-400" />
                <span>Progresso de hoje</span>
              </span>
              <span className="font-semibold text-foreground">
                {completedCount} <span className="text-muted-foreground">/ {totalHabits}</span>{" "}
                <span className="text-muted-foreground/60">({percentage}%)</span>
              </span>
            </div>

            <div className="h-2 w-full rounded-full bg-surface-elevated overflow-hidden p-0.5 border border-white/5">
              <motion.div
                initial={false}
                animate={{ width: `${percentage}%` }}
                transition={{ type: "spring", stiffness: 120, damping: 20 }}
                className={cn(
                  "h-full rounded-full transition-colors duration-500",
                  isChad
                    ? "bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 shadow-[0_0_12px_rgba(251,191,36,0.6)]"
                    : isDoomer
                    ? "bg-zinc-500/70"
                    : "bg-gradient-to-r from-primary to-accent shadow-[0_0_10px_rgba(0,122,255,0.4)]"
                )}
              />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
