import React from "react";
import {
  type Action,
  type OutcomeKey,
  type PayoffMatrix,
  type Player,
  PAYOFF_MAX,
  PAYOFF_MIN,
} from "../game/types";
import type { GameAnalysis } from "../game/analysis";
import { fmt, outcomeShort } from "../game/format";

interface PayoffMatrixProps {
  matrix: PayoffMatrix;
  selectedOutcome: OutcomeKey;
  analysis: GameAnalysis;
  onCellChange: (outcome: OutcomeKey, player: Player, value: number) => void;
  onSelectOutcome: (outcome: OutcomeKey) => void;
  onReset: () => void;
  isCustomMatrix?: boolean;
  activeScenarioId?: string;
}

interface PayoffCellInputProps {
  id: string;
  value: number;
  min: number;
  max: number;
  className: string;
  ariaLabel: string;
  onFocus?: () => void;
  onChange: (val: number) => void;
}

const PayoffCellInput: React.FC<PayoffCellInputProps> = ({
  id,
  value,
  min,
  max,
  className,
  ariaLabel,
  onFocus,
  onChange,
}) => {
  const [localText, setLocalText] = React.useState<string>(String(value));
  const lastReportedValueRef = React.useRef<number>(value);
  const initialValueOnFocusRef = React.useRef<number>(value);

  React.useEffect(() => {
    if (value !== lastReportedValueRef.current) {
      setLocalText(String(value));
      lastReportedValueRef.current = value;
    }
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;

    if (raw === "" || raw === "-" || raw === "." || raw === "-.") {
      setLocalText(raw);
      return;
    }

    if (!/^-?\d*\.?\d*$/.test(raw)) {
      return;
    }

    setLocalText(raw);

    const parsed = parseFloat(raw);
    if (!isNaN(parsed)) {
      const clamped = Math.max(min, Math.min(max, parsed));
      lastReportedValueRef.current = clamped;
      onChange(clamped);
    }
  };

  const handleBlur = () => {
    const parsed = parseFloat(localText);
    if (
      isNaN(parsed) ||
      localText === "" ||
      localText === "-" ||
      localText === "." ||
      localText === "-."
    ) {
      setLocalText(String(value));
      lastReportedValueRef.current = value;
    } else {
      const clamped = Math.max(min, Math.min(max, parsed));
      setLocalText(String(clamped));
      if (clamped !== value) {
        lastReportedValueRef.current = clamped;
        onChange(clamped);
      }
    }
  };

  const handleFocus = () => {
    initialValueOnFocusRef.current = value;
    onFocus?.();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    e.stopPropagation();
    if (e.key === "Enter") {
      (e.target as HTMLInputElement).blur();
    } else if (e.key === "Escape") {
      const original = initialValueOnFocusRef.current;
      setLocalText(String(original));
      lastReportedValueRef.current = original;
      onChange(original);
      (e.target as HTMLInputElement).blur();
    }
  };

  return (
    <input
      id={id}
      type="text"
      inputMode="decimal"
      value={localText}
      onChange={handleChange}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      className={className}
      aria-label={ariaLabel}
    />
  );
};

export const PayoffMatrixComponent: React.FC<PayoffMatrixProps> = ({
  matrix,
  selectedOutcome,
  analysis,
  onCellChange,
  onSelectOutcome,
  onReset,
  isCustomMatrix = false,
  activeScenarioId,
}) => {
  const renderCell = (
    outcome: OutcomeKey,
    aAction: Action,
    bAction: Action,
  ) => {
    const isSelected = selectedOutcome === outcome;
    const isNash = analysis.nash.includes(outcome);
    const cell = matrix[outcome];

    return (
      <td
        key={outcome}
        className={`matrix-cell ${isSelected ? "selected" : ""} ${isNash ? "is-nash" : ""}`}
        onClick={() => onSelectOutcome(outcome)}
        aria-label={`Outcome Student A ${aAction === "H" ? "Choose Hard-Working Teammate" : "Choose Lazy Teammate"}, Student B ${
          bAction === "H" ? "Choose Hard-Working Teammate" : "Choose Lazy Teammate"
        }. Student A score ${fmt(cell.a)}, Student B score ${fmt(cell.b)}.${isNash ? " Nash Equilibrium." : ""}`}
      >
        <div className="matrix-cell-header">
          {isSelected ? (
            <span className="cell-active-indicator">● Active</span>
          ) : (
            <span className="cell-header-spacer" />
          )}
        </div>

        <div
          className="payoff-pair-row"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="payoff-input-item">
            <PayoffCellInput
              id={`input-${outcome}-a`}
              min={PAYOFF_MIN}
              max={PAYOFF_MAX}
              value={cell.a}
              onFocus={() => onSelectOutcome(outcome)}
              onChange={(val) => onCellChange(outcome, "A", val)}
              className="payoff-input payoff-input-a"
              ariaLabel={`Score for Student A: ${aAction === "H" ? "Hard-Working" : "Lazy"}`}
            />
            <span className="payoff-subscript color-a" aria-hidden="true" title="Student A score">A</span>
          </div>

          <span className="payoff-comma" aria-hidden="true">,</span>

          <div className="payoff-input-item">
            <PayoffCellInput
              id={`input-${outcome}-b`}
              min={PAYOFF_MIN}
              max={PAYOFF_MAX}
              value={cell.b}
              onFocus={() => onSelectOutcome(outcome)}
              onChange={(val) => onCellChange(outcome, "B", val)}
              className="payoff-input payoff-input-b"
              ariaLabel={`Score for Student B: ${bAction === "H" ? "Hard-Working" : "Lazy"}`}
            />
            <span className="payoff-subscript color-b" aria-hidden="true" title="Student B score">B</span>
          </div>
        </div>

        <div className="cell-badges-row">
          {isNash ? (
            <span className="badge badge-nash">★ Nash Equilibrium</span>
          ) : (
            <span className="cell-team-score num">
              Total: {fmt(cell.a + cell.b)} pts
            </span>
          )}
        </div>
      </td>
    );
  };

  return (
    <section className="card" aria-labelledby="matrix-heading">
      <div className="card-header">
        <div className="card-header-top">
          <h2 id="matrix-heading" className="card-title">
            Interactive 2&times;2 Payoff Matrix
          </h2>

          <div className="card-header-actions">
            {isCustomMatrix ? (
              <span className="badge badge-warning" style={{ fontSize: "0.75rem" }}>
                Custom Values
              </span>
            ) : activeScenarioId && activeScenarioId !== "none" ? (
              <span className="badge badge-success" style={{ fontSize: "0.75rem" }}>
                Policy Preset Active
              </span>
            ) : null}

            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={onReset}
              title="Restore baseline classroom numbers: (6,6), (2,8), (8,2), (3,3)"
            >
              ↺ Reset Default
            </button>
          </div>
        </div>

        <p className="card-subtitle">
          Values display (Student A Score, Student B Score) based on teammate selection. Click any cell to test it in the simulator, or edit numbers directly.
        </p>
      </div>

      <div className="matrix-container">
        <table
          className="matrix-table"
          aria-label="Payoff matrix for Student A and Student B teammate selection"
        >
          <thead>
            <tr>
              <th
                scope="col"
                className="matrix-header-empty"
              >
                <span className="sr-only">Row Player vs Column Player</span>
              </th>
              <th scope="col" className="matrix-header-col">
                <span className="header-player-pill player-b-pill">Student B</span>
                <span className="header-action-name">Choose Hard-Working Teammate</span>
              </th>
              <th scope="col" className="matrix-header-col">
                <span className="header-player-pill player-b-pill">Student B</span>
                <span className="header-action-name">Choose Lazy Teammate</span>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <th scope="row" className="matrix-header-row">
                <span className="header-player-pill player-a-pill">Student A</span>
                <span className="header-action-name">Choose Hard-Working Teammate</span>
              </th>
              {renderCell("HH", "H", "H")}
              {renderCell("HL", "H", "L")}
            </tr>
            <tr>
              <th scope="row" className="matrix-header-row">
                <span className="header-player-pill player-a-pill">Student A</span>
                <span className="header-action-name">Choose Lazy Teammate</span>
              </th>
              {renderCell("LH", "L", "H")}
              {renderCell("LL", "L", "L")}
            </tr>
          </tbody>
        </table>
      </div>

      {/* Strategic Summary Bar */}
      <div className="matrix-summary-bar">
        <div className="matrix-summary-left">
          <span className="matrix-summary-label">Nash Equilibrium:</span>
          {analysis.nash.length === 0 ? (
            <span className="matrix-summary-none">
              None in pure strategies
            </span>
          ) : (
            analysis.nash.map((key) => (
              <span key={key} className="badge badge-nash">
                ★ {outcomeShort(key)}
              </span>
            ))
          )}
        </div>
        <div className="matrix-summary-right">
          {analysis.nash.length > 0
            ? "Neither student wants to change their teammate choice unilaterally."
            : "Students have cycling incentives to switch teammate choices."}
        </div>
      </div>
    </section>
  );
};
