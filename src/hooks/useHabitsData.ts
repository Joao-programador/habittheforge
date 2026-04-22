import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
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

export function useHabitsData() {
  const { user } = useAuth();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [completions, setCompletions] = useState<Completion[]>([]);
  const [badges, setBadges] = useState<BadgeRow[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const [h, c, b] = await Promise.all([
      supabase.from("habits").select("*").eq("user_id", user.id).order("position"),
      supabase.from("completions").select("*").eq("user_id", user.id),
      supabase.from("badges").select("*").eq("user_id", user.id),
    ]);
    if (h.data) setHabits(h.data as Habit[]);
    if (c.data) setCompletions(c.data as Completion[]);
    if (b.data) setBadges(b.data as BadgeRow[]);
    setLoading(false);
  }, [user]);

  useEffect(() => { refresh(); }, [refresh]);

  // CRUD
  const addHabit = async (h: { name: string; emoji: string; color: string }) => {
    if (!user) return;
    const { data, error } = await supabase
      .from("habits")
      .insert({ ...h, user_id: user.id, position: habits.length })
      .select()
      .single();
    if (!error && data) setHabits((p) => [...p, data as Habit]);
  };

  const updateHabit = async (id: string, patch: Partial<Habit>) => {
    if (!user) return;
    await supabase.from("habits").update(patch).eq("id", id);
    setHabits((p) => p.map((h) => (h.id === id ? { ...h, ...patch } : h)));
  };

  const deleteHabit = async (id: string) => {
    if (!user) return;
    await supabase.from("habits").delete().eq("id", id);
    setHabits((p) => p.filter((h) => h.id !== id));
    setCompletions((p) => p.filter((c) => c.habit_id !== id));
  };

  const toggleCompletion = async (habit_id: string, date: Date) => {
    if (!user) return;
    const dateStr = fmtDate(date);
    const existing = completions.find(
      (c) => c.habit_id === habit_id && c.date === dateStr
    );
    if (existing) {
      await supabase.from("completions").delete().eq("id", existing.id);
      setCompletions((p) => p.filter((c) => c.id !== existing.id));
    } else {
      const { data, error } = await supabase
        .from("completions")
        .insert({ habit_id, date: dateStr, user_id: user.id })
        .select()
        .single();
      if (!error && data) setCompletions((p) => [...p, data as Completion]);
    }
  };

  const isCompleted = (habit_id: string, date: Date) =>
    completions.some((c) => c.habit_id === habit_id && c.date === fmtDate(date));

  const unlockBadge = async (badge_key: string, habit_id: string | null = null) => {
    if (!user) return;
    const exists = badges.some(
      (b) => b.badge_key === badge_key && b.habit_id === habit_id
    );
    if (exists) return null;
    const { data, error } = await supabase
      .from("badges")
      .insert({ user_id: user.id, badge_key, habit_id })
      .select()
      .single();
    if (!error && data) {
      setBadges((p) => [...p, data as BadgeRow]);
      return data as BadgeRow;
    }
    return null;
  };

  return {
    habits, completions, badges, loading,
    addHabit, updateHabit, deleteHabit,
    toggleCompletion, isCompleted, unlockBadge, refresh,
  };
}
