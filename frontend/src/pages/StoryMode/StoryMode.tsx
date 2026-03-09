import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Api from '../../services/api';
import { usePlayer } from '../../services/usePlayer';
import BossBattle from '../../components/BossBattle/BossBattle';
import CharacterPortrait from '../../components/CharacterPortrait/CharacterPortrait';
import { SpeechBubble } from '../../components/CharacterPortrait/CharacterPortrait';
import {
  REGION_GUIDES,
  REGION_BOSSES,
  getRandomQuote,
  HarmoniaCharacter,
} from '../../data/characters';

const REGION_VISUALS: Record<number, { color: string; emoji: string; description: string }> = {
  1: { color: 'var(--region-limits)', emoji: '🌊', description: 'Paths converge. Values approach. Learn to find limits.' },
  2: { color: 'var(--region-derivatives)', emoji: '🎼', description: 'Change becomes music. Hear the rhythm of rates.' },
  3: { color: 'var(--region-integrals)', emoji: '🎨', description: 'Fragments reassemble. Build wholes from parts.' },
  4: { color: 'var(--region-series)', emoji: '♾️', description: 'Infinity finds its voice. Discover convergence.' },
};

const REGION_IDS = [
  'valley-of-limits',
  'derivative-conservatory',
  'integral-atelier',
  'infinite-series-amphitheater',
];

export default function StoryMode() {
  const { player, unlockedRegions, defeatBoss } = usePlayer('player-1');
  const [regions, setRegions] = useState<any[]>([]);
  const [activeBoss, setActiveBoss] = useState<string | null>(null);
  const [lessons, setLessons] = useState<any[]>([]);

  useEffect(() => {
    Api.get('/curriculum/regions').then(r => setRegions(r.data.regions ?? [])).catch(() => {});
  }, []);

  const isUnlocked = (regionId: string) => unlockedRegions?.includes(regionId);

  const fetchLessons = (regionId: string) => {
    Api.get(`/curriculum/regions/${regionId}/lessons`)
      .then((r) => setLessons(r.data.lessons || []))
      .catch(() => setLessons([]));
  };

  const handleDefeat = async (_xpReward: number) => {
    if (!activeBoss) return;
    await defeatBoss(activeBoss);
    setActiveBoss(null);
  };

  if (activeBoss) {
    return (
      <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
        <div className="top-bar">
          <h1>⚔️ Boss Battle</h1>
          <div className="version">v0.1.0-mvp</div>
        </div>
        <div className="page-shell">
          <BossBattle bossId={activeBoss} playerId="player-1" onDefeat={handleDefeat} onAbandon={() => setActiveBoss(null)} />
          <div className="page-footer">
            <Link to="/story">← Back to Regions</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      <div className="top-bar">
        <h1>📖 Story Mode</h1>
        <div className="version">v0.1.0-mvp</div>
      </div>

      <div className="page-shell">
        {/* HERO */}
        <div className="hero">
          <h2>The World of Harmonia Awaits</h2>
          <p>Journey through four mystical regions, each guarded by a powerful boss. Master new concepts and unlock your potential.</p>
          {player && <p style={{ color: 'var(--muted)' }}>Level {player.level} • {player.totalXp} XP</p>}
        </div>

        {/* REGIONS LIST */}
        <div className="story-section">
          <h3>Regions</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {regions.map((r, idx) => {
              const locked = !isUnlocked(r.id);
              const visual = REGION_VISUALS[(idx % 4) + 1];
              const regionId = REGION_IDS[idx];
              const guide = regionId ? REGION_GUIDES[regionId] : null;
              const boss = regionId ? REGION_BOSSES[regionId] : null;
              return (
                <div key={r.id} className="story-region card">
                  <div
                    className="story-region-art"
                    style={{ background: `linear-gradient(135deg, ${visual.color}, ${visual.color}cc)`, position: 'relative' }}
                  >
                    {guide ? (
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem' }}>
                        <span style={{ fontSize: '2.5rem' }}>{guide.emoji}</span>
                        <span style={{ fontSize: '0.6rem', color: '#fff', fontWeight: 600, textShadow: '0 1px 3px rgba(0,0,0,0.4)' }}>{guide.name}</span>
                      </div>
                    ) : (
                      visual.emoji
                    )}
                    {boss && (
                      <span style={{ position: 'absolute', bottom: 4, right: 4, fontSize: '1.2rem', opacity: 0.7 }} title={`Boss: ${boss.name}`}>
                        {boss.emoji}
                      </span>
                    )}
                  </div>
                  <div className="story-region-content" style={{ opacity: locked ? 0.55 : 1 }}>
                    <h4>{r.name}</h4>
                    <div className="subtitle">{r.subtitle}</div>
                    <p className="desc">{visual.description}</p>
                    {/* Guide quote */}
                    {guide && !locked && (
                      <div style={{
                        fontSize: '0.8rem',
                        fontStyle: 'italic',
                        color: guide.color,
                        background: `${guide.color}10`,
                        borderRadius: 'var(--radius)',
                        padding: '0.4rem 0.6rem',
                        margin: '0.5rem 0',
                        borderLeft: `3px solid ${guide.color}`,
                      }}>
                        {guide.emoji} "{getRandomQuote(guide, 'idle')}"
                      </div>
                    )}
                    {locked ? (
                      <div className="locked-overlay">
                        <span>🔒 {r.unlockRequirement}</span>
                      </div>
                    ) : (
                      <div className="story-region-content" style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
                        {r.lessons && r.lessons.length > 0 ? (
                          <Link
                            to={`/lesson/${r.lessons[0].id}`}
                            className="btn btn-ghost"
                            style={{ fontSize: '0.85rem' }}
                          >
                            Start Lessons
                          </Link>
                        ) : (
                          <span style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>
                            No lessons available yet
                          </span>
                        )}
                        <button
                          className="btn"
                          onClick={() => setActiveBoss(r.bossId)}
                          style={{ fontSize: '0.85rem' }}
                        >
                          {boss ? `${boss.emoji} Fight ${boss.name}` : 'Challenge Boss'}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* PROGRESS INDICATOR */}
        {player && (
          <div style={{ marginTop: '2rem', padding: '1rem', background: 'var(--accent-soft)', borderRadius: 'var(--radius)', textAlign: 'center' }}>
            <p style={{ margin: 0, color: 'var(--accent)', fontWeight: '500' }}>
              {unlockedRegions?.length || 0} region{(unlockedRegions?.length || 0) !== 1 ? 's' : ''} unlocked · {player.totalXp} total XP
            </p>
          </div>
        )}

        <div className="page-footer">
          <Link to="/">← Back Home</Link>
        </div>
      </div>
    </div>
  );
}
