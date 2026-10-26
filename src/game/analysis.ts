/**
 * Pure game-theory calculations for any 2×2 payoff matrix.
 * Nothing here knows about React; every result is derived from the matrix passed in.
 */
import {
  ACTIONS,
  OUTCOMES,
  otherAction,
  outcomeKey,
  splitOutcome,
  type Action,
  type OutcomeKey,
  type PayoffMatrix,
  type Player,
} from './types';

/** Tolerance for comparing payoffs, so 0.1 + 0.2 and 0.3 count as a tie. */
export const EPSILON = 1e-9;

/** Three-way comparison with tolerance: 1 if x > y, -1 if x < y, 0 for a tie. */
export function compare(x: number, y: number): -1 | 0 | 1 {
  if (Math.abs(x - y) <= EPSILON) return 0;
  return x > y ? 1 : -1;
}

/** Payoff to `player` when A plays `a` and B plays `b`. */
export function payoff(m: PayoffMatrix, player: Player, a: Action, b: Action): number {
  const cell = m[outcomeKey(a, b)];
  return player === 'A' ? cell.a : cell.b;
}

/** Payoff to `player` from playing `own` against the opponent's `opp`. */
export function payoffFor(m: PayoffMatrix, player: Player, own: Action, opp: Action): number {
  return player === 'A' ? payoff(m, 'A', own, opp) : payoff(m, 'B', opp, own);
}

/**
 * All best responses of `player` to the opponent's action.
 * Returns both actions when they tie.
 */
export function bestResponses(m: PayoffMatrix, player: Player, opponentAction: Action): Action[] {
  const values = ACTIONS.map((own) => payoffFor(m, player, own, opponentAction));
  const best = Math.max(...values);
  return ACTIONS.filter((_, i) => compare(values[i], best) === 0);
}

/** Whether `player`'s action in outcome `k` is a best response to the opponent's action there. */
export function isBestResponse(m: PayoffMatrix, player: Player, k: OutcomeKey): boolean {
  const [a, b] = splitOutcome(k);
  return player === 'A'
    ? bestResponses(m, 'A', b).includes(a)
    : bestResponses(m, 'B', a).includes(b);
}

/**
 * Change in `player`'s payoff from switching their own action while the
 * other student's action stays fixed. Positive means an incentive to switch.
 */
export function deviationGain(m: PayoffMatrix, player: Player, k: OutcomeKey): number {
  const [a, b] = splitOutcome(k);
  if (player === 'A') return m[outcomeKey(otherAction(a), b)].a - m[k].a;
  return m[outcomeKey(a, otherAction(b))].b - m[k].b;
}

/** Pure-strategy Nash equilibrium: no unilateral deviation strictly improves either payoff. */
export function isNashEquilibrium(m: PayoffMatrix, k: OutcomeKey): boolean {
  return compare(deviationGain(m, 'A', k), 0) <= 0 && compare(deviationGain(m, 'B', k), 0) <= 0;
}

export function pureNashEquilibria(m: PayoffMatrix): OutcomeKey[] {
  return OUTCOMES.filter((k) => isNashEquilibrium(m, k));
}

/** Strict equilibrium: every unilateral deviation strictly lowers the deviator's payoff. */
export function isStrictNashEquilibrium(m: PayoffMatrix, k: OutcomeKey): boolean {
  return compare(deviationGain(m, 'A', k), 0) < 0 && compare(deviationGain(m, 'B', k), 0) < 0;
}

export type Dominance =
  | { kind: 'strict'; action: Action; margins: [number, number] }
  | { kind: 'weak'; action: Action; margins: [number, number] }
  | { kind: 'none' };

/**
 * Dominance check for one player.
 * `margins` are the payoff advantages of the dominant action against the
 * opponent's High and Low effort, in that order.
 */
export function dominance(m: PayoffMatrix, player: Player): Dominance {
  const marginsFor = (x: Action): [number, number] => [
    payoffFor(m, player, x, 'H') - payoffFor(m, player, otherAction(x), 'H'),
    payoffFor(m, player, x, 'L') - payoffFor(m, player, otherAction(x), 'L'),
  ];
  for (const x of ACTIONS) {
    const margins = marginsFor(x);
    if (margins.every((d) => compare(d, 0) > 0)) return { kind: 'strict', action: x, margins };
  }
  for (const x of ACTIONS) {
    const margins = marginsFor(x);
    if (margins.every((d) => compare(d, 0) >= 0) && margins.some((d) => compare(d, 0) > 0)) {
      return { kind: 'weak', action: x, margins };
    }
  }
  return { kind: 'none' };
}

/** Social welfare: the sum of both payoffs. */
export function welfare(m: PayoffMatrix, k: OutcomeKey): number {
  return m[k].a + m[k].b;
}

export function maxWelfare(m: PayoffMatrix): { value: number; outcomes: OutcomeKey[] } {
  const values = OUTCOMES.map((k) => welfare(m, k));
  const value = Math.max(...values);
  return { value, outcomes: OUTCOMES.filter((_, i) => compare(values[i], value) === 0) };
}

/** Whether outcome `x` Pareto-dominates `y`: nobody worse off, someone strictly better off. */
export function paretoDominates(m: PayoffMatrix, x: OutcomeKey, y: OutcomeKey): boolean {
  const da = compare(m[x].a, m[y].a);
  const db = compare(m[x].b, m[y].b);
  return da >= 0 && db >= 0 && (da > 0 || db > 0);
}

export function paretoDominators(m: PayoffMatrix, k: OutcomeKey): OutcomeKey[] {
  return OUTCOMES.filter((o) => o !== k && paretoDominates(m, o, k));
}

export function paretoOptimal(m: PayoffMatrix): OutcomeKey[] {
  return OUTCOMES.filter((k) => paretoDominators(m, k).length === 0);
}

export interface DilemmaPayoffs {
  /** Temptation: free-ride while the teammate works hard. */
  T: number;
  /** Reward: both work hard. */
  R: number;
  /** Punishment: both ease off. */
  P: number;
  /** Sucker's payoff: work hard while the teammate free-rides. */
  S: number;
  /** Each inequality of T > R > P > S, in order. */
  checks: { TR: boolean; RP: boolean; PS: boolean };
  ordering: boolean;
  /** 2R > T + S: mutual effort beats taking turns at free-riding. */
  cooperationBeatsAlternating: boolean;
}

export interface PrisonersDilemmaResult {
  a: DilemmaPayoffs;
  b: DilemmaPayoffs;
  isPrisonersDilemma: boolean;
}

function dilemmaPayoffs(T: number, R: number, P: number, S: number): DilemmaPayoffs {
  const checks = {
    TR: compare(T, R) > 0,
    RP: compare(R, P) > 0,
    PS: compare(P, S) > 0,
  };
  return {
    T,
    R,
    P,
    S,
    checks,
    ordering: checks.TR && checks.RP && checks.PS,
    cooperationBeatsAlternating: compare(2 * R, T + S) > 0,
  };
}

/**
 * Prisoner's dilemma test with High effort as cooperation and Low effort as defection.
 * Requires T > R > P > S for both students. The 2R > T + S condition is
 * reported separately because it only matters for repeated play.
 */
export function prisonersDilemma(m: PayoffMatrix): PrisonersDilemmaResult {
  const a = dilemmaPayoffs(m.LH.a, m.HH.a, m.LL.a, m.HL.a);
  const b = dilemmaPayoffs(m.HL.b, m.HH.b, m.LL.b, m.LH.b);
  return { a, b, isPrisonersDilemma: a.ordering && b.ordering };
}

/** Gain from easing off while the teammate keeps working hard. Positive means free-riding pays. */
export function freeRidingGain(m: PayoffMatrix, player: Player): number {
  return player === 'A' ? m.LH.a - m.HH.a : m.HL.b - m.HH.b;
}

export interface MixedEquilibrium {
  /** Probability that Student A chooses High effort. */
  p: number;
  /** Probability that Student B chooses High effort. */
  q: number;
  expectedA: number;
  expectedB: number;
}

/**
 * Fully mixed equilibrium of a 2×2 game, if one exists.
 * A mixes with probability p so that B is indifferent, and B mixes with q so that A is.
 * Returns null when no interior solution exists, including the degenerate
 * case where a player is indifferent everywhere.
 */
export function mixedEquilibrium(m: PayoffMatrix): MixedEquilibrium | null {
  const denomP = m.HH.b - m.LH.b - m.HL.b + m.LL.b;
  const denomQ = m.HH.a - m.HL.a - m.LH.a + m.LL.a;
  if (compare(denomP, 0) === 0 || compare(denomQ, 0) === 0) return null;
  const p = (m.LL.b - m.LH.b) / denomP;
  const q = (m.LL.a - m.HL.a) / denomQ;
  const interior = (x: number) => x > EPSILON && x < 1 - EPSILON;
  if (!interior(p) || !interior(q)) return null;
  return {
    p,
    q,
    expectedA: q * m.HH.a + (1 - q) * m.HL.a,
    expectedB: p * m.HH.b + (1 - p) * m.LH.b,
  };
}

export type GameClassId =
  | 'all-indifferent'
  | 'prisoners-dilemma'
  | 'no-pure'
  | 'anti-coordination'
  | 'coordination'
  | 'cooperation-stable'
  | 'social-dilemma'
  | 'efficient';

export interface GameClass {
  id: GameClassId;
  label: string;
}

const CLASS_LABELS: Record<GameClassId, string> = {
  'all-indifferent': 'Every outcome is an equilibrium',
  'prisoners-dilemma': 'Prisoner’s dilemma',
  'no-pure': 'No pure-strategy equilibrium',
  'anti-coordination': 'Anti-coordination: one student carries the project',
  coordination: 'Coordination game',
  'cooperation-stable': 'Mutual high effort is self-enforcing',
  'social-dilemma': 'Social dilemma',
  efficient: 'Equilibrium is efficient',
};

/** A short label for the strategic structure of the current matrix. */
export function classifyGame(m: PayoffMatrix): GameClass {
  const nash = pureNashEquilibria(m);
  const best = maxWelfare(m);
  const has = (k: OutcomeKey) => nash.includes(k);
  let id: GameClassId;
  if (nash.length === 4) id = 'all-indifferent';
  else if (prisonersDilemma(m).isPrisonersDilemma) id = 'prisoners-dilemma';
  else if (nash.length === 0) id = 'no-pure';
  else if (nash.length === 2 && has('HL') && has('LH')) id = 'anti-coordination';
  else if (has('HH') && has('LL')) id = 'coordination';
  else if (nash.length === 1 && nash[0] === 'HH') id = 'cooperation-stable';
  else if (nash.every((k) => !best.outcomes.includes(k))) id = 'social-dilemma';
  else id = 'efficient';
  return { id, label: CLASS_LABELS[id] };
}

export interface GameAnalysis {
  nash: OutcomeKey[];
  strictNash: OutcomeKey[];
  bestResponse: Record<OutcomeKey, { a: boolean; b: boolean }>;
  deviation: Record<OutcomeKey, { a: number; b: number }>;
  dominanceA: Dominance;
  dominanceB: Dominance;
  welfare: Record<OutcomeKey, number>;
  maxWelfare: { value: number; outcomes: OutcomeKey[] };
  paretoOptimal: OutcomeKey[];
  prisonersDilemma: PrisonersDilemmaResult;
  freeRidingGain: { a: number; b: number };
  mixed: MixedEquilibrium | null;
  classification: GameClass;
}

function byOutcome<T>(fn: (k: OutcomeKey) => T): Record<OutcomeKey, T> {
  return { HH: fn('HH'), HL: fn('HL'), LH: fn('LH'), LL: fn('LL') };
}

/** Every derived result for a matrix, computed in one pass for the UI. */
export function analyzeGame(m: PayoffMatrix): GameAnalysis {
  return {
    nash: pureNashEquilibria(m),
    strictNash: OUTCOMES.filter((k) => isStrictNashEquilibrium(m, k)),
    bestResponse: byOutcome((k) => ({ a: isBestResponse(m, 'A', k), b: isBestResponse(m, 'B', k) })),
    deviation: byOutcome((k) => ({ a: deviationGain(m, 'A', k), b: deviationGain(m, 'B', k) })),
    dominanceA: dominance(m, 'A'),
    dominanceB: dominance(m, 'B'),
    welfare: byOutcome((k) => welfare(m, k)),
    maxWelfare: maxWelfare(m),
    paretoOptimal: paretoOptimal(m),
    prisonersDilemma: prisonersDilemma(m),
    freeRidingGain: { a: freeRidingGain(m, 'A'), b: freeRidingGain(m, 'B') },
    mixed: mixedEquilibrium(m),
    classification: classifyGame(m),
  };
}

export type EquilibriumWelfare =
  | { kind: 'pure'; outcomes: OutcomeKey[]; values: number[]; min: number; max: number }
  | { kind: 'mixed'; value: number }
  | { kind: 'none' };

/** Total payoff the group can expect at equilibrium. */
export function equilibriumWelfare(m: PayoffMatrix): EquilibriumWelfare {
  const nash = pureNashEquilibria(m);
  if (nash.length > 0) {
    const values = nash.map((k) => welfare(m, k));
    return { kind: 'pure', outcomes: nash, values, min: Math.min(...values), max: Math.max(...values) };
  }
  const mixed = mixedEquilibrium(m);
  if (mixed) return { kind: 'mixed', value: mixed.expectedA + mixed.expectedB };
  return { kind: 'none' };
}

