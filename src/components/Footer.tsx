import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="page-footer" role="contentinfo">
      <div className="footer-content">
        <div>
          <strong>Interactive Game Theory Lab &bull; Free-Rider Problem Simulator</strong>
          <p>
            An intuitive educational demonstration of individual rational incentives vs team cooperation in university group work.
          </p>
        </div>
        <div className="footer-meta">
          <div>Meets WCAG 2.2 AA accessibility standards</div>
          <div>Keyboard navigable &bull; Tabular numbers &bull; High contrast palette</div>
        </div>
      </div>
    </footer>
  );
};
