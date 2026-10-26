import React from "react";
import { SCENARIOS, type Scenario } from "../game/scenarios";
import {
  type IncentiveParams,
  buildMatrix,
  withoutIncentives,
} from "../game/model";
import { analyzeGame } from "../game/analysis";
import { fmt, outcomeShort } from "../game/format";

interface DemonstrationScenariosProps {
  currentParams: IncentiveParams;
  activeScenarioId: string;
  onApplyScenario: (scenario: Scenario) => void;
}

const PRESET_HIGHLIGHTS: Record<
  string,
  { badge: string; badgeClass: string; icon: string }
> = {
  none: {
    icon: "⚡",
    badge: "Dilemma: Lazy Teammates",
    badgeClass: "badge-warning",
  },
  peer: {
    icon: "👥",
    badge: "Solution: Hard-Working",
    badgeClass: "badge-success",
  },
  reward: {
    icon: "🎁",
    badge: "Solution: Hard-Working",
    badgeClass: "badge-success",
  },
};

export const DemonstrationScenarios: React.FC<DemonstrationScenariosProps> = ({
  currentParams,
  activeScenarioId,
  onApplyScenario,
}) => {
  const baseParams = withoutIncentives(currentParams);

  return (
    <section className="card" aria-labelledby="presets-heading">
      <div className="card-header">
        <div className="card-title-group">
          <h2 id="presets-heading" className="card-title">
            Educational Demonstration: 3 Team Formation Policies
          </h2>
          <p className="card-subtitle">
            Select a team formation policy to see how institutional rules change student incentives from choosing lazy teammates to recruiting hard-working partners.
          </p>
        </div>
      </div>

      <div className="preset-cards-grid" role="radiogroup" aria-label="Policy Scenarios">
        {SCENARIOS.map((scenario) => {
          const scenarioParams = { ...baseParams, ...scenario.incentives };
          const scenarioMatrix = buildMatrix(scenarioParams);
          const scenarioAnalysis = analyzeGame(scenarioMatrix);
          const isActive = activeScenarioId === scenario.id;
          const meta = PRESET_HIGHLIGHTS[scenario.id] || {
            icon: "📋",
            badge: "Policy Preset",
            badgeClass: "badge-info",
          };

          const eqOutcome =
            scenarioAnalysis.nash.length > 0 ? scenarioAnalysis.nash[0] : null;
          const eqTeamScore = eqOutcome
            ? scenarioMatrix[eqOutcome].a + scenarioMatrix[eqOutcome].b
            : null;

          return (
            <div
              key={scenario.id}
              role="radio"
              aria-checked={isActive}
              tabIndex={0}
              className={`preset-card ${isActive ? "active" : ""}`}
              onClick={() => onApplyScenario(scenario)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onApplyScenario(scenario);
                }
              }}
              aria-label={`Policy preset: ${scenario.title}. ${scenario.summary}`}
            >
              <div className="preset-card-top">
                <div className="preset-title-row">
                  <span className="preset-icon" aria-hidden="true">{meta.icon}</span>
                  <h3 className="preset-title">{scenario.title}</h3>
                </div>
                {isActive ? (
                  <span className="badge badge-active-pill">
                    ✓ Active
                  </span>
                ) : (
                  <span className={`badge ${meta.badgeClass}`}>
                    {meta.badge}
                  </span>
                )}
              </div>

              <p className="preset-summary">{scenario.summary}</p>

              <div className="preset-meta-footer">
                <span className="preset-meta-label">Nash Equilibrium:</span>
                <span className="preset-meta-value">
                  <strong>{eqOutcome ? outcomeShort(eqOutcome) : "None"}</strong>
                  {eqTeamScore !== null && (
                    <span className="preset-meta-score num">
                      {fmt(eqTeamScore)} pts total
                    </span>
                  )}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
