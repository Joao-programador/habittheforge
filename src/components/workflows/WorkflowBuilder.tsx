import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { GripVertical, Plus, Trash2, Hammer } from "lucide-react";
import { Workflow, WorkflowStep, newStep } from "@/hooks/useWorkflows";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initial?: Workflow;
  onSave: (data: { title: string; steps: WorkflowStep[] }) => void;
}

export function WorkflowBuilder({ open, onOpenChange, initial, onSave }: Props) {
  const [title, setTitle] = useState("");
  const [steps, setSteps] = useState<WorkflowStep[]>([]);

  useEffect(() => {
    if (open) {
      setTitle(initial?.title ?? "");
      setSteps(
        initial?.steps?.length
          ? initial.steps.map((s) => ({ ...s }))
          : [newStep()],
      );
    }
  }, [open, initial]);

  const addStep = () => setSteps((s) => [...s, newStep()]);
  const removeStep = (id: string) =>
    setSteps((s) => (s.length > 1 ? s.filter((x) => x.id !== id) : s));
  const patchStep = (id: string, patch: Partial<WorkflowStep>) =>
    setSteps((s) => s.map((x) => (x.id === id ? { ...x, ...patch } : x)));

  const handleSave = () => {
    const cleaned = steps
      .map((s) => ({ ...s, title: s.title.trim() }))
      .filter((s) => s.title.length > 0);
    if (!title.trim() || cleaned.length === 0) return;
    onSave({ title: title.trim(), steps: cleaned });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl tracking-tight uppercase flex items-center gap-2">
            <Hammer className="w-5 h-5 text-primary" />
            {initial ? "Forjar Algoritmo" : "Novo Algoritmo"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 py-2">
          <div className="space-y-2">
            <Label htmlFor="wf-title">Título do Algoritmo</Label>
            <Input
              id="wf-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Algoritmo de Estudos"
              className="text-base"
            />
          </div>

          <div>
            <Label className="text-xs uppercase tracking-widest text-muted-foreground">
              Passos · {steps.length}
            </Label>

            <div className="mt-3 space-y-3">
              <AnimatePresence initial={false}>
                {steps.map((step, idx) => (
                  <motion.div
                    key={step.id}
                    layout
                    initial={{ opacity: 0, y: -8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, x: -20, scale: 0.95 }}
                    transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                    className="relative"
                  >
                    {/* connecting line */}
                    {idx < steps.length - 1 && (
                      <div
                        aria-hidden
                        className="absolute left-[18px] top-full h-3 w-0.5 bg-gradient-to-b from-primary/60 to-transparent"
                      />
                    )}

                    <div className="surface-card p-3 sm:p-4 flex gap-3 items-start">
                      <div className="flex flex-col items-center pt-1.5 shrink-0">
                        <div className="w-9 h-9 rounded-xl bg-gradient-primary flex items-center justify-center font-display text-sm text-primary-foreground glow-primary">
                          {idx + 1}
                        </div>
                      </div>

                      <div className="flex-1 min-w-0 space-y-2">
                        <div className="flex items-center gap-2">
                          <Input
                            value={step.title}
                            onChange={(e) =>
                              patchStep(step.id, { title: e.target.value })
                            }
                            placeholder={`Passo ${idx + 1}`}
                            className="font-medium"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeStep(step.id)}
                            disabled={steps.length === 1}
                            className="text-muted-foreground hover:text-destructive shrink-0"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>

                        <Accordion type="single" collapsible className="w-full">
                          <AccordionItem value="details" className="border-0">
                            <AccordionTrigger className="py-1.5 text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground hover:no-underline">
                              Adicionar Detalhes
                            </AccordionTrigger>
                            <AccordionContent className="pt-2 space-y-3">
                              <div className="space-y-1.5">
                                <Label className="text-xs">
                                  Avisos / Notas (o que não fazer, como fazer)
                                </Label>
                                <Textarea
                                  value={step.notes ?? ""}
                                  onChange={(e) =>
                                    patchStep(step.id, { notes: e.target.value })
                                  }
                                  placeholder="Sem celular. Foco total no caderno."
                                  rows={3}
                                />
                              </div>
                              <div className="space-y-1.5">
                                <Label className="text-xs">
                                  Tempo estimado (minutos)
                                </Label>
                                <Input
                                  type="number"
                                  min={0}
                                  value={step.estimatedMinutes ?? ""}
                                  onChange={(e) =>
                                    patchStep(step.id, {
                                      estimatedMinutes: e.target.value
                                        ? Math.max(0, Number(e.target.value))
                                        : undefined,
                                    })
                                  }
                                  placeholder="25"
                                  className="max-w-[120px]"
                                />
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                        </Accordion>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            <Button
              type="button"
              variant="secondary"
              onClick={addStep}
              className="w-full mt-4 gap-2 border border-dashed border-border/60"
            >
              <Plus className="w-4 h-4" /> Adicionar novo passo
            </Button>
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            disabled={!title.trim() || steps.every((s) => !s.title.trim())}
            className="gap-2"
          >
            <Hammer className="w-4 h-4" />
            Salvar Template
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
