import { describe, expect, it } from 'vitest';
import {
  analyzeGame,
  bestResponses,
  classifyGame,
  deviationGain,
  dominance,
  equilibriumWelfare,
  mixedEquilibrium,
  paretoOptimal,
  prisonersDilemma,
  pureNashEquilibria,
} from './analysis';
import { DEFAULT_MATRIX, type PayoffMatrix } from './types';

const matrix = (hh: [number, number], hl: [number, number], lh: [number, number], ll: [number, number]): PayoffMatrix => ({
  HH: { a: hh[0], b: hh[1] },
  HL: { a: hl[0], b: hl[1] },
  LH: { a: lh[0], b: lh[1] },
  LL: { a: ll[0], b: ll[1] },
});

describe('default free-rider matrix', () => {
  const a = analyzeGame(DEFAULT_MATRIX);

  it('has (Low, Low) as the only pure Nash equilibrium', () => {
    expect(a.nash).toEqual(['LL']);
    expect(a.strictNash).toEqual(['LL']);
  });

  it('makes Low effort strictly dominant for both students', () => {
    expect(a.dominanceA).toEqual({ kind: 'strict', action: 'L', margins: [2, 1] });
    expect(a.dominanceB).toEqual({ kind: 'strict', action: 'L', margins: [2, 1] });
  });

  it('identifies best responses cell by cell', () => {
    expect(bestResponses(DEFAULT_MATRIX, 'A', 'H')).toEqual(['L']);
    expect(bestResponses(DEFAULT_MATRIX, 'B', 'L')).toEqual(['L']);
    expect(a.bestResponse.LH).toEqual({ a: true, b: false });
    expect(a.bestResponse.HL).toEqual({ a: false, b: true });
  });

  it('computes deviation gains from unilateral switches', () => {
    expect(deviationGain(DEFAULT_MATRIX, 'A', 'HH')).toBe(2);
    expect(deviationGain(DEFAULT_MATRIX, 'B', 'LL')).toBe(-1);
  });

  it('finds mutual High effort has the highest welfare', () => {
    expect(a.maxWelfare).toEqual({ value: 12, outcomes: ['HH'] });
    expect(a.welfare.LL).toBe(6);
  });

  it('is a prisoner’s dilemma', () => {
    const pd = prisonersDilemma(DEFAULT_MATRIX);
    expect(pd.isPrisonersDilemma).toBe(true);
    expect(pd.a).toMatchObject({ T: 8, R: 6, P: 3, S: 2, cooperationBeatsAlternating: true });
    expect(classifyGame(DEFAULT_MATRIX).id).toBe('prisoners-dilemma');
  });

  it('shows the equilibrium is Pareto-dominated', () => {
    expect(paretoOptimal(DEFAULT_MATRIX)).not.toContain('LL');
  });

  it('measures the free-riding temptation', () => {
    expect(a.freeRidingGain).toEqual({ a: 2, b: 2 });
  });

  it('has no fully mixed equilibrium', () => {
    expect(mixedEquilibrium(DEFAULT_MATRIX)).toBeNull();
  });
});

describe('other structures', () => {
  it('handles a game with no pure equilibrium via a mixed one', () => {
    const pennies = matrix([1, -1], [-1, 1], [-1, 1], [1, -1]);
    expect(pureNashEquilibria(pennies)).toEqual([]);
    const mixed = mixedEquilibrium(pennies)!;
    expect(mixed.p).toBeCloseTo(0.5);
    expect(mixed.q).toBeCloseTo(0.5);
    expect(mixed.expectedA).toBeCloseTo(0);
    expect(classifyGame(pennies).id).toBe('no-pure');
    expect(equilibriumWelfare(pennies)).toEqual({ kind: 'mixed', value: 0 });
  });

  it('finds both equilibria of a coordination game plus the mixed one', () => {
    const stagHunt = matrix([5, 5], [0, 3], [3, 0], [3, 3]);
    expect(pureNashEquilibria(stagHunt)).toEqual(['HH', 'LL']);
    expect(classifyGame(stagHunt).id).toBe('coordination');
    const mixed = mixedEquilibrium(stagHunt)!;
    expect(mixed.p).toBeCloseTo(0.6);
    expect(mixed.q).toBeCloseTo(0.6);
  });

  it('finds the asymmetric equilibria of an anti-coordination game', () => {
    const chicken = matrix([4, 4], [2, 6], [6, 2], [0, 0]);
    expect(pureNashEquilibria(chicken)).toEqual(['HL', 'LH']);
    expect(classifyGame(chicken).id).toBe('anti-coordination');
  });

  it('treats ties as best responses and weak equilibria', () => {
    const flat = matrix([1, 1], [1, 1], [1, 1], [1, 1]);
    expect(pureNashEquilibria(flat)).toHaveLength(4);
    expect(bestResponses(flat, 'A', 'H')).toEqual(['H', 'L']);
    expect(dominance(flat, 'A')).toEqual({ kind: 'none' });
    expect(analyzeGame(flat).strictNash).toEqual([]);
    expect(mixedEquilibrium(flat)).toBeNull();
    expect(classifyGame(flat).id).toBe('all-indifferent');
  });

  it('detects weak dominance', () => {
    const weak = matrix([3, 3], [1, 3], [3, 1], [2, 2]);
    expect(dominance(weak, 'A')).toEqual({ kind: 'weak', action: 'L', margins: [0, 1] });
    expect(pureNashEquilibria(weak)).toEqual(['HH', 'LL']);
  });

  it('compares decimals with a tolerance', () => {
    const decimals = matrix([0.3, 0.3], [0, 0.1 + 0.2], [0.1 + 0.2, 0], [0, 0]);
    expect(bestResponses(decimals, 'A', 'H')).toEqual(['H', 'L']);
  });

  it('does not call a game a prisoner’s dilemma when the ordering fails', () => {
    const notPd = matrix([6, 6], [2, 5], [5, 2], [3, 3]);
    const pd = prisonersDilemma(notPd);
    expect(pd.isPrisonersDilemma).toBe(false);
    expect(pd.a.checks.TR).toBe(false);
  });

  it('handles negative payoffs', () => {
    const negative = matrix([-1, -1], [-5, 0], [0, -5], [-3, -3]);
    expect(pureNashEquilibria(negative)).toEqual(['LL']);
    expect(prisonersDilemma(negative).isPrisonersDilemma).toBe(true);
  });
});

