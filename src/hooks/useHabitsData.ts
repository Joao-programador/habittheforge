import { useCallback } from "react";
import { format } from "date-fns";
import { createCloudStore } from "@/lib/cloudStore";

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

const habitsStore = createCloudStore<Habit>(
  "habits",
  (r) => {
    let meta: { emoji?: string; color?: string } = {};
    if (r.description) {
      try {
        meta = JSON.parse(r.description);
      } catch (e) {}
    }
    return {
      id: r.id,
      name: r.name ?? r.title ?? "",
      emoji: r.emoji ?? meta.emoji ?? "💪",
      color: r.color ?? meta.color ?? "#4f46e5",
      position: r.position ?? 0,
      created_at: r.created_at,
    };
  },
  { column: "created_at", ascending: true },
  (a, b) => a.position - b.position
);

const completionsStore = createCloudStore<Completion>(
  "completions",
  (r) => ({ id: r.id, habit_id: r.habit_id, date: r.date }),
  { column: "date", ascending: true }
);

const badgesStore = createCloudStore<BadgeRow>(
  "badges",
  (r) => ({ 
    id: r.id, 
    badge_key: r.badge_key, 
    habit_id: r.habit_id, 
    unlocked_at: r.unlocked_at ?? r.created_at ?? new Date().toISOString() 
  }),
  { column: "unlocked_at", ascending: true }
);

export function useHabitsData() {
  const habits = habitsStore.useItems();
  const completions = completionsStore.useItems();
  const badges = badgesStore.useItems();

  const addHabit = useCallback(async (h: { name: string; emoji: string; color: string }) => {
    const desc = JSON.stringify({ emoji: h.emoji, color: h.color });
    return habitsStore.insert({
      title: h.name,
      description: desc,
      name: h.name,
      emoji: h.emoji,
      color: h.color,
      position: habitsStore.get().length,
    });
  }, []);

  const updateHabit = useCallback(async (id: string, patch: Partial<Habit>) => {
    const db: Record<string, unknown> = {};
    if (patch.name) db.title = patch.name;
    if (patch.emoji || patch.color) {
      db.description = JSON.stringify({ emoji: patch.emoji, color: patch.color });
    }
    await habitsStore.update(id, db, patch);
  }, []);

  const deleteHabit = useCallback(async (id: string) => {
    await habitsStore.remove(id);
    await completionsStore.reload();
    await badgesStore.reload();
  }, []);

  const toggleCompletion = useCallback(async (habit_id: string, date: Date) => {
    const dateStr = fmtDate(date);
    const existing = completionsStore.get().find((c) => c.habit_id === habit_id && c.date === dateStr);
    if (existing) await completionsStore.remove(existing.id);
    else await completionsStore.insert({ habit_id, date: dateStr });
  }, []);

  const isCompleted = useCallback(
    (habit_id: string, date: Date) =>
      completionsStore.get().some((c) => c.habit_id === habit_id && c.date === fmtDate(date)),
    []
  );

  const unlockBadge = useCallback(async (badge_key: string, habit_id: string | null = null) => {
    const exists = badgesStore.get().some((b) => b.badge_key === badge_key && b.habit_id === habit_id);
    if (exists) return null;
    return badgesStore.insert({ badge_key, habit_id });
  }, []);

  const refresh = useCallback(async () => {
    await Promise.all([habitsStore.reload(), completionsStore.reload(), badgesStore.reload()]);
  }, []);

  return {
    habits,
    completions,
    badges,
    loading: !habitsStore.loaded(),
    addHabit,
    updateHabit,
    deleteHabit,
    toggleCompletion,
    isCompleted,
    unlockBadge,
    refresh,
  };
}
