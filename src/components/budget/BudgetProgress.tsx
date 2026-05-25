import { cn } from "@/lib/utils";
import { formatCOP } from "@/lib/money";

interface BudgetProgressProps {
  income: number;
  /** Total comprometido del mes (fijos + únicos). */
  committed: number;
  /** Monto ya pagado o comprado. */
  paid: number;
  className?: string;
}

/**
 * Barra de presupuesto mensual.
 * Escala: el ancho completo = ingreso (100 %). Dos segmentos:
 * - Pagado (sólido)
 * - Comprometido pendiente de pago (más tenue)
 */
export function BudgetProgress({
  income,
  committed,
  paid,
  className,
}: BudgetProgressProps) {
  const pending = Math.max(0, committed - paid);
  const scale = income > 0 ? income : Math.max(committed, paid, 1);

  const paidPct = (paid / scale) * 100;
  const pendingPct = (pending / scale) * 100;
  const totalPct = paidPct + pendingPct;
  const overBudget = income > 0 && committed > income;

  let displayPaid = paidPct;
  let displayPending = pendingPct;
  if (totalPct > 100) {
    const factor = 100 / totalPct;
    displayPaid *= factor;
    displayPending *= factor;
  }
  // Los anchos son % puros del track (ingreso = 100 %). Sin restar px por separadores.
  const hasBothSegments = displayPaid > 0 && displayPending > 0;

  const noIncome = income === 0;

  return (
    <div className={cn("space-y-2", className)}>
      <div
        className={cn(
          "relative h-2.5 w-full overflow-hidden rounded-full bg-secondary",
          overBudget && "ring-1 ring-destructive/60",
        )}
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={income > 0 ? income : committed}
        aria-valuenow={paid}
        aria-label="Progreso de gastos del mes"
      >
        {displayPaid > 0 && (
          <div
            className="absolute inset-y-0 left-0 rounded-l-full bg-emerald-400 transition-all"
            style={{ width: `${displayPaid}%` }}
          />
        )}
        {displayPending > 0 && (
          <div
            className={cn(
              "absolute inset-y-0 transition-all",
              overBudget ? "bg-amber-400" : "bg-blue-500",
              hasBothSegments &&
                "shadow-[inset_2px_0_0_0_hsl(var(--background))]",
            )}
            style={{
              left: `${displayPaid}%`,
              width: `${displayPending}%`,
            }}
          />
        )}
        {noIncome && totalPct > 0 && (
          <div className="absolute inset-0 bg-primary/10" aria-hidden />
        )}
      </div>

      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
        <LegendDot color="bg-emerald-400" label={`Pagado ${formatCOP(paid)}`} />
        <LegendDot
          color={overBudget ? "bg-amber-400" : "bg-blue-500"}
          label={`Pendiente ${formatCOP(pending)}`}
        />
        <span className="ml-auto tabular-nums">
          {noIncome ? (
            `Comprometido ${formatCOP(committed)}`
          ) : (
            <>
              Ingreso {formatCOP(income)}
              {overBudget && (
                <span className="ml-1.5 text-destructive">
                  (+{formatCOP(committed - income)} sobre ingreso)
                </span>
              )}
            </>
          )}
        </span>
      </div>
    </div>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={cn("h-2 w-2 shrink-0 rounded-full", color)} />
      {label}
    </span>
  );
}
