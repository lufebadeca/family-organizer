import { Link } from "react-router-dom";
import { Plus } from "lucide-react";
import { getCategoryIcon } from "@/lib/categoryIcons";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { formatCOPCompact } from "@/lib/money";
import { hexWithAlpha } from "@/lib/colors";
import { useCategorySummary } from "@/lib/queries/categories";

export function Categories() {
  const { data: summary = [], isLoading } = useCategorySummary();

  return (
    <>
      <PageHeader title="Categorías" subtitle="Proyectos y agrupadores" />
      <div className="space-y-3 px-4 py-4">
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Cargando…</p>
        ) : summary.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {summary.map((c) => {
              const Icon = getCategoryIcon(c.icon);
              const budget = c.estimated_budget_cop ?? 0;
              const usage =
                budget > 0
                  ? Math.min(100, Math.round((Number(c.spent_cop) / budget) * 100))
                  : 0;
              return (
                <Link
                  key={c.category_id}
                  to={`/categorias/${c.category_id}`}
                  className="block"
                >
                  <Card className="p-3">
                    <div className="flex items-center gap-2">
                      <span
                        className="flex h-8 w-8 items-center justify-center rounded-md"
                        style={{
                          backgroundColor: hexWithAlpha(c.color, 0.18),
                          color: c.color,
                        }}
                      >
                        <Icon className="h-4 w-4" />
                      </span>
                      <p className="truncate text-sm font-semibold">{c.name}</p>
                    </div>
                    <div className="mt-3 space-y-1.5">
                      <div className="flex justify-between text-[11px] text-muted-foreground">
                        <span>{formatCOPCompact(c.spent_cop)}</span>
                        <span>
                          {budget > 0 ? formatCOPCompact(budget) : "Sin tope"}
                        </span>
                      </div>
                      {budget > 0 && (
                        <Progress value={usage} indicatorColor={c.color} />
                      )}
                      <div className="flex justify-between pt-1 text-[10px] uppercase tracking-wide text-muted-foreground">
                        <span>{c.task_pending_count} pend.</span>
                        <span>{c.task_done_count} hechas</span>
                      </div>
                    </div>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border bg-muted/30 p-6 text-center">
      <span className="rounded-full bg-primary/10 p-3 text-primary">
        <Plus className="h-5 w-5" />
      </span>
      <p className="text-sm font-medium">Aún no tienes categorías</p>
      <p className="text-xs text-muted-foreground">
        Crea tu primera categoría desde el botón +
      </p>
    </div>
  );
}
