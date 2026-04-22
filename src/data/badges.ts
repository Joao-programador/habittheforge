import { Trophy, Flame, Zap, Star, Crown, Target, Sparkles, Award } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface BadgeDef {
  key: string;
  name: string;
  description: string;
  icon: LucideIcon;
  color: string;
  threshold?: number;
}

export const BADGE_DEFS: Record<string, BadgeDef> = {
  first_check: {
    key: "first_check",
    name: "Primeiro Passo",
    description: "Sua primeira conclusão. A jornada começou.",
    icon: Sparkles,
    color: "#a78bfa",
  },
  streak_7: {
    key: "streak_7",
    name: "Uma Semana de Pé",
    description: "7 dias consecutivos. Hábito formando.",
    icon: Flame,
    color: "#f59e0b",
    threshold: 7,
  },
  streak_14: {
    key: "streak_14",
    name: "Quinzena de Aço",
    description: "14 dias seguidos. Você não para.",
    icon: Zap,
    color: "#facc15",
    threshold: 14,
  },
  streak_21: {
    key: "streak_21",
    name: "21 Dias — Hábito Forjado",
    description: "Ciência confirma: agora é parte de você.",
    icon: Target,
    color: "#fb923c",
    threshold: 21,
  },
  streak_30: {
    key: "streak_30",
    name: "Mês Perfeito",
    description: "30 dias. Disciplina inabalável.",
    icon: Trophy,
    color: "#fbbf24",
    threshold: 30,
  },
  streak_60: {
    key: "streak_60",
    name: "Lenda Viva",
    description: "60 dias. Poucos chegam aqui.",
    icon: Crown,
    color: "#fde047",
    threshold: 60,
  },
  perfect_day: {
    key: "perfect_day",
    name: "Dia Perfeito",
    description: "Todos os hábitos completados em um único dia.",
    icon: Star,
    color: "#4f46e5",
  },
  month_warrior: {
    key: "month_warrior",
    name: "Guerreiro do Mês",
    description: "100 checks em um mês.",
    icon: Award,
    color: "#06b6d4",
  },
};

export const BADGE_LIST = Object.values(BADGE_DEFS);
