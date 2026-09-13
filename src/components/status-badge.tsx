import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const STATUS_STYLES: Record<string, string> = {
  // funds
  Active: "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-400",
  Frozen: "bg-sky-100 text-sky-800 dark:bg-sky-500/15 dark:text-sky-400",
  Closed: "bg-zinc-200 text-zinc-700 dark:bg-zinc-500/15 dark:text-zinc-400",
  // grants
  Draft: "bg-zinc-200 text-zinc-700 dark:bg-zinc-500/15 dark:text-zinc-400",
  PendingApproval: "bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-400",
  Approved: "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-400",
  Completed: "bg-violet-100 text-violet-800 dark:bg-violet-500/15 dark:text-violet-400",
  Rejected: "bg-rose-100 text-rose-800 dark:bg-rose-500/15 dark:text-rose-400",
  // milestones
  Pending: "bg-zinc-200 text-zinc-700 dark:bg-zinc-500/15 dark:text-zinc-400",
  Submitted: "bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-400",
  UnderReview: "bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-400",
  Disbursed: "bg-violet-100 text-violet-800 dark:bg-violet-500/15 dark:text-violet-400",
  // donors
  Prospect: "bg-sky-100 text-sky-800 dark:bg-sky-500/15 dark:text-sky-400",
  Lapsed: "bg-rose-100 text-rose-800 dark:bg-rose-500/15 dark:text-rose-400",
  // pipeline stages
  Identification: "bg-zinc-200 text-zinc-700 dark:bg-zinc-500/15 dark:text-zinc-400",
  Cultivation: "bg-sky-100 text-sky-800 dark:bg-sky-500/15 dark:text-sky-400",
  Solicitation: "bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-400",
  Negotiation: "bg-orange-100 text-orange-800 dark:bg-orange-500/15 dark:text-orange-400",
  ClosedWon: "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-400",
  ClosedLost: "bg-rose-100 text-rose-800 dark:bg-rose-500/15 dark:text-rose-400",
};

const STATUS_LABELS: Record<string, string> = {
  PendingApproval: "Pending Approval",
  UnderReview: "Under Review",
  ClosedWon: "Closed – Won",
  ClosedLost: "Closed – Lost",
};

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  return (
    <Badge
      variant="outline"
      className={cn("border-transparent font-medium", STATUS_STYLES[status], className)}
    >
      {STATUS_LABELS[status] ?? status}
    </Badge>
  );
}
