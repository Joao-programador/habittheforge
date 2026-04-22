import { format, eachDayOfInterval, startOfMonth, endOfMonth, differenceInDays, subDays, isSameDay, parseISO } from "date-fns";
import type { Completion, Habit } from "@/hooks/useHabitsData";

const fmt = (d: Date) => format(d, "yyyy-MM-dd");

export function getMonthDays(date: Date): Date[] {
  return eachDayOfInterval({ start: startOfMonth(date), end: endOfMonth(date) });
}

export function getStreak(habit_id: string, completions: Completion[], today = new Date()): number {
  const set = new Set(completions.filter(c => c.habit_id === habit_id).map(c => c.date));
  let streak = 0;
  // Allow today not done — count from yesterday if today not done
  let cursor = new Date(today);
  if (!set.has(fmt(cursor))) cursor = subDays(cursor, 1);
  while (set.has(fmt(cursor))) {
    streak++;
    cursor = subDays(cursor, 1);
  }
  return streak;
}

export function getLongestStreak(habit_id: string, completions: Completion[]): number {
  const dates = completions
    .filter(c => c.habit_id === habit_id)
    .map(c => parseISO(c.date))
    .sort((a, b) => a.getTime() - b.getTime());
  if (!dates.length) return 0;
  let longest = 1, current = 1;
  for (let i = 1; i < dates.length; i++) {
    if (differenceInDays(dates[i], dates[i - 1]) === 1) {
      current++;
      longest = Math.max(longest, current);
    } else {
      current = 1;
    }
  }
  return longest;
}

export function getMonthCompletions(habit_id: string, completions: Completion[], date: Date): number {
  const start = fmt(startOfMonth(date)); const end = fmt(endOfMonth(date));
  return completions.filter(c => c.habit_id === habit_id && c.date >= start && c.date <= end).length;
}

export function getMonthCompletionsAll(completions: Completion[], date: Date): number {
  const start = fmt(startOfMonth(date)); const end = fmt(endOfMonth(date));
  return completions.filter(c => c.date >= start && c.date <= end).length;
}

export function getCompletionPercentage(habits: Habit[], completions: Completion[], date: Date): number {
  const days = getMonthDays(date);
  const today = new Date();
  const relevantDays = days.filter(d => d <= today);
  const totalSlots = relevantDays.length * habits.length;
  if (totalSlots === 0) return 0;
  const done = getMonthCompletionsAll(completions, date);
  return Math.round((done / totalSlots) * 100);
}

export function getDailyCompletionRate(
  habits: Habit[],
  completions: Completion[],
  date: Date
): { date: string; rate: number; count: number }[] {
  const days = getMonthDays(date);
  return days.map(d => {
    const dStr = fmt(d);
    const count = completions.filter(c => c.date === dStr && habits.some(h => h.id === c.habit_id)).length;
    const rate = habits.length ? Math.round((count / habits.length) * 100) : 0;
    return { date: format(d, "dd"), rate, count };
  });
}

export function isPerfectDay(habits: Habit[], completions: Completion[], date: Date): boolean {
  if (!habits.length) return false;
  const dStr = fmt(date);
  return habits.every(h => completions.some(c => c.habit_id === h.id && c.date === dStr));
}
