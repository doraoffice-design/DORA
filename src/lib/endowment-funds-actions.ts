import type { CorpusType, CurrentUser, EndowmentFund, FundYieldRecord } from "./types";

// Maker-checker gate for this module — display-only guard for the UI mockup.
// Real enforcement happens server-side once this module is signed off (see DORA/CLAUDE.md).
export function canRecordFundYield(actor: CurrentUser): boolean {
  return actor.role === "ENDOWMENT_OFFICER";
}

export interface NewFundInput {
  name: string;
  donorName: string;
  corpusType: CorpusType;
  corpusValue: number;
  purpose: string;
}

export function createFund(input: NewFundInput): EndowmentFund {
  return {
    id: `fund-${Date.now()}`,
    name: input.name,
    code: `END-${new Date().getFullYear()}-${Math.floor(Math.random() * 900 + 100)}`,
    corpusType: input.corpusType,
    corpusValue: input.corpusValue,
    currentBalance: input.corpusValue,
    purpose: input.purpose,
    donorName: input.donorName,
    establishedDate: new Date().toISOString().slice(0, 10),
    status: "Active",
    yieldRecords: [],
  };
}

export function computeClosingBalance(
  openingBalance: number,
  interestEarned: number,
  disbursed: number,
): number {
  return openingBalance + interestEarned - disbursed;
}

export function recordFundYield(
  fund: EndowmentFund,
  year: string,
  interestEarned: number,
  disbursed: number,
  actor: CurrentUser,
): EndowmentFund {
  const record: FundYieldRecord = {
    id: `fy-${Date.now()}`,
    year,
    openingBalance: fund.currentBalance,
    interestEarned,
    disbursed,
    closingBalance: computeClosingBalance(fund.currentBalance, interestEarned, disbursed),
    recordedBy: actor.name,
    recordedAt: new Date().toISOString().slice(0, 10),
  };
  return {
    ...fund,
    currentBalance: record.closingBalance,
    yieldRecords: [record, ...fund.yieldRecords],
  };
}
