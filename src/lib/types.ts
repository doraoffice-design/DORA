export type Role =
  | "ENDOWMENT_OFFICER"
  | "CSR_GRANTS_OFFICER"
  | "SCHOLARSHIP_OFFICER"
  | "FUNDRAISING_OFFICER"
  | "DEAN_APPROVER"
  | "FINANCE"
  | "AUDITOR";

export interface CurrentUser {
  name: string;
  role: Role;
}

export type FundStatus = "Active" | "Frozen" | "Closed";
export type CorpusType = "Restricted" | "Unrestricted";

export interface FundYieldRecord {
  id: string;
  year: string;
  openingBalance: number;
  interestEarned: number;
  disbursed: number;
  closingBalance: number;
  recordedBy: string;
  recordedAt: string;
}

export interface EndowmentFund {
  id: string;
  name: string;
  code: string;
  corpusType: CorpusType;
  corpusValue: number;
  currentBalance: number;
  purpose: string;
  donorName: string;
  establishedDate: string;
  status: FundStatus;
  yieldRecords: FundYieldRecord[];
}

export type MilestoneStatus =
  | "Pending"
  | "Submitted"
  | "UnderReview"
  | "Approved"
  | "Rejected"
  | "Disbursed";

export interface GrantMilestone {
  id: string;
  title: string;
  dueDate: string;
  amount: number;
  status: MilestoneStatus;
  evidenceNote?: string;
  approvedBy?: string;
  disbursedBy?: string;
}

export type GrantStatus =
  | "Draft"
  | "PendingApproval"
  | "Approved"
  | "Active"
  | "Completed"
  | "Rejected";

export interface CSRGrant {
  id: string;
  companyName: string;
  grantTitle: string;
  csrActSection: string;
  totalAmount: number;
  sanctionedAmount: number;
  disbursedAmount: number;
  status: GrantStatus;
  startDate: string;
  endDate: string;
  makerName: string;
  approverName?: string;
  milestones: GrantMilestone[];
  auditTrail: AuditEntry[];
}

export interface AuditEntry {
  id: string;
  action: string;
  actor: string;
  role: Role;
  timestamp: string;
  note?: string;
}

export type DonorType = "Individual" | "Corporate" | "Alumni" | "Foundation";
export type DonorStatus = "Prospect" | "Active" | "Lapsed";

export interface DonorInteraction {
  id: string;
  date: string;
  type: "Call" | "Email" | "Meeting" | "Event";
  summary: string;
  by: string;
}

export interface Donor {
  id: string;
  name: string;
  type: DonorType;
  email: string;
  phone: string;
  status: DonorStatus;
  totalGiving: number;
  relationshipOwner: string;
  lastContactDate: string;
  tags: string[];
  interactions: DonorInteraction[];
}

export type PipelineStage =
  | "Identification"
  | "Cultivation"
  | "Solicitation"
  | "Negotiation"
  | "ClosedWon"
  | "ClosedLost";

export interface PipelineOpportunity {
  id: string;
  donorName: string;
  opportunityName: string;
  stage: PipelineStage;
  estimatedAmount: number;
  probability: number;
  expectedCloseDate: string;
  owner: string;
  notes?: string;
}
