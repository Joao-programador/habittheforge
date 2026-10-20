import { Trophy, Flame, Zap, Star, Crown, Target, Sparkles, Award, ShieldCheck, Sprout, Ban, Gem } from "lucide-react";
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
    description: "Sua primeira conclusão. A ascensão começou.",
    icon: Sparkles,
    color: "#a78bfa",
  },
  cura_do_beto: {
    key: "cura_do_beto",
    name: "Cura do Beto",
    description: "Concluiu pelo menos 1 hábito por 3 dias seguidos.",
    icon: ShieldCheck,
    color: "#10b981",
  },
  bloomer_grass: {
    key: "bloomer_grass",
    name: "Tocou na Grama (Bloomer)",
    description: "Atingiu 80%+ de conclusão em 5 dias do mês.",
    icon: Sprout,
    color: "#06b6d4",
  },
  zero_consoom: {
    key: "zero_consoom",
    name: "Zero Consoom",
    description: "Completou um dia inteiro em 100% pela primeira vez.",
    icon: Ban,
    color: "#8b5cf6",
  },
  gigachad_supremo: {
    key: "gigachad_supremo",
    name: "GigaChad Supremo",
    description: "Manteve 100% de conclusão por 7 dias seguidos.",
    icon: Gem,
    color: "#f59e0b",
  },
  streak_7: {
    key: "streak_7",
    name: "Uma Semana Locked-In",
    description: "7 dias consecutivos. O protocolo está criando raiz.",
    icon: Flame,
    color: "#f59e0b",
    threshold: 7,
  },
  streak_14: {
    key: "streak_14",
    name: "Quinzena Blindada",
    description: "14 dias seguidos. A inércia não te alcança mais.",
    icon: Zap,
    color: "#facc15",
    threshold: 14,
  },
  streak_21: {
    key: "streak_21",
    name: "21 Dias: Fora da Matrix",
    description: "A neurociência confirma: a rotina agora faz parte de quem você é.",
    icon: Target,
    color: "#fb923c",
    threshold: 21,
  },
  streak_30: {
    key: "streak_30",
    name: "Mês de Ascensão",
    description: "30 dias seguidos. Disciplina inabalável.",
    icon: Trophy,
    color: "#fbbf24",
    threshold: 30,
  },
  streak_60: {
    key: "streak_60",
    name: "Lenda Viva",
    description: "60 dias. Menos de 1% chegam neste nível.",
    icon: Crown,
    color: "#fde047",
    threshold: 60,
  },
  perfect_day: {
    key: "perfect_day",
    name: "Dia Perfeito",
    description: "Todos os hábitos concluídos em um único dia.",
    icon: Star,
    color: "#4f46e5",
  },
  month_warrior: {
    key: "month_warrior",
    name: "Dominador do Mês",
    description: "100 checks registrados em um único mês.",
    icon: Award,
    color: "#06b6d4",
  },
};

export const BADGE_LIST = Object.values(BADGE_DEFS);
