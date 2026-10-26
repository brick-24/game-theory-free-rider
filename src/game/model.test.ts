import { describe, expect, it } from 'vitest';
import { analyzeGame, equilibriumWelfare } from './analysis';
import { buildMatrix, DEFAULT_PARAMS, formulaPayoff, withoutIncentives } from './model';
import { applyScenario, SCENARIOS } from './scenarios';
import { simulate } from './simulation';
import { DEFAULT_MATRIX } from './types';

describe('payoff formula', () => {
  it('reproduces the default matrix from the default parameters', () => {
    expect(buildMatrix(DEFAULT_PARAMS)).toEqual(DEFAULT_MATRIX);
  });

  it('applies the low-contribution advantage identities', () => {
    const p = { ...DEFAULT_PARAMS, lowPenalty: 1.5, peerEvaluation: 0.5, contributionReward: 1 };
    const m = buildMatrix(p);
    const { gradeReward: R, effortCost: C, freeRideBenefit: F, lowPenalty: P, peerEvaluation: V, contributionReward: W } = p;
    expect(m.LH.a - m.HH.a).toBeCloseTo(C + F - R - P - V - W);
    expect(m.LL.a - m.HL.a).toBeCloseTo(C - R - P - V - W);
  });

  it('keeps peer evaluation welfare-neutral', () => {
    const m0 = buildMatrix(DEFAULT_PARAMS);
    const m1 = buildMatrix({ ...DEFAULT_PARAMS, peerEvaluation: 3 });
    for (const k of ['HH', 'HL', 'LH', 'LL'] as const) {
      expect(m1[k].a + m1[k].b).toBeCloseTo(m0[k].a + m0[k].b);
    }
  });

  it('is symmetric between the students', () => {
    const m = buildMatrix({ ...DEFAULT_PARAMS, peerEvaluation: 2 });
    expect(m.HL.a).toBe(m.LH.b);
    expect(formulaPayoff(DEFAULT_PARAMS, 'L', 'H')).toBe(8);
  });
});

describe('demonstration scenarios', () => {
  const base = withoutIncentives(DEFAULT_PARAMS);
  const nashFor = (id: string) =>
    analyzeGame(buildMatrix(applyScenario(base, SCENARIOS.find((s) => s.id === id)!))).nash;

  it('leaves free-riding as the equilibrium without incentives', () => {
    expect(nashFor('none')).toEqual(['LL']);
  });

  it('moves the equilibrium to mutual high effort under peer evaluation', () => {
    expect(nashFor('peer')).toEqual(['HH']);
  });

  it('moves the equilibrium to mutual high effort with a contribution reward', () => {
    expect(nashFor('reward')).toEqual(['HH']);
    const m = buildMatrix(applyScenario(base, SCENARIOS[2]));
    expect(equilibriumWelfare(m)).toMatchObject({ kind: 'pure', min: 18, max: 18 });
  });
});

describe('repeated simulation', () => {
  const config = { rounds: 200, rule: 'history' as const, exploration: 0, seed: 7, startA: 'H' as const, startB: 'H' as const };

  it('is reproducible for a fixed seed', () => {
    expect(simulate(DEFAULT_MATRIX, { ...config, exploration: 0.2 })).toEqual(
      simulate(DEFAULT_MATRIX, { ...config, exploration: 0.2 }),
    );
  });

  it('converges to the dominant strategy without exploration', () => {
    const result = simulate(DEFAULT_MATRIX, config);
    expect(result.outcomeCounts).toEqual({ HH: 1, HL: 0, LH: 0, LL: 199 });
    expect(result.settled).toEqual({ outcome: 'LL', fromRound: 2 });
    expect(result.avgPayoffA).toBeCloseTo((6 + 199 * 3) / 200);
  });

  it('follows the last-action rule', () => {
    const result = simulate(DEFAULT_MATRIX, { ...config, rule: 'last-action', rounds: 3 });
    expect(result.records.map((r) => `${r.a}${r.b}`)).toEqual(['HH', 'LL', 'LL']);
  });

  it('keeps the chart series bounded', () => {
    const result = simulate(DEFAULT_MATRIX, { ...config, rounds: 1000 });
    expect(result.series.length).toBeLessThanOrEqual(200);
    expect(result.series.at(-1)?.round).toBe(1000);
  });
});

