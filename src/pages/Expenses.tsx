import { Repeat, ShoppingBag } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { FixedExpenseRow } from "@/components/items/FixedExpenseRow";
import { OneTimeExpenseRow } from "@/components/items/OneTimeExpenseRow";
import { formatCOP } from "@/lib/money";
import { currentYearMonth, monthLabel } from "@/lib/dates";
import { useFixedExpensesForMonth } from "@/lib/queries/fixedExpenses";
import { useOneTimeExpenses } from "@/lib/queries/oneTimeExpenses";
import { useMonthSummary } from "@/lib/queries/monthlyBudget";
import { useCategories } from "@/lib/queries/categories";
import { useMembers } from "@/lib/queries/members";

export function Expenses() {
  const ym = currentYearMonth();
  const { data: fixed = [] } = useFixedExpensesForMonth(ym);
  const { data: oneTime = [] } = useOneTimeExpenses({ period: ym });
  const { data: summary } = useMonthSummary(ym);
  const { data: categories = [] } = useCategories();
  const { data: members = [] } = useMembers();

  const fixedByDay = groupBy(fixed, (it) => String(it.expense.payment_day));
  const sortedDays = Object.keys(fixedByDay)
    .map(Number)
    .sort((a, b) => a - b);

  return (
    <>
      <PageHeader title="Gastos" subtitle={monthLabel(ym)} />
      <div className="px-4 py-3">
        <Tabs defaultValue="fixed">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="fixed">Fijos</TabsTrigger>
            <TabsTrigger value="one-time">Únicos</TabsTrigger>
            <TabsTrigger value="summary">Resumen</TabsTrigger>
          </TabsList>

          <TabsContent value="fixed" className="space-y-3">
            {fixed.length === 0 ? (
              <EmptyState
                icon={<Repeat className="h-5 w-5" />}
                text="Sin gastos fijos. Agrégalos desde el botón +"
              />
            ) : (
              sortedDays.map((day) => (
                <div key={day} className="space-y-1.5">
                  <p className="px-1 text-[11px] uppercase tracking-wide text-muted-foreground">
                    Día {day} del mes
                  </p>
                  {fixedByDay[String(day)]!.map((it) => (
                    <FixedExpenseRow
                      key={it.expense.id}
                      item={it}
                      period={ym}
                      category={categories.find(
                        (c) => c.id === it.expense.category_id,
                      )}
                    />
                  ))}
                </div>
              ))
            )}
          </TabsContent>

          <TabsContent value="one-time" className="space-y-1.5">
            {oneTime.length === 0 ? (
              <EmptyState
                icon={<ShoppingBag className="h-5 w-5" />}
                text="Sin gastos únicos este mes"
              />
            ) : (
              oneTime.map((e) => (
                <OneTimeExpenseRow
                  key={e.id}
                  expense={e}
                  category={categories.find((c) => c.id === e.category_id)}
                  member={members.find((m) => m.id === e.assignee_id)}
                />
              ))
            )}
          </TabsContent>

          <TabsContent value="summary" className="space-y-3">
            <SummaryCard
              label="Ingreso"
              value={summary?.income_cop ?? 0}
              tone="primary"
            />
            <SummaryCard
              label="Gastos fijos totales"
              value={summary?.fixed_total_cop ?? 0}
            />
            <SummaryCard
              label="Gastos fijos pagados"
              value={summary?.fixed_paid_cop ?? 0}
              hint={`Pendiente: ${formatCOP(summary?.fixed_pending_cop ?? 0)}`}
            />
            <SummaryCard
              label="Gastos únicos del mes"
              value={summary?.one_time_total_cop ?? 0}
            />
            <Card>
              <CardContent className="space-y-2 p-4">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  Balance del mes
                </p>
                <p
                  className={`text-2xl font-bold tabular-nums ${(summary?.balance_cop ?? 0) < 0 ? "text-destructive" : "text-emerald-400"}`}
                >
                  {formatCOP(summary?.balance_cop ?? 0)}
                </p>
                <Progress
                  value={
                    summary && summary.income_cop > 0
                      ? Math.min(
                          100,
                          ((Number(summary.fixed_total_cop) +
                            Number(summary.one_time_total_cop)) /
                            Number(summary.income_cop)) *
                            100,
                        )
                      : 0
                  }
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}

function SummaryCard({
  label,
  value,
  tone,
  hint,
}: {
  label: string;
  value: number;
  tone?: "primary";
  hint?: string;
}) {
  return (
    <Card>
      <CardContent className="flex items-center justify-between p-3">
        <div>
          <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
            {label}
          </p>
          {hint && (
            <p className="text-[10px] text-muted-foreground">{hint}</p>
          )}
        </div>
        <p
          className={`text-base font-semibold tabular-nums ${tone === "primary" ? "text-primary" : ""}`}
        >
          {formatCOP(value)}
        </p>
      </CardContent>
    </Card>
  );
}

function EmptyState({
  icon,
  text,
}: {
  icon: React.ReactNode;
  text: string;
}) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border bg-muted/30 p-6 text-center">
      <span className="rounded-full bg-primary/10 p-3 text-primary">{icon}</span>
      <p className="text-xs text-muted-foreground">{text}</p>
    </div>
  );
}

function groupBy<T>(arr: T[], key: (item: T) => string): Record<string, T[]> {
  return arr.reduce<Record<string, T[]>>((acc, item) => {
    const k = key(item);
    if (!acc[k]) acc[k] = [];
    acc[k]!.push(item);
    return acc;
  }, {});
}
