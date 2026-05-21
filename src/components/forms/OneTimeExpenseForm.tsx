import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MoneyInput } from "@/components/ui/money-input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCategories } from "@/lib/queries/categories";
import { useMembers } from "@/lib/queries/members";
import {
  useCreateOneTimeExpense,
  useUpdateOneTimeExpense,
  type OneTimeExpense,
} from "@/lib/queries/oneTimeExpenses";
import { dayjs } from "@/lib/dates";

const NONE = "__none__";

interface Props {
  initial?: OneTimeExpense;
  defaultCategoryId?: string | null;
  onDone?: () => void;
}

export function OneTimeExpenseForm({
  initial,
  defaultCategoryId,
  onDone,
}: Props) {
  const { data: categories = [] } = useCategories();
  const { data: members = [] } = useMembers();
  const create = useCreateOneTimeExpense();
  const update = useUpdateOneTimeExpense();

  const [title, setTitle] = useState(initial?.title ?? "");
  const [amount, setAmount] = useState<number>(initial?.amount_cop ?? 0);
  const [expenseDate, setExpenseDate] = useState(
    initial?.expense_date ?? dayjs().format("YYYY-MM-DD"),
  );
  const [status, setStatus] = useState<"planned" | "purchased">(
    initial?.status ?? "planned",
  );
  const [purchaseLink, setPurchaseLink] = useState(initial?.purchase_link ?? "");
  const [location, setLocation] = useState(initial?.location ?? "");
  const [assigneeId, setAssigneeId] = useState<string>(
    initial?.assignee_id ?? NONE,
  );
  const [categoryId, setCategoryId] = useState<string>(
    initial?.category_id ?? defaultCategoryId ?? NONE,
  );
  const [includeInMonthly, setIncludeInMonthly] = useState<boolean>(
    initial?.include_in_monthly ?? true,
  );

  const submitting = create.isPending || update.isPending;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const payload = {
      title: title.trim(),
      amount_cop: amount,
      expense_date: expenseDate,
      status,
      purchase_link: purchaseLink.trim() || null,
      location: location.trim() || null,
      assignee_id: assigneeId === NONE ? null : assigneeId,
      category_id: categoryId === NONE ? null : categoryId,
      include_in_monthly: includeInMonthly,
    };
    if (!payload.title || payload.amount_cop <= 0) return;
    if (initial) {
      await update.mutateAsync({ id: initial.id, patch: payload });
    } else {
      await create.mutateAsync(payload);
    }
    onDone?.();
  }

  return (
    <form onSubmit={submit} className="mt-4 space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="ote-title">Título</Label>
        <Input
          id="ote-title"
          autoFocus
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Nevera nueva, Mercado, Tiquetes..."
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="ote-amount">Monto (COP)</Label>
          <MoneyInput id="ote-amount" value={amount} onValueChange={setAmount} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="ote-date">Fecha</Label>
          <Input
            id="ote-date"
            type="date"
            value={expenseDate}
            onChange={(e) => setExpenseDate(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label>Estado</Label>
        <Select
          value={status}
          onValueChange={(v) => setStatus(v as typeof status)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="planned">Planeado</SelectItem>
            <SelectItem value="purchased">Comprado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="ote-location">Lugar (opcional)</Label>
        <Input
          id="ote-location"
          value={location ?? ""}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="Éxito, Falabella, Mercado..."
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="ote-link">Link (opcional)</Label>
        <Input
          id="ote-link"
          type="url"
          inputMode="url"
          value={purchaseLink ?? ""}
          onChange={(e) => setPurchaseLink(e.target.value)}
          placeholder="https://..."
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label>Asignado</Label>
          <Select value={assigneeId} onValueChange={setAssigneeId}>
            <SelectTrigger>
              <SelectValue placeholder="Sin asignar" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={NONE}>Sin asignar</SelectItem>
              {members.map((m) => (
                <SelectItem key={m.id} value={m.id}>
                  {m.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>Categoría</Label>
          <Select value={categoryId} onValueChange={setCategoryId}>
            <SelectTrigger>
              <SelectValue placeholder="Sin categoría" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={NONE}>Sin categoría</SelectItem>
              {categories.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={includeInMonthly}
          onChange={(e) => setIncludeInMonthly(e.target.checked)}
          className="h-4 w-4 rounded border-input"
        />
        <span>Incluir en cuentas mensuales</span>
      </label>

      <Button
        type="submit"
        className="w-full"
        disabled={submitting || !title.trim() || amount <= 0}
      >
        {initial ? "Guardar cambios" : "Crear gasto"}
      </Button>
    </form>
  );
}
