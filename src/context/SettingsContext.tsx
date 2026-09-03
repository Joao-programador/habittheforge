import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getCurrentUserId, onUserChange } from "@/lib/cloudStore";

interface Settings {
  dark_mode: boolean;
  primary_color: string;
  accent_color: string;
}

interface SettingsContextValue extends Settings {
  update: (patch: Partial<Settings>) => void;
}

const DEFAULTS: Settings = {
  dark_mode: true,
  primary_color: "#4f46e5",
  accent_color: "#818cf8",
};

const SettingsContext = createContext<SettingsContextValue | undefined>(undefined);

function hexToHslString(hex: string): string {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16) / 255;
  const g = parseInt(h.slice(2, 4), 16) / 255;
  const b = parseInt(h.slice(4, 6), 16) / 255;
  const max = Math.max(r, g, b),
    min = Math.min(r, g, b);
  let hh = 0,
    s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        hh = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        hh = (b - r) / d + 2;
        break;
      case b:
        hh = (r - g) / d + 4;
        break;
    }
    hh /= 6;
  }
  return `${Math.round(hh * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
  const [settings, setSettings] = useState<Settings>(DEFAULTS);

  useEffect(() => {
    const load = async (uid: string | null) => {
      if (!uid) {
        setSettings(DEFAULTS);
        return;
      }
      const { data } = await supabase
        .from("user_settings")
        .select("dark_mode, primary_color, accent_color")
        .eq("user_id", uid)
        .maybeSingle();
      if (data) setSettings({ ...DEFAULTS, ...data });
    };
    void load(getCurrentUserId());
    const off = onUserChange((uid) => void load(uid));
    return () => {
      off();
    };

  }, []);

  useEffect(() => {
    const root = document.documentElement;
    if (settings.dark_mode) root.classList.remove("light");
    else root.classList.add("light");
    root.style.setProperty("--primary", hexToHslString(settings.primary_color));
    root.style.setProperty("--ring", hexToHslString(settings.primary_color));
    root.style.setProperty("--accent", hexToHslString(settings.primary_color));
    root.style.setProperty("--primary-glow", hexToHslString(settings.accent_color));
    root.style.setProperty("--sidebar-primary", hexToHslString(settings.primary_color));
  }, [settings]);

  const update = useCallback((patch: Partial<Settings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...patch };
      const uid = getCurrentUserId();
      if (uid) {
        void supabase
          .from("user_settings")
          .upsert({ user_id: uid, ...next }, { onConflict: "user_id" })
          .then(({ error }) => {
            if (error) console.error("[user_settings] save error", error.message);
          });
      }
      return next;
    });
  }, []);

  return <SettingsContext.Provider value={{ ...settings, update }}>{children}</SettingsContext.Provider>;
};

export const useSettings = () => {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useSettings must be inside SettingsProvider");
  return ctx;
};
