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
    title: "Unregulated Team Formation (Base)",
    summary:
      "Students choose teammates freely without accountability. The temptation to pick a lazy friend while relying on the other student's recruit traps both teams in mutual underperformance.",
    incentives: { lowPenalty: 0, peerEvaluation: 0, contributionReward: 0 },
  },
  {
    id: "peer",
    title: "Peer Evaluation Policy",
    summary:
      "Teammates rate each other. Selecting a lazy teammate incurs a 2-point penalty, and 1 point transfers from the lower contributor to the higher one, making choosing a hard-working teammate the unique equilibrium.",
    incentives: { lowPenalty: 2, peerEvaluation: 1, contributionReward: 0 },
  },
  {
    id: "reward",
    title: "Team Contribution Reward",
    summary:
      "The instructor adds 3 bonus marks for each student who recruits a hard-working teammate. Choosing hard-working teammates becomes strictly dominant and maximizes total team scores.",
    incentives: { lowPenalty: 0, peerEvaluation: 0, contributionReward: 3 },
  },
];

export function applyScenario(
  base: IncentiveParams,
  scenario: Scenario,
): IncentiveParams {
  return { ...withoutIncentives(base), ...scenario.incentives };
}
