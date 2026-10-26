/**
 * Project team formation: a two-stage game.
 *
 * STAGE 1: FORMATION. A class of T × k students, each with a skill s ∈ [0, 1]
 * (think of it as a past-grade percentile), is split into T teams of k.
 * Team quality mixes the members' average skill with the best member's skill:
 *
 *     Q = (1 − β) · mean(skills) + β · max(skills),   0 ≤ β < 1
 *
 * β is how much the strongest member carries the project.
 *
 * STAGE 2: EFFORT. Each member chooses to work or not. The team grade is
 *
 *     G = 40 + 40 · Q + M · (workers / k)
 *
 * so one worker adds M/k marks to every member's grade (M in total), while
 * the effort cost c_i is paid by the worker alone. Peer evaluation moves V
 * marks in total from shirkers to workers (a pure transfer, no marks created).
 * A student's private gain from working is M/k + V − c_i whatever the others
 * do, so working is a dominant strategy exactly when c_i < M/k + V, while the
 * team as a whole gains whenever c_i < M.
 *
 * Effort therefore does not depend on who your teammates are, only on team
 * size. That is why Stage 1 and Stage 2 can be studied separately: in Stage 1
 * every team gets the same expected effort marks, M × (share who work), so
 * grades differ only because of who is in the team.
 */
import { makeRng, permutation, type Rng } from './rng';

export type FormationId = 'random' | 'self' | 'balanced-report' | 'balanced-verified';
export const FORMATIONS: readonly FormationId[] = ['random', 'self', 'balanced-report', 'balanced-verified'];

export const FORMATION_INFO: Record<
  FormationId,
  { name: string; short: string; rule: string; strategic: string }
> = {
  random: {
    name: 'Random assignment',
    short: 'Random',
    rule: 'The instructor shuffles the class and cuts it into teams.',
    strategic: 'Nothing to manipulate: your report and your choices do not matter.',
  },
  self: {
    name: 'Free choice',
    short: 'Free choice',
    rule: 'Students form their own teams. Everyone prefers skilled teammates.',
    strategic:
      'The strongest students team up with each other and refuse weaker ones, then the next strongest do the same. The class ends up sorted by skill.',
  },
  'balanced-report': {
    name: 'Balanced on self-reported skill',
    short: 'Balanced (self-report)',
    rule: 'Students declare their skill. The instructor ranks the declarations and deals students into teams in snake order (1→T, then T→1, …).',
    strategic:
      'A strong student can understate their skill. They are then dealt as if weak, into a team built to compensate with stronger members.',
  },
  'balanced-verified': {
    name: 'Balanced on verified grades',
    short: 'Balanced (verified)',
    rule: 'Same snake-order dealing, but using past grades the student cannot change.',
    strategic: 'Nothing to manipulate: declarations are not used.',
  },
};

export interface TeamConfig {
  teams: number;
  teamSize: number;
  /** β ∈ [0, 0.9]: weight of the best member in team quality. */
  bestShot: number;
  /** Share of students who understate their skill (only matters for self-reported balancing). */
  understateShare: number;
  /** M: marks that full effort adds to the team grade. */
  effortValue: number;
  /** V: peer-evaluation transfer. */
  peerEval: number;
  costMin: number;
  costMax: number;
  seed: number;
}

export const DEFAULT_CONFIG: TeamConfig = {
  teams: 10,
  teamSize: 3,
  bestShot: 0.5,
  understateShare: 0.3,
  effortValue: 20,
  peerEval: 0,
  costMin: 2,
  costMax: 14,
  seed: 1,
};

export const GRADE_BASE = 40;
export const GRADE_QUALITY = 40;

export interface Student {
  id: number;
  /** Skill in [0, 1]. Continuous, so ties have probability zero. */
  skill: number;
  /** Private effort cost, uniform on [costMin, costMax]. */
  cost: number;
}

export function generateClass(config: TeamConfig, seed = config.seed): Student[] {
  const rng = makeRng(seed);
  const n = config.teams * config.teamSize;
  return Array.from({ length: n }, (_, id) => ({
    id,
    skill: rng(),
    cost: config.costMin + rng() * (config.costMax - config.costMin),
  }));
}

/** Splits an ordered list into consecutive teams of size k. */
export function chunk(order: number[], k: number): number[][] {
  const teams: number[][] = [];
  for (let i = 0; i < order.length; i += k) teams.push(order.slice(i, i + k));
  return teams;
}

/** Deals an ordered list into t teams in snake order: 1→t, t→1, 1→t, … */
export function snakeDeal(order: number[], t: number): number[][] {
  const teams: number[][] = Array.from({ length: t }, () => []);
  order.forEach((s, i) => {
    const round = Math.floor(i / t);
    const pos = i % t;
    teams[round % 2 === 0 ? pos : t - 1 - pos].push(s);
  });
  return teams;
}

/** Students ordered from highest to lowest score. `rng` breaks exact ties. */
function rankBy(students: Student[], score: (s: Student) => number, rng: Rng): number[] {
  const tiebreak = permutation(students.length, rng);
  return students
    .map((s) => s.id)
    .sort((a, b) => score(students[b]) - score(students[a]) || tiebreak[a] - tiebreak[b]);
}

/**
 * Forms teams. `declared[i]` is student i's declared skill, used only by
 * 'balanced-report'.
 */
export function formTeams(
  id: FormationId,
  students: Student[],
  config: Pick<TeamConfig, 'teams' | 'teamSize'>,
  declared: number[],
  rng: Rng,
): number[][] {
  switch (id) {
    case 'random':
      return chunk(permutation(students.length, rng), config.teamSize);
    case 'self':
      return chunk(rankBy(students, (s) => s.skill, rng), config.teamSize);
    case 'balanced-report':
      return snakeDeal(rankBy(students, (s) => declared[s.id], rng), config.teams);
    case 'balanced-verified':
      return snakeDeal(rankBy(students, (s) => s.skill, rng), config.teams);
  }
}

export function teamQuality(students: Student[], team: number[], beta: number): number {
  let sum = 0;
  let max = 0;
  for (const s of team) {
    sum += students[s].skill;
    max = Math.max(max, students[s].skill);
  }
  return (1 - beta) * (sum / team.length) + beta * max;
}

/** Stage 2 dominant strategy: work iff the private return beats the cost. */
export function works(cost: number, teamSize: number, effortValue: number, peerEval: number): boolean {
  return effortValue / teamSize + peerEval > cost;
}

export interface MemberOutcome {
  grade: number;
  /** Grade minus effort cost actually paid. */
  payoff: number;
  worked: boolean;
}

export interface TeamOutcome {
  members: number[];
  quality: number;
  /** Team grade before peer-evaluation transfers. */
  grade: number;
  workers: number;
}

export function playTeams(
  students: Student[],
  teams: number[][],
  config: Pick<TeamConfig, 'bestShot' | 'effortValue' | 'peerEval'>,
): { teams: TeamOutcome[]; members: MemberOutcome[] } {
  const members: MemberOutcome[] = new Array(students.length);
  const out = teams.map((team) => {
    const n = team.length;
    const quality = teamQuality(students, team, config.bestShot);
    const worker = team.map((s) => works(students[s].cost, n, config.effortValue, config.peerEval));
    const workers = worker.filter(Boolean).length;
    const grade = GRADE_BASE + GRADE_QUALITY * quality + config.effortValue * (workers / n);
    team.forEach((s, i) => {
      const shirkers = n - workers;
      // Each shirker pays V/(n−1) to each worker. Sum over the team is zero.
      const transfer = n > 1 ? (worker[i] ? (config.peerEval * shirkers) / (n - 1) : -(config.peerEval * workers) / (n - 1)) : 0;
      members[s] = {
        grade: grade + transfer,
        payoff: grade + transfer - (worker[i] ? students[s].cost : 0),
        worked: worker[i],
      };
    });
    return { members: team, quality, grade, workers };
  });
  return { teams: out, members };
}

/**
 * Core stability. A partition is stable if no group of k students would all be
 * strictly better off forming a team together.
 *
 * With everyone preferring higher team quality, quality increasing in every
 * member's skill, β < 1 and distinct skills, this check is exact: walk down the
 * class in skill order in groups of k. If a group is not already a team, every
 * member of it is currently with someone weaker (all stronger students are
 * already in their own sorted teams), so their current team has a strictly
 * lower average and no higher maximum. The group therefore blocks. Hence the
 * partition is stable if and only if it is the skill-sorted partition.
 */
export function blockingGroup(students: Student[], teams: number[][], k: number, beta: number): number[] | null {
  const teamOf = new Array<number>(students.length);
  teams.forEach((t, i) => t.forEach((s) => (teamOf[s] = i)));
  const quality = teams.map((t) => teamQuality(students, t, beta));
  const sorted = students.map((s) => s.id).sort((a, b) => students[b].skill - students[a].skill);
  for (let i = 0; i + k <= sorted.length; i += k) {
    const group = sorted.slice(i, i + k);
    const together = group.every((s) => teamOf[s] === teamOf[group[0]]);
    if (together) continue;
    const q = teamQuality(students, group, beta);
    if (group.every((s) => q > quality[teamOf[s]] + 1e-12)) return group;
  }
  return null;
}

/** Declarations: understaters declare 0, everyone else declares the truth. */
export function declarations(students: Student[], understaters: Set<number>): number[] {
  return students.map((s) => (understaters.has(s.id) ? 0 : s.skill));
}

export function pickUnderstaters(n: number, share: number, rng: Rng): Set<number> {
  const k = Math.round(Math.max(0, Math.min(1, share)) * n);
  return new Set(permutation(n, rng).slice(0, k));
}

/** Stage 1 grade: quality from the members, plus the same expected effort marks for every team. */
export function formationGrade(
  students: Student[],
  team: number[],
  config: Pick<TeamConfig, 'bestShot' | 'effortValue' | 'peerEval' | 'costMin' | 'costMax'>,
): number {
  return GRADE_BASE + GRADE_QUALITY * teamQuality(students, team, config.bestShot) + config.effortValue * effortShare(team.length, config);
}

export interface FormationSummary {
  formation: FormationId;
  avgGrade: number;
  /** Highest minus lowest team grade, averaged over classes. */
  teamGap: number;
  /** Mean grade of the lowest-graded 10% of students. */
  bottom10: number;
  /** Share of classes in which no group of k students wants to break away. */
  stable: number;
  /**
   * Gain (marks) for a student in the top third from understating their
   * skill, others fixed. null when the rule ignores declarations.
   */
  understateGain: number | null;
  /** Share of top-third students for whom understating strictly helps. */
  understateHelps: number | null;
}

function mean(xs: number[]): number {
  return xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : NaN;
}

/** Derives an independent seed for class c. */
export function classSeed(seed: number, c: number): number {
  return (Math.imul(seed + 1, 0x9e3779b1) ^ Math.imul(c + 1, 0x85ebca6b)) >>> 0;
}

/**
 * Runs every formation rule on the same `classes` randomly generated classes.
 * Grades use formationGrade (equal expected effort for every team).
 */
export function compareFormations(config: TeamConfig, classes: number): Record<FormationId, FormationSummary> {
  const k = config.teamSize;
  const acc = Object.fromEntries(
    FORMATIONS.map((f) => [f, { avg: [] as number[], gap: [] as number[], b10: [] as number[], stable: 0, gains: [] as number[], helps: 0 }]),
  ) as Record<FormationId, { avg: number[]; gap: number[]; b10: number[]; stable: number; gains: number[]; helps: number }>;

  for (let c = 0; c < classes; c++) {
    const seed = classSeed(config.seed, c);
    const students = generateClass(config, seed);
    const understaters = pickUnderstaters(students.length, config.understateShare, makeRng(seed ^ 0x51));
    const declared = declarations(students, understaters);
    const topThird = [...students].sort((a, b) => b.skill - a.skill).slice(0, Math.max(1, Math.round(students.length / 3)));

    for (const f of FORMATIONS) {
      const tieSeed = seed ^ 0xa5;
      const teams = formTeams(f, students, config, declared, makeRng(tieSeed));
      const teamGrades = teams.map((t) => formationGrade(students, t, config));
      const grades = new Array<number>(students.length);
      teams.forEach((t, i) => t.forEach((s) => (grades[s] = teamGrades[i])));
      const a = acc[f];
      a.avg.push(mean(grades));
      a.gap.push(Math.max(...teamGrades) - Math.min(...teamGrades));
      const sorted = [...grades].sort((x, y) => x - y);
      a.b10.push(mean(sorted.slice(0, Math.max(1, Math.round(grades.length / 10)))));
      if (!blockingGroup(students, teams, k, config.bestShot)) a.stable++;

      if (f === 'balanced-report') {
        // Unilateral deviation: one strong student switches between truthful and understating.
        for (const s of topThird) {
          const honest = [...declared];
          honest[s.id] = s.skill;
          const low = [...declared];
          low[s.id] = 0;
          const gradeWith = (d: number[]) =>
            formationGrade(students, formTeams(f, students, config, d, makeRng(tieSeed)).find((t) => t.includes(s.id))!, config);
          const g = gradeWith(low) - gradeWith(honest);
          a.gains.push(g);
          if (g > 1e-9) a.helps++;
        }
      }
    }
  }

  const out = {} as Record<FormationId, FormationSummary>;
  for (const f of FORMATIONS) {
    const a = acc[f];
    const manipulable = f === 'balanced-report';
    out[f] = {
      formation: f,
      avgGrade: mean(a.avg),
      teamGap: mean(a.gap),
      bottom10: mean(a.b10),
      stable: a.stable / classes,
      understateGain: manipulable ? mean(a.gains) : null,
      understateHelps: manipulable ? a.helps / Math.max(1, a.gains.length) : null,
    };
  }
  return out;
}

/** Stage 2, exact: share of students who work at equilibrium in teams of n (costs are uniform). */
export function effortShare(n: number, config: Pick<TeamConfig, 'effortValue' | 'peerEval' | 'costMin' | 'costMax'>): number {
  const threshold = config.effortValue / n + config.peerEval;
  return Math.min(1, Math.max(0, (threshold - config.costMin) / (config.costMax - config.costMin)));
}

/** Share who should work for the team's sake: cost below M. */
export function optimalEffortShare(config: Pick<TeamConfig, 'effortValue' | 'costMin' | 'costMax'>): number {
  return Math.min(1, Math.max(0, (config.effortValue - config.costMin) / (config.costMax - config.costMin)));
}

/** Smallest V that makes everyone work in teams of n. */
export function peerEvalNeeded(n: number, config: Pick<TeamConfig, 'effortValue' | 'costMax'>): number {
  return Math.max(0, config.costMax - config.effortValue / n);
}
