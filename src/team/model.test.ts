import { describe, expect, it } from 'vitest';
import {
  DEFAULT_CONFIG,
  FORMATIONS,
  blockingGroup,
  chunk,
  compareFormations,
  effortShare,
  formTeams,
  generateClass,
  optimalEffortShare,
  peerEvalNeeded,
  playTeams,
  snakeDeal,
  teamQuality,
  type Student,
} from './model';
import { makeRng } from './rng';

const S = (skills: number[], costs?: number[]): Student[] =>
  skills.map((skill, id) => ({ id, skill, cost: costs ? costs[id] : 100 }));

/** All size-k subsets of 0..n−1. */
function subsets(n: number, k: number): number[][] {
  const out: number[][] = [];
  const rec = (start: number, cur: number[]) => {
    if (cur.length === k) return void out.push([...cur]);
    for (let i = start; i < n; i++) rec(i + 1, [...cur, i]);
  };
  rec(0, []);
  return out;
}

/** Brute force: does ANY group of k students all strictly prefer to be together? */
function bruteForceBlocked(students: Student[], teams: number[][], k: number, beta: number): boolean {
  const q = new Map<number, number>();
  teams.forEach((t) => t.forEach((s) => q.set(s, teamQuality(students, t, beta))));
  return subsets(students.length, k).some((g) => {
    const qg = teamQuality(students, g, beta);
    return g.every((s) => qg > q.get(s)! + 1e-12);
  });
}

describe('formation rules', () => {
  it('snake order deals 1→T then T→1', () => {
    expect(snakeDeal([0, 1, 2, 3, 4, 5], 2)).toEqual([
      [0, 3, 4],
      [1, 2, 5],
    ]);
  });

  it('free choice sorts the class by skill', () => {
    const students = S([0.1, 0.9, 0.5, 0.8, 0.2, 0.6]);
    expect(formTeams('self', students, { teams: 2, teamSize: 3 }, [], makeRng(1))).toEqual([
      [1, 3, 5],
      [2, 4, 0],
    ]);
  });

  it('every rule produces T teams of exactly k students covering the class', () => {
    const cfg = { ...DEFAULT_CONFIG, teams: 7, teamSize: 4 };
    const students = generateClass(cfg);
    for (const f of FORMATIONS) {
      const teams = formTeams(f, students, cfg, students.map((s) => s.skill), makeRng(2));
      expect(teams).toHaveLength(7);
      teams.forEach((t) => expect(t).toHaveLength(4));
      expect(teams.flat().sort((a, b) => a - b)).toEqual(students.map((s) => s.id));
    }
  });

  it('understating moves a strong student into a stronger team under self-reported balancing', () => {
    // Ranks by skill: 0 > 1 > … > 5. Two teams of three.
    const students = S([0.95, 0.9, 0.7, 0.5, 0.3, 0.1]);
    const cfg = { teams: 2, teamSize: 3 };
    const honest = formTeams('balanced-report', students, cfg, students.map((s) => s.skill), makeRng(1));
    const low = students.map((s) => s.skill);
    low[0] = 0;
    const lied = formTeams('balanced-report', students, cfg, low, makeRng(1));
    const mates = (teams: number[][]) => teams.find((t) => t.includes(0))!.filter((s) => s !== 0);
    const avg = (ids: number[]) => ids.reduce((a, s) => a + students[s].skill, 0) / ids.length;
    expect(avg(mates(lied))).toBeGreaterThan(avg(mates(honest)));
  });
});

describe('stability (core)', () => {
  it('the fast check agrees with brute force over every possible group', () => {
    for (let trial = 0; trial < 40; trial++) {
      const k = 2 + (trial % 2);
      const teams = 3;
      const cfg = { ...DEFAULT_CONFIG, teams, teamSize: k, seed: 100 + trial };
      const students = generateClass(cfg);
      const beta = (trial % 5) * 0.2;
      for (const f of FORMATIONS) {
        const partition = formTeams(f, students, cfg, students.map((s) => s.skill), makeRng(trial));
        const fast = blockingGroup(students, partition, k, beta) !== null;
        expect(fast).toBe(bruteForceBlocked(students, partition, k, beta));
      }
    }
  });

  it('free choice is always stable; balanced teams are not', () => {
    const cfg = { ...DEFAULT_CONFIG, teams: 4, teamSize: 3 };
    const students = generateClass(cfg);
    const self = formTeams('self', students, cfg, [], makeRng(1));
    const balanced = formTeams('balanced-verified', students, cfg, [], makeRng(1));
    expect(blockingGroup(students, self, 3, 0.5)).toBeNull();
    expect(blockingGroup(students, balanced, 3, 0.5)).not.toBeNull();
  });
});

describe('effort stage', () => {
  it('works iff M/k + V beats the cost', () => {
    const students = S([0.5, 0.5, 0.5], [5, 7, 9]);
    const base = { bestShot: 0, effortValue: 20, peerEval: 0 };
    // M/k = 6.67: only the cost-5 student works.
    expect(playTeams(students, [[0, 1, 2]], base).members.map((m) => m.worked)).toEqual([true, false, false]);
    expect(playTeams(students, [[0, 1, 2]], { ...base, peerEval: 1 }).members.map((m) => m.worked)).toEqual([true, true, false]);
  });

  it('peer evaluation only moves marks between students', () => {
    const students = S([0.5, 0.5, 0.5], [5, 7, 13]);
    const sum = (v: number) =>
      playTeams(students, [[0, 1, 2]], { bestShot: 0, effortValue: 20, peerEval: v }).members.reduce((a, m) => a + m.grade, 0);
    // Same workers (costs 5 and 7) at V = 0.5 and V = 3, so totals must match.
    expect(sum(0.5)).toBeCloseTo(sum(3));
  });

  it('free-riding grows with team size and V closes the gap', () => {
    const shares = [2, 3, 4, 6].map((n) => effortShare(n, DEFAULT_CONFIG));
    for (let i = 1; i < shares.length; i++) expect(shares[i]).toBeLessThan(shares[i - 1]);
    expect(optimalEffortShare(DEFAULT_CONFIG)).toBe(1);
    expect(effortShare(3, { ...DEFAULT_CONFIG, peerEval: peerEvalNeeded(3, DEFAULT_CONFIG) })).toBe(1);
  });
});

describe('comparison', () => {
  const r = compareFormations(DEFAULT_CONFIG, 30);

  it('free choice is stable in every class; the others almost never', () => {
    expect(r.self.stable).toBe(1);
    expect(r.random.stable).toBeLessThan(0.1);
    expect(r['balanced-verified'].stable).toBe(0);
  });

  it('only self-reported balancing can be manipulated, and strong students gain from it', () => {
    expect(r.random.understateGain).toBeNull();
    expect(r['balanced-verified'].understateGain).toBeNull();
    expect(r['balanced-report'].understateGain!).toBeGreaterThan(0);
  });

  it('verified balancing gives the smallest gap between teams', () => {
    for (const f of FORMATIONS) expect(r['balanced-verified'].teamGap).toBeLessThanOrEqual(r[f].teamGap + 1e-9);
  });

  it('with β = 0 grades are additive, so formation is zero-sum', () => {
    const z = compareFormations({ ...DEFAULT_CONFIG, bestShot: 0 }, 10);
    for (const f of FORMATIONS) expect(z[f].avgGrade).toBeCloseTo(z.random.avgGrade, 9);
  });

  it('chunk splits in order', () => {
    expect(chunk([5, 4, 3, 2], 2)).toEqual([
      [5, 4],
      [3, 2],
    ]);
  });
});
