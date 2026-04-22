import jsPDF from "jspdf";
import { format, startOfMonth, endOfMonth, eachDayOfInterval } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { Habit, Completion, BadgeRow } from "@/hooks/useHabitsData";
import { getStreak, getMonthCompletions, getCompletionPercentage, getMonthCompletionsAll } from "@/lib/stats";
import { getQuoteOfTheDay } from "@/data/quotes";
import { BADGE_DEFS } from "@/data/badges";

interface Args {
  month: Date;
  habits: Habit[];
  completions: Completion[];
  badges: BadgeRow[];
}

export async function exportMonthPDF({ month, habits, completions, badges }: Args) {
  const pdf = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });
  const W = pdf.internal.pageSize.getWidth();
  const H = pdf.internal.pageSize.getHeight();
  const M = 36;

  // Background dark
  pdf.setFillColor(10, 10, 26);
  pdf.rect(0, 0, W, H, "F");

  // Header
  pdf.setTextColor(255, 255, 255);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(28);
  pdf.text("FORGE", M, M + 10);
  pdf.setFontSize(11);
  pdf.setTextColor(180, 180, 220);
  pdf.text("Habit Tracker · Discipline · Iron", M, M + 26);

  pdf.setFontSize(20);
  pdf.setTextColor(129, 140, 248);
  pdf.text(format(month, "MMMM yyyy", { locale: ptBR }).toUpperCase(), W - M, M + 16, { align: "right" });

  // Quote
  const q = getQuoteOfTheDay();
  pdf.setFont("helvetica", "italic");
  pdf.setFontSize(10);
  pdf.setTextColor(200, 200, 230);
  const qLines = pdf.splitTextToSize(`"${q.text}" — ${q.author}`, W - M * 2);
  pdf.text(qLines, M, M + 50);

  // Stats
  let y = M + 80;
  const pct = getCompletionPercentage(habits, completions, month);
  const total = getMonthCompletionsAll(completions, month);
  const today = new Date();
  const bestStreak = habits.length ? Math.max(...habits.map(h => getStreak(h.id, completions, today))) : 0;

  const stats = [
    { l: "Conclusão", v: `${pct}%` },
    { l: "Total checks", v: String(total) },
    { l: "Melhor streak", v: `${bestStreak}d` },
    { l: "Hábitos ativos", v: String(habits.length) },
    { l: "Conquistas", v: String(badges.length) },
  ];
  const cardW = (W - M * 2 - 16) / stats.length;
  stats.forEach((s, i) => {
    const x = M + i * (cardW + 4);
    pdf.setFillColor(20, 20, 50);
    pdf.roundedRect(x, y, cardW, 60, 8, 8, "F");
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(20);
    pdf.setTextColor(255, 255, 255);
    pdf.text(s.v, x + 12, y + 28);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(8);
    pdf.setTextColor(150, 150, 180);
    pdf.text(s.l.toUpperCase(), x + 12, y + 45);
  });

  // Habits grid
  y += 80;
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(12);
  pdf.setTextColor(255, 255, 255);
  pdf.text("HÁBITOS DO MÊS", M, y);
  y += 14;

  const days = eachDayOfInterval({ start: startOfMonth(month), end: endOfMonth(month) });
  const nameW = 130;
  const cellW = Math.min(14, (W - M * 2 - nameW - 60) / days.length);
  const rowH = 18;

  // Day headers
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(7);
  pdf.setTextColor(140, 140, 170);
  days.forEach((d, i) => {
    pdf.text(format(d, "d"), M + nameW + i * cellW + cellW / 2, y, { align: "center" });
  });
  pdf.text("Mês", M + nameW + days.length * cellW + 30, y, { align: "center" });
  y += 6;

  habits.forEach((h) => {
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(9);
    pdf.setTextColor(230, 230, 250);
    const truncName = h.name.length > 22 ? h.name.slice(0, 21) + "…" : h.name;
    pdf.text(`${h.emoji}  ${truncName}`, M, y + rowH * 0.7);

    const r = parseInt(h.color.slice(1, 3), 16);
    const g = parseInt(h.color.slice(3, 5), 16);
    const b = parseInt(h.color.slice(5, 7), 16);

    days.forEach((d, i) => {
      const dStr = format(d, "yyyy-MM-dd");
      const done = completions.some(c => c.habit_id === h.id && c.date === dStr);
      const x = M + nameW + i * cellW + 1;
      if (done) {
        pdf.setFillColor(r, g, b);
        pdf.roundedRect(x, y + 4, cellW - 2, rowH - 6, 2, 2, "F");
      } else {
        pdf.setDrawColor(50, 50, 80);
        pdf.roundedRect(x, y + 4, cellW - 2, rowH - 6, 2, 2, "S");
      }
    });

    const monthCount = getMonthCompletions(h.id, completions, month);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(10);
    pdf.setTextColor(r, g, b);
    pdf.text(`${monthCount}`, M + nameW + days.length * cellW + 30, y + rowH * 0.7, { align: "center" });

    y += rowH;
    if (y > H - 80) return;
  });

  // Badges
  if (badges.length && y < H - 90) {
    y += 14;
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(12);
    pdf.setTextColor(255, 255, 255);
    pdf.text("CONQUISTAS DESBLOQUEADAS", M, y);
    y += 14;
    pdf.setFontSize(9);
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(200, 200, 230);
    const names = badges
      .map(b => BADGE_DEFS[b.badge_key]?.name)
      .filter(Boolean)
      .join(" · ");
    const lines = pdf.splitTextToSize(names, W - M * 2);
    pdf.text(lines, M, y);
  }

  // Footer
  pdf.setFontSize(8);
  pdf.setTextColor(100, 100, 140);
  pdf.text(`Gerado em ${format(new Date(), "dd/MM/yyyy HH:mm")} · forge`, M, H - 18);

  pdf.save(`forge-${format(month, "yyyy-MM")}.pdf`);
}
