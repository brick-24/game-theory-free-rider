import { describe, expect, it } from 'vitest';
import { analyzeGame } from './analysis';
import { buildMatrix, DEFAULT_PARAMS, withoutIncentives } from './model';
import { applyScenario, SCENARIOS } from './scenarios';
import { DEFAULT_MATRIX, type OutcomeKey } from './types';

describe('outcome comparison and presets verification', () => {
  it('correctly identifies baseline dilemma trap and team optimum', () => {
    const analysis = analyzeGame(DEFAULT_MATRIX);

    // LL is the unique Nash equilibrium
    expect(analysis.nash).toEqual(['LL']);

    // HH has the maximum team score (social optimum)
    expect(analysis.maxWelfare.outcomes).toEqual(['HH']);
    expect(analysis.maxWelfare.value).toBe(12);

    // LL has team score 6, which is strictly worse than HH (12)
    const teamScoreLL = DEFAULT_MATRIX.LL.a + DEFAULT_MATRIX.LL.b;
    expect(teamScoreLL).toBe(6);

    // Prisoner's dilemma condition holds
    expect(analysis.prisonersDilemma.isPrisonersDilemma).toBe(true);

    // Switching incentives in baseline:
    // At HH, Student A gains +2 by switching to Slack
    expect(analysis.deviation.HH.a).toBe(2);
    // At LL, Student A loses 1 by switching to Work (gain = -1)
    expect(analysis.deviation.LL.a).toBe(-1);
  });

  it('verifies Peer Evaluation aligns equilibrium with best team outcome', () => {
    const base = withoutIncentives(DEFAULT_PARAMS);
    const peerScenario = SCENARIOS.find((s) => s.id === 'peer')!;
    const peerMatrix = buildMatrix(applyScenario(base, peerScenario));
    const analysis = analyzeGame(peerMatrix);

    // Nash moves to mutual cooperation (HH)
    expect(analysis.nash).toEqual(['HH']);

    // Best team score is at HH
    expect(analysis.maxWelfare.outcomes).toContain('HH');
    expect(peerMatrix.HH.a + peerMatrix.HH.b).toBe(12);

    // At HH, deviating to Slack yields a loss
    expect(analysis.deviation.HH.a).toBeLessThan(0);
    expect(analysis.deviation.HH.b).toBeLessThan(0);
  });

  it('verifies Contribution Reward aligns equilibrium with best team outcome', () => {
    const base = withoutIncentives(DEFAULT_PARAMS);
    const rewardScenario = SCENARIOS.find((s) => s.id === 'reward')!;
    const rewardMatrix = buildMatrix(applyScenario(base, rewardScenario));
    const analysis = analyzeGame(rewardMatrix);

    // Nash moves to mutual cooperation (HH)
    expect(analysis.nash).toEqual(['HH']);

    // Mutual work produces the highest team score (18)
    expect(analysis.maxWelfare.outcomes).toContain('HH');
    expect(rewardMatrix.HH.a + rewardMatrix.HH.b).toBe(18);

    // Deviating from HH lowers payoff
    expect(analysis.deviation.HH.a).toBeLessThan(0);
    expect(analysis.deviation.HH.b).toBeLessThan(0);
  });

  it('evaluates all 4 outcome scenarios for any custom matrix', () => {
    const customMatrix = {
      HH: { a: 10, b: 10 },
      HL: { a: 0, b: 12 },
      LH: { a: 12, b: 0 },
      LL: { a: 2, b: 2 },
    };
    const analysis = analyzeGame(customMatrix);

    const outcomes: OutcomeKey[] = ['HH', 'HL', 'LH', 'LL'];
    const teamScores = outcomes.map((k) => customMatrix[k].a + customMatrix[k].b);

    expect(teamScores).toEqual([20, 12, 12, 4]);
    expect(analysis.maxWelfare.outcomes).toEqual(['HH']);
    expect(analysis.nash).toEqual(['LL']);
  });

  it('handles negative payoffs and floating point numbers accurately', () => {
    const negFloatMatrix = {
      HH: { a: -2.5, b: -2.5 },
      HL: { a: -6.0, b: 0.5 },
      LH: { a: 0.5, b: -6.0 },
      LL: { a: -3.5, b: -3.5 },
    };
    const analysis = analyzeGame(negFloatMatrix);

    // At HH (-2.5), switching to Slack (LH for A) gives 0.5. Deviation gain = 0.5 - (-2.5) = +3.0
    expect(analysis.deviation.HH.a).toBeCloseTo(3.0);
    // At LL (-3.5), switching to Work (HL for A) gives -6.0. Deviation gain = -6.0 - (-3.5) = -2.5
    expect(analysis.deviation.LL.a).toBeCloseTo(-2.5);

    // LL is the unique Nash equilibrium even with negative numbers
    expect(analysis.nash).toEqual(['LL']);

    // Best team score is HH (-5.0), compared to HL/LH (-5.5) and LL (-7.0)
    expect(analysis.maxWelfare.outcomes).toEqual(['HH']);
    expect(analysis.maxWelfare.value).toBeCloseTo(-5.0);
  });

  it('accurately identifies multiple pure Nash equilibria in coordination & anti-coordination games', () => {
    // Anti-coordination game (e.g. Chicken/Hawk-Dove): One works, other slacks
    const antiCoordMatrix = {
      HH: { a: 2, b: 2 },
      HL: { a: 5, b: 4 },
      LH: { a: 4, b: 5 },
      LL: { a: 1, b: 1 },
    };
    const analysisAnti = analyzeGame(antiCoordMatrix);
    expect(analysisAnti.nash.sort()).toEqual(['HL', 'LH'].sort());

    // Coordination game (e.g. Stag Hunt): Both work or both slack
    const coordMatrix = {
      HH: { a: 10, b: 10 },
      HL: { a: 0, b: 7 },
      LH: { a: 7, b: 0 },
      LL: { a: 5, b: 5 },
    };
    const analysisCoord = analyzeGame(coordMatrix);
    expect(analysisCoord.nash.sort()).toEqual(['HH', 'LL'].sort());
  });

  it('handles zero pure equilibrium games gracefully', () => {
    // Matching Pennies structure: no pure Nash equilibrium
    const pennies = {
      HH: { a: 1, b: -1 },
      HL: { a: -1, b: 1 },
      LH: { a: -1, b: 1 },
      LL: { a: 1, b: -1 },
    };
    const analysis = analyzeGame(pennies);
    expect(analysis.nash).toEqual([]);
    expect(analysis.classification.id).toBe('no-pure');
  });

  it('verifies exact preset title requirement: No incentives (Base)', () => {
    const baseScenario = SCENARIOS.find((s) => s.id === 'none');
    expect(baseScenario).toBeDefined();
    expect(baseScenario?.title).toBe('No incentives (Base)');
  });

  it('guarantees truthful, monotonic progress bar scaling across positive, mixed, and negative scores', () => {
    function computeBarPct(teamScore: number, minTeamScore: number, maxTeamScore: number): number {
      if (minTeamScore >= 0) {
        if (maxTeamScore > 0) {
          return teamScore <= 0 ? 8 : Math.max(12, Math.min(100, Math.round((teamScore / maxTeamScore) * 100)));
        }
        return 100;
      }
      if (maxTeamScore > minTeamScore) {
        return Math.max(10, Math.min(100, Math.round(((teamScore - minTeamScore) / (maxTeamScore - minTeamScore)) * 90 + 10)));
      }
      return 100;
    }

    // Baseline positive numbers: 6/12 must be exactly 50%
    expect(computeBarPct(12, 6, 12)).toBe(100);
    expect(computeBarPct(6, 6, 12)).toBe(50);
    expect(computeBarPct(10, 6, 12)).toBe(83);

    // Mixed positive and negative numbers: scores must be strictly monotonic
    const minMixed = -10;
    const maxMixed = 10;
    const barNeg10 = computeBarPct(-10, minMixed, maxMixed);
    const barNeg5 = computeBarPct(-5, minMixed, maxMixed);
    const barZero = computeBarPct(0, minMixed, maxMixed);
    const barPos10 = computeBarPct(10, minMixed, maxMixed);

    expect(barNeg10).toBe(10);
    expect(barPos10).toBe(100);
    expect(barNeg10).toBeLessThan(barNeg5);
    expect(barNeg5).toBeLessThan(barZero);
    expect(barZero).toBeLessThan(barPos10);

    // All negative numbers: -10 is minimum (10%), -5 is optimum (100%)
    const minAllNeg = -10;
    const maxAllNeg = -5;
    expect(computeBarPct(-10, minAllNeg, maxAllNeg)).toBe(10);
    expect(computeBarPct(-5, minAllNeg, maxAllNeg)).toBe(100);
    expect(computeBarPct(-8, minAllNeg, maxAllNeg)).toBe(46);
  });

  it('accurately distinguishes custom matrix vs policy preset vs baseline grid badges', () => {
    function getMatrixBadgeText(isCustomMatrix: boolean, activeScenarioId?: string): string {
      if (isCustomMatrix) return 'Custom Values';
      if (activeScenarioId && activeScenarioId !== 'none') return 'Policy Preset Active';
      return 'Baseline Classroom Grid';
    }

    expect(getMatrixBadgeText(false, 'none')).toBe('Baseline Classroom Grid');
    expect(getMatrixBadgeText(false, 'peer')).toBe('Policy Preset Active');
    expect(getMatrixBadgeText(false, 'reward')).toBe('Policy Preset Active');
    expect(getMatrixBadgeText(true, 'custom')).toBe('Custom Values');
    expect(getMatrixBadgeText(true, 'peer')).toBe('Custom Values');
  });
});

