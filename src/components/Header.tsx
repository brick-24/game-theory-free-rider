import React from 'react';

export const Header: React.FC = () => {
  return (
    <header className="page-header" role="banner">
      <a href="#main" className="skip-link">
        Skip to main content
      </a>
      <div className="header-badge">
        <span>University Economics &bull; Game Theory Lab: Team Formation</span>
      </div>
      <h1 className="page-title">
        Project Team Formation: Choosing People for Your Team
      </h1>
      <p className="page-description">
        When forming university project teams, who do you choose to recruit? Do you pick a hard-working teammate who commits to quality, or a lazy teammate who risks free-riding? Explore how personal incentives, screening costs, and team policies shape who gets chosen on project teams.
      </p>
    </header>
  );
};
