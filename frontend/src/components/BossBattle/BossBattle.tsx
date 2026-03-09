import React, { useState, useEffect } from 'react';
import Api from '../../services/api';
import katex from 'katex';
import CharacterPortrait from '../CharacterPortrait/CharacterPortrait';
import {
  BOSS_CHARACTERS,
  getRandomQuote,
  HarmoniaCharacter,
} from '../../data/characters';

interface BossBattleData {
  id: string;
  bossName: string;
  description: string;
  phases: any[];
}

interface Props {
  bossId: string;
  playerId: string;
  onDefeat: (xpReward: number) => void;
  onAbandon: () => void;
}

export default function BossBattle({ bossId, playerId, onDefeat, onAbandon }: Props) {
  const [boss, setBoss] = useState<BossBattleData | null>(null);
  const [currentPhase, setCurrentPhase] = useState(0);
  const [bossHealth, setBossHealth] = useState(100);
  const [playerHealth, setPlayerHealth] = useState(100);
  const [message, setMessage] = useState('Engage!');
  const [problemIdx, setProblemIdx] = useState(0);

  useEffect(() => {
    Api.get(`/curriculum/bosses/${bossId}`)
      .then(r => {
        setBoss(r.data.boss ?? null);
        if (r.data.boss?.phases?.[0]?.bossHealthPerPhase) {
          setBossHealth(r.data.boss.phases[0].bossHealthPerPhase);
        }
      })
      .catch(() => setMessage('Could not load boss'));
  }, [bossId]);

  function renderLatex(latex?: string) {
    if (!latex) return null;
    try {
      return <span dangerouslySetInnerHTML={{ __html: katex.renderToString(latex, { throwOnError: false }) }} />;
    } catch {
      return <span>{latex}</span>;
    }
  }

  function onProblemSolved(correct: boolean) {
    if (!boss) return;
    const phase = boss.phases[currentPhase];
    if (!phase) return;

    if (correct) {
      const dmg = phase.playerDamagePerCorrect || 25;
      const newHealth = Math.max(0, bossHealth - dmg);
      setBossHealth(newHealth);
      setProblemIdx(prev => prev + 1);
      setMessage(`✓ Hit! Boss health: ${newHealth}/${phase.bossHealthPerPhase}`);

      if (newHealth <= 0) {
        if (currentPhase < boss.phases.length - 1) {
          const nextIdx = currentPhase + 1;
          setCurrentPhase(nextIdx);
          const nextPhase = boss.phases[nextIdx];
          setBossHealth(nextPhase?.bossHealthPerPhase || 100);
          setProblemIdx(0);
          setMessage(`⚡ Phase ${nextIdx + 1}! Boss transforms!`);
        } else {
          const totalXp = boss.phases.reduce((sum: number, p: any) => sum + (p.totalXpReward || 50), 0);
          setMessage(`🎉 Victory! Earned ${totalXp} XP!`);
          onDefeat(totalXp);
        }
      }
    } else {
      const dmg = phase.bossDamagePerIncorrect || 15;
      const newHealth = Math.max(0, playerHealth - dmg);
      setPlayerHealth(newHealth);
      setProblemIdx(prev => prev + 1);
      const bChar = BOSS_CHARACTERS[bossId];
      const taunt = bChar ? getRandomQuote(bChar, 'taunt') : '';
      setMessage(`✗ ${taunt || 'Missed!'} (Health: ${newHealth}/100)`);
      if (newHealth <= 0) {
        setMessage('💀 Defeated. Return stronger.');
        onAbandon();
      }
    }
  }

  if (!boss) return <div className="card">Loading boss...</div>;

  const phase = boss.phases[currentPhase];
  const problems = phase?.problems || [];
  const problem = problems[problemIdx % Math.max(problems.length, 1)] || null;
  const bossHealthPercent = (bossHealth / (phase?.bossHealthPerPhase || 100)) * 100;
  const bossChar = BOSS_CHARACTERS[bossId] || null;

  return (
    <div className="boss-arena">
      {/* Boss character header */}
      <div style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
        {bossChar ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
            <CharacterPortrait character={bossChar} size="lg" showQuote quoteType="taunt" />
          </div>
        ) : (
          <>
            <h2 style={{ margin: 0, fontSize: '1.5rem', color: '#b91c1c' }}>⚔️ {boss.bossName}</h2>
            <p style={{ margin: '0.5rem 0 0', color: 'var(--text-light)', fontSize: '0.9rem' }}>{boss.description}</p>
          </>
        )}
      </div>

      {/* HEALTH BARS */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: '500' }}>
            <span>Boss</span>
            <span>{Math.round(bossHealth)}/{phase?.bossHealthPerPhase || 100}</span>
          </div>
          <div className="health-bar-track">
            <div className="health-bar-fill" style={{ width: `${bossHealthPercent}%`, background: '#ef4444' }} />
          </div>
        </div>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: '500' }}>
            <span>You</span>
            <span>{Math.round(playerHealth)}/100</span>
          </div>
          <div className="health-bar-track">
            <div className="health-bar-fill" style={{ width: `${playerHealth}%`, background: '#22c55e' }} />
          </div>
        </div>
      </div>

      {/* MESSAGE */}
      <div style={{
        padding: '0.75rem 1rem',
        borderRadius: 'var(--radius)',
        background: message.startsWith('✓') ? '#dcfce7' : message.startsWith('✗') ? '#fee2e2' : 'var(--accent-soft)',
        color: message.startsWith('✓') ? '#166534' : message.startsWith('✗') ? '#991b1b' : 'var(--accent)',
        fontWeight: '500',
        marginBottom: '1.5rem',
        textAlign: 'center',
      }}>
        {message}
      </div>

      {/* PROBLEM */}
      {problem ? (
        <div className="problem-card" style={{ marginBottom: '1.5rem' }}>
          <div style={{ marginBottom: '1rem' }}>
            <strong style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--muted)' }}>Problem</strong>
            <div style={{ fontSize: '1.1rem' }}>{renderLatex(problem.statementLatex || problem.problemLatex) || problem.statement}</div>
          </div>
          <div>
            {problem.options ? (
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {problem.options.map((opt: any) => (
                  <button
                    key={opt.id}
                    onClick={() => onProblemSolved(opt.isCorrect)}
                    className="btn"
                    style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
                  >
                    {opt.text}
                  </button>
                ))}
              </div>
            ) : (
              <input
                type="text"
                placeholder="Your answer"
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    const correct = (e.target as HTMLInputElement).value === problem.correctAnswer;
                    onProblemSolved(correct);
                  }
                }}
                style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius)', border: '1.5px solid var(--accent)' }}
              />
            )}
          </div>
        </div>
      ) : null}

      <button onClick={onAbandon} className="btn-ghost" style={{ width: '100%' }}>
        Flee Battle
      </button>
    </div>
  );
}
