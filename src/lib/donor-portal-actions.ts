import { formatDate, formatINR } from "./format";
import type { CSRGrant, Donor, GrantMilestone } from "./types";

// Donor-facing document logic for the portal. UI-mockup stage: real UCs will
// be uploaded PDFs served from storage once that exists — here the certificate
// text is generated from mock milestone data so the download flow is demoable
// now.

export interface DonorDocument {
  id: string;
  label: string;
  detail: string;
  amount: number;
  issuedOn: string;
  fileName: string;
  content: string;
}

export function buildUtilizationCertificate(grant: CSRGrant, milestone: GrantMilestone): string {
  return [
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
    "",
    "Dean of Resources & Alumni Affairs (DORA), IIT Mandi",
    `Generated: ${formatDate(new Date().toISOString())}`,
  ]
    .filter((line): line is string => line !== null)
    .join("\n");
}

function ucFileName(grant: CSRGrant, milestone: GrantMilestone): string {
  const slug = (value: string) => value.replace(/[^\w]+/g, "-").replace(/^-|-$/g, "");
  return `UC-${slug(grant.companyName)}-${slug(milestone.title)}.txt`;
}

// Every downloadable document available to a donor, newest first. Today that is
// one utilization certificate per disbursed CSR milestone against their giving;
// MoUs, receipts and 80G certificates will slot in here later.
export function donorDocuments(donor: Donor, grants: CSRGrant[]): DonorDocument[] {
  return grants
    .filter((grant) => grant.companyName === donor.name)
    .flatMap((grant) =>
      grant.milestones
        .filter((milestone) => milestone.status === "Disbursed")
        .map((milestone) => ({
          id: `uc-${grant.id}-${milestone.id}`,
          label: "Utilization Certificate",
          detail: `${grant.grantTitle} — ${milestone.title}`,
          amount: milestone.amount,
          issuedOn: milestone.dueDate,
          fileName: ucFileName(grant, milestone),
          content: buildUtilizationCertificate(grant, milestone),
        })),
    )
    .sort((a, b) => new Date(b.issuedOn).getTime() - new Date(a.issuedOn).getTime());
}
