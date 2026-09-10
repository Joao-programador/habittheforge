import { useHabitsData } from "@/hooks/useHabitsData";
import { getCompletionPercentage, getDailyCompletionRate, getMonthCompletionsAll, getStreak } from "@/lib/stats";
import { motion } from "framer-motion";
import { Flame, Trophy, TrendingUp, Target, Activity } from "lucide-react";
import { AreaChart, Area, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts";

interface Props { currentMonth: Date; }

export function StatsPanel({ currentMonth }: Props) {
  const { habits, completions, badges } = useHabitsData();
  const today = new Date();
  const pct = getCompletionPercentage(habits, completions, currentMonth);
  const totalChecks = getMonthCompletionsAll(completions, currentMonth);
  const bestStreak = habits.length
    ? Math.max(...habits.map((h) => getStreak(h.id, completions, today)))
    : 0;
  const chartData = getDailyCompletionRate(habits, completions, currentMonth);

  const stats = [
    { label: "Conclusão", value: `${pct}%`, icon: Target, color: "from-indigo-500 to-purple-500" },
    { label: "Total checks", value: totalChecks, icon: TrendingUp, color: "from-cyan-500 to-blue-500" },
    { label: "Melhor streak", value: `${bestStreak}d`, icon: Flame, color: "from-orange-500 to-red-500" },
    { label: "Conquistas", value: badges.length, icon: Trophy, color: "from-amber-400 to-yellow-500" },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className="surface-card p-4 relative overflow-hidden group"
          >
            <div className={`absolute -top-6 -right-6 w-20 h-20 rounded-full bg-gradient-to-br ${s.color} opacity-15 blur-2xl group-hover:opacity-30 transition-opacity`} />
            <s.icon className="w-4 h-4 text-muted-foreground mb-2" />
            <div className="font-display text-3xl tracking-tight">{s.value}</div>
            <div className="text-xs uppercase tracking-widest text-muted-foreground mt-1">{s.label}</div>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="surface-card p-4 md:p-5 flex flex-col justify-center"
      >
        <h3 className="text-sm font-semibold tracking-tight text-muted-foreground uppercase flex items-center gap-2 mb-4">
          <Activity className="w-4 h-4" /> Desempenho
        </h3>
        <div className="h-[200px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="colorPerc" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="date"
                tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => v.split("-")[2]}
              />
              <YAxis
                tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                tickLine={false}
                axisLine={false}
                domain={[0, 100]}
                width={32}
              />
              <Tooltip
                contentStyle={{
                  background: "hsl(var(--popover))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: 12,
                  fontSize: 12,
                }}
                formatter={(v: number) => [`${v}%`, "Conclusão"]}
              />
              <Area
                type="monotone"
                dataKey="rate"
                stroke="hsl(var(--primary))"
                strokeWidth={2.5}
                fill="url(#colorPerc)"
                animationDuration={800}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>
    </div>
  );
}
