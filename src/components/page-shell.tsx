import type { ReactNode } from "react";
import { DashboardTopbar } from "@/components/dashboard-topbar";

export function PageShell({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="flex flex-1 flex-col">
      <DashboardTopbar title={title} />
      <div className="flex flex-1 flex-col gap-6 p-6">{children}</div>
    </div>
  );
}
