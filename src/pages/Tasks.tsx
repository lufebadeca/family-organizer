import { useState } from "react";
import { CheckSquare } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TaskRow } from "@/components/items/TaskRow";
import { useTasks } from "@/lib/queries/tasks";
import { useCategories } from "@/lib/queries/categories";
import { useMembers } from "@/lib/queries/members";

const ALL = "__all__";
const NONE = "__none__";

export function Tasks() {
  const [status, setStatus] = useState<"pending" | "done" | "all">("pending");
  const [categoryId, setCategoryId] = useState<string>(ALL);
  const [assigneeId, setAssigneeId] = useState<string>(ALL);

  const { data: categories = [] } = useCategories();
  const { data: members = [] } = useMembers();
  const { data: tasks = [], isLoading } = useTasks({
    status,
    categoryId:
      categoryId === ALL
        ? undefined
        : categoryId === NONE
          ? null
          : categoryId,
    assigneeId:
      assigneeId === ALL
        ? undefined
        : assigneeId === NONE
          ? null
          : assigneeId,
  });

  return (
    <>
      <PageHeader title="Tareas" />
      <div className="space-y-3 px-4 py-3">
        <Tabs
          value={status}
          onValueChange={(v) => setStatus(v as typeof status)}
        >
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="pending">Pendientes</TabsTrigger>
            <TabsTrigger value="done">Hechas</TabsTrigger>
            <TabsTrigger value="all">Todas</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="grid grid-cols-2 gap-2">
          <Select value={categoryId} onValueChange={setCategoryId}>
            <SelectTrigger className="h-9 text-xs">
              <SelectValue placeholder="Categoría" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>Todas las categorías</SelectItem>
              <SelectItem value={NONE}>Sin categoría</SelectItem>
              {categories.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={assigneeId} onValueChange={setAssigneeId}>
            <SelectTrigger className="h-9 text-xs">
              <SelectValue placeholder="Asignado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>Todos</SelectItem>
              <SelectItem value={NONE}>Sin asignar</SelectItem>
              {members.map((m) => (
                <SelectItem key={m.id} value={m.id}>
                  {m.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <p className="text-sm text-muted-foreground">Cargando…</p>
        ) : tasks.length === 0 ? (
          <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border bg-muted/30 p-6 text-center">
            <span className="rounded-full bg-primary/10 p-3 text-primary">
              <CheckSquare className="h-5 w-5" />
            </span>
            <p className="text-sm font-medium">Sin tareas por aquí</p>
            <p className="text-xs text-muted-foreground">
              Crea una nueva desde el botón +
            </p>
          </div>
        ) : (
          <div className="space-y-1.5">
            {tasks.map((t) => (
              <TaskRow
                key={t.id}
                task={t}
                category={categories.find((c) => c.id === t.category_id)}
                member={members.find((m) => m.id === t.assignee_id)}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
