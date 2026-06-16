import { cn } from "@/lib/utils";
import { hexWithAlpha } from "@/lib/colors";
import { getCategoryIcon } from "@/lib/categoryIcons";

interface Props {
  icon: string;
  color: string;
  size?: "sm" | "md";
  className?: string;
}

export function CategoryIconBadge({
  icon,
  color,
  size = "sm",
  className,
}: Props) {
  const Icon = getCategoryIcon(icon);

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-md",
        size === "sm" ? "h-6 w-6" : "h-8 w-8",
        className,
      )}
      style={{
        backgroundColor: hexWithAlpha(color, 0.18),
        color,
      }}
    >
      <Icon className={size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4"} />
    </span>
  );
}
