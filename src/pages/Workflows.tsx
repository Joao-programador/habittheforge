import { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import {
  Workflow as WorkflowIcon,
  Plus,
  Pencil,
  Play,
  Trash2,
  Eye,
  Hammer,
  ListOrdered,
} from "lucide-react";
import { Workflow, useWorkflows } from "@/hooks/useWorkflows";
import { WorkflowBuilder } from "@/components/workflows/WorkflowBuilder";
import { WorkflowRunner } from "@/components/workflows/WorkflowRunner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

export default function Workflows() {
  const { workflows, createWorkflow, updateWorkflow, deleteWorkflow } =
    useWorkflows();
  const [builderOpen, setBuilderOpen] = useState(false);
  const [editing, setEditing] = useState<Workflow | null>(null);
  const [running, setRunning] = useState<Workflow | null>(null);
  const [previewing, setPreviewing] = useState<Workflow | null>(null);

  const openNew = () => {
    setEditing(null);
    setBuilderOpen(true);
  };

  const openEdit = (wf: Workflow) => {
    setEditing(wf);
    setBuilderOpen(true);
  };

  return (
    <AppLayout>
      <div className="max-w-5xl space-y-6">
        <div>
          <h1 className="font-display text-4xl tracking-tight uppercase">
            Algoritmos
          </h1>
          <p className="text-muted-foreground mt-1">
            Templates passo-a-passo. Blindagem contra distração.
          </p>
        </div>

        {/* Big forge button */}
        <button
          onClick={openNew}
          className="group w-full surface-card p-6 sm:p-8 flex items-center gap-4 sm:gap-6 hover:border-primary/60 hover:glow-primary transition-all duration-300 text-left"
        >
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-primary flex items-center justify-center glow-primary shrink-0 group-hover:scale-110 transition-transform duration-300">
            <Hammer
              className="w-7 h-7 sm:w-8 sm:h-8 text-primary-foreground"
              strokeWidth={2.5}
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-display text-xl sm:text-2xl tracking-tight uppercase">
              Forjar Novo Algoritmo
            </div>
            <div className="text-sm text-muted-foreground mt-0.5">
              Construa um workflow de passos para uma rotina.
            </div>
          </div>
          <Plus className="w-6 h-6 text-primary opacity-70 group-hover:opacity-100 shrink-0" />
        </button>

        {/* Grid */}
        {workflows.length === 0 ? (
          <div className="surface-card p-12 text-center">
            <WorkflowIcon className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">
              Nenhum algoritmo ainda. Forje o primeiro.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {workflows.map((wf) => (
              <div
                key={wf.id}
                className="surface-card p-5 flex flex-col gap-4 hover:border-primary/40 transition-colors group"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="font-display text-lg tracking-tight uppercase line-clamp-2">
                      {wf.title}
                    </h3>
                    <div className="flex items-center gap-1.5 mt-1 text-xs text-muted-foreground">
                      <ListOrdered className="w-3.5 h-3.5" />
                      <span>
                        {wf.steps.length}{" "}
                        {wf.steps.length === 1 ? "passo" : "passos"}
                      </span>
                    </div>
                  </div>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-muted-foreground hover:text-destructive shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          Apagar algoritmo?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          "{wf.title}" será removido. Essa ação é permanente.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => {
                            deleteWorkflow(wf.id);
                            toast.success("Algoritmo apagado");
                          }}
                          className="bg-destructive text-destructive-foreground"
                        >
                          Apagar
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>

                <div className="flex items-center gap-2 mt-auto">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setPreviewing(wf)}
                    title="Visualizar"
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="gap-1.5"
                    onClick={() => openEdit(wf)}
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    Editar
                  </Button>
                  <Button
                    size="sm"
                    className="gap-1.5 ml-auto glow-primary"
                    onClick={() => setRunning(wf)}
                  >
                    <Play className="w-3.5 h-3.5" fill="currentColor" />
                    Executar
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <WorkflowBuilder
        open={builderOpen}
        onOpenChange={setBuilderOpen}
        initial={editing ?? undefined}
        onSave={(data) => {
          if (editing) {
            updateWorkflow(editing.id, data);
            toast.success("Algoritmo atualizado");
          } else {
            createWorkflow(data);
            toast.success("Algoritmo forjado");
          }
        }}
      />

      <WorkflowRunner
        workflow={running}
        onClose={() => setRunning(null)}
      />

      {/* Preview-only dialog */}
      <Dialog
        open={!!previewing}
        onOpenChange={(o) => !o && setPreviewing(null)}
      >
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display text-xl tracking-tight uppercase">
              {previewing?.title}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-2 pt-2">
            {previewing?.steps.map((s, idx) => (
              <div
                key={s.id}
                className="flex gap-3 p-3 rounded-xl bg-secondary/30 border border-border/40"
              >
                <div className="w-7 h-7 rounded-lg bg-gradient-primary flex items-center justify-center text-primary-foreground text-xs font-display shrink-0">
                  {idx + 1}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-medium">{s.title}</div>
                  {s.notes && (
                    <p className="text-xs italic text-muted-foreground mt-0.5">
                      {s.notes}
                    </p>
                  )}
                  {s.estimatedMinutes ? (
                    <p className="text-[11px] italic text-muted-foreground mt-0.5">
                      ~{s.estimatedMinutes} min
                    </p>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
