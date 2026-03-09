import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Api from '../../services/api';
import { usePlayer } from '../../services/usePlayer';
import LessonList from '../../components/LessonList/LessonList';
import CharacterPortrait from '../../components/CharacterPortrait/CharacterPortrait';
import { CLEF, REGION_GUIDES, REGION_BOSSES, HarmoniaCharacter } from '../../data/characters';

const REGION_COLORS: Record<string, { bg: string; emoji: string }> = {
  'region-1': { bg: '--region-limits', emoji: '🌊' },
  'region-2': { bg: '--region-derivatives', emoji: '🎼' },
  'region-3': { bg: '--region-integrals', emoji: '🎨' },
  'region-4': { bg: '--region-series', emoji: '♾️' },
};

const REGION_IDS = [
  'valley-of-limits',
  'derivative-conservatory',
  'integral-atelier',
  'infinite-series-amphitheater',
];

export default function Home() {
  const { player } = usePlayer('player-1');
  const [regions, setRegions] = useState<any[]>([]);

  useEffect(() => {
    Api.get('/curriculum/regions').then(r => setRegions(r.data.regions || [])).catch(() => {});
  }, []);

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      {/* TOP BAR WITH VERSION */}
      <div className="top-bar">
        <div>
          <h1>🎵 Harmonia</h1>
          <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--muted)' }}>The Calculus of Creation</p>
        </div>
        <div className="version">v0.1.0-mvp</div>
      </div>

      <div className="page-shell">
        {/* HERO SECTION WITH CLEF */}
        <div className="hero" style={{ position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', justifyContent: 'center', marginBottom: '0.75rem' }}>
            <CharacterPortrait character={CLEF} size="md" showQuote quoteType="idle" />
          </div>
          <h2>Begin Your Journey</h2>
          <p>Master calculus through story, puzzles, and creative exploration. Each region holds new concepts to discover.</p>
          {player && <p style={{ marginTop: '.5rem' }}>Welcome back, Level <strong>{player.level}</strong>!</p>}
        </div>

        {/* NAVIGATION PILLS */}
        <div className="nav-pills">
          <Link to="/story" className="nav-pill">📖 Story Mode</Link>
          <Link to="/arcade" className="nav-pill">🎮 Arcade Mode</Link>
          <Link to="/creative" className="nav-pill">🎨 Creative Mode</Link>
          <Link to="/practice" className="nav-pill">🧩 Practice</Link>
        </div>

        {/* MAIN GRID: REGIONS + SIDEBAR */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '1.5rem', alignItems: 'start' }}>
          {/* REGIONS LEFT */}
          <section>
            <h3 style={{ fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--muted)', margin: '0 0 0.75rem' }}>
              Regions
            </h3>
            <div className="region-grid">
              {regions.map((r, idx) => {
                const colorKey = `region-${idx + 1}`;
                const color = REGION_COLORS[colorKey] || REGION_COLORS['region-1'];
                const rgbFromCss = getComputedStyle(document.documentElement).getPropertyValue(`${color.bg}`).trim();
                return (
                  <div key={r.id} className="card region-card">
                    <div
                      className="region-banner"
                      style={{
                        background: `linear-gradient(135deg, var(${color.bg}), var(${color.bg})dd)`,
                      }}
                    >
                      <span style={{ fontSize: '2rem' }}>{color.emoji}</span>
                    </div>
                    <div className="region-body">
                      <h4 style={{ margin: 0 }}>{r.name}</h4>
                      <div className="subtitle" style={{ marginTop: '0.25rem' }}>{r.subtitle}</div>
                      <p style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: 'var(--text-light)' }}>
                        {r.description}
                      </p>
                      {/* Guide & Boss characters */}
                      {(() => {
                        const regionId = REGION_IDS[idx];
                        const guide = regionId ? REGION_GUIDES[regionId] : null;
                        const boss = regionId ? REGION_BOSSES[regionId] : null;
                        return (guide || boss) ? (
                          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.75rem', justifyContent: 'center' }}>
                            {guide && <CharacterPortrait character={guide} size="sm" />}
                            {boss && <CharacterPortrait character={boss} size="sm" />}
                          </div>
                        ) : null;
                      })()}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* SIDEBAR RIGHT */}
          <aside>
            <LessonList />
          </aside>
        </div>
      </div>
    </div>
  );
}
