import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCategories } from "@/lib/queries/categories";
import { useMembers } from "@/lib/queries/members";
import {
  useCreateTask,
  useUpdateTask,
  type Task,
} from "@/lib/queries/tasks";

interface Props {
  initial?: Task;
  defaultCategoryId?: string | null;
  onDone?: () => void;
}

const NONE = "__none__";

export function TaskForm({ initial, defaultCategoryId, onDone }: Props) {
  const { data: categories = [] } = useCategories();
  const { data: members = [] } = useMembers();
  const create = useCreateTask();
  const update = useUpdateTask();

  const [title, setTitle] = useState(initial?.title ?? "");
  const [notes, setNotes] = useState(initial?.notes ?? "");
  const [priority, setPriority] = useState<number>(initial?.priority ?? 2);
  const [dueDate, setDueDate] = useState(initial?.due_date ?? "");
  const [assigneeId, setAssigneeId] = useState<string>(
    initial?.assignee_id ?? NONE,
  );
  const [categoryId, setCategoryId] = useState<string>(
    initial?.category_id ?? defaultCategoryId ?? NONE,
  );

  const submitting = create.isPending || update.isPending;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const payload = {
      title: title.trim(),
      notes: notes.trim() || null,
      priority,
      due_date: dueDate || null,
      assignee_id: assigneeId === NONE ? null : assigneeId,
      category_id: categoryId === NONE ? null : categoryId,
    };
    if (!payload.title) return;
    if (initial) {
      await update.mutateAsync({ id: initial.id, patch: payload });
    } else {
      await create.mutateAsync(payload);
    }
    onDone?.();
  }

  return (
    <form onSubmit={submit} className="mt-4 space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="task-title">Título</Label>
        <Input
          id="task-title"
          autoFocus
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Sacar la basura, Llamar al técnico..."
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label>Prioridad</Label>
          <Select
            value={String(priority)}
            onValueChange={(v) => setPriority(Number(v))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">Baja</SelectItem>
              <SelectItem value="2">Media</SelectItem>
              <SelectItem value="3">Alta</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="task-due">Fecha límite</Label>
          <Input
            id="task-due"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label>Asignado</Label>
        <Select value={assigneeId} onValueChange={setAssigneeId}>
          <SelectTrigger>
            <SelectValue placeholder="Sin asignar" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={NONE}>Sin asignar</SelectItem>
            {members.map((m) => (
              <SelectItem key={m.id} value={m.id}>
                {m.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label>Categoría</Label>
        <Select value={categoryId} onValueChange={setCategoryId}>
          <SelectTrigger>
            <SelectValue placeholder="Sin categoría" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={NONE}>Sin categoría</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="task-notes">Notas (opcional)</Label>
        <Textarea
          id="task-notes"
          rows={2}
          value={notes ?? ""}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>

      <Button
        type="submit"
        className="w-full"
        disabled={submitting || !title.trim()}
      >
        {initial ? "Guardar cambios" : "Crear tarea"}
      </Button>
    </form>
  );
}
