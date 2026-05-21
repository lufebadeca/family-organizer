import { useState } from "react";
import { ExternalLink, MapPin, MoreVertical, Pencil, Trash2 } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { AssigneeBadge } from "@/components/chips/AssigneeBadge";
import { CategoryChip } from "@/components/chips/CategoryChip";
import { OneTimeExpenseForm } from "@/components/forms/OneTimeExpenseForm";
import { formatCOP } from "@/lib/money";
import { cn } from "@/lib/utils";
import { dayjs } from "@/lib/dates";
import {
  useDeleteOneTimeExpense,
  useUpdateOneTimeExpense,
  type OneTimeExpense,
} from "@/lib/queries/oneTimeExpenses";
import type { Category } from "@/lib/queries/categories";
import type { Member } from "@/lib/queries/members";

interface Props {
  expense: OneTimeExpense;
  category?: Category | null;
  member?: Member | null;
}

export function OneTimeExpenseRow({ expense, category, member }: Props) {
  const update = useUpdateOneTimeExpense();
  const remove = useDeleteOneTimeExpense();
  const [menuOpen, setMenuOpen] = useState(false);
  const [editing, setEditing] = useState(false);

  const purchased = expense.status === "purchased";

  return (
    <>
      <div className="flex items-center gap-3 rounded-lg border border-border bg-card px-3 py-2.5">
        <button
          type="button"
          aria-label={purchased ? "Marcar como planeado" : "Marcar como comprado"}
          onClick={() =>
            update.mutate({
              id: expense.id,
              patch: {
                status: purchased ? "planned" : "purchased",
              },
            })
          }
          className={cn(
            "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
            purchased
              ? "border-emerald-500 bg-emerald-500 text-white"
              : "border-input",
          )}
        >
          {purchased && (
            <svg viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5">
              <path d="M16.7 5.3a1 1 0 010 1.4l-7.6 7.6a1 1 0 01-1.4 0L3.3 10a1 1 0 011.4-1.4l3.7 3.6 6.9-6.9a1 1 0 011.4 0z" />
            </svg>
          )}
        </button>
        <div className="min-w-0 flex-1">
          <p
            className={cn(
              "truncate text-sm font-medium",
              purchased && "text-muted-foreground line-through",
            )}
          >
            {expense.title}
          </p>
          <div className="mt-0.5 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
            <span>{dayjs(expense.expense_date).format("D MMM")}</span>
            {expense.location && (
              <span className="inline-flex items-center gap-0.5">
                <MapPin className="h-3 w-3" />
                <span className="truncate max-w-[80px]">{expense.location}</span>
              </span>
            )}
            {category && <CategoryChip category={category} />}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <p
            className={cn(
              "text-sm font-semibold tabular-nums",
              purchased
                ? "text-muted-foreground line-through"
                : "text-foreground",
            )}
          >
            {formatCOP(expense.amount_cop)}
          </p>
          {member && <AssigneeBadge member={member} size="xs" />}
          {expense.purchase_link && (
            <a
              href={expense.purchase_link}
              target="_blank"
              rel="noreferrer"
              aria-label="Abrir link"
              className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-accent"
            >
              <ExternalLink className="h-4 w-4" />
            </a>
          )}
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            aria-label="Más opciones"
            className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-accent"
          >
            <MoreVertical className="h-4 w-4" />
          </button>
        </div>
      </div>

      <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
        <SheetContent side="bottom" className="pb-10">
          <SheetHeader>
            <SheetTitle className="truncate">{expense.title}</SheetTitle>
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
                if (confirm("¿Eliminar este gasto?")) {
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
            <SheetTitle>Editar gasto</SheetTitle>
          </SheetHeader>
          <OneTimeExpenseForm
            initial={expense}
            onDone={() => setEditing(false)}
          />
        </SheetContent>
      </Sheet>
    </>
  );
}
