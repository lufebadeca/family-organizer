import { useEffect, useState } from "react";
import { Pencil, Plus, Trash2, Copy } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { MoneyInput } from "@/components/ui/money-input";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { AssigneeBadge } from "@/components/chips/AssigneeBadge";
import { MemberForm } from "@/components/forms/MemberForm";
import { formatCOP } from "@/lib/money";
import { currentYearMonth, monthLabel, previousYearMonth } from "@/lib/dates";
import {
  useDeleteMember,
  useMembers,
  type Member,
} from "@/lib/queries/members";
import {
  useCopyPreviousMonthBudget,
  useMonthlyBudget,
  useUpsertMonthlyBudget,
} from "@/lib/queries/monthlyBudget";

export function SettingsPage() {
  const ym = currentYearMonth();
  const { data: members = [] } = useMembers();
  const { data: budget } = useMonthlyBudget(ym);
  const { data: prevBudget } = useMonthlyBudget(previousYearMonth(ym));
  const upsert = useUpsertMonthlyBudget();
  const copyPrev = useCopyPreviousMonthBudget();
  const deleteMember = useDeleteMember();

  const [income, setIncome] = useState<number>(budget?.income_cop ?? 0);
  const [memberSheet, setMemberSheet] = useState<{ open: boolean; initial?: Member }>(
    { open: false },
  );

  useEffect(() => {
    if (budget) setIncome(budget.income_cop);
  }, [budget]);

  return (
    <>
      <PageHeader title="Ajustes" subtitle="Configuración general" />
      <div className="space-y-5 px-4 py-4">
        <section className="space-y-2">
          <h2 className="text-sm font-semibold">
            Ingreso mensual · {monthLabel(ym)}
          </h2>
          <Card>
            <CardContent className="space-y-3 p-4">
              <div className="space-y-1.5">
                <Label htmlFor="income">Ingreso del mes (COP)</Label>
                <MoneyInput id="income" value={income} onValueChange={setIncome} />
              </div>
              <div className="flex gap-2">
                <Button
                  className="flex-1"
                  onClick={() =>
                    upsert.mutate({
                      year: ym.year,
                      month: ym.month,
                      income_cop: income,
                    })
                  }
                  disabled={upsert.isPending || income < 0}
                >
                  Guardar
                </Button>
                {prevBudget && !budget && (
                  <Button
                    variant="outline"
                    onClick={() => copyPrev(ym)}
                    className="gap-1"
                  >
                    <Copy className="h-4 w-4" />
                    Copiar anterior
                  </Button>
                )}
              </div>
              {prevBudget && (
                <p className="text-xs text-muted-foreground">
                  Mes anterior: {formatCOP(prevBudget.income_cop)}
                </p>
              )}
            </CardContent>
          </Card>
        </section>

        <section className="space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">Miembros de la familia</h2>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setMemberSheet({ open: true })}
            >
              <Plus className="h-4 w-4" />
              Agregar
            </Button>
          </div>
          {members.length === 0 ? (
            <p className="rounded-lg border border-dashed border-border bg-muted/30 p-4 text-center text-xs text-muted-foreground">
              Aún no hay miembros. Agrega los nombres de quienes usan la app.
            </p>
          ) : (
            <Card>
              <CardContent className="divide-y divide-border p-0">
                {members.map((m) => (
                  <div
                    key={m.id}
                    className="flex items-center gap-3 px-3 py-2.5"
                  >
                    <AssigneeBadge member={m} size="md" />
                    <p className="flex-1 truncate text-sm font-medium">
                      {m.name}
                    </p>
                    <button
                      type="button"
                      onClick={() => setMemberSheet({ open: true, initial: m })}
                      className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-accent"
                      aria-label="Editar"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm(`¿Eliminar a ${m.name}?`)) {
                          deleteMember.mutate(m.id);
                        }
                      }}
                      className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                      aria-label="Eliminar"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-semibold">Acerca de</h2>
          <Card>
            <CardContent className="space-y-1 p-4 text-xs text-muted-foreground">
              <p>
                Family Organizer · uso personal sin autenticación. Los datos viven
                en Supabase y se sincronizan entre dispositivos.
              </p>
              <p>
                Comparte la URL con tu familia para que también pueda usarla.
              </p>
            </CardContent>
          </Card>
        </section>
      </div>

      <Sheet
        open={memberSheet.open}
        onOpenChange={(v) => setMemberSheet({ open: v, initial: memberSheet.initial })}
      >
        <SheetContent side="bottom" className="max-h-[90vh] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>
              {memberSheet.initial ? "Editar miembro" : "Nuevo miembro"}
            </SheetTitle>
          </SheetHeader>
          <MemberForm
            initial={memberSheet.initial}
            onDone={() => setMemberSheet({ open: false })}
          />
        </SheetContent>
      </Sheet>
    </>
  );
}
