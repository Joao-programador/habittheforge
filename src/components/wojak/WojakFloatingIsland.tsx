import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { ArrowUp } from "lucide-react";
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
          initial={{ y: -60, opacity: 0, scale: 0.92 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: -50, opacity: 0, scale: 0.92 }}
          transition={{ type: "spring", stiffness: 380, damping: 26 }}
          onClick={scrollToTop}
          className={cn(
            "fixed top-3 left-1/2 -translate-x-1/2 z-50",
            "cursor-pointer select-none",
            "flex items-center gap-3 sm:gap-4 px-4 sm:px-5 py-2 sm:py-2.5 rounded-2xl sm:rounded-full",
            "glass backdrop-blur-2xl bg-card/95 border-2 shadow-[0_12px_36px_rgba(0,0,0,0.45)]",
            "hover:scale-[1.03] active:scale-[0.98] transition-all duration-200",
            isChad
              ? "border-amber-400 shadow-[0_0_35px_rgba(251,191,36,0.3)]"
              : stage.borderClass
          )}
          title="Clique para voltar ao topo da página"
        >
          {/* Avatar ampliado com traço nítido e fundo branco sólido */}
          <div
            className={cn(
              "relative w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-white overflow-hidden shrink-0 border-2 shadow-md flex items-center justify-center",
              isChad ? "border-amber-400 ring-2 ring-amber-400/40" : "border-white/50"
            )}
          >
            <img
              src={stage.imageUrl}
              alt={stage.title}
              className={cn(
                "w-full h-full select-none",
                isDoomer
                  ? "object-cover scale-175 object-[center_22%]"
                  : isChad
                  ? "object-cover"
                  : "object-contain p-1"
              )}
            />
          </div>

          {/* Nome e % ampliada */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-0.5 sm:gap-2.5 min-w-0">
            <span className="font-display text-sm sm:text-base font-bold tracking-tight text-foreground whitespace-nowrap">
              {stage.title}
            </span>
            <span
              className={cn(
                "font-mono text-xs px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider self-start sm:self-auto",
                stage.badgeColor
              )}
            >
              {percentage}% hoje
            </span>
          </div>

          {/* Frase reduzida do Beto / Wojak */}
          <span className="hidden md:inline-block text-xs sm:text-sm text-muted-foreground italic truncate max-w-[240px] lg:max-w-[420px] border-l border-border/40 pl-3">
            "{stage.quotes[0]}"
          </span>

          {/* Botão de retorno ao topo com affordance visual clara */}
          <div className="w-7 h-7 rounded-full bg-secondary/80 hover:bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground shrink-0 ml-1 border border-border/40 shadow-xs">
            <ArrowUp className="w-3.5 h-3.5" />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
