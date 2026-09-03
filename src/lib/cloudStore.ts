import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

/** Current signed-in user id, kept in sync by AuthProvider. */
let currentUserId: string | null = null;
const authListeners = new Set<(id: string | null) => void>();

export function setCurrentUserId(id: string | null) {
  if (currentUserId === id) return;
  currentUserId = id;
  authListeners.forEach((l) => l(id));
}
export function getCurrentUserId() {
  return currentUserId;
}
export function onUserChange(l: (id: string | null) => void) {
  authListeners.add(l);
  return () => {
    authListeners.delete(l);
  };
}

type OrderBy = { column: string; ascending: boolean };

export interface CloudStore<T extends { id: string }> {
  get(): T[];
  loaded(): boolean;
  reload(): Promise<void>;
  subscribe(l: () => void): () => void;
  insert(row: Record<string, unknown>): Promise<T | null>;
  update(id: string, dbPatch: Record<string, unknown>, localPatch?: Partial<T>): Promise<void>;
  remove(id: string): Promise<void>;
  useItems(): T[];
}

export function createCloudStore<T extends { id: string }>(
  table: string,
  map: (row: Record<string, any>) => T,
  orderBy: OrderBy,
  sortLocal?: (a: T, b: T) => number
): CloudStore<T> {
  let items: T[] = [];
  let isLoaded = false;
  const listeners = new Set<() => void>();
  const notify = () => listeners.forEach((l) => l());
  const sort = (list: T[]) => (sortLocal ? [...list].sort(sortLocal) : list);

  async function reload() {
    const uid = getCurrentUserId();
    if (!uid) {
      items = [];
      isLoaded = false;
      notify();
      return;
    }
    const { data, error } = await supabase
      .from(table as never)
      .select("*")
      .order(orderBy.column, { ascending: orderBy.ascending });
    if (error) {
      console.error(`[${table}] load error`, error.message);
      return;
    }
    items = sort(((data ?? []) as Record<string, any>[]).map(map));
    isLoaded = true;
    notify();
  }

  let channel: ReturnType<typeof supabase.channel> | null = null;
  onUserChange((uid) => {
    if (channel) {
      void supabase.removeChannel(channel);
      channel = null;
    }
    if (!uid) {
      items = [];
      isLoaded = false;
      notify();
      return;
    }
    void reload();
    channel = supabase
      .channel(`realtime-${table}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table, filter: `user_id=eq.${uid}` },
        () => void reload()
      )
      .subscribe();
  });

  return {
    get: () => items,
    loaded: () => isLoaded,
    reload,
    subscribe(l) {
      listeners.add(l);
      return () => {
        listeners.delete(l);
      };
    },
    async insert(row) {
      const uid = getCurrentUserId();
      if (!uid) return null;
      const { data, error } = await supabase
        .from(table as never)
        .insert({ ...row, user_id: uid } as never)
        .select()
        .single();
      if (error) {
        console.error(`[${table}] insert error`, error.message);
        return null;
      }
      const item = map(data as Record<string, any>);
      items = sort([...items, item]);
      notify();
      return item;
    },
    async update(id, dbPatch, localPatch) {
      const patch = (localPatch ?? (dbPatch as Partial<T>)) as Partial<T>;
      items = sort(items.map((i) => (i.id === id ? { ...i, ...patch } : i)));
      notify();
      const { error } = await supabase
        .from(table as never)
        .update(dbPatch as never)
        .eq("id", id);
      if (error) {
        console.error(`[${table}] update error`, error.message);
        void reload();
      }
    },
    async remove(id) {
      items = items.filter((i) => i.id !== id);
      notify();
      const { error } = await supabase.from(table as never).delete().eq("id", id);
      if (error) {
        console.error(`[${table}] delete error`, error.message);
        void reload();
      }
    },
    useItems() {
      const [, force] = useState(0);
      useEffect(() => {
        const l = () => force((x) => x + 1);
        listeners.add(l);
        return () => {
          listeners.delete(l);
        };
      }, []);
      return items;
    },
  };
}
