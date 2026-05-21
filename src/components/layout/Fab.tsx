import { useState } from "react";
import { Plus, CheckSquare, Repeat, ShoppingBag, Folder } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { TaskForm } from "@/components/forms/TaskForm";
import { FixedExpenseForm } from "@/components/forms/FixedExpenseForm";
import { OneTimeExpenseForm } from "@/components/forms/OneTimeExpenseForm";
import { CategoryForm } from "@/components/forms/CategoryForm";

type Mode = null | "task" | "fixed" | "one-time" | "category";

export function Fab() {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<Mode>(null);

  const close = () => {
    setMode(null);
    setOpen(false);
  };

  return (
    <>
      <button
        onClick={() => {
          setMode(null);
          setOpen(true);
        }}
        className="fixed bottom-20 right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-xl shadow-primary/30 transition-transform active:scale-95"
        aria-label="Crear nuevo"
      >
        <Plus className="h-6 w-6" />
      </button>

      <Sheet open={open} onOpenChange={(v) => (v ? setOpen(true) : close())}>
        <SheetContent side="bottom" className="max-h-[90vh] overflow-y-auto">
          {mode === null && (
            <>
              <SheetHeader>
                <SheetTitle>¿Qué quieres crear?</SheetTitle>
              </SheetHeader>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <QuickAction
                  icon={<CheckSquare className="h-6 w-6" />}
                  label="Tarea"
                  hint="Pendiente o quehacer"
                  onClick={() => setMode("task")}
                />
                <QuickAction
                  icon={<Repeat className="h-6 w-6" />}
                  label="Gasto fijo"
                  hint="Recurrente mensual"
                  onClick={() => setMode("fixed")}
                />
                <QuickAction
                  icon={<ShoppingBag className="h-6 w-6" />}
                  label="Gasto único"
                  hint="Compra o gasto puntual"
                  onClick={() => setMode("one-time")}
                />
                <QuickAction
                  icon={<Folder className="h-6 w-6" />}
                  label="Categoría"
                  hint="Proyecto o agrupador"
                  onClick={() => setMode("category")}
                />
              </div>
            </>
          )}

          {mode === "task" && (
            <>
              <SheetHeader>
                <SheetTitle>Nueva tarea</SheetTitle>
              </SheetHeader>
              <TaskForm onDone={close} />
            </>
          )}
          {mode === "fixed" && (
            <>
              <SheetHeader>
                <SheetTitle>Nuevo gasto fijo</SheetTitle>
              </SheetHeader>
              <FixedExpenseForm onDone={close} />
            </>
          )}
          {mode === "one-time" && (
            <>
              <SheetHeader>
                <SheetTitle>Nuevo gasto único</SheetTitle>
              </SheetHeader>
              <OneTimeExpenseForm onDone={close} />
            </>
          )}
          {mode === "category" && (
            <>
              <SheetHeader>
                <SheetTitle>Nueva categoría</SheetTitle>
              </SheetHeader>
              <CategoryForm onDone={close} />
            </>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}

function QuickAction({
  icon,
  label,
  hint,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  hint: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-start gap-2 rounded-xl border border-border bg-background p-4 text-left transition-colors hover:bg-accent active:scale-[0.98]"
    >
      <span className="rounded-md bg-primary/10 p-2 text-primary">{icon}</span>
      <div>
        <div className="text-sm font-semibold">{label}</div>
        <div className="text-xs text-muted-foreground">{hint}</div>
      </div>
    </button>
  );
}
