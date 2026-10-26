import React from "react";
import {
  type Action,
  type OutcomeKey,
  type PayoffMatrix,
  outcomeKey,
  splitOutcome,
} from "../game/types";
import { compare, type GameAnalysis } from "../game/analysis";
import { fmt, outcomeShort } from "../game/format";

interface StrategySimulatorProps {
  matrix: PayoffMatrix;
  selectedOutcome: OutcomeKey;
  onSelectOutcome: (outcome: OutcomeKey) => void;
  analysis: GameAnalysis;
}

export const StrategySimulator: React.FC<StrategySimulatorProps> = ({
  matrix,
  selectedOutcome,
  onSelectOutcome,
  analysis,
}) => {
  const [currentA, currentB] = splitOutcome(selectedOutcome);
  const cell = matrix[selectedOutcome];
  const teamScore = cell.a + cell.b;
  const devA = analysis.deviation[selectedOutcome].a;
  const devB = analysis.deviation[selectedOutcome].b;
  const isNash = analysis.nash.includes(selectedOutcome);
  const isBestForTeam = analysis.maxWelfare.outcomes.includes(selectedOutcome);

  const handleSelectA = (action: Action) => {
    onSelectOutcome(outcomeKey(action, currentB));
  };

  const handleSelectB = (action: Action) => {
    onSelectOutcome(outcomeKey(currentA, action));
  };

  const otherActionText = (action: Action) =>
    action === "H" ? "Choose Lazy Teammate" : "Choose Hard-Working Teammate";

  return (
    <section className="card" aria-labelledby="simulator-heading">
      <div className="card-header">
        <div className="card-header-top">
          <h2 id="simulator-heading" className="card-title">
            Dynamic Action Simulator
          </h2>
        </div>
        <p className="card-subtitle">
          Toggle who each student chooses for their team. See individual scores, total team performance, and incentives to switch partners.
        </p>
      </div>

      <div className="simulator-body">
        {/* Action Toggles for Student A and Student B */}
        <div className="action-picker-grid">
        {/* Student A Toggle */}
        <div className="player-panel player-panel-a">
          <div className="player-panel-header">
            <span className="player-panel-title label-a">
              <span className="player-indicator-dot dot-a" aria-hidden="true" />
              Student A Teammate Choice
            </span>
          </div>
          <div
            className="segmented-control"
            role="group"
            aria-label="Student A Teammate Decision"
          >
            <button
              type="button"
              className={`segmented-btn ${currentA === "H" ? "active-a" : ""}`}
              onClick={() => handleSelectA("H")}
              aria-pressed={currentA === "H"}
            >
              Choose Hard-Working Teammate
            </button>
            <button
              type="button"
              className={`segmented-btn ${currentA === "L" ? "active-a" : ""}`}
              onClick={() => handleSelectA("L")}
              aria-pressed={currentA === "L"}
            >
              Choose Lazy Teammate
            </button>
          </div>
        </div>

        {/* Student B Toggle */}
        <div className="player-panel player-panel-b">
          <div className="player-panel-header">
            <span className="player-panel-title label-b">
              <span className="player-indicator-dot dot-b" aria-hidden="true" />
              Student B Teammate Choice
            </span>
          </div>
          <div
            className="segmented-control"
            role="group"
            aria-label="Student B Teammate Decision"
          >
            <button
              type="button"
              className={`segmented-btn ${currentB === "H" ? "active-b" : ""}`}
              onClick={() => handleSelectB("H")}
              aria-pressed={currentB === "H"}
            >
              Choose Hard-Working Teammate
            </button>
            <button
              type="button"
              className={`segmented-btn ${currentB === "L" ? "active-b" : ""}`}
              onClick={() => handleSelectB("L")}
              aria-pressed={currentB === "L"}
            >
              Choose Lazy Teammate
            </button>
          </div>
        </div>
      </div>

      {/* Live Payoff Metric Cards */}
      <div className="stat-box-row">
        {/* Student A Payoff Card */}
        <div className="stat-box stat-box-a">
          <span className="stat-box-label label-a">Student A Score</span>
          <span className="stat-box-value num color-a">{fmt(cell.a)} pts</span>
          <div className="stat-box-incentive">
            {compare(devA, 0) > 0 ? (
              <span className="incentive-gain">
                ⚠ Wants to switch: +{fmt(devA)} pts if switching to {otherActionText(currentA)}
              </span>
            ) : compare(devA, 0) < 0 ? (
              <span className="incentive-loss">
                ✓ Best choice (loses {fmt(Math.abs(devA))} pts if switching)
              </span>
            ) : (
              <span className="incentive-neutral">
                Indifferent: same score if switching
              </span>
            )}
          </div>
        </div>

        {/* Student B Payoff Card */}
        <div className="stat-box stat-box-b">
          <span className="stat-box-label label-b">Student B Score</span>
          <span className="stat-box-value num color-b">{fmt(cell.b)} pts</span>
          <div className="stat-box-incentive">
            {compare(devB, 0) > 0 ? (
              <span className="incentive-gain">
                ⚠ Wants to switch: +{fmt(devB)} pts if switching to {otherActionText(currentB)}
              </span>
            ) : compare(devB, 0) < 0 ? (
              <span className="incentive-loss">
                ✓ Best choice (loses {fmt(Math.abs(devB))} pts if switching)
              </span>
            ) : (
              <span className="incentive-neutral">
                Indifferent: same score if switching
              </span>
            )}
          </div>
        </div>

        {/* Total Team Score Card */}
        <div className="stat-box stat-box-team">
          <span className="stat-box-label">Combined Group Payoff</span>
          <span className="stat-box-value num">{fmt(teamScore)} pts</span>
          <div className="stat-box-incentive">
            {isBestForTeam ? (
              <span className="incentive-loss">
                🏆 Highest possible team score
              </span>
            ) : (
              <span className="incentive-neutral">
                Max possible team score: {fmt(analysis.maxWelfare.value)} pts
              </span>
            )}
          </div>
        </div>
      </div>
      </div>

      {/* Plain-English Stability Banner */}
      <div
        className={`stability-banner ${isNash ? "is-nash" : "unstable"}`}
        role="status"
      >
        <div className="stability-icon" aria-hidden="true">{isNash ? "✓" : "⚠"}</div>
        <div className="stability-content">
          {isNash ? (
            <div>
              <strong className="stability-title">
                Selected outcome ({outcomeShort(selectedOutcome)}) is a Nash Equilibrium!
              </strong>
              <p className="stability-desc">
                Neither student can improve their score by unilaterally switching to a different teammate. Given what their partner chose, each student's current teammate choice is a mutual best response.
              </p>
            </div>
          ) : (
            <div>
              <strong className="stability-title">
                Selected outcome ({outcomeShort(selectedOutcome)}) is Strategically Unstable.
              </strong>
              <p className="stability-desc">
                {compare(devA, 0) > 0 && compare(devB, 0) > 0
                  ? `Both students would earn more points by switching teammates (Student A: +${fmt(devA)} pts, Student B: +${fmt(devB)} pts).`
                  : compare(devA, 0) > 0
                    ? `Student A would earn more points (+${fmt(devA)} pts) by switching to ${otherActionText(currentA)}.`
                    : `Student B would earn more points (+${fmt(devB)} pts) by switching to ${otherActionText(currentB)}.`}
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
