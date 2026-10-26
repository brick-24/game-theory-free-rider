# Original User Request

## 2026-10-25T21:30:08Z

This is a single self-contained redesign and simplification; keep it small and focused.
Simplify and redesign the Free-Rider Problem simulator ("Work on Project or Slack Off") down to its essential, intuitive components with a clean Apple-inspired UI, removing overwhelming academic jargon and focusing strictly on the key user-favorite features.

Working directory: C:\Users\raghav\Desktop\Sem5\Game Theory\project
Integrity mode: development

## Requirements

### R1. Simplified Core Interface (Apple-inspired UI)
- Strip away unnecessary dense sections (remove complex game theory academic concept accordions, formulas with obscure notation, and multi-round repeated simulation parameters).
- Apply a clean, minimalist Apple-like aesthetic: smooth rounded corners, clean card surfaces, generous whitespace, refined typography, and intuitive controls.

### R2. Focused Interactive Features
Retain and polish only the three core components:
1. **Interactive 2×2 Payoff Matrix**: Simple, clean grid showing Student A & Student B payoffs for (Work, Work), (Work, Slack), (Slack, Work), and (Slack, Slack), with clear editable numbers and Nash Equilibrium badges.
2. **Dynamic Action Simulator**: Clear toggle buttons to choose actions ("Work on project" vs "Slack off") for each student, immediately displaying the resulting payoffs and a plain-English explanation of whether someone wants to switch.
3. **Educational Demonstration (3 Presets)**: Simple 1-click preset policy scenarios: *No incentives (Base)*, *Peer evaluation*, and *Contribution reward*, showing how the outcome changes.

### R3. Renamed and Simplified Outcome Comparison
- Rename "Social Welfare Comparison" to a plain, intuitive title like **"Total Team Score / Group Payoff Comparison"** or **"All 4 Scenarios & Payoffs"**.
- Display all 4 possible scenarios clearly with their individual payoffs, total group score, and which outcome is the natural equilibrium vs the best outcome for the team.

## Acceptance Criteria

### Interface Simplification
- [ ] The app is simple and immediately understandable without any prior game theory knowledge.
- [ ] No overwhelming blocks of text, complex formulas, or obscure academic parameters.
- [ ] The 3 requested modules (Payoff Matrix, Action Simulator, 3 Preset Scenarios) are front and center.
- [ ] "Social Welfare" is replaced everywhere with plain terms like "Total Team Score" or "Combined Group Payoff".
- [ ] All 4 possible outcomes and their payoffs are clearly compared in a clean visual summary.

### Polish & Verification
- [ ] All calculations and interactions remain 100% mathematically correct.
- [ ] App builds cleanly (`npm run build`) and passes all tests (`npm test`).

