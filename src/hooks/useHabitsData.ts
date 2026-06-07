import { useCallback, useEffect, useState } from "react";
import { format } from "date-fns";

export interface Habit {
  id: string;
  name: string;
  emoji: string;
  color: string;
  position: number;
  created_at: string;
}

export interface Completion {
  id: string;
  habit_id: string;
  date: string; // YYYY-MM-DD
}

export interface BadgeRow {
  id: string;
  badge_key: string;
  habit_id: string | null;
  unlocked_at: string;
}

const fmtDate = (d: Date) => format(d, "yyyy-MM-dd");

const KEY_HABITS = "forge-habits";
const KEY_COMPLETIONS = "forge-completions";
const KEY_BADGES = "forge-badges";

function load<T>(key: string, fallback: T): T {
  try {
    const v = localStorage.getItem(key);
    return v ? (JSON.parse(v) as T) : fallback;
  } catch {
    return fallback;
  }
}
function save<T>(key: string, v: T) {
  localStorage.setItem(key, JSON.stringify(v));
}
function uid() {
  return crypto.randomUUID();
}

// Singleton state shared between hook instances so updates propagate
let _habits: Habit[] = load(KEY_HABITS, []);
let _completions: Completion[] = load(KEY_COMPLETIONS, []);
let _badges: BadgeRow[] = load(KEY_BADGES, []);
const listeners = new Set<() => void>();
const notify = () => listeners.forEach((l) => l());

export function useHabitsData() {
  const [, force] = useState(0);
  useEffect(() => {
    const l = () => force((x) => x + 1);
    listeners.add(l);
    return () => {
      listeners.delete(l);
    };
  }, []);

  const addHabit = useCallback(async (h: { name: string; emoji: string; color: string }) => {
    const newHabit: Habit = {
      id: uid(),
      name: h.name,
      emoji: h.emoji,
      color: h.color,
      position: _habits.length,
      created_at: new Date().toISOString(),
    };
    _habits = [..._habits, newHabit];
    save(KEY_HABITS, _habits);
    notify();
    return newHabit;
  }, []);

  const updateHabit = useCallback(async (id: string, patch: Partial<Habit>) => {
    _habits = _habits.map((h) => (h.id === id ? { ...h, ...patch } : h));
    save(KEY_HABITS, _habits);
    notify();
  }, []);

  const deleteHabit = useCallback(async (id: string) => {
    _habits = _habits.filter((h) => h.id !== id);
    _completions = _completions.filter((c) => c.habit_id !== id);
    _badges = _badges.filter((b) => b.habit_id !== id);
    save(KEY_HABITS, _habits);
    save(KEY_COMPLETIONS, _completions);
    save(KEY_BADGES, _badges);
    notify();
  }, []);

  const toggleCompletion = useCallback(async (habit_id: string, date: Date) => {
    const dateStr = fmtDate(date);
    const existing = _completions.find((c) => c.habit_id === habit_id && c.date === dateStr);
    if (existing) {
      _completions = _completions.filter((c) => c.id !== existing.id);
    } else {
      _completions = [..._completions, { id: uid(), habit_id, date: dateStr }];
    }
    save(KEY_COMPLETIONS, _completions);
    notify();
  }, []);

  const isCompleted = useCallback(
    (habit_id: string, date: Date) =>
      _completions.some((c) => c.habit_id === habit_id && c.date === fmtDate(date)),
    []
  );

  const unlockBadge = useCallback(async (badge_key: string, habit_id: string | null = null) => {
    const exists = _badges.some((b) => b.badge_key === badge_key && b.habit_id === habit_id);
    if (exists) return null;
    const row: BadgeRow = {
      id: uid(),
      badge_key,
      habit_id,
      unlocked_at: new Date().toISOString(),
    };
    _badges = [..._badges, row];
    save(KEY_BADGES, _badges);
    notify();
    return row;
  }, []);

  const refresh = useCallback(async () => {
    _habits = load(KEY_HABITS, []);
    _completions = load(KEY_COMPLETIONS, []);
    _badges = load(KEY_BADGES, []);
    notify();
  }, []);

  return {
    habits: _habits,
    completions: _completions,
    badges: _badges,
    loading: false,
    addHabit,
    updateHabit,
    deleteHabit,
    toggleCompletion,
    isCompleted,
    unlockBadge,
    refresh,
  };
}
