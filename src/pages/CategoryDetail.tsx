import { useState } from "react";
import { useParams } from "react-router-dom";
import { icons, Folder, Pencil, PiggyBank, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CategoryForm } from "@/components/forms/CategoryForm";
import { TaskRow } from "@/components/items/TaskRow";
import { OneTimeExpenseRow } from "@/components/items/OneTimeExpenseRow";
import { formatCOP } from "@/lib/money";
import { hexWithAlpha } from "@/lib/colors";
import { useCategory, useDeleteCategory } from "@/lib/queries/categories";
import { useTasks } from "@/lib/queries/tasks";
import { useOneTimeExpenses } from "@/lib/queries/oneTimeExpenses";
import { useMembers } from "@/lib/queries/members";
import { useNavigate } from "react-router-dom";

export function CategoryDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: category } = useCategory(id);
  const { data: tasks = [] } = useTasks({ categoryId: id });
  const { data: expenses = [] } = useOneTimeExpenses({ categoryId: id });
  const { data: members = [] } = useMembers();
  const remove = useDeleteCategory();
  const [editing, setEditing] = useState(false);

  if (!category) {
    return (
      <>
        <PageHeader title="Categoría" back />
        <p className="p-4 text-sm text-muted-foreground">Cargando…</p>
      </>
    );
  }

  const Icon =
    (icons[category.icon as keyof typeof icons] as
      | React.ComponentType<{ className?: string }>
      | undefined) ?? Folder;

  const spent = expenses.reduce((acc, e) => acc + e.amount_cop, 0);
  const budget = category.estimated_budget_cop ?? 0;
  const usagePct =
    budget > 0 ? Math.min(100, Math.round((spent / budget) * 100)) : 0;

  return (
    <>
      <PageHeader
        title={category.name}
        back="/categorias"
        right={
          <button
            onClick={() => setEditing(true)}
            className="flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground hover:bg-accent"
            aria-label="Editar"
          >
            <Pencil className="h-4 w-4" />
          </button>
        }
      />
      <div className="space-y-4 px-4 py-4">
        <Card>
          <CardContent className="space-y-3 p-4">
            <div className="flex items-center gap-3">
              <span
                className="flex h-10 w-10 items-center justify-center rounded-lg"
                style={{
                  backgroundColor: hexWithAlpha(category.color, 0.18),
                  color: category.color,
                }}
              >
                <Icon className="h-5 w-5" />
              </span>
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  Ejecutado
                </p>
                <p className="text-xl font-bold tabular-nums">
                  {formatCOP(spent)}
                </p>
              </div>
            </div>
            {budget > 0 ? (
              <>
                <Progress value={usagePct} indicatorColor={category.color} />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{usagePct}% del presupuesto</span>
                  <span>de {formatCOP(budget)}</span>
                </div>
              </>
            ) : (
              <p className="text-xs text-muted-foreground">
                Sin presupuesto estimado
              </p>
            )}
            {category.monthly_savings_quota_cop ? (
              <div className="flex items-center gap-2 rounded-md bg-secondary/40 px-3 py-2 text-xs">
                <PiggyBank className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Cuota mensual</span>
                <span className="ml-auto font-semibold tabular-nums">
                  {formatCOP(category.monthly_savings_quota_cop)}
                </span>
              </div>
            ) : null}
          </CardContent>
        </Card>

        <Tabs defaultValue="expenses">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="expenses">
              Gastos ({expenses.length})
            </TabsTrigger>
            <TabsTrigger value="tasks">Tareas ({tasks.length})</TabsTrigger>
          </TabsList>
          <TabsContent value="expenses" className="space-y-1">
            {expenses.length === 0 ? (
              <p className="rounded-lg border border-dashed border-border bg-muted/30 p-4 text-center text-xs text-muted-foreground">
                Sin gastos en esta categoría
              </p>
            ) : (
              expenses.map((e) => (
                <OneTimeExpenseRow
                  key={e.id}
                  expense={e}
                  category={category}
                  member={members.find((m) => m.id === e.assignee_id)}
                />
              ))
            )}
          </TabsContent>
          <TabsContent value="tasks" className="space-y-1">
            {tasks.length === 0 ? (
              <p className="rounded-lg border border-dashed border-border bg-muted/30 p-4 text-center text-xs text-muted-foreground">
                Sin tareas en esta categoría
              </p>
            ) : (
              tasks.map((t) => (
                <TaskRow
                  key={t.id}
                  task={t}
                  category={category}
                  member={members.find((m) => m.id === t.assignee_id)}
                />
              ))
            )}
          </TabsContent>
        </Tabs>

        <Button
          variant="outline"
          className="w-full text-destructive"
          onClick={() => {
            if (
              confirm(
                "¿Eliminar esta categoría? Sus tareas y gastos quedarán sin categoría.",
              )
            ) {
              remove.mutate(category.id, {
                onSuccess: () => navigate("/categorias"),
              });
            }
          }}
        >
          <Trash2 className="h-4 w-4" />
          Eliminar categoría
        </Button>
      </div>

      <Sheet open={editing} onOpenChange={setEditing}>
        <SheetContent side="bottom" className="max-h-[90vh] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Editar categoría</SheetTitle>
          </SheetHeader>
          <CategoryForm initial={category} onDone={() => setEditing(false)} />
        </SheetContent>
      </Sheet>
    </>
  );
}
