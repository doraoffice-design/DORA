import { createAuditEntry } from "./audit";
import type { CSRGrant, CurrentUser, GrantMilestone, Role } from "./types";

// Maker-checker gates for this module — display-only guards for the UI mockup.
// Real enforcement happens server-side once this module is signed off.
export function canCreateGrant(role: Role): boolean {
  return role === "CSR_GRANTS_OFFICER";
}
export function canApproveMilestone(role: Role): boolean {
  return role === "DEAN_APPROVER";
}
export function canDisburseMilestone(role: Role): boolean {
  return role === "FINANCE";
}

export interface NewGrantInput {
  companyName: string;
  grantTitle: string;
  csrActSection: string;
  totalAmount: number;
  startDate: string;
  endDate: string;
}

export function createGrant(input: NewGrantInput, actor: CurrentUser): CSRGrant {
  return {
    id: `grant-${Date.now()}`,
    companyName: input.companyName,
    grantTitle: input.grantTitle,
    csrActSection: input.csrActSection || "Schedule VII",
    totalAmount: input.totalAmount,
    sanctionedAmount: 0,
    disbursedAmount: 0,
    status: "PendingApproval",
    startDate: input.startDate,
    endDate: input.endDate,
    makerName: actor.name,
    milestones: [],
    auditTrail: [createAuditEntry(actor, "Grant created, submitted for approval")],
  };
}

export function approveGrant(grant: CSRGrant, actor: CurrentUser): CSRGrant {
  return {
    ...grant,
    status: "Active",
    sanctionedAmount: grant.totalAmount,
    approverName: actor.name,
    auditTrail: [createAuditEntry(actor, "Grant approved"), ...grant.auditTrail],
  };
}

export function rejectGrant(grant: CSRGrant, actor: CurrentUser, reason: string): CSRGrant {
  return {
    ...grant,
    status: "Rejected",
    approverName: actor.name,
    auditTrail: [createAuditEntry(actor, "Grant rejected", reason), ...grant.auditTrail],
  };
}

function updateMilestone(
  grant: CSRGrant,
  milestoneId: string,
  update: (m: GrantMilestone) => GrantMilestone,
): CSRGrant {
  return {
    ...grant,
    milestones: grant.milestones.map((m) => (m.id === milestoneId ? update(m) : m)),
  };
}

export function submitMilestone(grant: CSRGrant, milestoneId: string, actor: CurrentUser): CSRGrant {
  const milestone = grant.milestones.find((m) => m.id === milestoneId);
  const updated = updateMilestone(grant, milestoneId, (m) => ({
    ...m,
    status: "Submitted",
    evidenceNote: "Utilization certificate + photos uploaded.",
  }));
  return {
    ...updated,
    auditTrail: [
      createAuditEntry(actor, "Milestone submitted for review", milestone?.title),
      ...grant.auditTrail,
    ],
  };
}

export function approveMilestone(grant: CSRGrant, milestoneId: string, actor: CurrentUser): CSRGrant {
  const milestone = grant.milestones.find((m) => m.id === milestoneId);
  const updated = updateMilestone(grant, milestoneId, (m) => ({
    ...m,
    status: "Approved",
    approvedBy: actor.name,
  }));
  return {
    ...updated,
    auditTrail: [createAuditEntry(actor, "Milestone approved", milestone?.title), ...grant.auditTrail],
  };
}

export function rejectMilestone(
  grant: CSRGrant,
  milestoneId: string,
  actor: CurrentUser,
  reason: string,
): CSRGrant {
  const updated = updateMilestone(grant, milestoneId, (m) => ({
    ...m,
    status: "Rejected",
    approvedBy: actor.name,
  }));
  return {
    ...updated,
    auditTrail: [createAuditEntry(actor, "Milestone rejected", reason), ...grant.auditTrail],
  };
}

export function disburseMilestone(grant: CSRGrant, milestoneId: string, actor: CurrentUser): CSRGrant {
  const milestone = grant.milestones.find((m) => m.id === milestoneId);
  if (!milestone) return grant;
  const updated = updateMilestone(grant, milestoneId, (m) => ({
    ...m,
    status: "Disbursed",
    disbursedBy: actor.name,
  }));
  return {
    ...updated,
    disbursedAmount: grant.disbursedAmount + milestone.amount,
    auditTrail: [
      createAuditEntry(actor, "Milestone disbursed", `${milestone.title} — ₹${milestone.amount.toLocaleString("en-IN")}`),
      ...grant.auditTrail,
    ],
  };
}
