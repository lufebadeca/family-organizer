import { Input } from "@/components/ui/input";
import { parseCOPInput } from "@/lib/money";

interface Props {
  value: number;
  onValueChange: (value: number) => void;
  placeholder?: string;
  autoFocus?: boolean;
  id?: string;
}

const formatter = new Intl.NumberFormat("es-CO");

export function MoneyInput({
  value,
  onValueChange,
  placeholder = "0",
  autoFocus,
  id,
}: Props) {
  const display = value > 0 ? formatter.format(value) : "";
  return (
    <div className="relative">
      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
        $
      </span>
      <Input
        id={id}
        inputMode="numeric"
        autoComplete="off"
        autoFocus={autoFocus}
        placeholder={placeholder}
        value={display}
        onChange={(e) => onValueChange(parseCOPInput(e.target.value))}
        className="pl-7 tabular-nums"
      />
    </div>
  );
}
