import { useState, useEffect, useMemo } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Link } from "react-router-dom";
import { BookOpen, Trophy, Skull, Save, ArrowRight, Check } from "lucide-react";
import { useJournalData } from "@/hooks/useJournalData";
import { useHabitsData } from "@/hooks/useHabitsData";
import { getWojakStage } from "@/lib/wojakLore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface Props {
  selectedDate?: Date;
}

export function DailyJournalCard({ selectedDate = new Date() }: Props) {
  const { getEntry, saveEntry } = useJournalData();
  const { habits, completions } = useHabitsData();

  const dateStr = useMemo(() => format(selectedDate, "yyyy-MM-dd"), [selectedDate]);

  // Snapshot de estágio e porcentagem
  const { completionPct, stageId } = useMemo(() => {
    if (habits.length === 0) return { completionPct: 0, stageId: "doomer" as const };
    const habitIds = new Set(habits.map((h) => h.id));
    const done = completions.filter((c) => c.date === dateStr && habitIds.has(c.habit_id)).length;
    const pct = Math.round((done / habits.length) * 100);
    const stage = getWojakStage(pct);
    return { completionPct: pct, stageId: stage.id };
  }, [habits, completions, dateStr]);

  const [win, setWin] = useState("");
  const [excuse, setExcuse] = useState("");
  const [content, setContent] = useState("");
  const [isSaved, setIsSaved] = useState(false);

  // Carrega entrada existente quando mudar a data
  useEffect(() => {
    const existing = getEntry(dateStr);
    if (existing) {
      setWin(existing.winOfTheDay || "");
      setExcuse(existing.betoExcuseDestroyed || "");
      setContent(existing.content || "");
    } else {
      setWin("");
      setExcuse("");
      setContent("");
    }
    setIsSaved(false);
  }, [dateStr, getEntry]);

  const handleSave = () => {
    saveEntry(dateStr, {
      winOfTheDay: win.trim(),
      betoExcuseDestroyed: excuse.trim(),
      content: content.trim(),
      completionSnapshot: completionPct,
      stageSnapshot: stageId,
    });
    setIsSaved(true);
    toast.success("Registro salvo no sistema!");
    setTimeout(() => setIsSaved(false), 2500);
  };

  return (
    <div className="surface-card p-5 sm:p-6 flex flex-col justify-between space-y-4">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between gap-3 mb-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/15 text-amber-400 flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-display text-lg tracking-tight">Diário de Ascensão</h2>
              <p className="text-xs text-muted-foreground capitalize">
                {format(selectedDate, "EEEE, dd 'de' MMMM", { locale: ptBR })}
              </p>
            </div>
          </div>

          <span className="font-mono text-xs px-2 py-0.5 rounded-md bg-secondary border border-border/40 text-muted-foreground">
            {completionPct}% concluído
          </span>
        </div>
      </div>

      {/* Inputs Rápidos */}
      <div className="space-y-3 flex-1">
        <div>
          <label className="text-[11px] font-mono text-muted-foreground flex items-center gap-1.5 mb-1">
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span>Vitória do Dia</span>
          </label>
          <Input
            value={win}
            onChange={(e) => setWin(e.target.value)}
            placeholder="Ex: Treinei em jejum e cumpri 100% da leitura"
            className="h-8 text-xs bg-surface border-border/40 focus-visible:ring-amber-500"
          />
        </div>

        <div>
          <label className="text-[11px] font-mono text-muted-foreground flex items-center gap-1.5 mb-1">
            <Skull className="w-3.5 h-3.5 text-red-400" />
            <span>Desculpa de Beto Enfrentada</span>
          </label>
          <Input
            value={excuse}
            onChange={(e) => setExcuse(e.target.value)}
            placeholder="Ex: 'Estou cansado, amanhã eu compenso'"
            className="h-8 text-xs bg-surface border-border/40 focus-visible:ring-red-500"
          />
        </div>

        <div>
          <label className="text-[11px] font-mono text-muted-foreground flex items-center gap-1.5 mb-1">
            <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
            <span>Autópsia do Dia</span>
          </label>
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="O que te fez subir de nível hoje e o que tentou te puxar para baixo?"
            rows={2}
            className="text-xs resize-none bg-surface border-border/40 focus-visible:ring-primary min-h-[56px]"
          />
        </div>
      </div>

      {/* Footer com Salvar e Link */}
      <div className="pt-2 border-t border-border/30 flex items-center justify-between text-xs gap-3">
        <Button
          type="button"
          size="sm"
          onClick={handleSave}
          disabled={!win.trim() && !excuse.trim() && !content.trim()}
          className={cn(
            "h-8 px-3 gap-1.5 font-medium transition-all text-xs",
            isSaved
              ? "bg-emerald-600 hover:bg-emerald-500 text-white"
              : "bg-primary hover:bg-primary/90 text-primary-foreground"
          )}
        >
          {isSaved ? (
            <>
              <Check className="w-3.5 h-3.5" />
              <span>Registrado</span>
            </>
          ) : (
            <>
              <Save className="w-3.5 h-3.5" />
              <span>Salvar Registro</span>
            </>
          )}
        </Button>

        <Link
          to="/journal"
          className="inline-flex items-center gap-1.5 text-amber-400 hover:text-amber-300 font-medium hover:underline transition-colors text-xs"
        >
          <span>Abrir arquivo completo</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
