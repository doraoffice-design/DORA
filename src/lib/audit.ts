import type { AuditEntry, CurrentUser, Role } from "./types";

// Shared audit-log helper — every module's action functions call this so a
// state transition and its audit entry are always created together.
export function createAuditEntry(actor: CurrentUser, action: string, note?: string): AuditEntry {
  return {
    id: `audit-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    action,
    actor: actor.name,
    role: actor.role,
    timestamp: new Date().toISOString().slice(0, 10),
    note,
  };
}

export function canViewAuditTrail(role: Role): boolean {
  return role === "AUDITOR" || role === "DEAN_APPROVER";
}
