import { useCallback } from "react";
import { createCloudStore } from "@/lib/cloudStore";

export type ReminderMode = "interval" | "times";

export interface Reminder {
  id: string;
  title: string;
  message: string;
  mode: ReminderMode;
  intervalMinutes?: number;
  times?: string[]; // ["HH:mm"]
  active: boolean;
  lastFiredAt?: number; // ms epoch
  createdAt: number;
  habitId?: string; // optional link to a habit
}

const store = createCloudStore<Reminder>(
  "reminders",
  (r) => ({
    id: r.id,
    title: r.title,
    message: r.message ?? "",
    mode: (r.mode ?? "interval") as ReminderMode,
    intervalMinutes: r.interval_minutes ?? undefined,
    times: r.times ?? [],
    active: r.active,
    lastFiredAt: r.last_fired_at ? new Date(r.last_fired_at).getTime() : undefined,
    createdAt: new Date(r.created_at).getTime(),
    habitId: r.habit_id ?? undefined,
  }),
  { column: "created_at", ascending: false },
  (a, b) => b.createdAt - a.createdAt
);

export function useReminders() {
  const reminders = store.useItems();

  const addReminder = useCallback((r: Omit<Reminder, "id" | "createdAt" | "active">) => {
    void store.insert({
      title: r.title,
      message: r.message ?? "",
      mode: r.mode,
      interval_minutes: r.intervalMinutes ?? null,
      times: r.times ?? [],
      habit_id: r.habitId ?? null,
      active: true,
    });
  }, []);

  const updateReminder = useCallback((id: string, patch: Partial<Reminder>) => {
    const db: Record<string, unknown> = {};
    if (patch.title !== undefined) db.title = patch.title;
    if (patch.message !== undefined) db.message = patch.message;
    if (patch.mode !== undefined) db.mode = patch.mode;
    if (patch.intervalMinutes !== undefined) db.interval_minutes = patch.intervalMinutes ?? null;
    if (patch.times !== undefined) db.times = patch.times ?? [];
    if (patch.active !== undefined) db.active = patch.active;
    if (patch.habitId !== undefined) db.habit_id = patch.habitId ?? null;
    if (patch.lastFiredAt !== undefined)
      db.last_fired_at = patch.lastFiredAt ? new Date(patch.lastFiredAt).toISOString() : null;
    void store.update(id, db, patch);
  }, []);

  const deleteReminder = useCallback((id: string) => {
    void store.remove(id);
  }, []);

  const markFired = useCallback((id: string, at: number) => {
    void store.update(id, { last_fired_at: new Date(at).toISOString() }, { lastFiredAt: at });
  }, []);

  return { reminders, addReminder, updateReminder, deleteReminder, markFired };
}

export function isDue(r: Reminder, now: Date): boolean {
  if (!r.active) return false;
  const nowMs = now.getTime();
  const last = r.lastFiredAt ?? 0;

  if (r.mode === "interval" && r.intervalMinutes && r.intervalMinutes > 0) {
    const reference = Math.max(last, r.createdAt);
    return nowMs - reference >= r.intervalMinutes * 60_000;
  }

  if (r.mode === "times" && r.times && r.times.length > 0) {
    const hh = String(now.getHours()).padStart(2, "0");
    const mm = String(now.getMinutes()).padStart(2, "0");
    const current = `${hh}:${mm}`;
    if (!r.times.includes(current)) return false;
    if (last && nowMs - last < 60_000) return false;
    return true;
  }
  return false;
}
