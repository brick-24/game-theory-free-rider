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
              Game Theory Foundations: The Economics of Team Formation
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
          Rigorous economic concepts behind choosing teammates: Nash equilibrium in partner selection, dominant strategy dilemmas, Pareto-optimal team matching, and institutional mechanism design.
        </p>
      </div>

      {isExpanded && (
        <div id="theory-content-body" className="theory-body">
          {/* Theory Navigation Tabs */}
          <div
            className="segmented-control theory-tabs"
            role="tablist"
            aria-label="Team Formation Game Theory Topics"
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
                  <h3 className="theory-section-title">Formal Definition in Team Formation</h3>
                  <div className="math-block">
                    <code>
                      u<sub>i</sub>(s<sub>i</sub><sup>*</sup>, s<sub>-i</sub><sup>*</sup>) &ge; u<sub>i</sub>(s<sub>i</sub>, s<sub>-i</sub><sup>*</sup>) &emsp; &forall; s<sub>i</sub> &isin; S<sub>i</sub>, &forall; i &isin; &#123;A, B&#125;
                    </code>
                  </div>
                  <p className="theory-prose">
                    Formulated by <strong>John Nash (1950)</strong>, a team formation strategy profile <code>(s<sub>A</sub><sup>*</sup>, s<sub>B</sub><sup>*</sup>)</code> is in equilibrium if <em>neither</em> student can achieve a higher individual grade by unilaterally switching who they recruit for their team, holding their peer's teammate choice constant.
                  </p>
                </div>

                <div className="theory-col theory-box">
                  <h4 className="theory-box-title">Key Intuition: Mutual Best Responses</h4>
                  <ul className="theory-list">
                    <li>
                      <strong>Teammate Best Response:</strong> Each student chooses <code>BR<sub>i</sub>(s<sub>-i</sub>) = argmax u<sub>i</sub>(s<sub>i</sub>, s<sub>-i</sub>)</code> to optimize their own payoff.
                    </li>
                    <li>
                      <strong>Equilibrium Stability:</strong> A teammate selection is a Nash Equilibrium if and only if both choices are simultaneous best responses: <code>s<sub>A</sub><sup>*</sup> &isin; BR<sub>A</sub>(s<sub>B</sub><sup>*</sup>)</code> and <code>s<sub>B</sub><sup>*</sup> &isin; BR<sub>B</sub>(s<sub>A</sub><sup>*</sup>)</code>.
                    </li>
                    <li>
                      <strong>No Regret:</strong> At equilibrium, neither student regrets who they recruited onto their project team after seeing who their partner chose.
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Dominant Strategies & Lazy Teammate Dilemma */}
          {activeTab === "dominance" && (
            <div
              id="panel-dominance"
              role="tabpanel"
              aria-labelledby="tab-dominance"
              className="theory-panel"
            >
              <div className="theory-grid">
                <div className="theory-col">
                  <h3 className="theory-section-title">Strict Dominance &amp; The Lazy Teammate Trap</h3>
                  <p className="theory-prose">
                    A recruitment strategy <code>s<sub>i</sub></code> <strong>strictly dominates</strong> <code>s<sub>i</sub>&prime;</code> if it yields a strictly higher payoff against <em>any</em> teammate the other student recruits:
                  </p>
                  <div className="math-block">
                    <code>
                      u<sub>i</sub>(s<sub>i</sub>, s<sub>-i</sub>) &gt; u<sub>i</sub>(s<sub>i</sub>&prime;, s<sub>-i</sub>) &emsp; &forall; s<sub>-i</sub> &isin; S<sub>-i</sub>
                    </code>
                  </div>
                  <p className="theory-prose">
                    In unregulated team formation without accountability rules, <strong>Choosing a Lazy Teammate strictly dominates Choosing a Hard-Working Teammate</strong>:
                  </p>
                  <div className="theory-comparison-table">
                    <div className="theory-comp-row">
                      <span>If Partner Chooses Hard-Working:</span>
                      <strong>Choose Lazy (8 pts) &gt; Choose Hard-Working (6 pts) &rarr; +2 pt incentive to free-ride</strong>
                    </div>
                    <div className="theory-comp-row">
                      <span>If Partner Chooses Lazy:</span>
                      <strong>Choose Lazy (3 pts) &gt; Choose Hard-Working (2 pts) &rarr; +1 pt incentive to avoid being exploited</strong>
                    </div>
                  </div>
                </div>

                <div className="theory-col theory-box">
                  <h4 className="theory-box-title">Why Individual Rationality Traps Teams</h4>
                  <p className="theory-prose">
                    Because choosing a lazy teammate is strictly dominant, rational self-interest leads both students to <code>(Lazy, Lazy) = (3, 3)</code>.
                  </p>
                  <p className="theory-prose" style={{ marginTop: "0.5rem" }}>
                    This canonical mismatch—where choosing casual, low-effort teammates is individually rational but collectively disastrous—is the textbook <strong>Prisoner's Dilemma in Team Formation</strong> (Flood &amp; Dresher, 1950; Tucker).
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
                    A team matching is <strong>Pareto optimal</strong> (Vilfredo Pareto, 1906) if no alternative team formation exists that makes at least one student better off without making another worse off.
                  </p>
                  <div className="math-block">
                    <code>
                      &nexists; s&prime; : u<sub>i</sub>(s&prime;) &ge; u<sub>i</sub>(s) &forall; i, and &exist; j : u<sub>j</sub>(s&prime;) &gt; u<sub>j</sub>(s)
                    </code>
                  </div>
                  <p className="theory-prose">
                    The unregulated equilibrium <code>(Choose Lazy, Choose Lazy)</code> with scores <code>(3, 3)</code> is <strong>Pareto inefficient</strong>. Both students would strictly prefer <code>(Hard-Working, Hard-Working) = (6, 6)</code>!
                  </p>
                </div>

                <div className="theory-col theory-box">
                  <h4 className="theory-box-title">Mancur Olson's Collective Action Logic (1965)</h4>
                  <ul className="theory-list">
                    <li>
                      <strong>The Team Formation Problem:</strong> Because project grades are shared across the team, the benefits of recruiting a hard-working teammate are shared, while the effort of vetting is private.
                    </li>
                    <li>
                      <strong>Matching Failure:</strong> Voluntary team recruitment collapses into mutual slacking unless the classroom institutes formal vetting mechanisms.
                    </li>
                    <li>
                      <strong>Social Optimum:</strong> Total team performance is maximized when both choose hard-working peers (<code>W = 12 pts</code>), yet unguided team choice yields only <code>6 pts</code>.
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
                  <h3 className="theory-section-title">Mechanism Design for Team Formation</h3>
                  <p className="theory-prose">
                    <strong>Mechanism design</strong> (Nobel Memorial Prize 2007: Hurwicz, Maskin, Myerson) creates institutional rules where students' equilibrium choices naturally yield high-performing teams.
                  </p>
                  <div className="theory-policy-block">
                    <div className="theory-policy-item">
                      <span className="policy-tag tag-peer">Peer Evaluation Policy</span>
                      <p>
                        Introduces a penalty <code>p = 2</code> for fielding lazy teammates and a transfer <code>t = 1</code> when teammate contributions differ. If Student A recruits hard-working and Student B recruits lazy, Student B receives <code>8 - 2 - 1 = 5 pts</code> while Student A earns <code>2 + 1 = 3 pts</code>. Choosing hard-working now beats choosing lazy (<code>6 &gt; 5</code>), making mutual high-effort team formation the unique <strong>Nash Equilibrium</strong>!
                      </p>
                    </div>

                    <div className="theory-policy-item">
                      <span className="policy-tag tag-reward">Team Contribution Reward</span>
                      <p>
                        The instructor subsidizes hard-working teams with bonus points <code>b = 3</code>. Choosing hard-working teammates now yields <code>6 + 3 = 9 pts</code> each (18 pts total), making diligent teammate recruitment strictly payoff-dominant.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="theory-col theory-box">
                  <h4 className="theory-box-title">Transforming the Payoff Structure</h4>
                  <p className="theory-prose">
                    Without changing human nature, altering the <em>institutional incentives of team formation</em> turns an uncooperative dilemma into a harmonious <strong>Coordination Game</strong> where selecting hard-working teammates is self-enforcing.
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
