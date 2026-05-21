import { useState } from "react";
import { ExternalLink, MoreVertical, Pencil, Trash2 } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { CategoryChip } from "@/components/chips/CategoryChip";
import { FixedExpenseForm } from "@/components/forms/FixedExpenseForm";
import { formatCOP } from "@/lib/money";
import { cn } from "@/lib/utils";
import type { YearMonth } from "@/lib/dates";
import {
  useDeleteFixedExpense,
  useTogglePayment,
  type FixedExpenseWithPayment,
} from "@/lib/queries/fixedExpenses";
import type { Category } from "@/lib/queries/categories";

interface Props {
  item: FixedExpenseWithPayment;
  period: YearMonth;
  category?: Category | null;
  compact?: boolean;
}

export function FixedExpenseRow({ item, period, category, compact }: Props) {
  const { expense, payment } = item;
  const toggle = useTogglePayment(period);
  const remove = useDeleteFixedExpense();
  const [menuOpen, setMenuOpen] = useState(false);
  const [editing, setEditing] = useState(false);

  const paid = !!payment?.paid;

  return (
    <>
      <div className="flex items-center gap-3 rounded-lg border border-border bg-card px-3 py-2.5">
        <Checkbox
          checked={paid}
          onCheckedChange={(checked) =>
            toggle.mutate({
              fixedExpenseId: expense.id,
              paid: checked === true,
              amountCop: expense.amount_cop,
            })
          }
          aria-label="Marcar pagado"
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p
              className={cn(
                "truncate text-sm font-medium",
                paid && "text-muted-foreground line-through",
              )}
            >
              {expense.name}
            </p>
          </div>
          <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
            <span className="tabular-nums">Día {expense.payment_day}</span>
            {category && <CategoryChip category={category} />}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <p
            className={cn(
              "text-sm font-semibold tabular-nums",
              paid ? "text-muted-foreground line-through" : "text-foreground",
            )}
          >
            {formatCOP(expense.amount_cop)}
          </p>
          {expense.payment_link && (
            <a
              href={expense.payment_link}
              target="_blank"
              rel="noreferrer"
              aria-label="Abrir link de pago"
              className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-accent"
            >
              <ExternalLink className="h-4 w-4" />
            </a>
          )}
          {!compact && (
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              aria-label="Más opciones"
              className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-accent"
            >
              <MoreVertical className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
        <SheetContent side="bottom" className="pb-10">
          <SheetHeader>
            <SheetTitle className="truncate">{expense.name}</SheetTitle>
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
                if (
                  confirm(
                    "¿Eliminar este gasto fijo y todo su historial de pagos?",
                  )
                ) {
                  remove.mutate(expense.id);
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
            <SheetTitle>Editar gasto fijo</SheetTitle>
          </SheetHeader>
          <FixedExpenseForm initial={expense} onDone={() => setEditing(false)} />
        </SheetContent>
      </Sheet>
    </>
  );
}
