import { useEffect, useRef } from "react";
import { useHabitsData } from "@/hooks/useHabitsData";
import { getStreak, isPerfectDay, getMonthCompletionsAll } from "@/lib/stats";
import { BADGE_DEFS } from "@/data/badges";
import { toast } from "sonner";

export function useBadgeWatcher() {
  const { habits, completions, badges, unlockBadge } = useHabitsData();
  const lastChecked = useRef<string>("");

  useEffect(() => {
    const sig = `${completions.length}-${habits.length}`;
    if (sig === lastChecked.current) return;
    lastChecked.current = sig;

    if (!habits.length) return;
    const today = new Date();

    const announce = async (key: string, habitId: string | null = null) => {
      const def = BADGE_DEFS[key];
      if (!def) return;
      const already = badges.some(b => b.badge_key === key && b.habit_id === habitId);
      if (already) return;
      const r = await unlockBadge(key, habitId);
      if (r) {
        toast.success(`🏆 Badge desbloqueada: ${def.name}`, {
          description: def.description,
          duration: 5000,
        });
      }
    };

    // First check ever
    if (completions.length > 0) {
      announce("first_check");
    }

    // Per-habit streaks
    habits.forEach(h => {
      const streak = getStreak(h.id, completions, today);
      [
        { key: "streak_7", t: 7 },
        { key: "streak_14", t: 14 },
        { key: "streak_21", t: 21 },
        { key: "streak_30", t: 30 },
        { key: "streak_60", t: 60 },
      ].forEach(({ key, t }) => {
        if (streak >= t) announce(key, h.id);
      });
    });

    // Perfect day
    if (isPerfectDay(habits, completions, today)) {
      announce("perfect_day");
    }

    // Month warrior
    if (getMonthCompletionsAll(completions, today) >= 100) {
      announce("month_warrior");
    }
  }, [habits, completions, badges, unlockBadge]);
}
