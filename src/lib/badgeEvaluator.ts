import { parseISO, differenceInCalendarDays, format } from "date-fns";
import type { Habit, Completion } from "@/hooks/useHabitsData";
import { BADGE_DEFS } from "@/data/badges";
import { toast } from "sonner";
import { getLongestStreak } from "@/lib/stats";

export async function evaluateAndUnlockBadges(
  habits: Habit[],
  completions: Completion[],
  unlockedKeys: Set<string>,
  unlockBadge: (key: string) => Promise<any>
) {
  if (!habits.length || !completions.length) return;

  const toUnlock: string[] = [];

  // 1. first_check
  if (!unlockedKeys.has("first_check") && completions.length > 0) {
    toUnlock.push("first_check");
  }

  // Group unique completed habits by date (filtering valid active habits)
  const habitIdSet = new Set(habits.map((h) => h.id));
  const completionsByDate = new Map<string, Set<string>>();
  for (const c of completions) {
    if (habitIdSet.has(c.habit_id)) {
      if (!completionsByDate.has(c.date)) {
        completionsByDate.set(c.date, new Set());
      }
      completionsByDate.get(c.date)!.add(c.habit_id);
    }
  }

  const activeDates = Array.from(completionsByDate.keys())
    .map((dStr) => parseISO(dStr))
    .sort((a, b) => a.getTime() - b.getTime());

  // 2. cura_do_beto: at least 1 habit completed for 3 days in a row
  if (!unlockedKeys.has("cura_do_beto") && activeDates.length >= 3) {
    let streak = 1;
    for (let i = 1; i < activeDates.length; i++) {
      if (differenceInCalendarDays(activeDates[i], activeDates[i - 1]) === 1) {
        streak++;
        if (streak >= 3) {
          toUnlock.push("cura_do_beto");
          break;
        }
      } else {
        streak = 1;
      }
    }
  }

  // 3. bloomer_grass: 80%+ completion on 5 days in any month
  if (!unlockedKeys.has("bloomer_grass")) {
    const threshold80 = Math.ceil(habits.length * 0.8);
    const monthHighDays = new Map<string, number>();

    for (const [dateStr, habitSet] of completionsByDate.entries()) {
      if (habitSet.size >= threshold80) {
        const monthKey = dateStr.slice(0, 7); // YYYY-MM
        monthHighDays.set(monthKey, (monthHighDays.get(monthKey) || 0) + 1);
      }
    }

    for (const daysCount of monthHighDays.values()) {
      if (daysCount >= 5) {
        toUnlock.push("bloomer_grass");
        break;
      }
    }
  }

  // 4. zero_consoom & perfect_day: 100% completion on a single day
  const perfectDays = Array.from(completionsByDate.entries())
    .filter(([_, habitSet]) => habitSet.size >= habits.length)
    .map(([dateStr]) => parseISO(dateStr))
    .sort((a, b) => a.getTime() - b.getTime());

  if (perfectDays.length > 0) {
    if (!unlockedKeys.has("zero_consoom")) toUnlock.push("zero_consoom");
    if (!unlockedKeys.has("perfect_day")) toUnlock.push("perfect_day");
  }

  // 5. gigachad_supremo: 100% completion for 7 consecutive days
  if (!unlockedKeys.has("gigachad_supremo") && perfectDays.length >= 7) {
    let perfectStreak = 1;
    for (let i = 1; i < perfectDays.length; i++) {
      if (differenceInCalendarDays(perfectDays[i], perfectDays[i - 1]) === 1) {
        perfectStreak++;
        if (perfectStreak >= 7) {
          toUnlock.push("gigachad_supremo");
          break;
        }
      } else {
        perfectStreak = 1;
      }
    }
  }

  // 6. Streaks by habit
  let maxAnyStreak = 0;
  for (const h of habits) {
    const s = getLongestStreak(h.id, completions);
    if (s > maxAnyStreak) maxAnyStreak = s;
  }

  const streakMilestones = [
    { key: "streak_7", threshold: 7 },
    { key: "streak_14", threshold: 14 },
    { key: "streak_21", threshold: 21 },
    { key: "streak_30", threshold: 30 },
    { key: "streak_60", threshold: 60 },
  ];

  for (const { key, threshold } of streakMilestones) {
    if (!unlockedKeys.has(key) && maxAnyStreak >= threshold) {
      toUnlock.push(key);
    }
  }

  // 7. month_warrior: 100 checks in a single month
  if (!unlockedKeys.has("month_warrior")) {
    const monthTotals = new Map<string, number>();
    for (const c of completions) {
      if (habitIdSet.has(c.habit_id)) {
        const monthKey = c.date.slice(0, 7);
        monthTotals.set(monthKey, (monthTotals.get(monthKey) || 0) + 1);
      }
    }
    for (const total of monthTotals.values()) {
      if (total >= 100) {
        toUnlock.push("month_warrior");
        break;
      }
    }
  }

  // Unlock all detected badges with slight delay to avoid overlapping toasts
  for (const badgeKey of toUnlock) {
    try {
      const inserted = await unlockBadge(badgeKey);
      if (inserted) {
        const def = BADGE_DEFS[badgeKey];
        toast.success(`🏆 Ascensão Desbloqueada: ${def?.name || badgeKey}!`, {
          description: def?.description,
        });
        await new Promise((resolve) => setTimeout(resolve, 350));
      }
    } catch (e) {
      // Ignored if already unlocked
    }
  }
}
