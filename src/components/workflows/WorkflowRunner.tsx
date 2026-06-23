import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Workflow } from "@/hooks/useWorkflows";
import { Button } from "@/components/ui/button";
import { Check, Clock, X, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  workflow: Workflow | null;
  onClose: () => void;
}

export function WorkflowRunner({ workflow, onClose }: Props) {
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [forged, setForged] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (workflow) {
      setChecked({});
      setForged(false);
      setIsOpen(true);
    }
  }, [workflow?.id]);

  const total = workflow?.steps.length ?? 0;
  const done = useMemo(
    () => (workflow ? workflow.steps.filter((s) => checked[s.id]).length : 0),
    [checked, workflow],
  );
  const progress = total > 0 ? (done / total) * 100 : 0;

  const handleClose = () => {
    console.log("handleClose called, current isOpen:", isOpen);
    setIsOpen(false);
    window.setTimeout(() => {
      console.log("calling onClose");
      onClose();
    }, 250);
  };

  useEffect(() => {
    if (!workflow || total === 0) return;
    if (done === total && !forged) {
      setForged(true);
      const t = window.setTimeout(() => {
        handleClose();
      }, 1500);
      return () => window.clearTimeout(t);
    }
  }, [done, total, workflow, forged]);

  const toggle = (id: string) =>
    setChecked((c) => ({ ...c, [id]: !c[id] }));

  return (
    <AnimatePresence>
      {console.log("render isOpen:", isOpen, "workflow:", workflow?.title)}
      {isOpen && workflow && (
        <motion.div
          key="runner"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[100] bg-background/95 backdrop-blur-xl overflow-y-auto"
        >
        <div className="min-h-full flex flex-col">
          {/* Header */}
          <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-xl border-b border-border/40">
            <div className="max-w-2xl mx-auto px-4 sm:px-6 py-4">
              <div className="flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <div className="text-[10px] uppercase tracking-[0.25em] text-primary/80">
                    Executando
                  </div>
                  <h1 className="font-display text-xl sm:text-2xl tracking-tight uppercase truncate">
                    {workflow.title}
                  </h1>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleClose}
                  className="shrink-0"
                  aria-label="Fechar"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              {/* Progress */}
              <div className="mt-4">
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
                  <span className="uppercase tracking-widest">
                    Progresso
                  </span>
                  <span className="font-mono">
                    {done}/{total} · {Math.round(progress)}%
                  </span>
                </div>
                <div className="h-2.5 w-full rounded-full bg-secondary/40 overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-gradient-primary glow-primary"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Steps */}
          <div className="flex-1 max-w-2xl w-full mx-auto px-4 sm:px-6 py-6 space-y-3">
            {workflow.steps.map((step, idx) => {
              const isChecked = !!checked[step.id];
              return (
                <motion.button
                  type="button"
                  key={step.id}
                  onClick={() => toggle(step.id)}
                  layout
                  whileTap={{ scale: 0.98 }}
                  className={cn(
                    "w-full text-left surface-card p-4 sm:p-5 flex gap-4 items-start transition-all duration-300",
                    "hover:border-primary/40",
                    isChecked && "opacity-60",
                  )}
                >
                  {/* Custom big checkbox */}
                  <div
                    className={cn(
                      "shrink-0 w-9 h-9 sm:w-11 sm:h-11 rounded-xl border-2 flex items-center justify-center transition-all duration-300",
                      isChecked
                        ? "bg-gradient-primary border-transparent glow-primary"
                        : "border-border bg-secondary/30 hover:border-primary/60",
                    )}
                  >
                    <AnimatePresence>
                      {isChecked && (
                        <motion.div
                          key="check"
                          initial={{ scale: 0, rotate: -90 }}
                          animate={{ scale: 1, rotate: 0 }}
                          exit={{ scale: 0 }}
                          transition={{
                            duration: 0.3,
                            ease: [0.34, 1.56, 0.64, 1],
                          }}
                        >
                          <Check
                            className="w-5 h-5 sm:w-6 sm:h-6 text-primary-foreground"
                            strokeWidth={3}
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-2">
                      <span className="font-mono text-xs text-muted-foreground pt-0.5">
                        {String(idx + 1).padStart(2, "0")}
                      </span>
                      <h3
                        className={cn(
                          "font-display text-base sm:text-lg tracking-tight transition-all duration-300",
                          isChecked &&
                            "line-through text-muted-foreground",
                        )}
                      >
                        {step.title}
                      </h3>
                    </div>
                    {(step.notes || step.estimatedMinutes) && (
                      <div
                        className={cn(
                          "mt-1.5 pl-7 space-y-1 transition-opacity duration-300",
                          isChecked && "opacity-70",
                        )}
                      >
                        {step.notes && (
                          <p className="text-xs sm:text-sm italic text-muted-foreground whitespace-pre-wrap">
                            {step.notes}
                          </p>
                        )}
                        {step.estimatedMinutes ? (
                          <div className="flex items-center gap-1 text-[11px] italic text-muted-foreground">
                            <Clock className="w-3 h-3" />
                            <span>~{step.estimatedMinutes} min</span>
                          </div>
                        ) : null}
                      </div>
                    )}
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Forged success overlay */}
        <AnimatePresence>
          {forged && (
            <motion.div
              key="forged"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-20 flex items-center justify-center bg-background/70 backdrop-blur-md pointer-events-none"
            >
              <motion.div
                initial={{ scale: 0.4, rotate: -20, opacity: 0 }}
                animate={{ scale: 1, rotate: 0, opacity: 1 }}
                transition={{
                  duration: 0.6,
                  ease: [0.34, 1.56, 0.64, 1],
                }}
                className="text-center"
              >
                <div className="relative inline-flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full bg-gradient-primary blur-3xl opacity-60 animate-pulse-glow" />
                  <div className="relative w-28 h-28 rounded-full bg-gradient-primary flex items-center justify-center glow-primary">
                    <Sparkles
                      className="w-14 h-14 text-primary-foreground"
                      strokeWidth={2.5}
                    />
                  </div>
                </div>
                <div className="mt-6 font-display text-4xl tracking-tight uppercase text-gradient">
                  Forjado
                </div>
                <div className="text-xs uppercase tracking-[0.3em] text-muted-foreground mt-2">
                  Algoritmo Completo
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
      )}
    </AnimatePresence>
  );
}
