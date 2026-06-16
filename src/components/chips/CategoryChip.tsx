import { cn } from "@/lib/utils";
import { hexWithAlpha } from "@/lib/colors";
import { getCategoryIcon } from "@/lib/categoryIcons";
import type { Category } from "@/lib/queries/categories";

interface Props {
  category: Category | null | undefined;
  size?: "xs" | "sm";
  showName?: boolean;
  className?: string;
}

export function CategoryChip({
  category,
  size = "xs",
  showName = false,
  className,
}: Props) {
  if (!category) return null;
  const Icon = getCategoryIcon(category.icon);

  if (!showName) {
    return (
      <span
        className={cn(
          "inline-flex items-center justify-center rounded-md",
          size === "xs" ? "h-5 w-5" : "h-6 w-6",
          className,
        )}
        style={{
          backgroundColor: hexWithAlpha(category.color, 0.18),
          color: category.color,
        }}
        title={category.name}
      >
        {Icon ? <Icon className={size === "xs" ? "h-3 w-3" : "h-3.5 w-3.5"} /> : null}
      </span>
    );
  }

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-xs font-medium",
        className,
      )}
      style={{
        backgroundColor: hexWithAlpha(category.color, 0.18),
        color: category.color,
      }}
    >
      {Icon ? <Icon className="h-3 w-3" /> : null}
      <span>{category.name}</span>
    </span>
  );
}
