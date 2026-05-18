import { useCallback, useEffect, useState } from "react";
import { format, isAfter, isBefore, parseISO, startOfDay } from "date-fns";

export type RecurrenceType = "none" | "daily" | "weekly" | "custom";

export interface RecurrenceRule {
  type: RecurrenceType;
  // For "weekly": single day-of-week derived from start date
  // For "custom": list of day-of-week numbers (0=Sun..6=Sat)
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

const KEY_EVENTS = "forge-planner-events";

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
const uid = () => crypto.randomUUID();
const fmt = (d: Date) => format(d, "yyyy-MM-dd");

let _events: PlannerEvent[] = load(KEY_EVENTS, []);
const listeners = new Set<() => void>();
const notify = () => listeners.forEach((l) => l());

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
  const [, force] = useState(0);
  useEffect(() => {
    const l = () => force((x) => x + 1);
    listeners.add(l);
    return () => {
      listeners.delete(l);
    };
  }, []);

  const addEvent = useCallback((e: Omit<PlannerEvent, "id" | "created_at">) => {
    const ev: PlannerEvent = { ...e, id: uid(), created_at: new Date().toISOString() };
    _events = [..._events, ev];
    save(KEY_EVENTS, _events);
    notify();
    return ev;
  }, []);

  const updateEvent = useCallback((id: string, patch: Partial<PlannerEvent>) => {
    _events = _events.map((e) => (e.id === id ? { ...e, ...patch } : e));
    save(KEY_EVENTS, _events);
    notify();
  }, []);

  const deleteEvent = useCallback((id: string) => {
    _events = _events.filter((e) => e.id !== id);
    save(KEY_EVENTS, _events);
    notify();
  }, []);

  return { events: _events, addEvent, updateEvent, deleteEvent };
}
