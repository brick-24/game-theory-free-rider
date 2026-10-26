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
        Strategic Behaviour in Project Team Formation
      </h1>
      <p className="page-description">
        A group project is a two-stage game. First, students sort themselves into teams, and every student
        wants strong teammates. Then, inside each team, grades are shared but effort is individual, so
        students are tempted to free-ride. Explore both stages and test the rules that fix them.
      </p>
    </header>
  );
};
