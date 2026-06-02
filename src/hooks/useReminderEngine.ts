import { useEffect, useState, useCallback } from "react";
import { Reminder, isDue, useReminders } from "./useReminders";

export interface PendingReminder {
  reminder: Reminder;
  firedAt: number;
}

export function useReminderEngine() {
  const { reminders, markFired } = useReminders();
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
        markFired(r.id, now.getTime());
        // Try native notification
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
  }, [reminders, markFired, enqueue]);

  return { current: queue[0] ?? null, dismissCurrent, queueSize: queue.length };
}
