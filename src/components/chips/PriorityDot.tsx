import { cn } from "@/lib/utils";

interface PriorityDotProps {
  priority: number;
  className?: string;
  showLabel?: boolean;
}

const config: Record<number, { color: string; label: string }> = {
  1: { color: "bg-emerald-500", label: "Baja" },
  2: { color: "bg-amber-500", label: "Media" },
  3: { color: "bg-rose-500", label: "Alta" },
};

export function PriorityDot({ priority, className, showLabel }: PriorityDotProps) {
  const c = config[priority] ?? config[2]!;
  return (
    <span
      className={cn("inline-flex items-center gap-1.5 text-xs", className)}
      title={`Prioridad ${c.label}`}
    >
      <span className={cn("h-2 w-2 rounded-full", c.color)} />
      {showLabel && <span className="text-muted-foreground">{c.label}</span>}
    </span>
  );
}
