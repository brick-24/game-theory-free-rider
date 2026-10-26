import React from "react";
import { type OutcomeKey, type PayoffMatrix, OUTCOMES } from "../game/types";
import type { GameAnalysis } from "../game/analysis";
import { fmt, outcomeShort, outcomeShortList } from "../game/format";

interface OutcomeComparisonProps {
  matrix: PayoffMatrix;
  analysis: GameAnalysis;
  selectedOutcome: OutcomeKey;
  onSelectOutcome: (outcome: OutcomeKey) => void;
}

interface ScenarioMeta {
  key: OutcomeKey;
  title: string;
  summary: string;
}

const SCENARIO_DETAILS: Record<OutcomeKey, ScenarioMeta> = {
  HH: {
    key: "HH",
    title: "Both Choose Hard-Working Teammates",
    summary:
      "Both students recruit diligent, committed teammates, producing superior project quality and shared high grades.",
  },
  HL: {
    key: "HL",
    title: "Student A Chooses Hard-Working, Student B Chooses Lazy",
    summary:
      "Student B chooses a lazy partner and free-rides, while Student A's hard-working recruit shoulders the workload.",
  },
  LH: {
    key: "LH",
    title: "Student A Chooses Lazy, Student B Chooses Hard-Working",
    summary:
      "Student A chooses a lazy partner and free-rides, while Student B's hard-working recruit shoulders the workload.",
  },
  LL: {
    key: "LL",
    title: "Both Choose Lazy Teammates",
    summary:
      "Both students choose uncommitted teammates. The team project suffers from coordination failure and minimal grade outcomes.",
  },
};

export const OutcomeComparison: React.FC<OutcomeComparisonProps> = ({
  matrix,
  analysis,
  selectedOutcome,
  onSelectOutcome,
}) => {
  const allTeamScores = OUTCOMES.map((k) => matrix[k].a + matrix[k].b);
  const maxTeamScore = Math.max(...allTeamScores);
  const minTeamScore = Math.min(...allTeamScores);

  return (
    <section className="card" aria-labelledby="outcome-comparison-heading">
      <div className="card-header">
        <div className="card-title-group">
          <h2 id="outcome-comparison-heading" className="card-title">
            All 4 Team Combinations &amp; Total Project Score Comparison
          </h2>
          <p className="card-subtitle">
            Compare how teammate selection choices affect total team performance. Observe whether the Nash equilibrium produces the highest team score or falls into a lazy teammate trap.
          </p>
        </div>
      </div>

      {/* Grid of all 4 outcomes */}
      <div className="outcome-comparison-grid" role="group" aria-label="Outcome Comparison Cards">
        {OUTCOMES.map((key) => {
          const cell = matrix[key];
          const teamScore = cell.a + cell.b;
          const isNash = analysis.nash.includes(key);
          const isBestForTeam = analysis.maxWelfare.outcomes.includes(key);
          const isSelected = selectedOutcome === key;
          const meta = SCENARIO_DETAILS[key];

          // Compute truthful, monotonic visual bar width
          let pct: number;
          if (minTeamScore >= 0) {
            if (maxTeamScore > 0) {
              pct =
                teamScore <= 0
                  ? 8
                  : Math.max(
                      12,
                      Math.min(
                        100,
                        Math.round((teamScore / maxTeamScore) * 100),
                      ),
                    );
            } else {
              pct = 100;
            }
          } else {
            if (maxTeamScore > minTeamScore) {
              pct = Math.max(
                10,
                Math.min(
                  100,
                  Math.round(
                    ((teamScore - minTeamScore) /
                      (maxTeamScore - minTeamScore)) *
                      90 +
                      10,
                  ),
                ),
              );
            } else {
              pct = 100;
            }
          }

          return (
            <div
              key={key}
              role="button"
              aria-pressed={isSelected}
              tabIndex={0}
              className={`outcome-card ${isSelected ? "selected" : ""} ${isNash ? "is-nash" : ""}`}
              onClick={() => onSelectOutcome(key)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onSelectOutcome(key);
                }
              }}
              aria-label={`Scenario: ${meta.title}. Total score: ${fmt(teamScore)} points.`}
            >
              {/* Card Header */}
              <div className="outcome-card-top">
                <div className="outcome-header-info">
                  <div className="outcome-code-badge">{outcomeShort(key)}</div>
                  <h3 className="outcome-card-title">{meta.title}</h3>
                </div>
                {isSelected ? (
                  <span className="badge badge-active-pill">
                    ✓ Active
                  </span>
                ) : null}
              </div>

              <p className="outcome-card-summary">{meta.summary}</p>

              {/* Status Badges */}
              <div className="outcome-badges-row">
                {isNash && isBestForTeam ? (
                  <span className="badge badge-success">
                    ★ Nash Equilibrium &bull; 🏆 Team Best
                  </span>
                ) : (
                  <>
                    {isNash && (
                      <span className="badge badge-nash">
                        ★ Nash Equilibrium
                      </span>
                    )}
                    {isBestForTeam && (
                      <span className="badge badge-team-best">
                        🏆 Best for Team
                      </span>
                    )}
                  </>
                )}
                {isNash && !isBestForTeam && (
                  <span className="badge badge-warning">
                    ⚠ Dilemma Trap
                  </span>
                )}
              </div>

              {/* Individual Payoffs Breakdown */}
              <div className="outcome-individual-scores">
                <div className="score-pill score-pill-a">
                  <span className="score-label">Student A:</span>
                  <span className="score-val num">{fmt(cell.a)} pts</span>
                </div>
                <div className="score-pill score-pill-b">
                  <span className="score-label">Student B:</span>
                  <span className="score-val num">{fmt(cell.b)} pts</span>
                </div>
              </div>

              {/* Total Team Score Bar */}
              <div className="outcome-team-score-block">
                <div className="outcome-team-score-header">
                  <span className="team-score-label">Total Team Score</span>
                  <span className="team-score-val num">
                    {fmt(teamScore)} pts
                  </span>
                </div>

                <div className="team-score-bar-track" aria-hidden="true">
                  <div
                    className={`team-score-bar-fill ${
                      isBestForTeam && isNash
                        ? "bar-opt-nash"
                        : isBestForTeam
                          ? "bar-team-best"
                          : isNash
                            ? "bar-nash-subopt"
                            : "bar-standard"
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>

              <div className="outcome-card-action-hint">
                <span className="outcome-action-text">
                  {isSelected ? "Currently Selected" : "Click to Test in Simulator"}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pedagogical Insight Takeaway */}
      <div className="insight-callout">
        <div className="insight-callout-icon" aria-hidden="true">💡</div>
        <div className="insight-callout-body">
          <h4 className="insight-callout-title">Core Team Formation Insight</h4>
          {analysis.prisonersDilemma.isPrisonersDilemma ? (
            <p>
              In unregulated team formation without screening policies, private incentives pull both students to recruit lazy teammates (
              <strong>{fmt(matrix.LL.a)} pts each, {fmt(matrix.LL.a + matrix.LL.b)} pts total</strong>
              ), even though both choosing hard-working teammates (
              <strong>{fmt(matrix.HH.a)} pts each, {fmt(matrix.HH.a + matrix.HH.b)} pts total</strong>
              ) produces double the team score! This wedge between individual recruitment incentives and collective group achievement is the classic <strong>Team Formation Dilemma</strong>.
            </p>
          ) : analysis.nash.includes("HH") &&
            analysis.maxWelfare.outcomes.includes("HH") ? (
            <p>
              Under this institutional policy, individual teammate selection directly aligns with team success! Choosing a hard-working teammate is now the
              <strong> Nash Equilibrium</strong>, unlocking the maximum total project score of <strong>{fmt(matrix.HH.a + matrix.HH.b)} points</strong>.
            </p>
          ) : analysis.nash.length === 0 ? (
            <p>
              Under this payoff structure, there is <strong>no Nash equilibrium in pure strategies</strong>. Students face cyclical incentives to second-guess each other's recruit: whenever one switches, the other wants to change partners in response.
            </p>
          ) : (
            <p>
              The current Nash {analysis.nash.length > 1 ? "equilibria are" : "equilibrium is"}{" "}
              <strong>{outcomeShortList(analysis.nash)}</strong>, producing a combined group payoff of{" "}
              <strong>
                {analysis.nash
                  .map(
                    (k) =>
                      `${fmt(matrix[k].a + matrix[k].b)} pts (${outcomeShort(k)})`,
                  )
                  .join(", ")}
              </strong>
              .
            </p>
          )}
        </div>
      </div>
    </section>
  );
};
