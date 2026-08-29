import type { Donor, DonorInteraction, DonorType, Role } from "./types";

// Display-only guard for the UI mockup — real enforcement happens server-side
// once this module is signed off.
export function canEditDonor(role: Role): boolean {
  return role === "FUNDRAISING_OFFICER" || role === "DEAN_APPROVER";
}

export interface NewDonorInput {
  name: string;
  type: DonorType;
  email: string;
  phone: string;
}

export function createDonor(input: NewDonorInput): Donor {
  return {
    id: `donor-${Date.now()}`,
    name: input.name,
    type: input.type,
    email: input.email,
    phone: input.phone,
    status: "Prospect",
    totalGiving: 0,
    relationshipOwner: "You",
    lastContactDate: new Date().toISOString().slice(0, 10),
    tags: [],
    interactions: [],
  };
}

export function logInteraction(
  donor: Donor,
  type: DonorInteraction["type"],
  summary: string,
  actorName: string,
): Donor {
  const interaction: DonorInteraction = {
    id: `interaction-${Date.now()}`,
    date: new Date().toISOString().slice(0, 10),
    type,
    summary,
    by: actorName,
  };
  return {
    ...donor,
    lastContactDate: interaction.date,
    interactions: [interaction, ...donor.interactions],
  };
}
