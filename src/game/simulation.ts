/**
 * Repeated-round simulation under an explicit behavioural rule.
 * Results describe that rule only; they are not a Nash equilibrium prediction.
 */
import { compare } from './analysis';
import { OUTCOMES, outcomeKey, type Action, type OutcomeKey, type PayoffMatrix } from './types';

export type DecisionRule = 'last-action' | 'history';
export type StartAction = Action | 'random';

export interface SimulationConfig {
  rounds: number;
  rule: DecisionRule;
  /** Probability in [0, 1) that a student picks an action at random in a round. */
  exploration: number;
  seed: number;
  startA: StartAction;
  startB: StartAction;
}

export interface RoundRecord {
  round: number;
  a: Action;
  b: Action;
  payoffA: number;
  payoffB: number;
}

export interface SeriesPoint {
  round: number;
  /** Share of rounds so far in which each student chose High effort. */
  highA: number;
  highB: number;
}

export interface SimulationResult {
  records: RoundRecord[];
  highShareA: number;
  highShareB: number;
  avgPayoffA: number;
  avgPayoffB: number;
  avgWelfare: number;
  outcomeCounts: Record<OutcomeKey, number>;
  series: SeriesPoint[];
  /** The outcome play settled on, if the final run is long enough to call it settled. */
  settled: { outcome: OutcomeKey; fromRound: number } | null;
}

export const ROUNDS_MIN = 1;
export const ROUNDS_MAX = 1000;
export const MAX_SERIES_POINTS = 200;

/** Small seeded generator (mulberry32) so every run is reproducible. */
export function seededRandom(seed: number): () => number {
  let t = seed >>> 0;
  return () => {
    t = (t + 0x6d2b79f5) >>> 0;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

function coinFlip(rng: () => number): Action {
  return rng() < 0.5 ? 'H' : 'L';
}

/** Highest expected payoff wins. Ties and exploration rounds are decided by a coin flip. */
function choose(rng: () => number, exploration: number, expectedHigh: number, expectedLow: number): Action {
  if (exploration > 0 && rng() < exploration) return coinFlip(rng);
  const c = compare(expectedHigh, expectedLow);
  if (c > 0) return 'H';
  if (c < 0) return 'L';
  return coinFlip(rng);
}

export function simulate(m: PayoffMatrix, config: SimulationConfig): SimulationResult {
  const rounds = Math.round(Math.min(ROUNDS_MAX, Math.max(ROUNDS_MIN, config.rounds)));
  const rng = seededRandom(config.seed);
  const records: RoundRecord[] = [];
  let highA = 0;
  let highB = 0;

  for (let t = 0; t < rounds; t++) {
    let a: Action;
    let b: Action;
    if (t === 0) {
      a = config.startA === 'random' ? coinFlip(rng) : config.startA;
      b = config.startB === 'random' ? coinFlip(rng) : config.startB;
    } else if (config.rule === 'last-action') {
      const prev = records[t - 1];
      a = choose(rng, config.exploration, m[outcomeKey('H', prev.b)].a, m[outcomeKey('L', prev.b)].a);
      b = choose(rng, config.exploration, m[outcomeKey(prev.a, 'H')].b, m[outcomeKey(prev.a, 'L')].b);
    } else {
      // Beliefs start at 50% (one imaginary High and one imaginary Low) and update with observed play.
      const beliefBHigh = (highB + 1) / (t + 2);
      const beliefAHigh = (highA + 1) / (t + 2);
      a = choose(
        rng,
        config.exploration,
        beliefBHigh * m.HH.a + (1 - beliefBHigh) * m.HL.a,
        beliefBHigh * m.LH.a + (1 - beliefBHigh) * m.LL.a,
      );
      b = choose(
        rng,
        config.exploration,
        beliefAHigh * m.HH.b + (1 - beliefAHigh) * m.LH.b,
        beliefAHigh * m.HL.b + (1 - beliefAHigh) * m.LL.b,
      );
    }
    const cell = m[outcomeKey(a, b)];
    records.push({ round: t + 1, a, b, payoffA: cell.a, payoffB: cell.b });
    if (a === 'H') highA++;
    if (b === 'H') highB++;
  }

  const outcomeCounts = { HH: 0, HL: 0, LH: 0, LL: 0 } as Record<OutcomeKey, number>;
  let sumA = 0;
  let sumB = 0;
  for (const r of records) {
    outcomeCounts[outcomeKey(r.a, r.b)]++;
    sumA += r.payoffA;
    sumB += r.payoffB;
  }

  const step = Math.max(1, Math.ceil(rounds / MAX_SERIES_POINTS));
  const series: SeriesPoint[] = [];
  let runA = 0;
  let runB = 0;
  records.forEach((r, i) => {
    if (r.a === 'H') runA++;
    if (r.b === 'H') runB++;
    if ((i + 1) % step === 0 || i === rounds - 1) {
      series.push({ round: r.round, highA: runA / (i + 1), highB: runB / (i + 1) });
    }
  });

  return {
    records,
    highShareA: highA / rounds,
    highShareB: highB / rounds,
    avgPayoffA: sumA / rounds,
    avgPayoffB: sumB / rounds,
    avgWelfare: (sumA + sumB) / rounds,
    outcomeCounts,
    series,
    settled: findSettledOutcome(records),
  };
}

/** Play has settled when the final unbroken run covers at least 5 rounds and 20% of the game. */
function findSettledOutcome(records: RoundRecord[]): SimulationResult['settled'] {
  if (records.length < 5) return null;
  const last = records[records.length - 1];
  const lastKey = outcomeKey(last.a, last.b);
  let start = records.length - 1;
  while (start > 0 && outcomeKey(records[start - 1].a, records[start - 1].b) === lastKey) start--;
  const runLength = records.length - start;
  if (runLength < 5 || runLength < records.length * 0.2) return null;
  return { outcome: lastKey, fromRound: records[start].round };
}

export const EMPTY_COUNTS: Record<OutcomeKey, number> = Object.fromEntries(
  OUTCOMES.map((k) => [k, 0]),
) as Record<OutcomeKey, number>;

