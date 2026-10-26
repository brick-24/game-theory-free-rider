import React from 'react';

export const Header: React.FC = () => {
  return (
    <header className="page-header" role="banner">
      <a href="#main" className="skip-link">
        Skip to main content
      </a>
      <div className="header-badge">
        <span>University Economics &bull; Interactive Game Theory Lab</span>
      </div>
      <h1 className="page-title">
        The Free-Rider Problem: Work on Project or Slack Off?
      </h1>
      <p className="page-description">
        When two students collaborate on a group project, will they work together or slack off?
        Grades are shared, but effort is individual. Explore how personal incentives shape teamwork,
        and test policies that turn free-riding into cooperation.
      </p>
    </header>
  );
};
