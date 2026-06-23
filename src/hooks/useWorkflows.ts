import { useEffect, useState, useCallback } from "react";

export interface WorkflowStep {
  id: string;
  title: string;
  notes?: string;
  estimatedMinutes?: number;
}

export interface Workflow {
  id: string;
  title: string;
  steps: WorkflowStep[];
  createdAt: number;
  updatedAt: number;
}

const KEY = "forge:workflows:v1";

function load(): Workflow[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    return JSON.parse(raw) as Workflow[];
  } catch {
    return [];
  }
}

function save(list: Workflow[]) {
  localStorage.setItem(KEY, JSON.stringify(list));
}

const uid = () =>
  (typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2)) as string;

export function newStep(partial?: Partial<WorkflowStep>): WorkflowStep {
  return { id: uid(), title: "", ...partial };
}

export function useWorkflows() {
  const [workflows, setWorkflows] = useState<Workflow[]>(() => load());

  useEffect(() => {
    save(workflows);
  }, [workflows]);

  const createWorkflow = useCallback(
    (data: { title: string; steps: WorkflowStep[] }) => {
      const now = Date.now();
      const wf: Workflow = {
        id: uid(),
        title: data.title.trim() || "Sem título",
        steps: data.steps,
        createdAt: now,
        updatedAt: now,
      };
      setWorkflows((prev) => [wf, ...prev]);
      return wf;
    },
    [],
  );

  const updateWorkflow = useCallback(
    (id: string, patch: Partial<Pick<Workflow, "title" | "steps">>) => {
      setWorkflows((prev) =>
        prev.map((w) =>
          w.id === id ? { ...w, ...patch, updatedAt: Date.now() } : w,
        ),
      );
    },
    [],
  );

  const deleteWorkflow = useCallback((id: string) => {
    setWorkflows((prev) => prev.filter((w) => w.id !== id));
  }, []);

  return { workflows, createWorkflow, updateWorkflow, deleteWorkflow };
}
