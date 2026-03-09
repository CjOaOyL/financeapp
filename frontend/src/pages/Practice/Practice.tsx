import React from 'react';
import { Link } from 'react-router-dom';
import ProblemSolver from '../../components/ProblemSolver/ProblemSolver';

export default function Practice() {
  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      <div className="top-bar">
        <h1>🧩 Practice Problems</h1>
        <div className="version">v0.1.0-mvp</div>
      </div>
      <div className="page-shell">
        <div className="hero">
          <h2>Sharpen Your Skills</h2>
          <p>Choose a topic and solve randomized problems. Each correct answer builds your mastery.</p>
        </div>
        <div className="card" style={{ padding: '1.5rem' }}>
          <ProblemSolver playerId="player-1" />
        </div>
        <div className="page-footer">
          <Link to="/">← Back Home</Link>
        </div>
      </div>
    </div>
  );
}
