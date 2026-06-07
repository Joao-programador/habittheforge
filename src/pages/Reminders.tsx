import { useEffect, useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { BellRing, Plus, Pencil, Trash2, BellOff, Bell, Eye } from "lucide-react";
import { Reminder, useReminders } from "@/hooks/useReminders";
import { useHabitsData } from "@/hooks/useHabitsData";
import { ReminderDialog } from "@/components/reminders/ReminderDialog";

import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { toast } from "sonner";

function describeReminder(r: Reminder): string {
  if (r.mode === "interval") return `A cada ${r.intervalMinutes} min`;
  if (r.mode === "times" && r.times?.length) return `Às ${r.times.join(" · ")}`;
  return "Sem agendamento";
}

export default function Reminders() {
  const { reminders, addReminder, updateReminder, deleteReminder } = useReminders();
  const { habits } = useHabitsData();

  const [permission, setPermission] = useState<NotificationPermission | "unsupported">(
    typeof Notification === "undefined" ? "unsupported" : Notification.permission,
  );

  useEffect(() => {
    if (typeof Notification === "undefined") return;
    const i = window.setInterval(() => setPermission(Notification.permission), 2000);
    return () => window.clearInterval(i);
  }, []);

  const requestPermission = async () => {
    if (typeof Notification === "undefined") return;
    const p = await Notification.requestPermission();
    setPermission(p);
    if (p === "granted") toast.success("Notificações ativadas");
    else if (p === "denied") toast.error("Notificações bloqueadas. Ajuste no navegador.");
  };

  const previewReminder = (r: Reminder) => {
    // Force fire by clearing lastFiredAt — engine tick (max 30s) will pick it up.
    // For instant feedback, dispatch a custom event the overlay layer can listen to OR just simulate.
    updateReminder(r.id, { lastFiredAt: 0 });
    if (r.mode === "interval") {
      // ensure isDue passes by also rewriting createdAt
      updateReminder(r.id, { lastFiredAt: 0, createdAt: 0 });
    }
    toast.info("Lembrete disparará nos próximos 30 segundos");
  };

  return (
    <AppLayout>
      <div className="max-w-4xl space-y-6">
        <div className="flex items-end justify-between gap-4 flex-wrap">
          <div>
            <h1 className="font-display text-4xl tracking-tight uppercase">Lembretes</h1>
            <p className="text-muted-foreground mt-1">Popups periódicos que te confrontam.</p>
          </div>
          <ReminderDialog
            trigger={
              <Button size="lg" className="gap-2">
                <Plus className="w-4 h-4" /> Novo lembrete
              </Button>
            }
            onSave={(data) => {
              addReminder(data);
              toast.success("Lembrete criado");
            }}
          />
        </div>

        {/* Permission banner */}
        {permission === "default" && (
          <div className="surface-card p-4 flex items-center justify-between gap-4 border-primary/40">
            <div className="flex items-center gap-3">
              <Bell className="w-5 h-5 text-primary" />
              <div>
                <div className="font-medium">Ative notificações do sistema</div>
                <p className="text-xs text-muted-foreground">
                  Para receber os lembretes mesmo com a aba minimizada.
                </p>
              </div>
            </div>
            <Button onClick={requestPermission} variant="secondary">Ativar</Button>
          </div>
        )}
        {permission === "denied" && (
          <div className="surface-card p-4 flex items-center gap-3 border-destructive/40">
            <BellOff className="w-5 h-5 text-destructive" />
            <div className="text-sm">
              <div className="font-medium">Notificações bloqueadas</div>
              <p className="text-xs text-muted-foreground">
                O overlay fullscreen ainda funciona quando a aba está aberta. Reative em
                Configurações &gt; Notificações do seu navegador.
              </p>
            </div>
          </div>
        )}
        {permission === "unsupported" && (
          <div className="surface-card p-4 text-sm text-muted-foreground">
            Este navegador não suporta notificações nativas. O overlay continua funcionando.
          </div>
        )}

        {/* Limitation note */}
        <div className="text-xs text-muted-foreground italic px-1">
          Aviso: os lembretes só disparam enquanto o Forge estiver aberto em alguma aba do navegador.
        </div>

        {/* List */}
        {reminders.length === 0 ? (
          <div className="surface-card p-12 text-center">
            <BellRing className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">Nenhum lembrete ainda. Crie o primeiro.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {reminders.map((r) => (
              <div key={r.id} className="surface-card p-4 flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${r.active ? "bg-primary/15 text-primary" : "bg-secondary/40 text-muted-foreground"}`}>
                  <BellRing className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-display text-lg tracking-tight uppercase truncate">
                    {r.title || "Sem título"}
                  </div>
                  {r.message && (
                    <p className="text-sm text-muted-foreground line-clamp-1">{r.message}</p>
                  )}
                  <div className="text-[11px] uppercase tracking-widest text-primary/80 mt-0.5">
                    {describeReminder(r)}
                  </div>
                </div>

                <Switch
                  checked={r.active}
                  onCheckedChange={(v) => updateReminder(r.id, { active: v })}
                />

                <Button variant="ghost" size="icon" onClick={() => previewReminder(r)} title="Disparar em breve">
                  <Eye className="w-4 h-4" />
                </Button>

                <ReminderDialog
                  initial={r}
                  trigger={
                    <Button variant="ghost" size="icon">
                      <Pencil className="w-4 h-4" />
                    </Button>
                  }
                  onSave={(data) => {
                    updateReminder(r.id, data);
                    toast.success("Lembrete atualizado");
                  }}
                />

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Apagar lembrete?</AlertDialogTitle>
                      <AlertDialogDescription>Essa ação é permanente.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction onClick={() => deleteReminder(r.id)} className="bg-destructive text-destructive-foreground">
                        Apagar
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
