import React, { useLayoutEffect, useMemo, useRef, useState } from 'react';
import {
  DEFAULT_CONFIG,
  FORMATIONS,
  FORMATION_INFO,
  blockingGroup,
  classSeed,
  declarations,
  formTeams,
  formationGrade,
  generateClass,
  pickUnderstaters,
  teamQuality,
  type FormationId,
  type FormationSummary,
  type TeamConfig,
} from '../../team/model';
import { makeRng } from '../../team/rng';
import { useComparison } from '../../team/useComparison';
import { Segmented, Slider, fmt, pct, signed } from './controls';

const CLASSES = 40;

/** Stage 1 holds effort settings at their defaults: effort does not depend on who your teammates are. */
type Stage1Config = Pick<TeamConfig, 'teams' | 'teamSize' | 'bestShot' | 'understateShare' | 'seed'>;

const RULE_OPTIONS = FORMATIONS.map((f) => ({ value: f, label: FORMATION_INFO[f].short }));

/** Skill 0–1 to a blue tint: pale for weak students, deep for strong ones. */
function chipStyle(skill: number): React.CSSProperties {
  const l = 93 - skill * 55;
  return { background: `hsl(211 85% ${l}%)`, color: l < 60 ? '#fff' : '#0b3a6e' };
}

export const TeamFormationLab: React.FC = () => {
  const [s1, setS1] = useState<Stage1Config>({
    teams: DEFAULT_CONFIG.teams,
    teamSize: DEFAULT_CONFIG.teamSize,
    bestShot: DEFAULT_CONFIG.bestShot,
    understateShare: DEFAULT_CONFIG.understateShare,
    seed: DEFAULT_CONFIG.seed,
  });
  const [rule, setRule] = useState<FormationId>('self');
  const classRef = useRef<HTMLOListElement>(null);
  /** Chip positions captured just before a rule change, keyed by student id. */
  const before = useRef<Map<string, DOMRect> | null>(null);

  // FLIP: snapshot where every chip is on screen right now (mid-flight positions included),
  // then let React move them, then glide each chip from its old spot to its new one.
  const changeRule = (next: FormationId) => {
    if (next === rule) return;
    const map = new Map<string, DOMRect>();
    classRef.current?.querySelectorAll<HTMLElement>('[data-student]').forEach((el) => {
      map.set(el.dataset.student!, el.getBoundingClientRect());
      el.getAnimations().forEach((a) => a.cancel());
    });
    before.current = map;
    setRule(next);
  };

  useLayoutEffect(() => {
    const prev = before.current;
    before.current = null;
    if (!prev || !classRef.current) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    classRef.current.querySelectorAll<HTMLElement>('[data-student]').forEach((el) => {
      const from = prev.get(el.dataset.student!);
      if (!from) return;
      const to = el.getBoundingClientRect();
      const dx = from.left - to.left;
      const dy = from.top - to.top;
      if (Math.abs(dx) < 0.5 && Math.abs(dy) < 0.5) return;
      if (reduce) {
        el.animate([{ opacity: 0.35 }, { opacity: 1 }], { duration: 150, easing: 'ease-out' });
      } else {
        el.animate([{ transform: `translate(${dx}px, ${dy}px)` }, { transform: 'translate(0, 0)' }], {
          duration: 450,
          easing: 'cubic-bezier(0.23, 1, 0.32, 1)',
        });
      }
    });
  }, [rule]);
  const config: TeamConfig = useMemo(() => ({ ...DEFAULT_CONFIG, ...s1 }), [s1]);
  const set = <K extends keyof Stage1Config>(k: K, v: Stage1Config[K]) => setS1((c) => ({ ...c, [k]: v }));

  // The class shown is exactly class #1 of the comparison below.
  const sample = useMemo(() => {
    const seed = classSeed(config.seed, 0);
    const students = generateClass(config, seed);
    const understaters = pickUnderstaters(students.length, config.understateShare, makeRng(seed ^ 0x51));
    const declared = declarations(students, understaters);
    const teams = formTeams(rule, students, config, declared, makeRng(seed ^ 0xa5));
    const graded = teams.map((t) => ({
      members: [...t].sort((a, b) => students[b].skill - students[a].skill),
      quality: teamQuality(students, t, config.bestShot),
      grade: formationGrade(students, t, config),
    }));
    graded.sort((a, b) => b.grade - a.grade);
    const blocking = blockingGroup(students, teams, config.teamSize, config.bestShot);
    const grades = graded.map((t) => t.grade);
    return {
      students,
      understaters,
      teams: graded,
      blocking: new Set(blocking ?? []),
      blockingList: blocking,
      gap: Math.max(...grades) - Math.min(...grades),
    };
  }, [config, rule]);

  const { result, busy } = useComparison(config, CLASSES);
  const showUnderstaters = rule === 'balanced-report';
  const info = FORMATION_INFO[rule];

  return (
    <section className="card tf-card" aria-labelledby="tf-heading">
      <header className="tf-head">
        <span className="tf-eyebrow">Stage 1 · Team formation</span>
        <h2 id="tf-heading" className="tf-title">
          Who ends up with whom?
        </h2>
        <p className="tf-lede">
          Before anyone works, students are split into teams. Every student wants strong teammates, and the rule
          the instructor uses decides who gets them. Pick a rule and watch the same class regroup.
        </p>
      </header>

      <div className="tf-controls">
        <Slider label="Teams" value={s1.teams} min={4} max={15} step={1} display={`${s1.teams}`} onChange={(v) => set('teams', v)} />
        <Slider label="Students per team" value={s1.teamSize} min={2} max={6} step={1} display={`${s1.teamSize}`} onChange={(v) => set('teamSize', v)} />
        <Slider
          label="Weight of the best member (β)"
          value={s1.bestShot}
          min={0}
          max={0.9}
          step={0.05}
          display={s1.bestShot.toFixed(2)}
          hint="0: a team is as good as its average member. Higher: the strongest member carries more of the project."
          onChange={(v) => set('bestShot', v)}
        />
        <Slider
          label="Students who understate their skill"
          value={s1.understateShare}
          min={0}
          max={1}
          step={0.05}
          display={pct(s1.understateShare)}
          hint="Only matters when teams are balanced on self-reported skill."
          onChange={(v) => set('understateShare', v)}
        />
      </div>

      <div className="tf-rule-bar">
        <Segmented label="Team formation rule" options={RULE_OPTIONS} value={rule} onChange={changeRule} />
        <button type="button" className="btn btn-secondary btn-sm tf-press" onClick={() => set('seed', s1.seed + 1)}>
          New class
        </button>
      </div>

      <div className="tf-split">
        <div className="tf-class" aria-label={`Teams formed by ${info.name}`}>
          <div className="tf-class-head">
            <span>#</span>
            <span>Members (skill 0–100)</span>
            <span className="tf-num">Grade</span>
          </div>
          <ol className="tf-team-list" ref={classRef}>
            {sample.teams.map((t, row) => (
              <li key={row} className="tf-team">
                <span className="tf-team-rank">{row + 1}</span>
                <span className="tf-chips">
                  {t.members.map((s) => {
                    const st = sample.students[s];
                    const under = showUnderstaters && sample.understaters.has(s);
                    const block = sample.blocking.has(s);
                    return (
                      <span
                        key={s}
                        data-student={s}
                        className={`tf-chip${under ? ' is-under' : ''}${block ? ' is-blocking' : ''}`}
                        style={chipStyle(st.skill)}
                        title={`Skill ${Math.round(st.skill * 100)}${under ? ', declared 0' : ''}${block ? ', would break away' : ''}`}
                      >
                        {Math.round(st.skill * 100)}
                      </span>
                    );
                  })}
                </span>
                <span className="tf-grade">
                  <span className="tf-grade-bar" aria-hidden="true">
                    <span style={{ transform: `scaleX(${(t.grade - 40) / 60})` }} />
                  </span>
                  <span className="tf-num">{fmt(t.grade)}</span>
                </span>
              </li>
            ))}
          </ol>
          <div className="tf-legend">
            <span>
              <span className="tf-chip tf-chip-sm" style={chipStyle(0.15)} /> weaker
            </span>
            <span>
              <span className="tf-chip tf-chip-sm" style={chipStyle(0.9)} /> stronger
            </span>
            {showUnderstaters && (
              <span>
                <span className="tf-chip tf-chip-sm is-under" style={chipStyle(0.6)} /> declared 0
              </span>
            )}
            {sample.blockingList && (
              <span>
                <span className="tf-chip tf-chip-sm is-blocking" style={chipStyle(0.8)} /> would break away
              </span>
            )}
          </div>
        </div>

        <aside className="tf-aside">
          <div className="tf-aside-block">
            <h3>{info.name}</h3>
            <p>{info.rule}</p>
            <p>
              <strong>Strategic behaviour.</strong> {info.strategic}
            </p>
          </div>
          <div className="tf-facts">
            <div className="tf-fact">
              <span className="tf-fact-label">Best − worst team</span>
              <span className="tf-fact-value">{fmt(sample.gap)}</span>
              <span className="tf-fact-note">grade points in this class</span>
            </div>
            <div className={`tf-fact ${sample.blockingList ? 'is-warn' : 'is-good'}`}>
              <span className="tf-fact-label">Stable?</span>
              <span className="tf-fact-value">{sample.blockingList ? 'No' : 'Yes'}</span>
              <span className="tf-fact-note">
                {sample.blockingList
                  ? `Students ${sample.blockingList.map((s) => Math.round(sample.students[s].skill * 100)).join(', ')} would all rather team up.`
                  : 'No group of students wants to break away.'}
              </span>
            </div>
          </div>
          <p className="tf-small">
            Grade = 40 + 40 × team quality + effort marks, where team quality = (1 − β) × average skill + β × best skill.
            Effort (Stage 2) depends only on team size, not on who your teammates are, so here every team gets the same
            expected effort marks and grades differ only because of who is in the team.
          </p>
        </aside>
      </div>

      <Comparison result={result} busy={busy} beta={config.bestShot} />
    </section>
  );
};

interface Col {
  key: string;
  label: string;
  title: string;
  value: (s: FormationSummary) => number | null;
  show: (s: FormationSummary) => string;
  better: 1 | -1;
}

const COLS: Col[] = [
  { key: 'avg', label: 'Average grade', title: 'Mean grade of all students.', value: (s) => s.avgGrade, show: (s) => fmt(s.avgGrade), better: 1 },
  { key: 'gap', label: 'Best − worst team', title: 'Grade difference between the best and worst team in a class.', value: (s) => s.teamGap, show: (s) => fmt(s.teamGap), better: -1 },
  { key: 'b10', label: 'Weakest 10%', title: 'Average grade of the lowest-graded tenth of students.', value: (s) => s.bottom10, show: (s) => fmt(s.bottom10), better: 1 },
  { key: 'stable', label: 'Stable classes', title: 'Share of classes where no group of students wants to leave and form its own team (the core).', value: (s) => s.stable, show: (s) => pct(s.stable), better: 1 },
  {
    key: 'gain',
    label: 'Gain from understating',
    title: 'Extra grade points a top-third student gets by declaring skill 0, everyone else unchanged.',
    value: (s) => s.understateGain,
    show: (s) => (s.understateGain === null ? 'not possible' : signed(s.understateGain)),
    better: -1,
  },
];

const Comparison: React.FC<{
  result: Record<FormationId, FormationSummary> | null;
  busy: boolean;
  beta: number;
}> = ({ result, busy, beta }) => (
  <div className="tf-compare">
    <div className="tf-compare-head">
      <h3>Across {CLASSES} random classes</h3>
      <span className={`tf-status${busy ? ' is-busy' : ''}`} aria-live="polite">
        {busy ? 'Updating' : 'Up to date'}
      </span>
    </div>
    {result && (
      <>
        <div className="tf-table-wrap">
          <table className="tf-table">
            <caption className="sr-only">Average outcome of each formation rule</caption>
            <thead>
              <tr>
                <th scope="col">Rule</th>
                {COLS.map((c) => (
                  <th scope="col" key={c.key} title={c.title}>
                    {c.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {FORMATIONS.map((f) => (
                <tr key={f}>
                  <th scope="row">{FORMATION_INFO[f].name}</th>
                  {COLS.map((c) => {
                    const vals = FORMATIONS.map((x) => c.value(result[x])).filter((v): v is number => v !== null);
                    const v = c.value(result[f]);
                    const best = c.better > 0 ? Math.max(...vals) : Math.min(...vals);
                    const spread = Math.max(...vals) - Math.min(...vals) > 1e-6;
                    const isBest = v !== null && spread && Math.abs(v - best) < 1e-9 && vals.length > 1;
                    return (
                      <td key={c.key} className={`${isBest ? 'is-best' : ''}${v === null ? ' is-na' : ''}`}>
                        {c.show(result[f])}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Findings result={result} beta={beta} />
      </>
    )}
  </div>
);

/** Every sentence here is computed from the numbers above; nothing is hard-coded. */
const Findings: React.FC<{ result: Record<FormationId, FormationSummary>; beta: number }> = ({ result, beta }) => {
  const stable = FORMATIONS.filter((f) => result[f].stable >= 0.999);
  const byGap = [...FORMATIONS].sort((a, b) => result[a].teamGap - result[b].teamGap);
  const byAvg = [...FORMATIONS].sort((a, b) => result[b].avgGrade - result[a].avgGrade);
  const spreadAvg = result[byAvg[0]].avgGrade - result[byAvg[3]].avgGrade;
  const br = result['balanced-report'];
  const name = (f: FormationId) => FORMATION_INFO[f].name;
  return (
    <ul className="tf-findings">
      <li>
        {stable.length > 0 ? (
          <>
            <strong>{stable.map(name).join(' and ')}</strong> {stable.length > 1 ? 'are' : 'is'} stable in every class: no group
            of students wants to leave.
            {stable.length === 1 && stable[0] === 'self' && ' With any other rule, some students would rather regroup, so the instructor has to enforce the teams.'}
          </>
        ) : (
          <>No rule is stable in every class at these settings.</>
        )}
      </li>
      <li>
        Smallest gap between teams: <strong>{name(byGap[0])}</strong> ({fmt(result[byGap[0]].teamGap)} points). Largest:{' '}
        <strong>{name(byGap[3])}</strong> ({fmt(result[byGap[3]].teamGap)} points).
      </li>
      <li>
        {spreadAvg < 0.05 ? (
          <>
            With β = {beta.toFixed(2)} every rule gives the same average grade ({fmt(result.random.avgGrade)}): grades are
            additive, so forming teams only moves marks between students.
          </>
        ) : (
          <>
            Highest average grade: <strong>{name(byAvg[0])}</strong> ({fmt(result[byAvg[0]].avgGrade)}); lowest:{' '}
            <strong>{name(byAvg[3])}</strong> ({fmt(result[byAvg[3]].avgGrade)}).
            {byAvg[3] === 'self' &&
              ` Because the best member counts extra (β = ${beta.toFixed(2)}), putting strong students together wastes some of their talent.`}
          </>
        )}
      </li>
      <li>
        {br.understateGain !== null && br.understateGain > 0.05 ? (
          <>
            Under self-reported balancing, a strong student gains <strong>{signed(br.understateGain)} points</strong> on
            average by understating their skill, and it helps {pct(br.understateHelps ?? 0)} of them. Verified grades remove
            the incentive.
          </>
        ) : (
          <>Understating skill gives no meaningful gain at these settings.</>
        )}
      </li>
    </ul>
  );
};
