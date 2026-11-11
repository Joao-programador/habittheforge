import { useState, useEffect, useCallback, useMemo } from "react";
import { format } from "date-fns";

export interface WaterLogItem {
  id: string;
  amountMl: number;
  timestamp: string; // HH:mm
}

export interface DailyWaterRecord {
  date: string; // YYYY-MM-DD
  intakeMl: number;
  goalMl: number;
  logs: WaterLogItem[];
  updatedAt: string;
}

interface WaterStorageState {
  defaultGoalMl: number;
  records: Record<string, DailyWaterRecord>;
}

const STORAGE_KEY = "ascend_water_v1";
const DEFAULT_GOAL_ML = 3000;

function loadWaterStorage(): WaterStorageState {
  if (typeof window === "undefined") {
    return { defaultGoalMl: DEFAULT_GOAL_ML, records: {} };
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { defaultGoalMl: DEFAULT_GOAL_ML, records: {} };
    const parsed = JSON.parse(raw);
    return {
      defaultGoalMl: parsed.defaultGoalMl || DEFAULT_GOAL_ML,
      records: parsed.records || {},
    };
  } catch {
    return { defaultGoalMl: DEFAULT_GOAL_ML, records: {} };
  }
}

function saveWaterStorage(state: WaterStorageState) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (err) {
    console.error("Falha ao salvar dados de hidratação:", err);
  }
}

export function useWaterData(selectedDate: Date = new Date()) {
  const [state, setState] = useState<WaterStorageState>(() => loadWaterStorage());
  const dateKey = useMemo(() => format(selectedDate, "yyyy-MM-dd"), [selectedDate]);

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        try {
          setState(JSON.parse(e.newValue));
        } catch {
          // ignore invalid JSON
        }
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const currentRecord: DailyWaterRecord = useMemo(() => {
    const existing = state.records[dateKey];
    if (existing) return existing;
    return {
      date: dateKey,
      intakeMl: 0,
      goalMl: state.defaultGoalMl,
      logs: [],
      updatedAt: new Date().toISOString(),
    };
  }, [state, dateKey]);

  const percentage = useMemo(() => {
    if (currentRecord.goalMl <= 0) return 0;
    return Math.round((currentRecord.intakeMl / currentRecord.goalMl) * 100);
  }, [currentRecord]);

  const addWater = useCallback(
    (amountMl: number) => {
      setState((prev) => {
        const existing = prev.records[dateKey] || {
          date: dateKey,
          intakeMl: 0,
          goalMl: prev.defaultGoalMl,
          logs: [],
          updatedAt: new Date().toISOString(),
        };

        const nextIntake = Math.max(0, Math.min(10000, existing.intakeMl + amountMl));
        const nowStr = format(new Date(), "HH:mm");

        const nextLogs =
          amountMl > 0
            ? [
                {
                  id: `${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
                  amountMl,
                  timestamp: nowStr,
                },
                ...existing.logs.slice(0, 19),
              ]
            : existing.logs.slice(1);

        const nextState: WaterStorageState = {
          ...prev,
          records: {
            ...prev.records,
            [dateKey]: {
              ...existing,
              intakeMl: nextIntake,
              logs: nextLogs,
              updatedAt: new Date().toISOString(),
            },
          },
        };
        saveWaterStorage(nextState);
        return nextState;
      });
    },
    [dateKey]
  );

  const setGoalMl = useCallback(
    (newGoalMl: number) => {
      const clamped = Math.max(1000, Math.min(8000, Math.round(newGoalMl / 250) * 250));
      setState((prev) => {
        const existing = prev.records[dateKey];
        const nextState: WaterStorageState = {
          defaultGoalMl: clamped,
          records: {
            ...prev.records,
            [dateKey]: {
              date: dateKey,
              intakeMl: existing?.intakeMl ?? 0,
              goalMl: clamped,
              logs: existing?.logs ?? [],
              updatedAt: new Date().toISOString(),
            },
          },
        };
        saveWaterStorage(nextState);
        return nextState;
      });
    },
    [dateKey]
  );

  const resetDay = useCallback(() => {
    setState((prev) => {
      const existing = prev.records[dateKey];
      if (!existing) return prev;
      const nextState: WaterStorageState = {
        ...prev,
        records: {
          ...prev.records,
          [dateKey]: {
            ...existing,
            intakeMl: 0,
            logs: [],
            updatedAt: new Date().toISOString(),
          },
        },
      };
      saveWaterStorage(nextState);
      return nextState;
    });
  }, [dateKey]);

  return {
    intakeMl: currentRecord.intakeMl,
    goalMl: currentRecord.goalMl,
    logs: currentRecord.logs,
    percentage,
    addWater,
    setGoalMl,
    resetDay,
  };
}
