import { format, subDays } from "date-fns";
import type { Habit, Completion } from "@/hooks/useHabitsData";

export interface WojakStage {
  id: "doomer" | "soyjak" | "wojak" | "bloomer" | "gigachad";
  title: string;
  subtitle: string;
  minPercent: number;
  maxPercent: number;
  imageUrl: string;
  glowClass: string;
  borderClass: string;
  badgeColor: string;
  quotes: string[];
}

export const WOJAK_STAGES: WojakStage[] = [
  {
    id: "doomer",
    title: "Withered Doomer",
    subtitle: "0% - 19% Concluído",
    minPercent: 0,
    maxPercent: 19,
    imageUrl: "/assets/wojaks/doomer.png",
    glowClass: "from-zinc-600/15 via-slate-900/30 to-black/40",
    borderClass: "border-zinc-700/40",
    badgeColor: "bg-zinc-800/80 text-zinc-400 border-zinc-700/60",
    quotes: [
      "It's so over...",
      "Nothing ever happens.",
      "I know that feel, bro.",
      "Acabou. It's over pro beto.",
      "Zero disciplina hoje. Simplesmente intankável.",
      "Mais um dia preso na wagie cage...",
      "Não sobrou absolutamente nada pro beto.",
    ],
  },
  {
    id: "soyjak",
    title: "Crying Soyjak",
    subtitle: "20% - 49% Concluído",
    minPercent: 20,
    maxPercent: 49,
    imageUrl: "/assets/wojaks/soyjak.png",
    glowClass: "from-red-500/15 via-orange-500/10 to-transparent",
    borderClass: "border-red-500/30",
    badgeColor: "bg-red-500/15 text-red-300 border-red-500/30",
    quotes: [
      "I MUST CONSOOM DOPAMINE!",
      "NÃÃÃO! Você não pode simplesmente ter disciplina todos os dias!",
      "Só mais um Reels mano, eu juro que começo às 20h!",
      "Espera... eu realmente tenho que fazer esforço?!",
      "Fiz 30% das metas hoje! Mereço 4 horas de descanso!",
      "Mentalidade de beto em ação: deixando tudo pra amanhã.",
    ],
  },
  {
    id: "wojak",
    title: "Locked-In Wojak",
    subtitle: "50% - 79% Concluído",
    minPercent: 50,
    maxPercent: 79,
    imageUrl: "/assets/wojaks/wojak.png",
    glowClass: "from-blue-500/20 via-indigo-500/15 to-transparent",
    borderClass: "border-blue-500/30",
    badgeColor: "bg-blue-500/15 text-blue-300 border-blue-500/30",
    quotes: [
      "We're so back.",
      "We're all gonna make it, brahs.",
      "Lock in. Tijolo por tijolo.",
      "Rejeite a modernidade, abrace a rotina.",
      "Silêncio. O homem está deixando de ser beto e forjando o caráter.",
      "Saindo da matrix um hábito por vez.",
    ],
  },
  {
    id: "bloomer",
    title: "Sunlit Bloomer",
    subtitle: "80% - 99% Concluído",
    minPercent: 80,
    maxPercent: 99,
    imageUrl: "/assets/wojaks/bloomer.png",
    glowClass: "from-emerald-400/20 via-cyan-500/15 to-transparent",
    borderClass: "border-emerald-400/30",
    badgeColor: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
    quotes: [
      "Feels good man.",
      "Nature is healing. Hora de tocar na grama.",
      "Hopepill tomada. Hoje foi um grande dia.",
      "Paz interior desbloqueada. Zero doomscrolling hoje.",
      "A vida é simples: beber água, bater metas e pegar sol.",
    ],
  },
  {
    id: "gigachad",
    title: "Nordic GigaChad",
    subtitle: "100% Concluído — Aura Máxima",
    minPercent: 100,
    maxPercent: 100,
    imageUrl: "/assets/wojaks/gigachad.png",
    glowClass: "from-amber-400/25 via-yellow-500/15 to-purple-600/20",
    borderClass: "border-amber-400/50",
    badgeColor: "bg-amber-500/20 text-amber-300 border-amber-400/50",
    quotes: [
      "Yes.",
      "Average Disciplina Enjoyer.",
      "> acorda > conclui 100% dos hábitos > se recusa a elaborar > vai embora.",
      "Sim, eu concluí todas as minhas metas hoje. Como descobriu?",
      "Can you feel my heart?",
      "Fino, senhores. 100% forjado. Zero energia de beto.",
    ],
  },
];

/**
 * Checks if Penalty Mode (Penalidade do Beto) should be triggered.
 * Condition: Habits exist and 0% completion on both subDays(1) and subDays(2).
 */
export function checkHasStreakPenalty(
  habits: Habit[],
  completions: Completion[],
  today: Date = new Date()
): boolean {
  if (!habits.length) return false;

  // Evita penalizar usuários que criaram hábitos há menos de 2 dias
  const d2Date = subDays(today, 2);
  const hasOlderHabits = habits.some((h) => h.created_at && new Date(h.created_at) <= d2Date);
  if (!hasOlderHabits && completions.length === 0) return false;

  const fmt = (d: Date) => format(d, "yyyy-MM-dd");
  const d1 = fmt(subDays(today, 1));
  const d2 = fmt(d2Date);

  const habitIds = new Set(habits.map((h) => h.id));
  const d1Count = completions.filter((c) => c.date === d1 && habitIds.has(c.habit_id)).length;
  const d2Count = completions.filter((c) => c.date === d2 && habitIds.has(c.habit_id)).length;

  return d1Count === 0 && d2Count === 0;
}

/**
 * Returns the current stage based on today's completion percentage and penalty status.
 */
export function getWojakStage(percentage: number, isPenaltyActive: boolean = false): WojakStage {
  if (isPenaltyActive) {
    return WOJAK_STAGES[0]; // Locked into Doomer
  }

  const clamped = Math.max(0, Math.min(100, Math.round(percentage)));
  const stage = WOJAK_STAGES.find((s) => clamped >= s.minPercent && clamped <= s.maxPercent);
  return stage ?? WOJAK_STAGES[0];
}
