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
import { CATEGORY_COLORS } from "@/lib/colors";
import { cn } from "@/lib/utils";
import {
  useCreateCategory,
  useUpdateCategory,
  type Category,
} from "@/lib/queries/categories";

const ICON_OPTIONS = [
  "Folder",
  "Home",
  "UtensilsCrossed",
  "PiggyBank",
  "Plane",
  "Hammer",
  "Car",
  "Heart",
  "Gift",
  "GraduationCap",
  "ShoppingBag",
  "Sparkles",
];

interface Props {
  initial?: Category;
  onDone?: () => void;
}

export function CategoryForm({ initial, onDone }: Props) {
  const [name, setName] = useState(initial?.name ?? "");
  const [color, setColor] = useState(initial?.color ?? CATEGORY_COLORS[0]!);
  const [icon, setIcon] = useState(initial?.icon ?? "Folder");
  const [budget, setBudget] = useState<number>(initial?.estimated_budget_cop ?? 0);
  const [savings, setSavings] = useState<number>(
    initial?.monthly_savings_quota_cop ?? 0,
  );
  const create = useCreateCategory();
  const update = useUpdateCategory();
  const submitting = create.isPending || update.isPending;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const payload = {
      name: name.trim(),
      color,
      icon,
      estimated_budget_cop: budget > 0 ? budget : null,
      monthly_savings_quota_cop: savings > 0 ? savings : null,
    };
    if (!payload.name) return;
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
        <Label htmlFor="cat-name">Nombre</Label>
        <Input
          id="cat-name"
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Viaje a la costa, Remodelación..."
        />
      </div>

      <div className="space-y-1.5">
        <Label>Color</Label>
        <div className="flex flex-wrap gap-2">
          {CATEGORY_COLORS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setColor(c)}
              className={cn(
                "h-8 w-8 rounded-full border-2 transition-transform",
                color === c
                  ? "scale-110 border-foreground"
                  : "border-transparent",
              )}
              style={{ backgroundColor: c }}
              aria-label={`Color ${c}`}
            />
          ))}
        </div>
      </div>

      <div className="space-y-1.5">
        <Label>Icono</Label>
        <Select value={icon} onValueChange={setIcon}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ICON_OPTIONS.map((i) => (
              <SelectItem key={i} value={i}>
                {i}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="cat-budget">Presupuesto estimado (opcional)</Label>
        <MoneyInput id="cat-budget" value={budget} onValueChange={setBudget} />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="cat-savings">Cuota mensual de ahorro (opcional)</Label>
        <MoneyInput id="cat-savings" value={savings} onValueChange={setSavings} />
      </div>

      <Button type="submit" className="w-full" disabled={submitting || !name.trim()}>
        {initial ? "Guardar cambios" : "Crear categoría"}
      </Button>
    </form>
  );
}
