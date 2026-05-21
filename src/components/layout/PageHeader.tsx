import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  title: string;
  subtitle?: string;
  back?: boolean | string;
  right?: ReactNode;
  className?: string;
}

export function PageHeader({ title, subtitle, back, right, className }: Props) {
  const navigate = useNavigate();
  return (
    <header
      className={cn(
        "sticky top-0 z-20 flex items-center justify-between gap-2 border-b border-border bg-background/95 px-4 py-3 backdrop-blur",
        className,
      )}
    >
      <div className="flex min-w-0 items-center gap-2">
        {back && (
          <button
            type="button"
            aria-label="Volver"
            onClick={() =>
              typeof back === "string" ? navigate(back) : navigate(-1)
            }
            className="-ml-2 flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground hover:bg-accent"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
        )}
        <div className="min-w-0">
          <h1 className="truncate text-lg font-semibold leading-tight">
            {title}
          </h1>
          {subtitle && (
            <p className="truncate text-xs text-muted-foreground">{subtitle}</p>
          )}
        </div>
      </div>
      {right && <div className="flex items-center gap-2">{right}</div>}
    </header>
  );
}
