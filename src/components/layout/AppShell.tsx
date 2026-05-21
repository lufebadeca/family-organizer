import type { ReactNode } from "react";
import { BottomNav } from "./BottomNav";
import { Fab } from "./Fab";

interface Props {
  children: ReactNode;
}

export function AppShell({ children }: Props) {
  return (
    <div className="relative mx-auto flex min-h-full max-w-md flex-col">
      <main className="flex-1 pb-32 pt-safe">{children}</main>
      <Fab />
      <BottomNav />
    </div>
  );
}
