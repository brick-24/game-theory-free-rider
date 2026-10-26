/**
 * Preset policy scenarios for the demonstration.
 * Each keeps the user's project structure (R, C, F) and sets only the policy incentives.
 */
import { withoutIncentives, type IncentiveParams } from "./model";

export type ScenarioId = "none" | "peer" | "reward";

export interface Scenario {
  id: ScenarioId;
  title: string;
  summary: string;
  incentives: Pick<
    IncentiveParams,
    "lowPenalty" | "peerEvaluation" | "contributionReward"
  >;
}

export const SCENARIOS: readonly Scenario[] = [
  {
    id: "none",
    title: "No incentives (Base)",
    summary:
      "Students bear their own effort costs and share the grade, so either can benefit from the other’s work. This is the reference game.",
    incentives: { lowPenalty: 0, peerEvaluation: 0, contributionReward: 0 },
  },
  {
    id: "peer",
    title: "Peer evaluation",
    summary:
      "Teammates rate each other. Low contribution now costs a 2-point penalty, and when contributions differ, 1 point moves from the lower contributor to the higher one.",
    incentives: { lowPenalty: 2, peerEvaluation: 1, contributionReward: 0 },
  },
  {
    id: "reward",
    title: "Contribution reward",
    summary:
      "The instructor adds 3 bonus marks for each student who contributes high effort. Nobody is penalised.",
    incentives: { lowPenalty: 0, peerEvaluation: 0, contributionReward: 3 },
  },
];

export function applyScenario(
  base: IncentiveParams,
  scenario: Scenario,
): IncentiveParams {
  return { ...withoutIncentives(base), ...scenario.incentives };
}
