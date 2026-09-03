import { useCallback } from "react";
import { parseISO, isSameDay } from "date-fns";
import { createCloudStore } from "@/lib/cloudStore";

export interface Todo {
  id: string;
  title: string;
  notes?: string;
  due_date: string | null; // YYYY-MM-DD or null
  completed: boolean;
  color: string;
  created_at: string;
  completed_at?: string | null;
}

const store = createCloudStore<Todo>(
  "todos",
  (r) => ({
    id: r.id,
    title: r.title,
    notes: r.notes ?? undefined,
    due_date: r.due_date,
    completed: r.completed,
    color: r.color,
    created_at: r.created_at,
    completed_at: r.completed_at,
  }),
  { column: "created_at", ascending: false },
  (a, b) => (a.created_at < b.created_at ? 1 : -1)
);

export function getTodosForDay(todos: Todo[], date: Date): Todo[] {
  return todos.filter((t) => t.due_date && isSameDay(parseISO(t.due_date), date));
}

export function useTodos() {
  const todos = store.useItems();

  const addTodo = useCallback(
    (data: { title: string; due_date?: string | null; notes?: string; color?: string }) => {
      void store.insert({
        title: data.title.trim(),
        notes: data.notes ?? null,
        due_date: data.due_date ?? null,
        color: data.color ?? "#818cf8",
        completed: false,
      });
    },
    []
  );

  const updateTodo = useCallback((id: string, patch: Partial<Todo>) => {
    const db: Record<string, unknown> = {};
    if (patch.title !== undefined) db.title = patch.title;
    if (patch.notes !== undefined) db.notes = patch.notes ?? null;
    if (patch.due_date !== undefined) db.due_date = patch.due_date;
    if (patch.color !== undefined) db.color = patch.color;
    if (patch.completed !== undefined) db.completed = patch.completed;
    if (patch.completed_at !== undefined) db.completed_at = patch.completed_at;
    void store.update(id, db, patch);
  }, []);

  const toggleTodo = useCallback((id: string) => {
    const t = store.get().find((x) => x.id === id);
    if (!t) return;
    const completed = !t.completed;
    const completed_at = completed ? new Date().toISOString() : null;
    void store.update(id, { completed, completed_at }, { completed, completed_at });
  }, []);

  const deleteTodo = useCallback((id: string) => {
    void store.remove(id);
  }, []);

  return { todos, addTodo, updateTodo, toggleTodo, deleteTodo };
}
