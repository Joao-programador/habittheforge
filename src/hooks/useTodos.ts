import { useCallback, useEffect, useState } from "react";
import { format, parseISO, isSameDay } from "date-fns";

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

const KEY = "forge-todos";

function load(): Todo[] {
  try {
    const v = localStorage.getItem(KEY);
    return v ? (JSON.parse(v) as Todo[]) : [];
  } catch {
    return [];
  }
}
function persist(v: Todo[]) {
  localStorage.setItem(KEY, JSON.stringify(v));
}
const uid = () => crypto.randomUUID();

let _todos: Todo[] = load();
const listeners = new Set<() => void>();
const notify = () => listeners.forEach((l) => l());

export function getTodosForDay(todos: Todo[], date: Date): Todo[] {
  return todos.filter((t) => t.due_date && isSameDay(parseISO(t.due_date), date));
}

export function useTodos() {
  const [, force] = useState(0);
  useEffect(() => {
    const l = () => force((x) => x + 1);
    listeners.add(l);
    return () => {
      listeners.delete(l);
    };
  }, []);

  const addTodo = useCallback(
    (data: { title: string; due_date?: string | null; notes?: string; color?: string }) => {
      const t: Todo = {
        id: uid(),
        title: data.title.trim(),
        notes: data.notes,
        due_date: data.due_date ?? null,
        completed: false,
        color: data.color ?? "#818cf8",
        created_at: new Date().toISOString(),
      };
      _todos = [t, ..._todos];
      persist(_todos);
      notify();
      return t;
    },
    []
  );

  const updateTodo = useCallback((id: string, patch: Partial<Todo>) => {
    _todos = _todos.map((t) => (t.id === id ? { ...t, ...patch } : t));
    persist(_todos);
    notify();
  }, []);

  const toggleTodo = useCallback((id: string) => {
    _todos = _todos.map((t) =>
      t.id === id
        ? { ...t, completed: !t.completed, completed_at: !t.completed ? new Date().toISOString() : null }
        : t
    );
    persist(_todos);
    notify();
  }, []);

  const deleteTodo = useCallback((id: string) => {
    _todos = _todos.filter((t) => t.id !== id);
    persist(_todos);
    notify();
  }, []);

  return { todos: _todos, addTodo, updateTodo, toggleTodo, deleteTodo };
}
