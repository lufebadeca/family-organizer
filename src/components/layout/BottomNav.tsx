import { NavLink } from "react-router-dom";
import {
  Home,
  CheckSquare,
  Wallet,
  FolderKanban,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { to: "/", label: "Inicio", icon: Home, end: true },
  { to: "/tareas", label: "Tareas", icon: CheckSquare },
  { to: "/gastos", label: "Gastos", icon: Wallet },
  { to: "/categorias", label: "Cat.", icon: FolderKanban },
  { to: "/ajustes", label: "Más", icon: Settings },
];

export function BottomNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-card/95 backdrop-blur pb-safe">
      <ul className="mx-auto flex max-w-md items-stretch justify-around">
        {items.map(({ to, label, icon: Icon, end }) => (
          <li key={to} className="flex-1">
            <NavLink
              to={to}
              end={end}
              className={({ isActive }) =>
                cn(
                  "flex flex-col items-center justify-center gap-1 py-2 text-[11px] font-medium transition-colors",
                  isActive ? "text-primary" : "text-muted-foreground",
                )
              }
            >
              <Icon className="h-5 w-5" />
              <span>{label}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
