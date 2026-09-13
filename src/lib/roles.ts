import type { Role } from "./types";

export const ROLE_LABELS: Record<Role, string> = {
  ENDOWMENT_OFFICER: "Endowment Officer",
  CSR_GRANTS_OFFICER: "CSR Grants Officer",
  SCHOLARSHIP_OFFICER: "Scholarship Officer",
  FUNDRAISING_OFFICER: "Fundraising Officer",
  DEAN_APPROVER: "Dean (Approver)",
  FINANCE: "Finance",
  AUDITOR: "Auditor",
};

export const ALL_ROLES: Role[] = [
  "ENDOWMENT_OFFICER",
  "CSR_GRANTS_OFFICER",
  "SCHOLARSHIP_OFFICER",
  "FUNDRAISING_OFFICER",
  "DEAN_APPROVER",
  "FINANCE",
  "AUDITOR",
];

export const DEMO_NAMES: Partial<Record<Role, string>> = {
  ENDOWMENT_OFFICER: "Anita Rao",
  CSR_GRANTS_OFFICER: "Rohan Verma",
  FUNDRAISING_OFFICER: "Priya Menon",
  DEAN_APPROVER: "Dean, DORA",
  FINANCE: "Finance Cell",
  AUDITOR: "Internal Audit",
  SCHOLARSHIP_OFFICER: "Kavya Iyer",
};
