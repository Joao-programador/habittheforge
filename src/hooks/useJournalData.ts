import { useState, useEffect, useCallback, useMemo } from "react";
import { format, parseISO, isSameMonth } from "date-fns";

export type WojakStageId = "doomer" | "soyjak" | "wojak" | "bloomer" | "gigachad";

export interface JournalEntry {
  date: string; // YYYY-MM-DD
  content: string;
  winOfTheDay: string;
  betoExcuseDestroyed: string;
  tags: string[];
  completionSnapshot: number;
  stageSnapshot: WojakStageId;
  updatedAt: string; // ISO date
}

const STORAGE_KEY = "forge_journal_v1";

function loadStorage(): Record<string, JournalEntry> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as Record<string, JournalEntry>;
  } catch (err) {
    console.error("Falha ao carregar diário do localStorage:", err);
    return {};
  }
}

function persistStorage(data: Record<string, JournalEntry>) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (err) {
    console.error("Falha ao salvar diário no localStorage:", err);
  }
}

export function useJournalData() {
  const [entriesMap, setEntriesMap] = useState<Record<string, JournalEntry>>(() => loadStorage());
  const [selectedDate, setSelectedDate] = useState<Date>(() => new Date());

  // Listen to cross-tab storage changes
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        try {
          setEntriesMap(JSON.parse(e.newValue));
        } catch {
          // ignore parsing error
        }
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const getEntry = useCallback(
    (dateKey: string): JournalEntry | undefined => {
      return entriesMap[dateKey];
    },
    [entriesMap]
  );

  const hasEntry = useCallback(
    (dateKey: string): boolean => {
      const e = entriesMap[dateKey];
      if (!e) return false;
      return Boolean(
        e.content?.trim() ||
        e.winOfTheDay?.trim() ||
        e.betoExcuseDestroyed?.trim() ||
        (e.tags && e.tags.length > 0)
      );
    },
    [entriesMap]
  );

  const saveEntry = useCallback(
    (dateKey: string, partial: Partial<JournalEntry>) => {
      setEntriesMap((prev) => {
        const existing = prev[dateKey];
        const updated: JournalEntry = {
          date: dateKey,
          content: partial.content ?? existing?.content ?? "",
          winOfTheDay: partial.winOfTheDay ?? existing?.winOfTheDay ?? "",
          betoExcuseDestroyed: partial.betoExcuseDestroyed ?? existing?.betoExcuseDestroyed ?? "",
          tags: partial.tags ?? existing?.tags ?? [],
          completionSnapshot: partial.completionSnapshot ?? existing?.completionSnapshot ?? 0,
          stageSnapshot: partial.stageSnapshot ?? existing?.stageSnapshot ?? "doomer",
          updatedAt: new Date().toISOString(),
        };

        const nextMap = { ...prev, [dateKey]: updated };
        persistStorage(nextMap);
        return nextMap;
      });
    },
    []
  );

  const deleteEntry = useCallback((dateKey: string) => {
    setEntriesMap((prev) => {
      const nextMap = { ...prev };
      delete nextMap[dateKey];
      persistStorage(nextMap);
      return nextMap;
    });
  }, []);

  const allEntries = useMemo(() => {
    return Object.values(entriesMap)
      .filter((e) =>
        Boolean(
          e.content?.trim() ||
          e.winOfTheDay?.trim() ||
          e.betoExcuseDestroyed?.trim() ||
          (e.tags && e.tags.length > 0)
        )
      )
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [entriesMap]);

  const getMonthEntries = useCallback(
    (month: Date): JournalEntry[] => {
      return allEntries.filter((e) => {
        try {
          const d = parseISO(e.date);
          return isSameMonth(d, month);
        } catch {
          return false;
        }
      });
    },
    [allEntries]
  );

  return {
    selectedDate,
    setSelectedDate,
    getEntry,
    hasEntry,
    saveEntry,
    deleteEntry,
    getMonthEntries,
    allEntries,
  };
}
