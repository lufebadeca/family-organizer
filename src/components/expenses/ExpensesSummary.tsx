import { BudgetProgress } from "@/components/budget/BudgetProgress";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { formatCOP } from "@/lib/money";
import { dayjs, paymentDateForMonth, type YearMonth } from "@/lib/dates";
import type { MonthSummary } from "@/lib/queries/monthlyBudget";
import type { FixedExpenseWithPayment } from "@/lib/queries/fixedExpenses";
import type { OneTimeExpense } from "@/lib/queries/oneTimeExpenses";
import type { Tables } from "@/types/database";

type Category = Tables<"categories">;

interface Props {
  ym: YearMonth;
  summary: MonthSummary | undefined;
  fixed: FixedExpenseWithPayment[];
  oneTime: OneTimeExpense[];
  categories: Category[];
}

export function ExpensesSummary({
  ym,
  summary,
  fixed,
  oneTime,
  categories,
}: Props) {
  const income = summary?.income_cop ?? 0;
  const fixedTotal = summary?.fixed_total_cop ?? 0;
  const fixedPaid = summary?.fixed_paid_cop ?? 0;
  const fixedPending = summary?.fixed_pending_cop ?? 0;
  const oneTimeTotal = summary?.one_time_total_cop ?? 0;

  const oneTimeIncluded = oneTime.filter((e) => e.include_in_monthly);
  const oneTimePurchasedAmount = oneTimeIncluded
    .filter((e) => e.status === "purchased")
    .reduce((acc, e) => acc + e.amount_cop, 0);
  const oneTimePlannedAmount = oneTimeIncluded
    .filter((e) => e.status === "planned")
    .reduce((acc, e) => acc + e.amount_cop, 0);
  const oneTimePurchasedCount = oneTimeIncluded.filter(
    (e) => e.status === "purchased",
  ).length;
  const oneTimePlannedCount = oneTimeIncluded.filter(
    (e) => e.status === "planned",
  ).length;

  const committed = fixedTotal + oneTimeTotal;
  const paid = fixedPaid + oneTimePurchasedAmount;
  const pending = Math.max(0, committed - paid);
  const balance = income - committed;
  const incomeUsagePct =
    income > 0 ? Math.min(100, Math.round((committed / income) * 100)) : null;
  const executionPct =
    committed > 0 ? Math.round((paid / committed) * 100) : null;

  const fixedPaidCount = fixed.filter((it) => it.payment?.paid).length;
  const fixedPaymentPct =
    fixed.length > 0 ? Math.round((fixedPaidCount / fixed.length) * 100) : 0;

  const today = dayjs().date();
  const nextUnpaid = fixed
    .filter((it) => !it.payment?.paid)
    .sort((a, b) => {
      const dist = (day: number) =>
        day >= today ? day - today : 100 + day;
      return dist(a.expense.payment_day) - dist(b.expense.payment_day);
    })[0];

  const fortnightEnd = today <= 15 ? 15 : dayjs().endOf("month").date();
  const fortnightPending = fixed
    .filter(
      (it) =>
        !it.payment?.paid &&
        it.expense.payment_day >= today &&
        it.expense.payment_day <= fortnightEnd,
    )
    .reduce((acc, it) => acc + it.expense.amount_cop, 0);

  const categoryBreakdown = buildCategoryBreakdown(fixed, oneTimeIncluded, categories)
    .filter((c) => c.amount > 0)
    .slice(0, 5);

  const uncategorizedAmount =
    fixed
      .filter((it) => !it.expense.category_id)
      .reduce((acc, it) => acc + it.expense.amount_cop, 0) +
    oneTimeIncluded
      .filter((e) => !e.category_id)
      .reduce((acc, e) => acc + e.amount_cop, 0);

  return (
    <div className="space-y-3">
      <Card>
        <CardContent className="space-y-3 p-4">
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              Balance del mes
            </p>
            <p
              className={`text-2xl font-bold tabular-nums ${balance < 0 ? "text-destructive" : "text-emerald-400"}`}
            >
              {formatCOP(balance)}
            </p>
            <p className="text-[11px] text-muted-foreground">
              Ingreso {formatCOP(income)} − comprometido {formatCOP(committed)}
            </p>
          </div>
          <BudgetProgress income={income} committed={committed} paid={paid} />
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-2">
        <StatTile label="Comprometido" value={formatCOP(committed)} />
        <StatTile label="Pagado" value={formatCOP(paid)} tone="success" />
        <StatTile label="Por pagar" value={formatCOP(pending)} />
        <StatTile
          label="Uso del ingreso"
          value={incomeUsagePct != null ? `${incomeUsagePct} %` : "—"}
          hint={
            executionPct != null ? `${executionPct} % ejecutado` : undefined
          }
        />
      </div>

      <SectionCard title="Gastos fijos">
        <MetricRow label="Total del mes" value={fixedTotal} />
        <MetricRow label="Pagados" value={fixedPaid} />
        <MetricRow label="Pendientes" value={fixedPending} />
        {fixed.length > 0 && (
          <div className="space-y-1 pt-1">
            <div className="flex justify-between text-[10px] text-muted-foreground">
              <span>
                {fixedPaidCount} de {fixed.length} pagados
              </span>
              <span>{fixedPaymentPct} %</span>
            </div>
            <Progress value={fixedPaymentPct} className="h-1.5" />
          </div>
        )}
        {nextUnpaid && (
          <p className="border-t border-border pt-2 text-[11px] text-muted-foreground">
            Próximo:{" "}
            <span className="font-medium text-foreground">
              {nextUnpaid.expense.name}
            </span>{" "}
            · día {nextUnpaid.expense.payment_day} ·{" "}
            {formatCOP(nextUnpaid.expense.amount_cop)}
          </p>
        )}
        {fortnightPending > 0 && (
          <p className="text-[11px] text-muted-foreground">
            Pendiente esta quincena:{" "}
            <span className="font-medium tabular-nums text-foreground">
              {formatCOP(fortnightPending)}
            </span>
          </p>
        )}
      </SectionCard>

      <SectionCard title="Gastos únicos">
        <MetricRow label="Total del mes" value={oneTimeTotal} />
        <MetricRow label="Comprados" value={oneTimePurchasedAmount} />
        <MetricRow label="Por comprar" value={oneTimePlannedAmount} />
        {oneTimeIncluded.length > 0 && (
          <p className="border-t border-border pt-2 text-[11px] text-muted-foreground">
            {oneTimePurchasedCount} comprados · {oneTimePlannedCount} planeados
          </p>
        )}
      </SectionCard>

      {(categoryBreakdown.length > 0 || uncategorizedAmount > 0) && (
        <SectionCard title="Por categoría">
          {categoryBreakdown.map((item) => (
            <div key={item.id} className="space-y-1">
              <div className="flex items-center justify-between gap-2 text-[11px]">
                <span className="truncate font-medium">{item.name}</span>
                <span className="shrink-0 tabular-nums text-muted-foreground">
                  {formatCOP(item.amount)}
                  {committed > 0 && (
                    <span className="ml-1">
                      ({Math.round((item.amount / committed) * 100)} %)
                    </span>
                  )}
                </span>
              </div>
              <Progress
                value={committed > 0 ? (item.amount / committed) * 100 : 0}
                indicatorColor={item.color}
                className="h-1.5"
              />
            </div>
          ))}
          {uncategorizedAmount > 0 && (
            <div className="space-y-1">
              <div className="flex items-center justify-between gap-2 text-[11px]">
                <span className="truncate font-medium text-muted-foreground">
                  Sin categoría
                </span>
                <span className="shrink-0 tabular-nums text-muted-foreground">
                  {formatCOP(uncategorizedAmount)}
                  {committed > 0 && (
                    <span className="ml-1">
                      ({Math.round((uncategorizedAmount / committed) * 100)} %)
                    </span>
                  )}
                </span>
              </div>
              <Progress
                value={
                  committed > 0 ? (uncategorizedAmount / committed) * 100 : 0
                }
                className="h-1.5"
              />
            </div>
          )}
        </SectionCard>
      )}

      {nextUnpaid && (
        <p className="text-center text-[10px] text-muted-foreground">
          Fecha estimada del próximo pago:{" "}
          {dayjs(paymentDateForMonth(nextUnpaid.expense.payment_day, ym)).format(
            "D MMM",
          )}
        </p>
      )}
    </div>
  );
}

function buildCategoryBreakdown(
  fixed: FixedExpenseWithPayment[],
  oneTime: OneTimeExpense[],
  categories: Category[],
) {
  const totals = new Map<string, number>();

  for (const it of fixed) {
    const id = it.expense.category_id;
    if (!id) continue;
    totals.set(id, (totals.get(id) ?? 0) + it.expense.amount_cop);
  }
  for (const e of oneTime) {
    const id = e.category_id;
    if (!id) continue;
    totals.set(id, (totals.get(id) ?? 0) + e.amount_cop);
  }

  return categories
    .map((c) => ({
      id: c.id,
      name: c.name,
      color: c.color,
      amount: totals.get(c.id) ?? 0,
    }))
    .sort((a, b) => b.amount - a.amount);
}

function StatTile({
  label,
  value,
  tone,
  hint,
}: {
  label: string;
  value: string;
  tone?: "success";
  hint?: string;
}) {
  return (
    <Card>
      <CardContent className="p-3">
        <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
        {hint && (
          <p className="text-[10px] text-muted-foreground">{hint}</p>
        )}
        <p
          className={`mt-0.5 text-sm font-semibold tabular-nums ${tone === "success" ? "text-emerald-400" : ""}`}
        >
          {value}
        </p>
      </CardContent>
    </Card>
  );
}

function SectionCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <CardContent className="space-y-2 p-3">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
          {title}
        </p>
        {children}
      </CardContent>
    </Card>
  );
}

function MetricRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between text-xs">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium tabular-nums">{formatCOP(value)}</span>
    </div>
  );
}
