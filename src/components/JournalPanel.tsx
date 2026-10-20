import { useState, useEffect, useMemo, useCallback } from "react";
import { format, isToday, addDays, subDays, parseISO, isSameDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  Search,
  BookOpen,
  Trophy,
  Skull,
  Tag,
  Save,
  Trash2,
  Sparkles,
  CheckCircle2,
  Filter,
  Plus,
  X,
} from "lucide-react";
import { useJournalData, type JournalEntry, type WojakStageId } from "@/hooks/useJournalData";
import { useHabitsData } from "@/hooks/useHabitsData";
import { getWojakStage, WOJAK_STAGES } from "@/lib/wojakLore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface Props {
  currentMonth: Date;
  selectedDate: Date;
  onSelectDate: (d: Date) => void;
}

const SUGGESTED_TAGS = [
  "#MonkMode",
  "#TreinoPesado",
  "#SonoRuim",
  "#ZeroConsoom",
  "#RecaídaDeBeto",
  "#Leitura",
  "#Hydrated",
  "#AuraMáxima",
];

const STAGE_FILTERS: { label: string; value: "all" | WojakStageId }[] = [
  { label: "Todos", value: "all" },
  { label: "Doomer", value: "doomer" },
  { label: "Soyjak", value: "soyjak" },
  { label: "Wojak", value: "wojak" },
  { label: "Bloomer", value: "bloomer" },
  { label: "GigaChad", value: "gigachad" },
];

export function JournalPanel({ currentMonth, selectedDate, onSelectDate }: Props) {
  const { getEntry, saveEntry, deleteEntry, allEntries } = useJournalData();
  const { habits, completions } = useHabitsData();

  const selectedKey = useMemo(() => format(selectedDate, "yyyy-MM-dd"), [selectedDate]);

  // Calculate day completion rate and Wojak stage for the selected day
  const { dayPct, dayStage } = useMemo(() => {
    if (!habits.length) {
      return { dayPct: 0, dayStage: WOJAK_STAGES[0] };
    }
    const habitIds = new Set(habits.map((h) => h.id));
    const done = completions.filter((c) => c.date === selectedKey && habitIds.has(c.habit_id)).length;
    const pct = Math.round((done / habits.length) * 100);
    return { dayPct: pct, dayStage: getWojakStage(pct) };
  }, [habits, completions, selectedKey]);

  // Form State
  const [content, setContent] = useState("");
  const [winOfTheDay, setWinOfTheDay] = useState("");
  const [betoExcuseDestroyed, setBetoExcuseDestroyed] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [customTagInput, setCustomTagInput] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Search & Filter State for Archive
  const [searchQuery, setSearchQuery] = useState("");
  const [stageFilter, setStageFilter] = useState<"all" | WojakStageId>("all");

  // Load entry into form when selected date changes
  useEffect(() => {
    const entry = getEntry(selectedKey);
    if (entry) {
      setContent(entry.content ?? "");
      setWinOfTheDay(entry.winOfTheDay ?? "");
      setBetoExcuseDestroyed(entry.betoExcuseDestroyed ?? "");
      setTags(entry.tags ?? []);
    } else {
      setContent("");
      setWinOfTheDay("");
      setBetoExcuseDestroyed("");
      setTags([]);
    }
  }, [selectedKey, getEntry]);

  // Dynamic placeholder based on Wojak stage
  const dynamicPlaceholder = useMemo(() => {
    switch (dayStage.id) {
      case "doomer":
        return "Por que o beto venceu hoje? O que travou sua rotina? Seja brutalmente honesto...";
      case "soyjak":
        return "Qual dopamina barata ou distração roubou seu foco hoje?";
      case "wojak":
        return "Relatório de trincheira: o que funcionou hoje e o que faltou para o 100%?";
      case "bloomer":
        return "Mente limpa: registre os aprendizados e a paz do dia de hoje...";
      case "gigachad":
        return "Relatório de domínio total: deixe registrado como você moggou a procrastinação hoje.";
      default:
        return "Escreva as reflexões e aprendizados do dia...";
    }
  }, [dayStage.id]);

  const handleSave = useCallback(() => {
    setIsSaving(true);
    saveEntry(selectedKey, {
      content,
      winOfTheDay,
      betoExcuseDestroyed,
      tags,
      completionSnapshot: dayPct,
      stageSnapshot: dayStage.id,
    });
    setTimeout(() => {
      setIsSaving(false);
      toast.success("Diário salvo na forja!");
    }, 150);
  }, [selectedKey, content, winOfTheDay, betoExcuseDestroyed, tags, dayPct, dayStage.id, saveEntry]);

  const handleDelete = () => {
    deleteEntry(selectedKey);
    setContent("");
    setWinOfTheDay("");
    setBetoExcuseDestroyed("");
    setTags([]);
    toast.info("Anotação excluída");
  };

  const toggleTag = (t: string) => {
    setTags((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]));
  };

  const addCustomTag = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = customTagInput.trim();
    if (!clean) return;
    const formatted = clean.startsWith("#") ? clean : `#${clean}`;
    if (!tags.includes(formatted)) {
      setTags((prev) => [...prev, formatted]);
    }
    setCustomTagInput("");
  };

  // Filtered entries for archive
  const filteredEntries = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return allEntries.filter((entry) => {
      // Stage filter
      if (stageFilter !== "all" && entry.stageSnapshot !== stageFilter) {
        return false;
      }
      // Text query
      if (!q) return true;
      const matchContent = entry.content?.toLowerCase().includes(q);
      const matchWin = entry.winOfTheDay?.toLowerCase().includes(q);
      const matchExcuse = entry.betoExcuseDestroyed?.toLowerCase().includes(q);
      const matchTags = entry.tags?.some((t) => t.toLowerCase().includes(q));
      const matchDate = entry.date.includes(q);
      return matchContent || matchWin || matchExcuse || matchTags || matchDate;
    });
  }, [allEntries, searchQuery, stageFilter]);

  const isCurrentDayToday = isToday(selectedDate);

  return (
    <div id="journal-panel" className="space-y-4 pt-2">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-primary/15 text-primary flex items-center justify-center">
            <BookOpen className="w-4 h-4" />
          </div>
          <div>
            <h2 className="font-display text-xl tracking-tight leading-none">Diário da Forja</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Reflexões, vitórias e o combate diário contra o beto interior.
            </p>
          </div>
        </div>

        {getEntry(selectedKey) && (
          <span className="hidden sm:inline-flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
            <CheckCircle2 className="w-3.5 h-3.5" /> Anotação salva
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* ========================================================================= */}
        {/* COLUNA 1: EDITOR DO DIA SELECIONADO (7 colunas)                          */}
        {/* ========================================================================= */}
        <div className="lg:col-span-7 surface-card p-4 sm:p-5 flex flex-col justify-between space-y-4">
          {/* Header do Editor */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-border/30">
            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="icon"
                onClick={() => onSelectDate(subDays(selectedDate, 1))}
                className="h-8 w-8 rounded-lg border-border/40 hover:bg-secondary/60"
                title="Dia anterior"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <div className="px-2 text-center min-w-[150px]">
                <div className="font-display text-base tracking-tight capitalize">
                  {format(selectedDate, "dd 'de' MMMM", { locale: ptBR })}
                </div>
                <div className="text-[11px] font-mono text-muted-foreground capitalize">
                  {format(selectedDate, "EEEE, yyyy", { locale: ptBR })}
                </div>
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={() => onSelectDate(addDays(selectedDate, 1))}
                className="h-8 w-8 rounded-lg border-border/40 hover:bg-secondary/60"
                title="Próximo dia"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
              {!isCurrentDayToday && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onSelectDate(new Date())}
                  className="h-8 text-xs gap-1 ml-1 text-primary hover:text-primary"
                >
                  <CalendarDays className="w-3.5 h-3.5" /> Hoje
                </Button>
              )}
            </div>

            {/* Badge de Progresso do Dia e Estágio Wojak */}
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs px-2 py-0.5 rounded bg-secondary text-foreground/90 border border-border/40">
                {dayPct}% feito
              </span>
              <span
                className={cn(
                  "text-xs px-2.5 py-0.5 rounded-full border font-medium flex items-center gap-1.5 shadow-sm",
                  dayStage.badgeColor
                )}
              >
                <img
                  src={dayStage.imageUrl}
                  alt={dayStage.title}
                  className="w-4 h-4 rounded-full object-contain bg-white/10"
                />
                <span>{dayStage.title}</span>
              </span>
            </div>
          </div>

          {/* Campos Rápidos: Vitória e Desculpa */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                <Trophy className="w-3.5 h-3.5 text-amber-400" />
                Vitória do Dia
              </label>
              <Input
                value={winOfTheDay}
                onChange={(e) => setWinOfTheDay(e.target.value)}
                placeholder="Ex: Treino concluído às 07h em jejum"
                className="h-9 text-xs bg-secondary/30 border-border/40 focus:border-primary/60"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                <Skull className="w-3.5 h-3.5 text-red-400" />
                Desculpa Enfrentada
              </label>
              <Input
                value={betoExcuseDestroyed}
                onChange={(e) => setBetoExcuseDestroyed(e.target.value)}
                placeholder="Ex: Venci a vontade de ficar 2h no Reels"
                className="h-9 text-xs bg-secondary/30 border-border/40 focus:border-primary/60"
              />
            </div>
          </div>

          {/* Textarea Livre com Placeholder Dinâmico */}
          <div className="space-y-1.5 flex-1 flex flex-col">
            <label className="text-xs font-semibold text-zinc-300 flex items-center justify-between">
              <span>Anotação Livre & Reflexões</span>
              <span className="text-[11px] font-mono text-muted-foreground/80">
                {content.length} caracteres
              </span>
            </label>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={dynamicPlaceholder}
              rows={6}
              className="resize-none text-sm bg-secondary/20 border-border/40 focus:border-primary/60 leading-relaxed min-h-[140px]"
            />
          </div>

          {/* Seletor de Tags (Pills) */}
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-primary" /> Tags do Dia
              </span>
            </div>

            <div className="flex flex-wrap gap-1.5 items-center">
              {SUGGESTED_TAGS.map((t) => {
                const active = tags.includes(t);
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => toggleTag(t)}
                    className={cn(
                      "text-xs px-2.5 py-1 rounded-md border transition-all select-none",
                      active
                        ? "bg-primary/20 border-primary text-primary font-medium shadow-xs"
                        : "bg-secondary/30 border-border/40 text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
                    )}
                  >
                    {t}
                  </button>
                );
              })}

              {/* Tags personalizadas que o usuário adicionou */}
              {tags
                .filter((t) => !SUGGESTED_TAGS.includes(t))
                .map((t) => (
                  <span
                    key={t}
                    className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-md bg-accent/20 border border-accent/40 text-accent-foreground font-medium"
                  >
                    {t}
                    <button
                      type="button"
                      onClick={() => toggleTag(t)}
                      className="hover:opacity-75 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
            </div>

            {/* Input para adicionar tag customizada */}
            <form onSubmit={addCustomTag} className="flex gap-2 max-w-xs pt-1">
              <Input
                value={customTagInput}
                onChange={(e) => setCustomTagInput(e.target.value)}
                placeholder="Nova tag (#FocoTotal)"
                className="h-8 text-xs bg-secondary/30 border-border/40"
              />
              <Button type="submit" size="sm" variant="secondary" className="h-8 text-xs px-2.5">
                <Plus className="w-3.5 h-3.5 mr-1" /> Adicionar
              </Button>
            </form>
          </div>

          {/* Rodapé com Ações */}
          <div className="flex items-center justify-between pt-3 border-t border-border/30">
            {getEntry(selectedKey) ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDelete}
                className="text-xs text-destructive hover:bg-destructive/10 hover:text-destructive h-9 gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" /> Excluir entrada
              </Button>
            ) : (
              <div className="text-[11px] text-muted-foreground italic">
                Anotações ficam salvas localmente no seu dispositivo.
              </div>
            )}

            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="bg-gradient-primary glow-primary h-9 px-5 text-xs font-semibold gap-2 ml-auto"
            >
              <Save className="w-3.5 h-3.5" />
              {isSaving ? "Salvando..." : "Salvar no Diário"}
            </Button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* COLUNA 2: HISTÓRICO & ARQUIVO (5 colunas)                                */}
        {/* ========================================================================= */}
        <div className="lg:col-span-5 surface-card p-4 sm:p-5 flex flex-col space-y-3.5 max-h-[640px]">
          <div className="flex items-center justify-between gap-2 pb-2 border-b border-border/30">
            <h3 className="font-display text-sm tracking-tight flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-primary" /> Histórico & Padrões
            </h3>
            <span className="font-mono text-xs text-muted-foreground bg-secondary/60 px-2 py-0.5 rounded">
              {allEntries.length} {allEntries.length === 1 ? "registro" : "registros"}
            </span>
          </div>

          {/* Busca Textual */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar em vitórias, notas ou tags..."
              className="h-9 pl-9 text-xs bg-secondary/30 border-border/40 focus:border-primary/60"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Filtro Rápido por Estágio Wojak */}
          <div className="flex gap-1 overflow-x-auto scrollbar-hide pb-1">
            {STAGE_FILTERS.map((f) => (
              <button
                key={f.value}
                type="button"
                onClick={() => setStageFilter(f.value)}
                className={cn(
                  "text-[11px] px-2.5 py-1 rounded-md transition-all shrink-0 border select-none",
                  stageFilter === f.value
                    ? "bg-primary text-primary-foreground font-medium border-primary shadow-xs"
                    : "bg-secondary/40 text-muted-foreground border-border/30 hover:bg-secondary/70 hover:text-foreground"
                )}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Lista Rolável de Cards */}
          <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 min-h-[220px]">
            {filteredEntries.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground space-y-2">
                <BookOpen className="w-8 h-8 mx-auto opacity-30 stroke-1" />
                <p className="text-xs">
                  {searchQuery || stageFilter !== "all"
                    ? "Nenhuma anotação encontrada com os filtros atuais."
                    : "Nenhuma anotação registrada ainda no diário."}
                </p>
                <p className="text-[11px] text-muted-foreground/80 max-w-xs mx-auto">
                  {searchQuery || stageFilter !== "all"
                    ? "Tente limpar a busca ou alternar o estágio acima."
                    : "Selecione uma data no editor ao lado e registre sua primeira vitória contra o beto."}
                </p>
              </div>
            ) : (
              filteredEntries.map((entry) => {
                const entryDate = parseISO(entry.date);
                const isSelected = isSameDay(entryDate, selectedDate);
                const stageObj = WOJAK_STAGES.find((s) => s.id === entry.stageSnapshot) ?? WOJAK_STAGES[0];

                return (
                  <div
                    key={entry.date}
                    onClick={() => onSelectDate(entryDate)}
                    className={cn(
                      "p-3 rounded-xl border transition-all text-left cursor-pointer group hover:border-primary/50 relative overflow-hidden",
                      isSelected
                        ? "bg-primary/10 border-primary/60 shadow-sm"
                        : "bg-secondary/25 border-border/40 hover:bg-secondary/45"
                    )}
                  >
                    {/* Header do Card */}
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <div className="font-display text-xs tracking-tight capitalize text-foreground">
                        {format(entryDate, "dd 'de' MMM, EEE", { locale: ptBR })}
                      </div>

                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-mono text-muted-foreground">
                          {entry.completionSnapshot}%
                        </span>
                        <span
                          className={cn(
                            "text-[10px] px-1.5 py-0.5 rounded-full border font-medium",
                            stageObj.badgeColor
                          )}
                        >
                          {stageObj.title.split(" ")[1] ?? stageObj.title}
                        </span>
                      </div>
                    </div>

                    {/* Destaque da Vitória */}
                    {entry.winOfTheDay && (
                      <div className="text-[11px] text-amber-300 font-medium truncate flex items-center gap-1 mb-1">
                        <Trophy className="w-3 h-3 shrink-0 text-amber-400" />
                        <span>{entry.winOfTheDay}</span>
                      </div>
                    )}

                    {/* Destaque da Desculpa */}
                    {entry.betoExcuseDestroyed && (
                      <div className="text-[11px] text-red-300/90 truncate flex items-center gap-1 mb-1">
                        <Skull className="w-3 h-3 shrink-0 text-red-400" />
                        <span>{entry.betoExcuseDestroyed}</span>
                      </div>
                    )}

                    {/* Preview do Conteúdo */}
                    {entry.content && (
                      <p className="text-xs text-muted-foreground/90 line-clamp-2 leading-relaxed mt-1">
                        {entry.content}
                      </p>
                    )}

                    {/* Tags */}
                    {entry.tags && entry.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {entry.tags.map((t) => (
                          <span
                            key={t}
                            className="text-[10px] px-1.5 py-0.5 rounded bg-secondary/80 text-muted-foreground border border-border/30"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
