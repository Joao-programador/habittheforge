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
      "It's over...",
      "Nothing ever happens.",
      "I know that feel, bro.",
      "Acabou. It's over pro beto.",
      "Não sobrou absolutamente nada pro beto.",
      "Hoje está simplesmente intankável.",
      "Mais um dia preso na wagie cage...",
      "Billions must procrastinate.",
      "Born to dilly-dally, forced to lock in.",
      "Tfw você olha pra tabela de hábitos e ela olha de volta pra você.",
      "O beto acordou, olhou pro teto por 40 minutos e já cansou.",
      "Realidade brutal: o tempo tá passando e o beto continua parado.",
      "Why are we still here? Just to suffer?",
      "O sol nasceu, mas na mente do beto continua sendo 3h da manhã de uma terça-feira chuvosa.",
      "No habits? No discipline? No aura? It's over.",
      "Mais um dia sendo moggado pela própria preguiça.",
      "Blackpill da rotina: ninguém vem salvar o beto.",
      "Olhando pro nada e pensando em tudo que eu deveria ter feito hoje.",
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
      "Só mais um Reels mano, eu juro que começo às 20h00 em ponto!",
      "Ah não, agora são 20h03, vou ter que esperar dar 21h00 pra começar!",
      "Espera... eu realmente tenho que fazer esforço?!",
      "Fiz 25% das metas hoje! Já mereço 6 horas de videogame e um iFood!",
      "Mentalidade de beto em ação: deixando tudo pra 'segunda-feira que vem'.",
      "OMG HECKIN' VALID EFFORT! Fiz um hábito só, já conta como dia produtivo né?!",
      "Vou assistir mais 4 vídeos sobre como parar de procrastinar antes de começar!",
      "Don't ask questions, just consoom TikTok and get excited for next TikTok.",
      "O namorado da minha esposa disse que 30% de conclusão já tá ótimo pra mim!",
      "Como assim beber água pura?! Cadê meu energético de melancia zero?!",
      "Comprei 5 cursos e 3 cadernos novos, agora sim o beto vai estudar!",
      "Marcar o hábito sem ter feito conta como manifestação quântica?!",
      "Alguém me dá um biscoito, eu consegui levantar da cama antes do meio-dia!",
      "Soy diet completa: 3 horas de Shorts, zero sol e costas curvadas.",
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
      "Lock in. Step by Step.",
      "Reject weakness, embrace routine.",
      "Silêncio. O homem está deixando de ser beto.",
      "Saindo da matrix um hábito por vez.",
      "O espírito de beto tentou negociar, mas o dever falou mais alto.",
      "Metade do caminho. Sem choro, sem plateia, só execução.",
      "The grind never stops. Continua marcando essas caixas.",
      "A dor da disciplina pesa gramas; a dor de continuar sendo um beto pesa toneladas.",
      "Monk mode ativado. Notificações silenciadas.",
      "Ainda não é o topo, mas já estamos longe do fundo do poço.",
      "Foco frio. Deixando a dopamina barata pros fracos.",
      "You mirin' the consistency, brah?",
      "50%+ concluído. O cérebro já entendeu quem manda aqui.",
      "É fácil pra quem tem ódio.",
      "It's grind season, bro.",
      "One must imagine Wojak disciplined.",
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
      "Paz interior desbloqueada. Sem doomscrolling hoje.",
      "A vida é simples: beber água, bater metas e pegar sol.",
      "Dopamina natural batendo forte. Que sensação absurda.",
      "O beto interior morreu; nasceu um homem em paz com a própria rotina.",
      "Quase 100%. Respira fundo e aprecia a jornada, irmão.",
      "Serotonina limpa: treino feito, água em dia e consciência tranquila.",
      "Olha esse gráfico subindo. It's a good life.",
      "Sem pressa, sem ansiedade, apenas constância implacável.",
      "O sol brilha diferente pra quem cumpre a própria palavra.",
      "Enjoying the little things. Só falta um detalhe pro 100%.",
      "Mente blindada, rotina em dia. Nada tira minha paz hoje.",
      "Touched grass, lifted heavy, drank water. Life is good.",
      "80%+ concluído. Aquele sono dos justos hoje tá garantido.",
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
      "Fiño, senhores. Energia de Alfredo.",
      "Moggando a procrastinação.",
      "Motivação é coisa de beto. Aqui é disciplina pura e cristalina.",
      "Average 'faço quando der' fan vs. Average '100% todo santo dia' Enjoyer.",
      "Aura máxima atingida. Os deuses do Olimpo aprovam este dashboard.",
      "Disciplina tão afiada quanto o maxilar.",
      "> olha pra lista de tarefas > destrói todas > dorme 8 horas em paz.",
      "Não existe dia ruim para quem domina a própria mente. 100%.",
      "Procrastinação? Desconheço essa palavra no meu vocabulário.",
      "100% concluído. Você oficialmente moggou a sua versão de ontem.",
      "Weak men create excuses. Strong men check all the boxes.",
      "Hoje o beto nem ousou aparecer. Domínio total.",
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
