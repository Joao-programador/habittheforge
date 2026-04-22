import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./AuthContext";

interface Settings {
  dark_mode: boolean;
  primary_color: string;
  accent_color: string;
}

interface SettingsContextValue extends Settings {
  update: (patch: Partial<Settings>) => Promise<void>;
}

const DEFAULTS: Settings = {
  dark_mode: true,
  primary_color: "#4f46e5",
  accent_color: "#818cf8",
};

const SettingsContext = createContext<SettingsContextValue | undefined>(undefined);

// Convert HEX to HSL string "H S% L%"
function hexToHslString(hex: string): string {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16) / 255;
  const g = parseInt(h.slice(2, 4), 16) / 255;
  const b = parseInt(h.slice(4, 6), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let hh = 0, s = 0; const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: hh = (g - b) / d + (g < b ? 6 : 0); break;
      case g: hh = (b - r) / d + 2; break;
      case b: hh = (r - g) / d + 4; break;
    }
    hh /= 6;
  }
  return `${Math.round(hh * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [settings, setSettings] = useState<Settings>(DEFAULTS);

  // Load from supabase or localStorage
  useEffect(() => {
    if (user) {
      supabase
        .from("user_settings")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle()
        .then(({ data }) => {
          if (data) {
            setSettings({
              dark_mode: data.dark_mode,
              primary_color: data.primary_color,
              accent_color: data.accent_color,
            });
          }
        });
    } else {
      const local = localStorage.getItem("forge-settings");
      if (local) {
        try { setSettings({ ...DEFAULTS, ...JSON.parse(local) }); } catch {}
      }
    }
  }, [user]);

  // Apply theme + colors to <html>
  useEffect(() => {
    const root = document.documentElement;
    if (settings.dark_mode) {
      root.classList.remove("light");
    } else {
      root.classList.add("light");
    }
    root.style.setProperty("--primary", hexToHslString(settings.primary_color));
    root.style.setProperty("--ring", hexToHslString(settings.primary_color));
    root.style.setProperty("--accent", hexToHslString(settings.primary_color));
    root.style.setProperty("--primary-glow", hexToHslString(settings.accent_color));
    root.style.setProperty("--sidebar-primary", hexToHslString(settings.primary_color));
  }, [settings]);

  const update = useCallback(async (patch: Partial<Settings>) => {
    const next = { ...settings, ...patch };
    setSettings(next);
    if (user) {
      await supabase.from("user_settings").upsert({
        user_id: user.id,
        ...next,
        updated_at: new Date().toISOString(),
      });
    } else {
      localStorage.setItem("forge-settings", JSON.stringify(next));
    }
  }, [settings, user]);

  return (
    <SettingsContext.Provider value={{ ...settings, update }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useSettings must be inside SettingsProvider");
  return ctx;
};
