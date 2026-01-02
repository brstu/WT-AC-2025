import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';

export default function Layout() {
  const location = useLocation();
  return (
    <div>
      <header>
        <nav>
          <Link to="/">Каталог стартапов</Link>
          <Link to="/startups/new">Добавить</Link>
          <span style={{ marginLeft: 'auto', fontSize: 12 }}>
            {location.pathname}
          </span>
        </nav>
      </header>
      <main className="main">
        <Outlet />
      </main>
    </div>
  );
}
