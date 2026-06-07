import { useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";
import { pickRandomWojak } from "@/assets/wojaks";
import { PendingReminder } from "@/hooks/useReminderEngine";
import { useHabitsData } from "@/hooks/useHabitsData";

interface Props {
  pending: PendingReminder | null;
  onDismiss: () => void;
  remaining: number;
}

export function ReminderOverlay({ pending, onDismiss, remaining }: Props) {
  useEffect(() => {
    if (!pending) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onDismiss();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [pending, onDismiss]);

  const wojak = useMemo(() => pickRandomWojak(), [pending?.firedAt]);
  if (!pending) return null;
  const { reminder } = pending;

  return (
    <div className="fixed inset-0 z-[100] bg-background/95 backdrop-blur-2xl flex items-center justify-center animate-in fade-in duration-300">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10 pointer-events-none" />

      <button
        onClick={onDismiss}
        className="absolute top-6 right-6 w-11 h-11 rounded-full bg-secondary/60 hover:bg-secondary border border-border/40 flex items-center justify-center transition-colors z-10"
        aria-label="Fechar"
      >
        <X className="w-5 h-5" />
      </button>

      {remaining > 1 && (
        <div className="absolute top-6 left-6 text-xs uppercase tracking-[0.25em] text-muted-foreground">
          +{remaining - 1} na fila
        </div>
      )}

      <div className="relative max-w-2xl w-full px-6 text-center flex flex-col items-center gap-8">
        <div className="text-xs uppercase tracking-[0.4em] text-primary font-bold">
          Lembrete · {new Date(pending.firedAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
        </div>

        <h1 className="font-display text-5xl md:text-7xl tracking-tight leading-[0.9] uppercase">
          Você é isso<br />
          <span className="text-primary" style={{ textShadow: "0 0 40px hsl(var(--primary) / 0.6)" }}>
            aqui:
          </span>
        </h1>

        <div className="relative">
          <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full" />
          <img
            src={wojak}
            alt="Wojak"
            width={320}
            height={320}
            className="relative w-64 h-64 md:w-80 md:h-80 object-contain drop-shadow-2xl"
            style={{ filter: "drop-shadow(0 0 24px hsl(var(--primary) / 0.4))" }}
          />
        </div>

        {reminder.title && (
          <div className="font-display text-2xl md:text-3xl tracking-tight uppercase">
            {reminder.title}
          </div>
        )}

        {reminder.message && (
          <p className="text-lg md:text-xl text-muted-foreground max-w-xl leading-relaxed">
            {reminder.message}
          </p>
        )}

        <Button
          size="lg"
          onClick={onDismiss}
          className="mt-4 px-10 h-12 font-display tracking-wider uppercase text-sm"
        >
          Levanta
        </Button>
      </div>
    </div>
  );
}
