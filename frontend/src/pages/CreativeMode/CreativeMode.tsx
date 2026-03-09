import React from 'react';
import { Link } from 'react-router-dom';

export default function CreativeMode() {
  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      <div className="top-bar">
        <h1>🎨 Creative Mode</h1>
        <div className="version">v0.1.0-mvp</div>
      </div>

      <div className="page-shell">
        <div className="hero">
          <h2>Compose & Explore</h2>
          <p>Create visual and musical interpretations of calculus. Express your mathematical creativity.</p>
        </div>

        <div className="card" style={{ textAlign: 'center', padding: '2rem' }}>
          <p style={{ color: 'var(--muted)' }}>Coming soon in the next update!</p>
          <p style={{ fontSize: '3rem', marginTop: '1rem' }}>✨</p>
        </div>

        <div className="page-footer">
          <Link to="/">← Back Home</Link>
        </div>
      </div>
    </div>
  );
}
