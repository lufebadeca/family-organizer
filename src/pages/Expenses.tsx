import { Repeat, ShoppingBag } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ExpensesSummary } from "@/components/expenses/ExpensesSummary";
import { FixedExpenseRow } from "@/components/items/FixedExpenseRow";
import { OneTimeExpenseRow } from "@/components/items/OneTimeExpenseRow";
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
            <ExpensesSummary
              ym={ym}
              summary={summary}
              fixed={fixed}
              oneTime={oneTime}
              categories={categories}
            />
          </TabsContent>
        </Tabs>
      </div>
    </>
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
