import React, { useState, useMemo, useCallback } from 'react';
import { Header } from './components/Header';
import { DemonstrationScenarios } from './components/DemonstrationScenarios';
import { PayoffMatrixComponent } from './components/PayoffMatrix';
import { StrategySimulator } from './components/StrategySimulator';
import { GameTheoryGuide } from './components/GameTheoryGuide';
import { OutcomeComparison } from './components/OutcomeComparison';
import { TeamFormationLab } from './components/team/TeamFormationLab';

import {
  DEFAULT_MATRIX,
  type OutcomeKey,
  type PayoffMatrix,
  type Player,
  cloneMatrix,
} from './game/types';
import {
  DEFAULT_PARAMS,
  type IncentiveParams,
  buildMatrix,
  withoutIncentives,
} from './game/model';
import { analyzeGame } from './game/analysis';
import type { Scenario } from './game/scenarios';

export const App: React.FC = () => {
  const [params, setParams] = useState<IncentiveParams>({ ...DEFAULT_PARAMS });
  const [matrix, setMatrix] = useState<PayoffMatrix>(cloneMatrix(DEFAULT_MATRIX));
  const [selectedOutcome, setSelectedOutcome] = useState<OutcomeKey>('LL');
  const [activeScenarioId, setActiveScenarioId] = useState<string>('none');
  const [isCustomMatrix, setIsCustomMatrix] = useState<boolean>(false);

  // Live game theory analysis computed on every matrix change
  const analysis = useMemo(() => analyzeGame(matrix), [matrix]);

  // Handle direct cell editing inside the matrix
  const handleCellChange = useCallback(
    (outcome: OutcomeKey, player: Player, value: number) => {
      setMatrix((prev) => {
        const currentVal = player === 'A' ? prev[outcome].a : prev[outcome].b;
        if (currentVal === value) return prev;

        const next = cloneMatrix(prev);
        if (player === 'A') {
          next[outcome].a = value;
        } else {
          next[outcome].b = value;
        }
        setIsCustomMatrix(true);
        setActiveScenarioId('custom');
        return next;
      });
    },
    []
  );

  // Reset to default illustrative classroom numbers
  const handleReset = useCallback(() => {
    setParams({ ...DEFAULT_PARAMS });
    setMatrix(cloneMatrix(DEFAULT_MATRIX));
    setSelectedOutcome('LL');
    setActiveScenarioId('none');
    setIsCustomMatrix(false);
  }, []);

  // 1-Click Demonstration Scenario preset application
  const handleApplyScenario = useCallback(
    (scenario: Scenario) => {
      const baseParams = withoutIncentives(params);
      const nextParams = { ...baseParams, ...scenario.incentives };
      setParams(nextParams);

      const nextMatrix = buildMatrix(nextParams);
      setMatrix(nextMatrix);
      setActiveScenarioId(scenario.id);
      setIsCustomMatrix(false);

      // Auto-select the scenario equilibrium if available
      const scenarioAnalysis = analyzeGame(nextMatrix);
      if (scenarioAnalysis.nash.length > 0) {
        setSelectedOutcome(scenarioAnalysis.nash[0]);
      }
    },
    [params]
  );

  return (
    <div className="app-wrapper">
      <Header />

      <main id="main" className="app-main">
        {/* Stage 1: Team formation (who teams up with whom) */}
        <TeamFormationLab />

        {/* Module 1: Educational Demonstration (3 Policy Presets) */}
        <DemonstrationScenarios
          currentParams={params}
          activeScenarioId={activeScenarioId}
          onApplyScenario={handleApplyScenario}
        />

        {/* Module 2: Core Interactive Matrix & Action Simulator */}
        <div className="dashboard-grid">
          <PayoffMatrixComponent
            matrix={matrix}
            selectedOutcome={selectedOutcome}
            analysis={analysis}
            onCellChange={handleCellChange}
            onSelectOutcome={setSelectedOutcome}
            onReset={handleReset}
            isCustomMatrix={isCustomMatrix}
            activeScenarioId={activeScenarioId}
          />

          <StrategySimulator
            matrix={matrix}
            selectedOutcome={selectedOutcome}
            onSelectOutcome={setSelectedOutcome}
            analysis={analysis}
          />
        </div>

        {/* Module 3: Game Theory Academic Foundations */}
        <GameTheoryGuide />

        {/* Module 4: Outcome Comparison (All 4 Scenarios & Payoffs) */}
        <OutcomeComparison
          matrix={matrix}
          analysis={analysis}
          selectedOutcome={selectedOutcome}
          onSelectOutcome={setSelectedOutcome}
        />
      </main>
    </div>
  );
};

export default App;
