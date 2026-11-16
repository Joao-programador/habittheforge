import { AppLayout } from "@/components/AppLayout";
import { useSettings } from "@/context/SettingsContext";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Sun, Moon, Palette, Smartphone, Download, CheckCircle2, Trash2 } from "lucide-react";
import { useHabitsData } from "@/hooks/useHabitsData";
import { usePwaInstall } from "@/hooks/usePwaInstall";
import { AddHabitDialog } from "@/components/AddHabitDialog";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { toast } from "sonner";

const PRIMARY_COLORS = ["#4f46e5", "#7c3aed", "#ec4899", "#f43f5e", "#f59e0b", "#10b981", "#06b6d4", "#3b82f6"];
const ACCENT_COLORS = ["#818cf8", "#a78bfa", "#f472b6", "#fb7185", "#fbbf24", "#34d399", "#22d3ee", "#60a5fa"];

export default function Settings() {
  const { dark_mode, primary_color, accent_color, update } = useSettings();
  const { habits, addHabit, deleteHabit } = useHabitsData();
  const { canPromptInstall, isIosInstallable, isStandalone, promptInstall } = usePwaInstall();

  const handleInstall = async () => {
    const ok = await promptInstall();
    if (ok) toast.success("ASCEND instalado com sucesso!");
  };

  return (
    <AppLayout>
      <div className="max-w-3xl space-y-6">
        <div>
          <h1 className="font-display text-3xl sm:text-4xl tracking-tight">Configurações</h1>
          <p className="text-muted-foreground mt-1">Calibre seu sistema.</p>
        </div>

        {/* App Mobile / PWA */}
        <div className="surface-card p-4 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <Smartphone className="w-5 h-5 text-primary shrink-0" />
              <div className="min-w-0">
                <Label className="font-display text-lg">Aplicativo no Celular (PWA)</Label>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {isStandalone
                    ? "Executando em modo aplicativo independente."
                    : isIosInstallable
                    ? "No Safari, toque em Compartilhar e depois em Adicionar à Tela de Início."
                    : "Instale na tela inicial para usar em tela cheia como app nativo."}
                </p>
              </div>
            </div>

            {isStandalone ? (
              <span className="inline-flex items-center gap-1.5 text-xs font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1.5 rounded-full">
                <CheckCircle2 className="w-3.5 h-3.5" /> Instalado
              </span>
            ) : canPromptInstall ? (
              <Button onClick={handleInstall} className="bg-gradient-primary glow-primary gap-2 h-11 md:h-9">
                <Download className="w-4 h-4" /> Instalar App
              </Button>
            ) : null}
          </div>
        </div>

        {/* Theme */}
        <div className="surface-card p-4 sm:p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              {dark_mode ? <Moon className="w-5 h-5 text-primary" /> : <Sun className="w-5 h-5 text-primary" />}
              <div>
                <Label className="font-display text-lg">Tema {dark_mode ? "escuro" : "claro"}</Label>
                <p className="text-xs text-muted-foreground">Alterne entre modo escuro e claro</p>
              </div>
            </div>
            <Switch checked={dark_mode} onCheckedChange={(v) => update({ dark_mode: v })} />
          </div>
        </div>

        {/* Colors */}
        <div className="surface-card p-6 space-y-5">
          <div className="flex items-center gap-3">
            <Palette className="w-5 h-5 text-primary" />
            <div>
              <Label className="font-display text-lg">Cores</Label>
              <p className="text-xs text-muted-foreground">Personalize as cores principais da interface</p>
            </div>
          </div>

          <div>
            <Label className="text-xs uppercase tracking-widest text-muted-foreground mb-3 block">Cor primária</Label>
            <div className="flex gap-2 flex-wrap">
              {PRIMARY_COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => update({ primary_color: c })}
                  className={`w-11 h-11 sm:w-10 sm:h-10 rounded-xl transition-all hover:scale-110 ${primary_color === c ? "ring-2 ring-offset-2 ring-offset-background ring-foreground" : ""}`}
                  style={{ background: c }}
                />
              ))}
            </div>
          </div>

          <div>
            <Label className="text-xs uppercase tracking-widest text-muted-foreground mb-3 block">Cor de destaque</Label>
            <div className="flex gap-2 flex-wrap">
              {ACCENT_COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => update({ accent_color: c })}
                  className={`w-11 h-11 sm:w-10 sm:h-10 rounded-xl transition-all hover:scale-110 ${accent_color === c ? "ring-2 ring-offset-2 ring-offset-background ring-foreground" : ""}`}
                  style={{ background: c }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Habits management */}
        <div className="surface-card p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <Label className="font-display text-lg">Hábitos ({habits.length})</Label>
              <p className="text-xs text-muted-foreground">Gerencie seus hábitos</p>
            </div>
            <AddHabitDialog onAdd={addHabit} />
          </div>

          <div className="space-y-2">
            {habits.length === 0 && (
              <p className="text-sm text-muted-foreground italic text-center py-6">
                Nenhum hábito ainda. Adicione o primeiro acima.
              </p>
            )}
            {habits.map((h) => (
              <div key={h.id} className="flex items-center gap-3 p-3 bg-secondary/40 rounded-xl">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center text-xl"
                  style={{ background: `${h.color}25`, border: `1px solid ${h.color}55` }}
                >
                  {h.emoji}
                </div>
                <span className="flex-1 font-medium">{h.name}</span>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-11 w-11 md:h-9 md:w-9 text-muted-foreground hover:text-destructive">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Apagar "{h.name}"?</AlertDialogTitle>
                      <AlertDialogDescription>O histórico será perdido permanentemente.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction onClick={() => deleteHabit(h.id)} className="bg-destructive text-destructive-foreground">Apagar</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
