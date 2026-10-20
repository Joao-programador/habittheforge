import { AppLayout } from "@/components/AppLayout";
import { BADGE_LIST } from "@/data/badges";
import { useHabitsData } from "@/hooks/useHabitsData";
import { format, parseISO } from "date-fns";
import { Lock } from "lucide-react";
import { motion } from "framer-motion";

export default function Achievements() {
  const { badges } = useHabitsData();
  const map = new Map(badges.map(b => [b.badge_key, b]));

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-4xl tracking-tight">Conquistas</h1>
          <p className="text-muted-foreground mt-1">
            {badges.length} de {BADGE_LIST.length} desbloqueadas: continue ascendendo.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {BADGE_LIST.map((b, i) => {
            const unlocked = map.get(b.key);
            const Icon = b.icon;
            return (
              <motion.div
                key={b.key}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`surface-card p-4 sm:p-6 text-center transition-all ${
                  unlocked ? "glow-primary" : "opacity-50 grayscale"
                }`}
              >
                <div
                  className="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-3"
                  style={{
                    background: unlocked ? `${b.color}20` : "hsl(var(--secondary))",
                    border: unlocked ? `1px solid ${b.color}55` : "1px solid hsl(var(--border))",
                  }}
                >
                  {unlocked ? (
                    <Icon className="w-8 h-8" style={{ color: b.color }} strokeWidth={2.2} />
                  ) : (
                    <Lock className="w-7 h-7 text-muted-foreground" />
                  )}
                </div>
                <h3 className="font-display text-base leading-tight tracking-tight mb-1">{b.name}</h3>
                <p className="text-xs text-muted-foreground leading-snug min-h-[2.5rem]">{b.description}</p>
                {unlocked && (
                  <div className="mt-3 text-[10px] font-mono text-primary uppercase tracking-widest">
                    {format(parseISO(unlocked.unlocked_at), "dd/MM/yyyy")}
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </AppLayout>
  );
}
