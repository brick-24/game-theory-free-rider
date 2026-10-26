import React, { useState } from "react";

type TheoryTab = "nash" | "dominance" | "pareto" | "mechanism";

export const GameTheoryGuide: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TheoryTab>("nash");
  const [isExpanded, setIsExpanded] = useState<boolean>(true);

  return (
    <section className="card theory-card" aria-labelledby="theory-heading">
      <div className="card-header">
        <div className="card-header-top">
          <div className="theory-header-title">
            <span className="theory-icon" aria-hidden="true">📘</span>
            <h2 id="theory-heading" className="card-title">
              Game Theory Foundations: The Mathematics of Cooperation
            </h2>
          </div>

          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => setIsExpanded((prev) => !prev)}
            aria-expanded={isExpanded}
            aria-controls="theory-content-body"
          >
            {isExpanded ? "Hide Theory" : "Show Theory"}
          </button>
        </div>

        <p className="card-subtitle">
          Rigorous economic concepts behind group project incentives: Nash stability, dominant strategies, Pareto efficiency, and institutional mechanism design.
        </p>
      </div>

      {isExpanded && (
        <div id="theory-content-body" className="theory-body">
          {/* Theory Navigation Tabs */}
          <div
            className="segmented-control theory-tabs"
            role="tablist"
            aria-label="Game Theory Topics"
          >
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === "nash"}
              aria-controls="panel-nash"
              id="tab-nash"
              className={`segmented-btn ${activeTab === "nash" ? "active" : ""}`}
              onClick={() => setActiveTab("nash")}
            >
              1. Nash Equilibrium
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === "dominance"}
              aria-controls="panel-dominance"
              id="tab-dominance"
              className={`segmented-btn ${activeTab === "dominance" ? "active" : ""}`}
              onClick={() => setActiveTab("dominance")}
            >
              2. Dominant Strategies
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === "pareto"}
              aria-controls="panel-pareto"
              id="tab-pareto"
              className={`segmented-btn ${activeTab === "pareto" ? "active" : ""}`}
              onClick={() => setActiveTab("pareto")}
            >
              3. Pareto Efficiency
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === "mechanism"}
              aria-controls="panel-mechanism"
              id="tab-mechanism"
              className={`segmented-btn ${activeTab === "mechanism" ? "active" : ""}`}
              onClick={() => setActiveTab("mechanism")}
            >
              4. Mechanism Design
            </button>
          </div>

          {/* Tab 1: Nash Equilibrium */}
          {activeTab === "nash" && (
            <div
              id="panel-nash"
              role="tabpanel"
              aria-labelledby="tab-nash"
              className="theory-panel"
            >
              <div className="theory-grid">
                <div className="theory-col">
                  <h3 className="theory-section-title">Formal Mathematical Definition</h3>
                  <div className="math-block">
                    <code>
                      u<sub>i</sub>(s<sub>i</sub><sup>*</sup>, s<sub>-i</sub><sup>*</sup>) &ge; u<sub>i</sub>(s<sub>i</sub>, s<sub>-i</sub><sup>*</sup>) &emsp; &forall; s<sub>i</sub> &isin; S<sub>i</sub>, &forall; i &isin; &#123;A, B&#125;
                    </code>
                  </div>
                  <p className="theory-prose">
                    Formulated by <strong>John Nash (1950)</strong>, a strategy profile <code>(s<sub>A</sub><sup>*</sup>, s<sub>B</sub><sup>*</sup>)</code> is in equilibrium if <em>neither</em> student can achieve a higher individual grade by unilaterally changing their action, holding their peer's strategy constant.
                  </p>
                </div>

                <div className="theory-col theory-box">
                  <h4 className="theory-box-title">Key Intuition: Mutual Best Responses</h4>
                  <ul className="theory-list">
                    <li>
                      <strong>Best Response Function:</strong> Each player selects <code>BR<sub>i</sub>(s<sub>-i</sub>) = argmax u<sub>i</sub>(s<sub>i</sub>, s<sub>-i</sub>)</code>.
                    </li>
                    <li>
                      <strong>Stability Condition:</strong> An outcome is a Nash Equilibrium if and only if both actions are simultaneously mutual best responses to each other: <code>s<sub>A</sub><sup>*</sup> &isin; BR<sub>A</sub>(s<sub>B</sub><sup>*</sup>)</code> and <code>s<sub>B</sub><sup>*</sup> &isin; BR<sub>B</sub>(s<sub>A</sub><sup>*</sup>)</code>.
                    </li>
                    <li>
                      <strong>No Regret:</strong> At a Nash equilibrium, neither student regrets their choice after observing what their teammate did.
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Dominant Strategies & Prisoner's Dilemma */}
          {activeTab === "dominance" && (
            <div
              id="panel-dominance"
              role="tabpanel"
              aria-labelledby="tab-dominance"
              className="theory-panel"
            >
              <div className="theory-grid">
                <div className="theory-col">
                  <h3 className="theory-section-title">Strict Dominance &amp; The Free-Rider Trap</h3>
                  <p className="theory-prose">
                    A strategy <code>s<sub>i</sub></code> <strong>strictly dominates</strong> <code>s<sub>i</sub>&prime;</code> if it yields a strictly higher payoff against <em>every</em> possible move of the other student:
                  </p>
                  <div className="math-block">
                    <code>
                      u<sub>i</sub>(s<sub>i</sub>, s<sub>-i</sub>) &gt; u<sub>i</sub>(s<sub>i</sub>&prime;, s<sub>-i</sub>) &emsp; &forall; s<sub>-i</sub> &isin; S<sub>-i</sub>
                    </code>
                  </div>
                  <p className="theory-prose">
                    In the baseline project without institutional policies, <strong>Slacking off strictly dominates Working</strong> for both students:
                  </p>
                  <div className="theory-comparison-table">
                    <div className="theory-comp-row">
                      <span>If Partner Works:</span>
                      <strong>Slack (8 pts) &gt; Work (6 pts) &rarr; +2 pt incentive to free-ride</strong>
                    </div>
                    <div className="theory-comp-row">
                      <span>If Partner Slacks:</span>
                      <strong>Slack (3 pts) &gt; Work (2 pts) &rarr; +1 pt incentive to avoid being a sucker</strong>
                    </div>
                  </div>
                </div>

                <div className="theory-col theory-box">
                  <h4 className="theory-box-title">Why Rationality Causes Group Failure</h4>
                  <p className="theory-prose">
                    Because slacking is strictly dominant, rational self-interest leads both students straight to <code>(Slack, Slack) = (3, 3)</code>.
                  </p>
                  <p className="theory-prose" style={{ marginTop: "0.5rem" }}>
                    This canonical mismatch—where non-cooperation is individually rational but collectively disastrous—is the famous <strong>Prisoner's Dilemma</strong> (Merrill Flood &amp; Melvin Dresher, 1950; Albert Tucker).
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: Pareto Efficiency */}
          {activeTab === "pareto" && (
            <div
              id="panel-pareto"
              role="tabpanel"
              aria-labelledby="tab-pareto"
              className="theory-panel"
            >
              <div className="theory-grid">
                <div className="theory-col">
                  <h3 className="theory-section-title">Pareto Efficiency vs. Social Optimum</h3>
                  <p className="theory-prose">
                    An outcome is <strong>Pareto optimal</strong> (Vilfredo Pareto, 1906) if no alternative exists that makes at least one student better off without making the other student worse off.
                  </p>
                  <div className="math-block">
                    <code>
                      &nexists; s&prime; : u<sub>i</sub>(s&prime;) &ge; u<sub>i</sub>(s) &forall; i, and &exist; j : u<sub>j</sub>(s&prime;) &gt; u<sub>j</sub>(s)
                    </code>
                  </div>
                  <p className="theory-prose">
                    The baseline Nash equilibrium <code>(Slack, Slack)</code> with payoffs <code>(3, 3)</code> is <strong>Pareto inefficient</strong>. Both students would strictly prefer <code>(Work, Work) = (6, 6)</code>!
                  </p>
                </div>

                <div className="theory-col theory-box">
                  <h4 className="theory-box-title">Mancur Olson's Collective Action Logic (1965)</h4>
                  <ul className="theory-list">
                    <li>
                      <strong>The Problem:</strong> When group project benefits are non-excludable (shared grade), individual effort is a pure private cost producing a public group good.
                    </li>
                    <li>
                      <strong>The Failure:</strong> Voluntary teamwork collapses unless the group is either small with social accountability, or institutional rules alter the payoffs.
                    </li>
                    <li>
                      <strong>Social Welfare:</strong> Total team score is maximized at <code>W = u<sub>A</sub> + u<sub>B</sub> = 12 pts</code>, yet the equilibrium yields only <code>6 pts</code>.
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Tab 4: Mechanism Design */}
          {activeTab === "mechanism" && (
            <div
              id="panel-mechanism"
              role="tabpanel"
              aria-labelledby="tab-mechanism"
              className="theory-panel"
            >
              <div className="theory-grid">
                <div className="theory-col">
                  <h3 className="theory-section-title">Institutional Mechanism Design</h3>
                  <p className="theory-prose">
                    <strong>Mechanism design</strong> (Nobel Memorial Prize 2007: Leonid Hurwicz, Eric Maskin, Roger Myerson) creates game rules where equilibrium player choices align with the desired social optimum.
                  </p>
                  <div className="theory-policy-block">
                    <div className="theory-policy-item">
                      <span className="policy-tag tag-peer">Peer Evaluation Policy</span>
                      <p>
                        Introduces a penalty <code>p = 2</code> for low effort and a transfer <code>t = 1</code> when effort levels diverge. If Student A works and Student B slacks, Student B receives <code>8 - 2 - 1 = 5 pts</code> while Student A earns <code>2 + 1 = 3 pts</code>. Working now beats slacking (<code>6 &gt; 5</code>), transforming mutual high effort into the unique <strong>Nash Equilibrium</strong>!
                      </p>
                    </div>

                    <div className="theory-policy-item">
                      <span className="policy-tag tag-reward">Contribution Reward Policy</span>
                      <p>
                        The instructor subsidizes high effort with a bonus <code>b = 3</code> points. Working together now pays <code>6 + 3 = 9 pts</code> each (18 pts total), making mutual collaboration strictly payoff-dominant and Pareto superior.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="theory-col theory-box">
                  <h4 className="theory-box-title">Transforming the Payoff Structure</h4>
                  <p className="theory-prose">
                    Without changing human nature, simply changing the <em>rules of the classroom</em> converts an intractable Prisoner's Dilemma into a cooperative <strong>Coordination / Harmony Game</strong> where teamwork is the natural self-enforcing Nash Equilibrium.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
};
