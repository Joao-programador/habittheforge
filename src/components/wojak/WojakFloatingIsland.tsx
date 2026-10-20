import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { ArrowUp, Sparkles } from "lucide-react";
import { useHabitsData } from "@/hooks/useHabitsData";
import { getWojakStage, checkHasStreakPenalty } from "@/lib/wojakLore";
import { cn } from "@/lib/utils";

export function WojakFloatingIsland() {
  const { habits, completions } = useHabitsData();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 160);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <AnimatePresence>
      {scrolled && (
        <motion.div
          initial={{ y: -50, opacity: 0, scale: 0.95 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: -40, opacity: 0, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 400, damping: 28 }}
          onClick={scrollToTop}
          className={cn(
            "fixed top-3 left-1/2 -translate-x-1/2 z-50",
            "cursor-pointer select-none",
            "flex items-center gap-2.5 sm:gap-3 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full",
            "glass backdrop-blur-xl bg-card/90 border shadow-2xl",
            "hover:scale-[1.02] active:scale-[0.98] transition-transform duration-200",
            isChad
              ? "border-amber-400/60 shadow-[0_0_25px_rgba(251,191,36,0.25)]"
              : stage.borderClass
          )}
          title="Clique para voltar ao topo da página"
        >
          {/* Mini Avatar com fundo branco para traço nítido */}
          <div className="relative w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white overflow-hidden shrink-0 border border-white/30 shadow-xs flex items-center justify-center">
            <img
              src={stage.imageUrl}
              alt={stage.title}
              className={cn(
                "w-full h-full select-none",
                isDoomer ? "object-cover scale-140 object-[center_20%]" : isChad ? "object-cover" : "object-contain p-0.5"
              )}
            />
          </div>

          {/* Nome e % */}
          <div className="flex items-center gap-2 min-w-0">
            <span className="font-display text-xs sm:text-sm tracking-tight text-foreground whitespace-nowrap">
              {stage.title}
            </span>
            <span
              className={cn(
                "font-mono text-[10px] sm:text-xs px-2 py-0.5 rounded-full font-bold uppercase tracking-wider",
                stage.badgeColor
              )}
            >
              {percentage}%
            </span>
          </div>

          {/* Frase reduzida do Beto / Wojak */}
          <span className="hidden md:inline-block text-xs text-muted-foreground italic truncate max-w-[220px] lg:max-w-[320px] border-l border-border/40 pl-2.5">
            "{stage.quotes[0]}"
          </span>

          {/* Botão de retorno ao topo */}
          <div className="w-5 h-5 rounded-full bg-secondary/80 flex items-center justify-center text-muted-foreground shrink-0 ml-0.5">
            <ArrowUp className="w-3 h-3" />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
