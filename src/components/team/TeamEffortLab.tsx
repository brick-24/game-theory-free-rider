import React, { useMemo, useState } from 'react';
import { CartesianGrid, Legend, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { DEFAULT_CONFIG, effortShare, generateClass, optimalEffortShare, peerEvalNeeded, works } from '../../team/model';
import { Slider, fmt, pct } from './controls';

const SIZES = [2, 3, 4, 5, 6, 7, 8];
const { costMin, costMax } = DEFAULT_CONFIG;

export const TeamEffortLab: React.FC = () => {
  const [n, setN] = useState(3);
  const [m, setM] = useState(DEFAULT_CONFIG.effortValue);
  const [v, setV] = useState(0);
  const cfg = { effortValue: m, peerEval: v, costMin, costMax };

  // A sample team: the first n students of a fixed class, cheapest effort first.
  const members = useMemo(
    () =>
      generateClass({ ...DEFAULT_CONFIG, teams: 8, teamSize: 1 }, 11)
        .slice(0, n)
        .map((s) => s.cost)
        .sort((a, b) => a - b),
    [n],
  );
  const privateReturn = m / n + v;
  const scaleMax = Math.max(costMax, m, privateReturn) + 1;
  const at = (x: number) => ({ '--at': Math.min(1, x / scaleMax) }) as React.CSSProperties;

  const data = SIZES.map((size) => ({
    size,
    none: +(effortShare(size, { ...cfg, peerEval: 0 }) * 100).toFixed(1),
    peer: +(effortShare(size, cfg) * 100).toFixed(1),
    best: +(optimalEffortShare(cfg) * 100).toFixed(1),
  }));
  const eq = effortShare(n, cfg);
  const opt = optimalEffortShare(cfg);
  const needed = peerEvalNeeded(n, cfg);

  return (
    <section className="card tf-card" aria-labelledby="te-heading">
      <header className="tf-head">
        <span className="tf-eyebrow">Stage 2 · Effort in teams of any size</span>
        <h2 id="te-heading" className="tf-title">
          Bigger teams, more free-riding
        </h2>
        <p className="tf-lede">
          The two-student game above, extended to a whole team. Working adds M marks to the team grade, split across all
          n members, so the worker keeps only M/n. The cost is theirs alone. A student works only if M/n + V is larger
          than their cost, whatever the others do: a dominant strategy.
        </p>
      </header>

      <div className="tf-controls">
        <Slider label="Team size (n)" value={n} min={2} max={8} step={1} display={`${n}`} onChange={setN} />
        <Slider label="Marks full effort adds (M)" value={m} min={4} max={40} step={1} display={`${m}`} onChange={setM} />
        <Slider
          label="Peer evaluation (V)"
          value={v}
          min={0}
          max={15}
          step={0.5}
          display={fmt(v)}
          hint="Teammates' ratings move V marks from shirkers to workers. No marks are created."
          onChange={setV}
        />
      </div>

      <div className="tf-split">
        <div className="tf-members" aria-label="One team, member by member">
          <div className="tf-members-head">
            <h3>One team of {n}, member by member</h3>
            <p>Effort costs range from {costMin} to {costMax} marks.</p>
          </div>
          <div className="tf-scale">
            <span className="tf-marker is-private" style={at(privateReturn)}>
              <span>
                M/n + V = {fmt(privateReturn)}
              </span>
            </span>
            <span className="tf-marker is-team" style={at(m)}>
              <span>M = {m}</span>
            </span>
            {members.map((c, i) => {
              const w = works(c, n, m, v);
              return (
                <div key={i} className="tf-member">
                  <span className="tf-member-name">Student {i + 1}</span>
                  <span className="tf-member-track">
                    <span className="tf-member-bar" style={{ transform: `scaleX(${c / scaleMax})` }} />
                  </span>
                  <span className={`tf-pill ${w ? 'is-work' : 'is-shirk'}`}>{w ? 'Works' : 'Free-rides'}</span>
                </div>
              );
            })}
          </div>
          <p className="tf-small">
            Bar = the student’s effort cost. Anyone whose cost sits left of the blue line works. Anyone left of the green line
            should work for the team’s sake. Students between the two lines are the free-riders.
          </p>
        </div>

        <aside className="tf-aside">
          <div className="tf-facts is-stack">
            <div className="tf-fact">
              <span className="tf-fact-label">Work at equilibrium</span>
              <span className="tf-fact-value">{pct(eq)}</span>
              <span className="tf-fact-note">of students, in teams of {n}</span>
            </div>
            <div className="tf-fact">
              <span className="tf-fact-label">Should work</span>
              <span className="tf-fact-value">{pct(opt)}</span>
              <span className="tf-fact-note">best for the team (cost below M)</span>
            </div>
            <div className={`tf-fact ${v >= needed ? 'is-good' : ''}`}>
              <span className="tf-fact-label">Peer evaluation needed</span>
              <span className="tf-fact-value">V ≥ {fmt(needed)}</span>
              <span className="tf-fact-note">for everyone in a team of {n} to work</span>
            </div>
          </div>
        </aside>
      </div>

      <div className="tf-chart-block">
        <h3>Share of students who work, by team size</h3>
        <div className="tf-chart">
          <ResponsiveContainer>
            <LineChart data={data} margin={{ top: 8, right: 16, bottom: 20, left: -6 }}>
              <CartesianGrid stroke="#ececf1" vertical={false} />
              <XAxis
                dataKey="size"
                tickLine={false}
                fontSize={12}
                label={{ value: 'Team size n', position: 'insideBottom', offset: -12, fontSize: 12, fill: '#6e6e73' }}
              />
              <YAxis tickLine={false} axisLine={false} fontSize={12} domain={[0, 100]} unit="%" />
              <ReferenceLine x={n} stroke="#aeaeb2" strokeDasharray="4 4" />
              <Tooltip labelFormatter={(s) => `Team of ${s}`} formatter={(val, name) => [`${Number(val).toFixed(0)}%`, name]} />
              <Legend wrapperStyle={{ fontSize: 12, paddingTop: 14 }} />
              <Line name="Best for the team" dataKey="best" stroke="#15803d" strokeWidth={2} strokeDasharray="6 4" dot={false} isAnimationActive={false} />
              <Line name="No peer evaluation" dataKey="none" stroke="#d14343" strokeWidth={2} dot={{ r: 4, strokeWidth: 2, fill: '#fff' }} isAnimationActive={false} />
              {v > 0 && (
                <Line name={`Peer evaluation V = ${fmt(v)}`} dataKey="peer" stroke="#0071e3" strokeWidth={2} dot={{ r: 4, strokeWidth: 2, fill: '#fff' }} isAnimationActive={false} />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
        <p className="tf-small">
          Exact, not simulated: costs are uniform between {costMin} and {costMax}, so the share who work is the share of costs
          below M/n + V.
        </p>
      </div>
    </section>
  );
};
