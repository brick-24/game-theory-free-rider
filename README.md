# The Free-Rider Problem: Strategic Behavior in University Group Projects

An interactive, rigorous game-theory educational simulation built with **React**, **TypeScript**, and **Recharts**.

## Overview

In university group projects, students share a joint grade (a public good) while individually bearing the private cost of their effort. This application simulates how individually rational decisions lead to suboptimal collective outcomes (the Free-Rider Problem / Prisoner’s Dilemma) and how institutional mechanisms (such as peer evaluation and contribution rewards) can realign incentives and restore social efficiency.

## Features

- **Interactive 2×2 Payoff Matrix**:
  - Live numerical editing of payoffs for all 4 strategy profiles `(High, High)`, `(High, Low)`, `(Low, High)`, `(Low, Low)`.
  - Visual badges for Best Responses for Student A (Row player) and Student B (Column player).
  - Pure-strategy Nash equilibrium detection with strictness markers.
  - Selected cell highlighting and reset to default values `(6,6), (2,8), (8,2), (3,3)`.
- **Dynamic Game Simulation**:
  - Action selector for Student A and Student B.
  - Live calculation of individual payoffs, unilateral deviation incentives, and total social welfare.
  - Automated 4-outcome evaluation table analyzing equilibrium stability.
- **Adjustable Incentive Policy Controls**:
  - Sliders for Project Grade Reward ($R$), Effort Cost ($C$), Free-Riding Benefit ($F$), Low-Contribution Penalty ($P$), Peer Evaluation ($V$), and Contribution Reward ($W$).
  - Transparent formula: $u_i = 3 + R(k) - C(e_i) + F(1-e_i)e_j - P(1-e_i) + V(e_i-e_j) + W(e_i)$.
  - Explicit toggle between Formula Mode and Manual Edit Mode to prevent accidental overwrites.
- **Visualizations & Analysis**:
  - **Payoff Heatmap**: Shaded by collective welfare with Nash equilibrium borders.
  - **Social Welfare Bar Chart**: Side-by-side comparison of social welfare across all 4 strategy combinations.
  - **Repeated Game Simulation Engine**: Simulates $N$ rounds with behavioral learning rules (Fictitious Play or Myopic Best Response), exploration noise, and live time-series tracking.
- **Educational Demonstrations**:
  - 3 preset scenarios: *No incentives*, *Peer evaluation*, and *Contribution reward*.
  - Side-by-side matrix comparison, equilibrium shift, and pedagogical takeaways.
- **Game Theory Concepts & Verification**:
  - Live dynamic check of the Prisoner’s Dilemma conditions ($T > R > P > S$ and $2R > T + S$).
  - Strict and weak dominance analysis, best response dynamics, and mixed-strategy equilibrium calculations.

## Quality & Standards

Built in adherence to `jakubkrehel/skills` guidelines:
- **Accessibility**: WCAG 2.2 AA compliant, full keyboard support, visible focus rings (`:focus-visible`), skip-link navigation, accessible ARIA attributes, and high contrast ratios.
- **Typography & Layout**: Tabular numbers for all statistics and financial values, responsive layouts down to 320px width, and unitless line heights.
- **UI & Colors**: Semantic color tokens with redundant text and badge indicators.

## Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Run the Development Server
```bash
npm run dev
```

### 3. Run Automated Tests
```bash
npm test
```

### 4. Build for Production
```bash
npm run build
```


---

## Stage 1: Team formation (added)

Before the effort game is played, students have to be split into teams. This section models that as a
coalition-formation game and compares four rules on the same randomly generated classes.

**Model.** T teams of k students. Skill `s ∈ [0, 1]`. Team quality `Q = (1 − β)·mean(skill) + β·max(skill)`,
where β is how much the strongest member carries the project. Team grade `G = 40 + 40·Q + M·(share who work)`.

| Rule | How teams form | Strategic behaviour |
|---|---|---|
| Random | Shuffle and cut | None possible |
| Free choice | Students choose; everyone prefers skilled teammates | The strongest k team up, then the next k, so the class sorts by skill |
| Balanced (self-report) | Snake-order deal on declared skill | Strong students understate their skill to be dealt into a stronger team |
| Balanced (verified) | Snake-order deal on past grades | None possible |

**Measures** (averaged over 40 classes, computed live): average grade, best − worst team gap, weakest 10%,
share of classes that are **core-stable** (no group of k students all prefer to form their own team), and the
grade a top-third student gains by understating skill with everyone else fixed (a unilateral deviation).

**Stability is checked exactly.** With β < 1 and distinct skills, a partition is stable if and only if it is the
skill-sorted one. The test suite verifies the fast check against brute force over every possible group.

## Stage 2 extended: effort in teams of any size (added)

Each worker adds `M/n` to every member's grade but pays their own cost `c_i` (uniform on [2, 14]). Peer evaluation
moves `V` marks from shirkers to workers (a pure transfer). Working is a dominant strategy iff `M/n + V > c_i`;
it is best for the team iff `M > c_i`. The chart shows the exact equilibrium share of workers by team size.

### Added files

```
src/team/model.ts                 Team formation + N-player effort model (no React)
src/team/model.test.ts            14 tests, incl. brute-force stability check
src/team/rng.ts                   Seeded random numbers (reproducible)
src/team/worker.ts                Runs the 40-class comparison off the main thread
src/team/useComparison.ts         Worker hook: one job in flight, latest settings only
src/components/team/              Stage 1 and Stage 2 (N-player) sections
src/team.css                      Styles for the added sections
```
