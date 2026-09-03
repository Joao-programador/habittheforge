import { useCallback } from "react";
import { createCloudStore } from "@/lib/cloudStore";

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

const uid = () =>
  (typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2)) as string;

export function newStep(partial?: Partial<WorkflowStep>): WorkflowStep {
  return { id: uid(), title: "", ...partial };
}

const store = createCloudStore<Workflow>(
  "workflows",
  (r) => ({
    id: r.id,
    title: r.title,
    steps: (r.steps ?? []) as WorkflowStep[],
    createdAt: new Date(r.created_at).getTime(),
    updatedAt: new Date(r.updated_at).getTime(),
  }),
  { column: "updated_at", ascending: false },
  (a, b) => b.updatedAt - a.updatedAt
);

export function useWorkflows() {
  const workflows = store.useItems();

  const createWorkflow = useCallback((data: { title: string; steps: WorkflowStep[] }) => {
    void store.insert({ title: data.title.trim() || "Sem título", steps: data.steps });
  }, []);

  const updateWorkflow = useCallback(
    (id: string, patch: Partial<Pick<Workflow, "title" | "steps">>) => {
      void store.update(id, patch as Record<string, unknown>, {
        ...patch,
        updatedAt: Date.now(),
      });
    },
    []
  );

  const deleteWorkflow = useCallback((id: string) => {
    void store.remove(id);
  }, []);

  return { workflows, createWorkflow, updateWorkflow, deleteWorkflow };
}
