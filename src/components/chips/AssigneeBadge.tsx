import { cn } from "@/lib/utils";
import { initialOf } from "@/lib/colors";
import type { Member } from "@/lib/queries/members";

interface Props {
  member: Member | null | undefined;
  size?: "xs" | "sm" | "md";
  className?: string;
}

const sizeMap = {
  xs: "h-5 w-5 text-[10px]",
  sm: "h-6 w-6 text-xs",
  md: "h-8 w-8 text-sm",
};

export function AssigneeBadge({ member, size = "sm", className }: Props) {
  if (!member) return null;
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-full font-semibold text-white shadow-sm",
        sizeMap[size],
        className,
      )}
      style={{ backgroundColor: member.color }}
      title={member.name}
    >
      {member.emoji ?? initialOf(member.name)}
    </span>
  );
}
