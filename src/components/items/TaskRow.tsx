import { useState } from "react";
import { MoreVertical, Pencil, Trash2 } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { PriorityDot } from "@/components/chips/PriorityDot";
import { AssigneeBadge } from "@/components/chips/AssigneeBadge";
import { CategoryChip } from "@/components/chips/CategoryChip";
import { TaskForm } from "@/components/forms/TaskForm";
import { formatDueDate, daysUntil } from "@/lib/dates";
import { cn } from "@/lib/utils";
import {
  useDeleteTask,
  useToggleTaskDone,
  type Task,
} from "@/lib/queries/tasks";
import type { Category } from "@/lib/queries/categories";
import type { Member } from "@/lib/queries/members";

interface Props {
  task: Task;
  category?: Category | null;
  member?: Member | null;
}

export function TaskRow({ task, category, member }: Props) {
  const toggle = useToggleTaskDone();
  const remove = useDeleteTask();
  const [editing, setEditing] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const isDone = task.status === "done";
  const dueDays = daysUntil(task.due_date);
  const isOverdue =
    !isDone && task.due_date && dueDays != null && dueDays < 0;

  return (
    <>
      <div className="flex items-center gap-3 rounded-lg border border-border bg-card px-3 py-2.5">
        <Checkbox
          checked={isDone}
          onCheckedChange={() => toggle(task)}
          aria-label="Marcar como completada"
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p
              className={cn(
                "truncate text-sm font-medium",
                isDone && "text-muted-foreground line-through",
              )}
            >
              {task.title}
            </p>
          </div>
          <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
            <PriorityDot priority={task.priority} />
            {task.due_date && (
              <span
                className={cn(
                  "tabular-nums",
                  isOverdue && "font-semibold text-destructive",
                )}
              >
                {formatDueDate(task.due_date)}
              </span>
            )}
            {category && <CategoryChip category={category} />}
          </div>
        </div>
        {member && <AssigneeBadge member={member} size="sm" />}
        <button
          type="button"
          onClick={() => setMenuOpen(true)}
          aria-label="Más opciones"
          className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-accent"
        >
          <MoreVertical className="h-4 w-4" />
        </button>
      </div>

      <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
        <SheetContent side="bottom" className="pb-10">
          <SheetHeader>
            <SheetTitle className="truncate">{task.title}</SheetTitle>
          </SheetHeader>
          <div className="mt-4 space-y-1">
            <button
              className="flex w-full items-center gap-3 rounded-md px-3 py-3 text-left text-sm hover:bg-accent"
              onClick={() => {
                setMenuOpen(false);
                setEditing(true);
              }}
            >
              <Pencil className="h-4 w-4" />
              Editar
            </button>
            <button
              className="flex w-full items-center gap-3 rounded-md px-3 py-3 text-left text-sm text-destructive hover:bg-destructive/10"
              onClick={() => {
                if (confirm("¿Eliminar esta tarea?")) {
                  remove.mutate(task.id);
                  setMenuOpen(false);
                }
              }}
            >
              <Trash2 className="h-4 w-4" />
              Eliminar
            </button>
          </div>
        </SheetContent>
      </Sheet>

      <Sheet open={editing} onOpenChange={setEditing}>
        <SheetContent side="bottom" className="max-h-[90vh] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Editar tarea</SheetTitle>
          </SheetHeader>
          <TaskForm initial={task} onDone={() => setEditing(false)} />
        </SheetContent>
      </Sheet>
    </>
  );
}
