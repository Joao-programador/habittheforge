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
  return () => authListeners.delete(l);
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

  const localKey = (uid: string) => `forge_store_${table}_${uid}`;

  function getLocal(uid: string): T[] {
    try {
      const raw = localStorage.getItem(localKey(uid));
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  function setLocal(uid: string, list: T[]) {
    try {
      localStorage.setItem(localKey(uid), JSON.stringify(list));
    } catch {}
  }

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
      console.warn(`[${table}] load fallback to local`, error.message);
      items = sort(getLocal(uid));
      isLoaded = true;
      notify();
      return;
    }
    items = sort(((data ?? []) as Record<string, any>[]).map(map));
    setLocal(uid, items);
    isLoaded = true;
    notify();
  }

  let channelTable: ReturnType<typeof supabase.channel> | null = null;
  onUserChange((uid) => {
    if (channelTable) {
      supabase.removeChannel(channelTable);
      channelTable = null;
    }
    if (!uid) {
      items = [];
      isLoaded = false;
      notify();
      return;
    }
    void reload();
    try {
      channelTable = supabase
        .channel(`realtime-${table}`)
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table, filter: `user_id=eq.${uid}` },
          () => void reload()
        )
        .subscribe();
    } catch {}
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
      let { data, error } = await supabase
        .from(table as never)
        .insert({ ...row, user_id: uid } as never)
        .select()
        .single();

      // Schema mismatch fallback (e.g. color or name missing in schema)
      if (error && error.code === "PGRST204") {
        const fallbackRow: Record<string, unknown> = {
          user_id: uid,
          title: (row as any).name ?? (row as any).title,
          description: (row as any).description ?? JSON.stringify({ emoji: (row as any).emoji, color: (row as any).color }),
        };
        const retry = await supabase.from(table as never).insert(fallbackRow as never).select().single();
        data = retry.data;
        error = retry.error;
      }

      if (error) {
        console.warn(`[${table}] insert fallback to local`, error.message);
        const fallbackItem = map({
          id: (row as any).id ?? `local_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
          created_at: new Date().toISOString(),
          ...row
        });
        items = sort([...items, fallbackItem]);
        setLocal(uid, items);
        notify();
        return fallbackItem;
      }

      const item = map(data as Record<string, any>);
      items = sort([...items, item]);
      setLocal(uid, items);
      notify();
      return item;
    },
    async update(id, dbPatch, localPatch) {
      const uid = getCurrentUserId();
      const patch = (localPatch ?? (dbPatch as Partial<T>)) as Partial<T>;
      items = sort(items.map((i) => (i.id === id ? { ...i, ...patch } : i)));
      if (uid) setLocal(uid, items);
      notify();
      const { error } = await supabase
        .from(table as never)
        .update(dbPatch as never)
        .eq("id", id);
      if (error) {
        console.warn(`[${table}] update remote error`, error.message);
      }
    },
    async remove(id) {
      const uid = getCurrentUserId();
      items = items.filter((i) => i.id !== id);
      if (uid) setLocal(uid, items);
      notify();
      const { error } = await supabase.from(table as never).delete().eq("id", id);
      if (error) {
        console.warn(`[${table}] delete remote error`, error.message);
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
