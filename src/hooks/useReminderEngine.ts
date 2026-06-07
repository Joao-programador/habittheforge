import { useEffect, useState, useCallback } from "react";
import { Reminder, isDue, useReminders } from "./useReminders";
import { useHabitsData } from "./useHabitsData";

export interface PendingReminder {
  reminder: Reminder;
  firedAt: number;
}

export function useReminderEngine() {
  const { reminders, markFired } = useReminders();
  const { isCompleted } = useHabitsData();
  const [queue, setQueue] = useState<PendingReminder[]>([]);

  const enqueue = useCallback((r: Reminder) => {
    setQueue((q) => [...q, { reminder: r, firedAt: Date.now() }]);
  }, []);

  const dismissCurrent = useCallback(() => {
    setQueue((q) => q.slice(1));
  }, []);

  // Periodic check loop
  useEffect(() => {
    const tick = () => {
      const now = new Date();
      reminders.forEach((r) => {
        if (!isDue(r, now)) return;
        // Skip if linked habit is already completed today
        if (r.habitId && isCompleted(r.habitId, now)) {
          markFired(r.id, now.getTime()); // bump so it doesn't keep retrying every tick
          return;
        }
        markFired(r.id, now.getTime());
        if (typeof Notification !== "undefined" && Notification.permission === "granted") {
          try {
            new Notification(r.title || "Lembrete", {
              body: r.message || "Você é isso aqui.",
              tag: r.id,
            });
          } catch {
            // ignore
          }
        }
        enqueue(r);
      });
    };
    tick();
    const id = window.setInterval(tick, 30_000);
    return () => window.clearInterval(id);
  }, [reminders, markFired, enqueue, isCompleted]);

  return { current: queue[0] ?? null, dismissCurrent, queueSize: queue.length };
}
