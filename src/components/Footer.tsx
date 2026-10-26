import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="page-footer" role="contentinfo">
      <div className="footer-content">
        <div>
          <strong>Interactive Game Theory Lab &bull; Project Team Formation Simulator</strong>
          <p>
            An intuitive educational demonstration of strategic teammate selection, free-riding risks, and institutional policy design in university group projects.
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
