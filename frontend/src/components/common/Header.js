// src/components/common/Header.js
import React from 'react';

const Header = ({ title, subtitle }) => {
  return (
    <header className="mb-4">
      <div className="container py-3">
        <h1 className="display-5 fw-bold text-primary">{title || 'PrecisionFlow'}</h1>
        {subtitle && <p className="lead text-muted">{subtitle}</p>}
      </div>
    </header>
  );
};

export default Header;