"use client";

import { use, useState } from "react";
import { notFound } from "next/navigation";
import { Check, FileText, IndianRupee, X } from "lucide-react";
import { toast } from "sonner";

import { PageShell } from "@/components/page-shell";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { formatDate, formatINR } from "@/lib/format";
import { canViewAuditTrail } from "@/lib/audit";
import {
  approveGrant,
  approveMilestone,
  canApproveMilestone,
  canDisburseMilestone,
  disburseMilestone,
  rejectGrant,
  rejectMilestone,
  submitMilestone,
} from "@/lib/csr-grants-actions";
import { useStore } from "@/lib/store";
import type { AuditEntry, GrantMilestone, Role } from "@/lib/types";

export default function GrantDetailPage({ params }: PageProps<"/dashboard/csr-grants/[id]">) {
  const { id } = use(params);
  const { grants, setGrants, currentUser } = useStore();
  const [rejectTarget, setRejectTarget] = useState<{ kind: "grant" | "milestone"; milestoneId?: string } | null>(
    null,
  );

  const grant = grants.find((g) => g.id === id);
  if (!grant) notFound();
  if (!currentUser) return null;

  const handleApproveGrant = () => {
    setGrants((prev) => prev.map((g) => (g.id === grant.id ? approveGrant(g, currentUser) : g)));
    toast.success("Grant approved", { description: `${grant.grantTitle} is now active.` });
  };

  const handleRejectGrant = (reason: string) => {
    setGrants((prev) => prev.map((g) => (g.id === grant.id ? rejectGrant(g, currentUser, reason) : g)));
    setRejectTarget(null);
    toast.error("Grant rejected");
  };

  const handleSubmitMilestone = (milestoneId: string) => {
    setGrants((prev) =>
      prev.map((g) => (g.id === grant.id ? submitMilestone(g, milestoneId, currentUser) : g)),
    );
    toast.success("Milestone submitted for review");
  };

  const handleApproveMilestone = (milestoneId: string) => {
    setGrants((prev) =>
      prev.map((g) => (g.id === grant.id ? approveMilestone(g, milestoneId, currentUser) : g)),
    );
    toast.success("Milestone approved");
  };

  const handleRejectMilestone = (milestoneId: string, reason: string) => {
    setGrants((prev) =>
      prev.map((g) => (g.id === grant.id ? rejectMilestone(g, milestoneId, currentUser, reason) : g)),
    );
    setRejectTarget(null);
    toast.error("Milestone rejected");
  };

  const handleDisburseMilestone = (milestoneId: string) => {
    setGrants((prev) =>
      prev.map((g) => (g.id === grant.id ? disburseMilestone(g, milestoneId, currentUser) : g)),
    );
    toast.success("Milestone marked as disbursed");
  };

  const canApprove = canApproveMilestone(currentUser.role);
  const isMaker = currentUser.name === grant.makerName;

  return (
    <PageShell title={grant.grantTitle}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold">{grant.grantTitle}</h2>
            <StatusBadge status={grant.status} />
          </div>
          <p className="text-sm text-muted-foreground">
            {grant.companyName} · {grant.csrActSection}
          </p>
        </div>

        {grant.status === "PendingApproval" && (
          <div className="flex items-center gap-2">
            {!canApprove && (
              <p className="text-xs text-muted-foreground">
                Only the Dean can approve — switch role to preview.
              </p>
            )}
            <Button
              size="sm"
              variant="outline"
              disabled={!canApprove}
              className="gap-1.5"
              onClick={() => setRejectTarget({ kind: "grant" })}
            >
              <X className="size-4" />
              Reject
            </Button>
            <Button size="sm" disabled={!canApprove} className="gap-1.5" onClick={handleApproveGrant}>
              <Check className="size-4" />
              Approve grant
            </Button>
          </div>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <SummaryCard label="Total amount" value={formatINR(grant.totalAmount)} />
        <SummaryCard label="Sanctioned" value={formatINR(grant.sanctionedAmount)} />
        <SummaryCard label="Disbursed" value={formatINR(grant.disbursedAmount)} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Milestones</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Milestone</TableHead>
                <TableHead>Due date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {grant.milestones.map((m) => (
                <TableRow key={m.id}>
                  <TableCell>
                    <p className="font-medium">{m.title}</p>
                    {m.evidenceNote && (
                      <p className="flex items-center gap-1 text-xs text-muted-foreground">
                        <FileText className="size-3" />
                        {m.evidenceNote}
                      </p>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground">{formatDate(m.dueDate)}</TableCell>
                  <TableCell>{formatINR(m.amount)}</TableCell>
                  <TableCell>
                    <StatusBadge status={m.status} />
                  </TableCell>
                  <TableCell className="text-right">
                    <MilestoneActions
                      milestone={m}
                      role={currentUser.role}
                      onSubmit={() => handleSubmitMilestone(m.id)}
                      onApprove={() => handleApproveMilestone(m.id)}
                      onReject={() => setRejectTarget({ kind: "milestone", milestoneId: m.id })}
                      onDisburse={() => handleDisburseMilestone(m.id)}
                    />
                  </TableCell>
                </TableRow>
              ))}
              {grant.milestones.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="py-10 text-center text-sm text-muted-foreground">
                    No milestones defined yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {canViewAuditTrail(currentUser.role) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Audit trail</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {grant.auditTrail.map((entry) => (
              <AuditRow key={entry.id} entry={entry} />
            ))}
          </CardContent>
        </Card>
      )}

      {isMaker && grant.status === "PendingApproval" && (
        <p className="text-xs text-muted-foreground">
          You created this grant, so you cannot approve it yourself — maker-checker
          separation is enforced by role.
        </p>
      )}

      <RejectDialog
        open={rejectTarget !== null}
        onOpenChange={(v) => !v && setRejectTarget(null)}
        onConfirm={(reason) => {
          if (rejectTarget?.kind === "grant") handleRejectGrant(reason);
          if (rejectTarget?.kind === "milestone" && rejectTarget.milestoneId)
            handleRejectMilestone(rejectTarget.milestoneId, reason);
        }}
      />
    </PageShell>
  );
}

function MilestoneActions({
  milestone,
  role,
  onSubmit,
  onApprove,
  onReject,
  onDisburse,
}: {
  milestone: GrantMilestone;
  role: Role;
  onSubmit: () => void;
  onApprove: () => void;
  onReject: () => void;
  onDisburse: () => void;
}) {
  if (milestone.status === "Pending" && role === "CSR_GRANTS_OFFICER") {
    return (
      <Button size="sm" variant="outline" onClick={onSubmit}>
        Submit for review
      </Button>
    );
  }
  if ((milestone.status === "Submitted" || milestone.status === "UnderReview") && canApproveMilestone(role)) {
    return (
      <div className="flex justify-end gap-2">
        <Button size="sm" variant="outline" onClick={onReject}>
          Reject
        </Button>
        <Button size="sm" onClick={onApprove}>
          Approve
        </Button>
      </div>
    );
  }
  if (milestone.status === "Approved" && canDisburseMilestone(role)) {
    return (
      <Button size="sm" className="gap-1.5" onClick={onDisburse}>
        <IndianRupee className="size-3.5" />
        Mark disbursed
      </Button>
    );
  }
  return null;
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <CardContent className="pt-6">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="mt-1 text-xl font-semibold tracking-tight">{value}</p>
      </CardContent>
    </Card>
  );
}

function AuditRow({ entry }: { entry: AuditEntry }) {
  return (
    <div className="flex items-start justify-between gap-3 border-b pb-3 text-sm last:border-0 last:pb-0">
      <div>
        <p className="font-medium">{entry.action}</p>
        {entry.note && <p className="text-muted-foreground">{entry.note}</p>}
        <p className="text-xs text-muted-foreground">
          {entry.actor} ({entry.role.replace(/_/g, " ").toLowerCase()})
        </p>
      </div>
      <span className="shrink-0 text-xs text-muted-foreground">{formatDate(entry.timestamp)}</span>
    </div>
  );
}

function RejectDialog({
  open,
  onOpenChange,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onConfirm: (reason: string) => void;
}) {
  const [reason, setReason] = useState("");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reason for rejection</DialogTitle>
          <DialogDescription>
            This will be recorded in the audit trail.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-1.5">
          <Label htmlFor="reject-reason">Reason</Label>
          <Textarea
            id="reject-reason"
            rows={3}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
        </div>
        <DialogFooter>
          <Button
            variant="destructive"
            onClick={() => {
              onConfirm(reason || "No reason provided.");
              setReason("");
            }}
          >
            Confirm rejection
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
