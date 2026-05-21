import { Link } from "react-router-dom";
import { ArrowRight, Calendar, Wallet, AlertCircle } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { formatCOP } from "@/lib/money";
import { currentYearMonth, monthLabel, dayjs } from "@/lib/dates";
import { useMonthSummary, useMonthlyBudget } from "@/lib/queries/monthlyBudget";
import { useFixedExpensesForMonth } from "@/lib/queries/fixedExpenses";
import { useTasks } from "@/lib/queries/tasks";
import { useCategories } from "@/lib/queries/categories";
import { useMembers } from "@/lib/queries/members";
import { FixedExpenseRow } from "@/components/items/FixedExpenseRow";
import { TaskRow } from "@/components/items/TaskRow";

export function Home() {
  const ym = currentYearMonth();
  const { data: summary } = useMonthSummary(ym);
  const { data: budget } = useMonthlyBudget(ym);
  const { data: fixedItems = [] } = useFixedExpensesForMonth(ym);
  const { data: tasks = [] } = useTasks({ status: "pending" });
  const { data: categories = [] } = useCategories();
  const { data: members = [] } = useMembers();

  const upcomingPayments = fixedItems
    .filter((it) => !it.payment?.paid)
    .slice(0, 4);

  const urgentTasks = tasks
    .filter((t) => {
      if (t.priority === 3) return true;
      if (!t.due_date) return false;
      const days = dayjs(t.due_date).diff(dayjs().startOf("day"), "day");
      return days <= 3;
    })
    .slice(0, 4);

  const fortnightDay = dayjs().date();
  const nextFortnightEnd = fortnightDay <= 15 ? 15 : dayjs().endOf("month").date();
  const fortnightProjection = fixedItems
    .filter(
      (it) =>
        !it.payment?.paid &&
        it.expense.payment_day >= fortnightDay &&
        it.expense.payment_day <= nextFortnightEnd,
    )
    .reduce((acc, it) => acc + it.expense.amount_cop, 0);

  const income = summary?.income_cop ?? budget?.income_cop ?? 0;
  const spent = (summary?.fixed_total_cop ?? 0) + (summary?.one_time_total_cop ?? 0);
  const balance = income - spent;
  const usagePct = income > 0 ? Math.min(100, (spent / income) * 100) : 0;

  return (
    <>
      <PageHeader title="Inicio" subtitle={monthLabel(ym)} />
      <div className="space-y-4 px-4 py-4">
        <Card>
          <CardContent className="space-y-3 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  Balance del mes
                </p>
                <p
                  className={`text-2xl font-bold tabular-nums ${balance < 0 ? "text-destructive" : "text-foreground"}`}
                >
                  {formatCOP(balance)}
                </p>
              </div>
              <Wallet className="h-6 w-6 text-muted-foreground" />
            </div>
            <Progress value={usagePct} />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Gastado {formatCOP(spent)}</span>
              <span>Ingreso {formatCOP(income)}</span>
            </div>
            {income === 0 && (
              <Link
                to="/ajustes"
                className="inline-flex items-center gap-1 text-xs font-medium text-primary"
              >
                Configurar ingreso mensual
                <ArrowRight className="h-3 w-3" />
              </Link>
            )}
          </CardContent>
        </Card>

        <div className="grid grid-cols-2 gap-3">
          <Stat
            label="Fijos pendientes"
            value={formatCOP(summary?.fixed_pending_cop ?? 0)}
          />
          <Stat
            label="Próx. quincena"
            value={formatCOP(fortnightProjection)}
          />
        </div>

        <section className="space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">Próximos pagos fijos</h2>
            <Link
              to="/gastos"
              className="text-xs text-primary inline-flex items-center gap-1"
            >
              Ver todos <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          {upcomingPayments.length === 0 ? (
            <EmptyHint
              icon={<Calendar className="h-4 w-4" />}
              text="Todo al día este mes"
            />
          ) : (
            <div className="space-y-1">
              {upcomingPayments.map((it) => (
                <FixedExpenseRow
                  key={it.expense.id}
                  item={it}
                  period={ym}
                  category={categories.find((c) => c.id === it.expense.category_id)}
                  compact
                />
              ))}
            </div>
          )}
        </section>

        <section className="space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">Tareas urgentes</h2>
            <Link
              to="/tareas"
              className="text-xs text-primary inline-flex items-center gap-1"
            >
              Ver todas <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          {urgentTasks.length === 0 ? (
            <EmptyHint
              icon={<AlertCircle className="h-4 w-4" />}
              text="Sin pendientes urgentes"
            />
          ) : (
            <div className="space-y-1">
              {urgentTasks.map((t) => (
                <TaskRow
                  key={t.id}
                  task={t}
                  category={categories.find((c) => c.id === t.category_id)}
                  member={members.find((m) => m.id === t.assignee_id)}
                />
              ))}
            </div>
          )}
        </section>

        {income === 0 && (
          <Button asChild variant="outline" className="w-full">
            <Link to="/ajustes">Configurar app</Link>
          </Button>
        )}
      </div>
    </>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <CardContent className="p-3">
        <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
        <p className="mt-0.5 text-base font-semibold tabular-nums">{value}</p>
      </CardContent>
    </Card>
  );
}

function EmptyHint({
  icon,
  text,
}: {
  icon: React.ReactNode;
  text: string;
}) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-dashed border-border bg-muted/30 px-3 py-3 text-xs text-muted-foreground">
      {icon}
      <span>{text}</span>
    </div>
  );
}
