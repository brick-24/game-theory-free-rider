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

