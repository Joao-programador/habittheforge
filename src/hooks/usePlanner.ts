import { useCallback } from "react";
import { format, isAfter, isBefore, parseISO, startOfDay } from "date-fns";
import { createCloudStore } from "@/lib/cloudStore";

export type RecurrenceType = "none" | "daily" | "weekly" | "custom";

export interface RecurrenceRule {
  type: RecurrenceType;
  daysOfWeek?: number[];
  until?: string | null; // YYYY-MM-DD inclusive, null = forever
}

export interface PlannerEvent {
  id: string;
  title: string;
  emoji?: string;
  color: string;
  date: string;            // YYYY-MM-DD anchor (start date)
  startMinutes: number;    // minutes from 00:00
  durationMinutes: number;
  habit_id?: string | null;
  notes?: string;
  recurrence: RecurrenceRule;
  created_at: string;
}

const fmt = (d: Date) => format(d, "yyyy-MM-dd");

const store = createCloudStore<PlannerEvent>(
  "planner_events",
  (r) => ({
    id: r.id,
    title: r.title,
    emoji: r.emoji ?? undefined,
    color: r.color,
    date: r.date,
    startMinutes: r.start_minutes,
    durationMinutes: r.duration_minutes,
    habit_id: r.habit_id,
    notes: r.notes ?? undefined,
    recurrence: (r.recurrence ?? { type: "none" }) as RecurrenceRule,
    created_at: r.created_at,
  }),
  { column: "start_minutes", ascending: true }
);

function toDb(e: Partial<PlannerEvent>): Record<string, unknown> {
  const db: Record<string, unknown> = {};
  if (e.title !== undefined) db.title = e.title;
  if (e.emoji !== undefined) db.emoji = e.emoji;
  if (e.color !== undefined) db.color = e.color;
  if (e.date !== undefined) db.date = e.date;
  if (e.startMinutes !== undefined) db.start_minutes = e.startMinutes;
  if (e.durationMinutes !== undefined) db.duration_minutes = e.durationMinutes;
  if (e.habit_id !== undefined) db.habit_id = e.habit_id || null;
  if (e.notes !== undefined) db.notes = e.notes;
  if (e.recurrence !== undefined) db.recurrence = e.recurrence;
  return db;
}

/** Returns true if event occurs on given date (expanding recurrence) */
export function eventOccursOn(ev: PlannerEvent, date: Date): boolean {
  const target = startOfDay(date);
  const anchor = startOfDay(parseISO(ev.date));
  if (isBefore(target, anchor)) return false;
  if (ev.recurrence.until) {
    const until = startOfDay(parseISO(ev.recurrence.until));
    if (isAfter(target, until)) return false;
  }
  const dow = target.getDay();
  switch (ev.recurrence.type) {
    case "none":
      return fmt(target) === ev.date;
    case "daily":
      return true;
    case "weekly":
      return dow === anchor.getDay();
    case "custom":
      return (ev.recurrence.daysOfWeek ?? []).includes(dow);
  }
}

/** Get all event instances overlapping a date range (inclusive) */
export function getEventsInRange(events: PlannerEvent[], from: Date, to: Date) {
  const out: { event: PlannerEvent; date: string }[] = [];
  let cursor = startOfDay(from);
  const end = startOfDay(to);
  while (!isAfter(cursor, end)) {
    for (const ev of events) {
      if (eventOccursOn(ev, cursor)) out.push({ event: ev, date: fmt(cursor) });
    }
    cursor = new Date(cursor.getTime() + 86400000);
  }
  return out;
}

export function getEventsForDay(events: PlannerEvent[], day: Date) {
  return events
    .filter((ev) => eventOccursOn(ev, day))
    .sort((a, b) => a.startMinutes - b.startMinutes);
}

export function usePlanner() {
  const events = store.useItems();

  const addEvent = useCallback((e: Omit<PlannerEvent, "id" | "created_at">) => {
    void store.insert(toDb(e));
  }, []);

  const updateEvent = useCallback((id: string, patch: Partial<PlannerEvent>) => {
    void store.update(id, toDb(patch), patch);
  }, []);

  const deleteEvent = useCallback((id: string) => {
    void store.remove(id);
  }, []);

  return { events, addEvent, updateEvent, deleteEvent };
}
