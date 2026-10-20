import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { Dices, AlertTriangle, Sparkles, Flame, PlusCircle } from "lucide-react";
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

  // Dynamic habits needed to break streak penalty
  const habitsNeededFor50 = useMemo(() => {
    if (!isPenaltyActive || totalHabits === 0) return 0;
    const target = Math.ceil(totalHabits * 0.5);
    return Math.max(1, target - completedCount);
  }, [isPenaltyActive, totalHabits, completedCount]);

  // Quote rotation per stage
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [isRolling, setIsRolling] = useState(false);

  // Reset or pick random quote on stage change
  useEffect(() => {
    if (currentStage.quotes.length > 0) {
      const randomIndex = Math.floor(Math.random() * currentStage.quotes.length);
      setQuoteIndex(randomIndex);
    }
  }, [currentStage.id]);

  const handleShuffleQuote = () => {
    if (currentStage.quotes.length <= 1) return;
    setIsRolling(true);
    setTimeout(() => setIsRolling(false), 350);

    setQuoteIndex((prev) => {
      let next = Math.floor(Math.random() * currentStage.quotes.length);
      if (next === prev) {
        next = (prev + 1) % currentStage.quotes.length;
      }
      return next;
    });
  };

  const isDoomer = currentStage.id === "doomer";
  const isChad = currentStage.id === "gigachad";
  const isColdStart = totalHabits === 0;

  const currentQuote = isColdStart
    ? "A jornada de mil quilômetros começa com o primeiro hábito forjado. Rejeite o comodismo."
    : currentStage.quotes[quoteIndex] || currentStage.quotes[0] || "";

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={cn(
        "relative overflow-hidden surface-card p-4 sm:p-5 md:p-6 transition-all duration-700",
        isColdStart
          ? "border-primary/30"
          : isChad
          ? "border-amber-400/60 shadow-[0_0_35px_rgba(251,191,36,0.25)]"
          : currentStage.borderClass
      )}
    >
      {/* Dynamic Glow Shift ambient background */}
      <div
        className={cn(
          "absolute inset-0 bg-gradient-to-br pointer-events-none transition-all duration-1000",
          isColdStart
            ? "from-primary/15 via-accent/10 to-transparent"
            : currentStage.glowClass
        )}
      />
      {isChad && <div className="absolute inset-0 opacity-20 animate-shimmer pointer-events-none" />}

      <div className="relative flex flex-col sm:flex-row items-center sm:items-start gap-5 sm:gap-6 md:gap-7">
        {/* Wojak Avatar Frame - Solid White Background to restore line-art fills */}
        <div className="relative shrink-0">
          <div
            className={cn(
              "w-28 h-28 sm:w-32 sm:h-32 md:w-36 md:h-36 lg:w-40 lg:h-40 rounded-2xl overflow-hidden",
              "bg-white border-2 flex items-center justify-center shadow-2xl transition-all duration-500",
              isChad
                ? "border-amber-400 shadow-amber-500/25 ring-2 ring-amber-400/30"
                : "border-white/40 shadow-xl",
              !isColdStart && isDoomer && percentage === 0 && "grayscale contrast-125"
            )}
          >
            <AnimatePresence mode="wait">
              <motion.img
                key={isColdStart ? "cold-start" : currentStage.id}
                src={isColdStart ? "/assets/wojaks/wojak.png" : currentStage.imageUrl}
                alt={isColdStart ? "Pronto para Forjar" : currentStage.title}
                initial={{ scale: 0.8, opacity: 0, rotate: -6 }}
                animate={{ scale: 1, opacity: 1, rotate: 0 }}
                exit={{ scale: 0.85, opacity: 0 }}
                transition={{ type: "spring", stiffness: 350, damping: 22 }}
                className={cn(
                  "w-full h-full select-none drop-shadow-sm",
                  isDoomer
                    ? "object-cover scale-145 object-[center_20%]"
                    : isChad
                    ? "object-cover"
                    : "object-contain p-2"
                )}
              />
            </AnimatePresence>
          </div>

          {/* Level indicator pill on avatar bottom */}
          <div className="absolute -bottom-2.5 inset-x-0 flex justify-center z-10">
            <span
              className={cn(
                "px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-mono font-bold tracking-tight border shadow-md backdrop-blur-md",
                isColdStart
                  ? "bg-primary/20 text-primary-foreground border-primary/40"
                  : currentStage.badgeColor
              )}
            >
              {isColdStart ? "NOVO" : `${percentage}%`}
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
                  {isColdStart ? "Pronto para Forjar" : currentStage.title}
                </h2>
                {isChad && !isColdStart && (
                  <span className="flex items-center gap-1 text-[11px] font-mono uppercase tracking-wider text-amber-300 font-bold bg-amber-500/15 border border-amber-400/40 px-2 py-0.5 rounded-full">
                    <Sparkles className="w-3 h-3 text-amber-400" /> Aura Máxima
                  </span>
                )}
                {isColdStart && (
                  <span className="flex items-center gap-1 text-[11px] font-mono uppercase tracking-wider text-primary font-bold bg-primary/15 border border-primary/30 px-2 py-0.5 rounded-full">
                    <PlusCircle className="w-3 h-3" /> Início
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                {isColdStart ? "Cadastre seu primeiro hábito abaixo para começar" : currentStage.subtitle}
              </p>
            </div>

            {/* Quick quote shuffle trigger with tactile micro-interaction */}
            {!isColdStart && (
              <button
                onClick={handleShuffleQuote}
                aria-label="Sortear nova frase deste estágio"
                title="Girar frases deste estágio"
                className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground px-3 py-1.5 rounded-lg bg-surface-elevated/40 hover:bg-surface-elevated border border-white/5 active:scale-95 transition-all min-h-[36px]"
              >
                <Dices
                  className={cn(
                    "w-3.5 h-3.5 transition-transform duration-300",
                    isRolling && "rotate-180 scale-110 text-primary"
                  )}
                />
                <span className="hidden sm:inline text-[11px] font-medium">Trocar frase</span>
              </button>
            )}
          </div>

          {/* Dynamic Penalty Notice (if triggered) */}
          {isPenaltyActive && !isColdStart && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="mt-2.5 px-3 py-1.5 rounded-xl bg-destructive/15 border border-destructive/30 text-destructive-foreground text-xs flex items-center gap-2"
            >
              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
              <span className="leading-tight font-medium">
                <strong>PENALIDADE DO BETO:</strong> 2 dias em queda livre. Conclua mais{" "}
                <strong className="underline text-red-300">
                  {habitsNeededFor50} {habitsNeededFor50 === 1 ? "hábito" : "hábitos"}
                </strong>{" "}
                hoje para quebrar o cativeiro Doomer e voltar a ascender!
              </span>
            </motion.div>
          )}

          {/* Dynamic Meme Quote (Refined Editorial Typography & CLS stability) */}
          <div className="my-2 min-h-[3.25rem] sm:min-h-[2.5rem] flex items-center">
            <AnimatePresence mode="wait">
              <motion.p
                key={isColdStart ? "quote-cold" : `${currentStage.id}-${quoteIndex}`}
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 6 }}
                transition={{ duration: 0.25 }}
                className="font-sans font-medium text-sm sm:text-base text-foreground/85 italic leading-relaxed tracking-normal"
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
                animate={{ width: isColdStart ? "0%" : `${percentage}%` }}
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
