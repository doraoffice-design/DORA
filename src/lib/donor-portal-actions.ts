import { buildGrantMoU, grantMoUFileName } from "./csr-grants-actions";
import { formatDate, formatINR } from "./format";
import type { CSRGrant, Donor, EndowmentFund, GrantMilestone } from "./types";

// Donor-facing document logic for the portal. UI-mockup stage: real documents
// will be uploaded files served from storage once that exists — here every
// document's text is generated from mock data so the download flow, and a
// populated "Your documents" list, are demoable now.

// Financial year the seeded demo documents are dated in — matched to the mock
// yield/disbursement data rather than the real current date.
const DEMO_FY = "FY 2024-25";

export interface DonorDocument {
  id: string;
  label: string;
  detail: string;
  amount?: number;
  issuedOn: string;
  fileName: string;
  content: string;
}

function slug(value: string): string {
  return value.replace(/[^\w]+/g, "-").replace(/^-|-$/g, "");
}

function makeDocument(input: {
  id: string;
  label: string;
  detail: string;
  issuedOn: string;
  amount?: number;
  lines: (string | null)[];
}): DonorDocument {
  return {
    id: input.id,
    label: input.label,
    detail: input.detail,
    amount: input.amount,
    issuedOn: input.issuedOn,
    fileName: `${slug(input.label)}-${slug(input.detail)}.txt`,
    content: input.lines.filter((line): line is string => line !== null).join("\n"),
  };
}

const FOOTER = ["", "Dean of Resources & Alumni Affairs (DORA), IIT Mandi"];

// The signed MoU for a grant, as a downloadable document — null until the grant
// is approved and the MoU is on file. Shared by the "Your documents" list and
// the per-project card on the donor portal.
export function donorMoU(grant: CSRGrant): DonorDocument | null {
  if (!grant.mou) return null;
  return {
    id: `mou-${grant.id}`,
    label: "Memorandum of Understanding",
    detail: grant.grantTitle,
    amount: grant.totalAmount,
    issuedOn: grant.mou.signedDate,
    fileName: grantMoUFileName(grant),
    content: buildGrantMoU(grant),
  };
}

export function buildUtilizationCertificate(grant: CSRGrant, milestone: GrantMilestone): string {
  return makeDocument({
    id: "",
    label: "Utilization Certificate",
    detail: `${grant.grantTitle} — ${milestone.title}`,
    issuedOn: milestone.dueDate,
    lines: [
      "UTILIZATION CERTIFICATE",
      "",
      `Grant: ${grant.grantTitle}`,
      `Donor / Partner: ${grant.companyName}`,
      `CSR Act Section: ${grant.csrActSection}`,
      "",
      `Milestone: ${milestone.title}`,
      `Amount Utilized: ${formatINR(milestone.amount)}`,
      `Due Date: ${formatDate(milestone.dueDate)}`,
      milestone.evidenceNote ? `Utilization Summary: ${milestone.evidenceNote}` : null,
      milestone.disbursedBy ? `Certified & Disbursed By: ${milestone.disbursedBy}, IIT Mandi` : null,
      ...FOOTER,
      `Generated: ${formatDate(new Date().toISOString())}`,
    ],
  }).content;
}

function utilizationCertificates(donor: Donor, grants: CSRGrant[]): DonorDocument[] {
  return grants
    .filter((grant) => grant.companyName === donor.name)
    .flatMap((grant) =>
      grant.milestones
        .filter((milestone) => milestone.status === "Disbursed")
        .map((milestone) =>
          makeDocument({
            id: `uc-${grant.id}-${milestone.id}`,
            label: "Utilization Certificate",
            detail: `${grant.grantTitle} — ${milestone.title}`,
            issuedOn: milestone.dueDate,
            amount: milestone.amount,
            lines: [buildUtilizationCertificate(grant, milestone)],
          }),
        ),
    );
}

// Seeded demo documents so the section looks realistic in a walkthrough even
// for donors with no disbursed milestone yet — an agreement/MoU per giving
// vehicle, an 80G tax receipt, and an annual giving statement.
function partnershipDocuments(
  donor: Donor,
  funds: EndowmentFund[],
  grants: CSRGrant[],
): DonorDocument[] {
  const donorFunds = funds.filter((fund) => fund.donorName === donor.name);
  const donorGrants = grants.filter((grant) => grant.companyName === donor.name);
  if (donorFunds.length === 0 && donorGrants.length === 0) return [];

  const documents: DonorDocument[] = [];

  for (const fund of donorFunds) {
    documents.push(
      makeDocument({
        id: `agr-${fund.id}`,
        label: "Endowment Gift Agreement",
        detail: fund.name,
        issuedOn: fund.establishedDate,
        amount: fund.corpusValue,
        lines: [
          "ENDOWMENT GIFT AGREEMENT",
          "",
          `Fund: ${fund.name} (${fund.code})`,
          `Donor: ${donor.name}`,
          `Corpus Committed: ${formatINR(fund.corpusValue)} (${fund.corpusType})`,
          `Established: ${formatDate(fund.establishedDate)}`,
          `Purpose: ${fund.purpose}`,
          ...FOOTER,
        ],
      }),
    );
  }

  for (const grant of donorGrants) {
    const mou = donorMoU(grant);
    if (mou) documents.push(mou);
  }

  documents.push(
    makeDocument({
      id: `80g-${donor.id}`,
      label: `80G Tax Exemption Receipt — ${DEMO_FY}`,
      detail: donor.name,
      issuedOn: "2025-04-15",
      amount: donor.totalGiving,
      lines: [
        "RECEIPT FOR DONATION — SECTION 80G(2)(a)(iiif)",
        "",
        `Received with thanks from: ${donor.name}`,
        `Total contribution recognised in ${DEMO_FY}: ${formatINR(donor.totalGiving)}`,
        "IIT Mandi is an institution of national importance; donations qualify",
        "for deduction under Section 80G of the Income Tax Act, 1961.",
        ...FOOTER,
      ],
    }),
  );

  documents.push(
    makeDocument({
      id: `stmt-${donor.id}`,
      label: `Annual Giving Statement — ${DEMO_FY}`,
      detail: donor.name,
      issuedOn: "2025-04-30",
      lines: [
        `ANNUAL GIVING STATEMENT — ${DEMO_FY}`,
        "",
        `Donor: ${donor.name} (${donor.type})`,
        `Relationship Manager: ${donor.relationshipOwner}`,
        `Lifetime giving to date: ${formatINR(donor.totalGiving)}`,
        "",
        "Supported this year:",
        ...donorFunds.map((fund) => `  - ${fund.name} — ${formatINR(fund.corpusValue)}`),
        ...donorGrants.map((grant) => `  - ${grant.grantTitle} — ${formatINR(grant.disbursedAmount)} disbursed`),
        ...FOOTER,
      ],
    }),
  );

  return documents;
}

// Every downloadable document available to a donor, newest first: utilization
// certificates for each disbursed CSR milestone against their giving, plus the
// seeded agreement / tax / statement documents.
export function donorDocuments(
  donor: Donor,
  funds: EndowmentFund[],
  grants: CSRGrant[],
): DonorDocument[] {
  return [
    ...utilizationCertificates(donor, grants),
    ...partnershipDocuments(donor, funds, grants),
  ].sort((a, b) => new Date(b.issuedOn).getTime() - new Date(a.issuedOn).getTime());
}
