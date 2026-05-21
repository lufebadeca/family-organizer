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
import {
  useCreateFixedExpense,
  useUpdateFixedExpense,
  type FixedExpense,
} from "@/lib/queries/fixedExpenses";

const NONE = "__none__";

interface Props {
  initial?: FixedExpense;
  defaultCategoryId?: string | null;
  onDone?: () => void;
}

export function FixedExpenseForm({ initial, defaultCategoryId, onDone }: Props) {
  const { data: categories = [] } = useCategories();
  const create = useCreateFixedExpense();
  const update = useUpdateFixedExpense();

  const [name, setName] = useState(initial?.name ?? "");
  const [amount, setAmount] = useState<number>(initial?.amount_cop ?? 0);
  const [paymentDay, setPaymentDay] = useState<number>(initial?.payment_day ?? 1);
  const [paymentLink, setPaymentLink] = useState(initial?.payment_link ?? "");
  const [categoryId, setCategoryId] = useState<string>(
    initial?.category_id ?? defaultCategoryId ?? NONE,
  );

  const submitting = create.isPending || update.isPending;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const payload = {
      name: name.trim(),
      amount_cop: amount,
      payment_day: Math.min(31, Math.max(1, paymentDay)),
      payment_link: paymentLink.trim() || null,
      category_id: categoryId === NONE ? null : categoryId,
    };
    if (!payload.name || payload.amount_cop <= 0) return;
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
        <Label htmlFor="fe-name">Concepto</Label>
        <Input
          id="fe-name"
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Arriendo, Internet, Energía..."
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="fe-amount">Monto (COP)</Label>
          <MoneyInput id="fe-amount" value={amount} onValueChange={setAmount} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="fe-day">Día de pago</Label>
          <Input
            id="fe-day"
            type="number"
            min={1}
            max={31}
            value={paymentDay}
            onChange={(e) => setPaymentDay(Number(e.target.value))}
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="fe-link">Link de pago (opcional)</Label>
        <Input
          id="fe-link"
          type="url"
          inputMode="url"
          value={paymentLink ?? ""}
          onChange={(e) => setPaymentLink(e.target.value)}
          placeholder="https://..."
        />
      </div>

      <div className="space-y-1.5">
        <Label>Categoría</Label>
        <Select value={categoryId} onValueChange={setCategoryId}>
          <SelectTrigger>
            <SelectValue />
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

      <Button
        type="submit"
        className="w-full"
        disabled={submitting || !name.trim() || amount <= 0}
      >
        {initial ? "Guardar cambios" : "Crear gasto fijo"}
      </Button>
    </form>
  );
}
