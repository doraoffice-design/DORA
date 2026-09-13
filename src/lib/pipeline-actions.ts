import type { PipelineOpportunity, PipelineStage } from "./types";

export interface NewOpportunityInput {
  donorName: string;
  opportunityName: string;
  estimatedAmount: number;
  expectedCloseDate: string;
}

export function createOpportunity(input: NewOpportunityInput): PipelineOpportunity {
  return {
    id: `opp-${Date.now()}`,
    donorName: input.donorName,
    opportunityName: input.opportunityName,
    stage: "Identification",
    estimatedAmount: input.estimatedAmount,
    probability: stageDefaultProbability("Identification"),
    expectedCloseDate: input.expectedCloseDate || new Date().toISOString().slice(0, 10),
    owner: "You",
  };
}

export function stageDefaultProbability(stage: PipelineStage): number {
  switch (stage) {
    case "Identification":
      return 15;
    case "Cultivation":
      return 35;
    case "Solicitation":
      return 55;
    case "Negotiation":
      return 70;
    case "ClosedWon":
      return 100;
    case "ClosedLost":
      return 0;
  }
}

export function moveStage(opportunity: PipelineOpportunity, stage: PipelineStage): PipelineOpportunity {
  return { ...opportunity, stage, probability: stageDefaultProbability(stage) };
}
