import { useCallback, useEffect, useState } from "react";

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
}

const KEY = "forge-reminders";

function load(): Reminder[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    return JSON.parse(raw) as Reminder[];
  } catch {
    return [];
  }
}

function save(list: Reminder[]) {
  localStorage.setItem(KEY, JSON.stringify(list));
  window.dispatchEvent(new CustomEvent("forge-reminders-changed"));
}

export function useReminders() {
  const [reminders, setReminders] = useState<Reminder[]>(() => load());

  useEffect(() => {
    const onChange = () => setReminders(load());
    window.addEventListener("forge-reminders-changed", onChange);
    window.addEventListener("storage", onChange);
    return () => {
      window.removeEventListener("forge-reminders-changed", onChange);
      window.removeEventListener("storage", onChange);
    };
  }, []);

  const addReminder = useCallback((r: Omit<Reminder, "id" | "createdAt" | "active">) => {
    const list = load();
    const next: Reminder = { ...r, id: crypto.randomUUID(), createdAt: Date.now(), active: true };
    save([next, ...list]);
  }, []);

  const updateReminder = useCallback((id: string, patch: Partial<Reminder>) => {
    const list = load().map((r) => (r.id === id ? { ...r, ...patch } : r));
    save(list);
  }, []);

  const deleteReminder = useCallback((id: string) => {
    save(load().filter((r) => r.id !== id));
  }, []);

  const markFired = useCallback((id: string, at: number) => {
    const list = load().map((r) => (r.id === id ? { ...r, lastFiredAt: at } : r));
    save(list);
  }, []);

  return { reminders, addReminder, updateReminder, deleteReminder, markFired };
}

export function isDue(r: Reminder, now: Date): boolean {
  if (!r.active) return false;
  const nowMs = now.getTime();
  const last = r.lastFiredAt ?? 0;

  if (r.mode === "interval" && r.intervalMinutes && r.intervalMinutes > 0) {
    // Don't fire on initial creation; require at least one full interval since creation OR last fire
    const reference = Math.max(last, r.createdAt);
    return nowMs - reference >= r.intervalMinutes * 60_000;
  }

  if (r.mode === "times" && r.times && r.times.length > 0) {
    const hh = String(now.getHours()).padStart(2, "0");
    const mm = String(now.getMinutes()).padStart(2, "0");
    const current = `${hh}:${mm}`;
    if (!r.times.includes(current)) return false;
    // Prevent re-fire within same minute
    if (last && nowMs - last < 60_000) return false;
    return true;
  }
  return false;
}
