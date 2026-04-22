import { useHabitsData } from "@/hooks/useHabitsData";
import { BADGE_LIST, BADGE_DEFS } from "@/data/badges";
import { motion } from "framer-motion";
import { Lock } from "lucide-react";

export function BadgesPanel() {
  const { badges } = useHabitsData();
  const unlockedKeys = new Set(badges.map((b) => b.badge_key));

  return (
    <div className="surface-card p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-display text-lg">Conquistas</h3>
          <p className="text-xs text-muted-foreground uppercase tracking-widest">
            {unlockedKeys.size} de {BADGE_LIST.length} desbloqueadas
          </p>
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {BADGE_LIST.map((b, i) => {
          const unlocked = unlockedKeys.has(b.key);
          const Icon = b.icon;
          return (
            <motion.div
              key={b.key}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              className={`relative aspect-square rounded-xl border p-3 flex flex-col items-center justify-center text-center transition-all ${
                unlocked
                  ? "border-primary/40 bg-gradient-to-br from-primary/15 to-primary-glow/5 glow-primary"
                  : "border-border/40 bg-secondary/30 grayscale opacity-60"
              }`}
              title={b.description}
            >
              {unlocked ? (
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 200, damping: 12 }}
                >
                  <Icon className="w-7 h-7 mb-1" style={{ color: b.color }} strokeWidth={2.2} />
                </motion.div>
              ) : (
                <Lock className="w-6 h-6 mb-1 text-muted-foreground" />
              )}
              <div className="text-[10px] font-bold uppercase tracking-wider leading-tight">{b.name}</div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
