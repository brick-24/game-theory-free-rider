/**
 * Transparent payoff formula that turns incentive parameters into a payoff matrix.
 *
 * For student i with teammate j, where e = 1 for High effort and 0 for Low effort,
 * and k = e_i + e_j is the number of students who chose High effort:
 *
 *   u_i = BASE + R·k − C·e_i + F·(1 − e_i)·e_j − P·(1 − e_i) + V·(e_i − e_j) + W·e_i
 */
import { OUTCOMES, splitOutcome, type Action, type PayoffMatrix } from './types';

export interface IncentiveParams {
  /** R: grade benefit each student receives per high-effort contributor. */
  gradeReward: number;
  /** C: cost a student bears for choosing High effort. */
  effortCost: number;
  /** F: extra benefit from easing off while the teammate works hard. */
  freeRideBenefit: number;
  /** P: penalty for any student who chooses Low effort. */
  lowPenalty: number;
  /** V: peer-evaluation transfer from the lower contributor to the higher one. */
  peerEvaluation: number;
  /** W: bonus for each student who chooses High effort. */
  contributionReward: number;
}

export type ParamKey = keyof IncentiveParams;

/** Baseline payoff both students receive regardless of effort, such as a pass mark. */
export const BASELINE_PAYOFF = 3;

/** Reproduces the brief's matrix: (6, 6), (2, 8), (8, 2), (3, 3). */
export const DEFAULT_PARAMS: IncentiveParams = {
  gradeReward: 4,
  effortCost: 5,
  freeRideBenefit: 1,
  lowPenalty: 0,
  peerEvaluation: 0,
  contributionReward: 0,
};

export interface ParamMeta {
  key: ParamKey;
  symbol: string;
  label: string;
  description: string;
  min: number;
  max: number;
  step: number;
  group: 'structure' | 'policy';
}

export const PARAM_META: readonly ParamMeta[] = [
  {
    key: 'gradeReward',
    symbol: 'R',
    label: 'Team project synergy gain',
    description: 'Grade points both students gain for each hard-working teammate recruited.',
    min: 0,
    max: 10,
    step: 0.5,
    group: 'structure',
  },
  {
    key: 'effortCost',
    symbol: 'C',
    label: 'Coordination and effort cost',
    description: 'Time and commitment spent vetting and working with a hard-working teammate.',
    min: 0,
    max: 10,
    step: 0.5,
    group: 'structure',
  },
  {
    key: 'freeRideBenefit',
    symbol: 'F',
    label: 'Free-riding benefit',
    description: 'Extra value a student gets from easing off when partnering with a hard-working peer.',
    min: 0,
    max: 6,
    step: 0.5,
    group: 'structure',
  },
  {
    key: 'lowPenalty',
    symbol: 'P',
    label: 'Lazy teammate penalty',
    description: 'Grade deduction for fielding a lazy, uncooperative teammate under instructor oversight.',
    min: 0,
    max: 8,
    step: 0.5,
    group: 'policy',
  },
  {
    key: 'peerEvaluation',
    symbol: 'V',
    label: 'Peer evaluation transfer',
    description:
      'When teammates differ in effort, peer ratings move V points from the lazy contributor to the hard-working one.',
    min: 0,
    max: 6,
    step: 0.5,
    group: 'policy',
  },
  {
    key: 'contributionReward',
    symbol: 'W',
    label: 'Contribution reward',
    description: 'Bonus marks for each student who contributes high effort, paid by the instructor.',
    min: 0,
    max: 8,
    step: 0.5,
    group: 'policy',
  },
];

export type TermId = 'baseline' | 'grade' | 'cost' | 'freeRide' | 'penalty' | 'peer' | 'reward';

export interface PayoffTerm {
  id: TermId;
  label: string;
  value: number;
}

/** Each additive term of one student's payoff, for showing the calculation. */
export function payoffTerms(p: IncentiveParams, own: Action, mate: Action): PayoffTerm[] {
  const eOwn = own === 'H' ? 1 : 0;
  const eMate = mate === 'H' ? 1 : 0;
  const k = eOwn + eMate;
  return [
    { id: 'baseline', label: 'Baseline', value: BASELINE_PAYOFF },
    { id: 'grade', label: 'Project grade (R × k)', value: p.gradeReward * k },
    { id: 'cost', label: 'Effort cost (−C)', value: -p.effortCost * eOwn },
    { id: 'freeRide', label: 'Free-riding benefit (+F)', value: p.freeRideBenefit * (1 - eOwn) * eMate },
    { id: 'penalty', label: 'Low-contribution penalty (−P)', value: -p.lowPenalty * (1 - eOwn) },
    { id: 'peer', label: 'Peer evaluation (±V)', value: p.peerEvaluation * (eOwn - eMate) },
    { id: 'reward', label: 'Contribution reward (+W)', value: p.contributionReward * eOwn },
  ];
}

export function formulaPayoff(p: IncentiveParams, own: Action, mate: Action): number {
  return payoffTerms(p, own, mate).reduce((sum, t) => sum + t.value, 0);
}

/** Builds the full matrix. The formula is symmetric, so B's payoff swaps the roles. */
export function buildMatrix(p: IncentiveParams): PayoffMatrix {
  const entries = OUTCOMES.map((k) => {
    const [a, b] = splitOutcome(k);
    return [k, { a: formulaPayoff(p, a, b), b: formulaPayoff(p, b, a) }] as const;
  });
  return Object.fromEntries(entries) as PayoffMatrix;
}

/** Same structural parameters (R, C, F) with every policy incentive switched off. */
export function withoutIncentives(p: IncentiveParams): IncentiveParams {
  return { ...p, lowPenalty: 0, peerEvaluation: 0, contributionReward: 0 };
}

export function clampParam(key: ParamKey, value: number): number {
  const meta = PARAM_META.find((m) => m.key === key)!;
  return Math.min(meta.max, Math.max(meta.min, value));
}

