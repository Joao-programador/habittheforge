import { AppLayout } from "@/components/AppLayout";
import { BADGE_LIST } from "@/data/badges";
import { useHabitsData } from "@/hooks/useHabitsData";
import { format, parseISO } from "date-fns";
import { Lock } from "lucide-react";
import { motion } from "framer-motion";

export default function Achievements() {
  const { badges } = useHabitsData();
  const map = new Map(badges.map(b => [b.badge_key, b]));

  const progressPct = Math.round((badges.length / BADGE_LIST.length) * 100);

  return (
    <AppLayout>
      <div className="space-y-4 sm:space-y-6">
        <div className="space-y-2.5">
          <div>
            <h1 className="font-display text-2xl sm:text-4xl tracking-tight">Conquistas</h1>
            <p className="text-xs sm:text-base text-muted-foreground mt-0.5 sm:mt-1">
              {badges.length} de {BADGE_LIST.length} desbloqueadas: continue ascendendo.
            </p>
          </div>
          <div className="w-full max-w-md bg-secondary/50 rounded-full h-2 overflow-hidden border border-border/30">
            <div
              className="bg-gradient-primary h-full transition-all duration-500 rounded-full"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {BADGE_LIST.map((b, i) => {
            const unlocked = map.get(b.key);
            const Icon = b.icon;
            return (
              <motion.div
                key={b.key}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`surface-card p-3.5 sm:p-6 text-center transition-all ${
                  unlocked ? "glow-primary" : "opacity-50 grayscale"
                }`}
              >
                <div
                  className="w-12 h-12 sm:w-16 sm:h-16 mx-auto rounded-xl sm:rounded-2xl flex items-center justify-center mb-2 sm:mb-3"
                  style={{
                    background: unlocked ? `${b.color}20` : "hsl(var(--secondary))",
                    border: unlocked ? `1px solid ${b.color}55` : "1px solid hsl(var(--border))",
                  }}
                >
                  {unlocked ? (
                    <Icon className="w-6 h-6 sm:w-8 sm:h-8" style={{ color: b.color }} strokeWidth={2.2} />
                  ) : (
                    <Lock className="w-5 h-5 sm:w-7 sm:h-7 text-muted-foreground" />
                  )}
                </div>
                <h3 className="font-display text-sm sm:text-base leading-tight tracking-tight mb-1">{b.name}</h3>
                <p className="text-[11px] sm:text-xs text-muted-foreground leading-snug min-h-0 sm:min-h-[2.5rem]">{b.description}</p>
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
