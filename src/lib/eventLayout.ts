import type { PlannerEvent } from "@/hooks/usePlanner";

export interface LaidOutEvent {
  event: PlannerEvent;
  col: number;
  cols: number;
}

/**
 * Lane layout for overlapping events.
 * Groups transitively overlapping events into clusters and assigns each
 * event a column index + the total columns in its cluster.
 */
export function layoutDayEvents(events: PlannerEvent[]): LaidOutEvent[] {
  const sorted = [...events].sort(
    (a, b) => a.startMinutes - b.startMinutes || b.durationMinutes - a.durationMinutes
  );
  const result: LaidOutEvent[] = [];

  let cluster: { ev: PlannerEvent; col: number; end: number }[] = [];
  let clusterMaxEnd = 0;

  const flush = () => {
    const cols = cluster.reduce((m, c) => Math.max(m, c.col + 1), 0);
    cluster.forEach((c) => result.push({ event: c.ev, col: c.col, cols }));
    cluster = [];
    clusterMaxEnd = 0;
  };

  for (const ev of sorted) {
    const end = ev.startMinutes + ev.durationMinutes;
    if (cluster.length && ev.startMinutes >= clusterMaxEnd) flush();
    // find first free column
    const used = new Set(cluster.filter((c) => c.end > ev.startMinutes).map((c) => c.col));
    let col = 0;
    while (used.has(col)) col++;
    cluster.push({ ev, col, end });
    clusterMaxEnd = Math.max(clusterMaxEnd, end);
  }
  if (cluster.length) flush();
  return result;
}
