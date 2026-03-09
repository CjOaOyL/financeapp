import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import Api from '../../services/api';
import katex from 'katex';
import CharacterPortrait from '../../components/CharacterPortrait/CharacterPortrait';
import { TEMPO, CLEF, getRandomQuote } from '../../data/characters';

type GameMode = 'menu' | 'speed' | 'streak' | 'results';

interface Problem {
  id: string;
  statementLatex?: string;
  statement?: string;
  correctAnswer: string;
  tolerance?: number;
  hints?: string[];
  difficulty?: string;
  xpReward?: number;
  topicId?: string;
}

interface GameStats {
  score: number;
  correct: number;
  incorrect: number;
  combo: number;
  maxCombo: number;
  totalTime: number;
  problemsSeen: number;
}

function renderLatex(latex?: string) {
  if (!latex) return null;
  try {
    return (
      <span
        dangerouslySetInnerHTML={{
          __html: katex.renderToString(latex, { throwOnError: false, strict: 'ignore' }),
        }}
      />
    );
  } catch {
    return <span>{latex}</span>;
  }
}

function normalizeAnswer(answer: string): string {
  return answer
    .replace(/\s+/g, '')
    .toLowerCase()
    .replace(/\+c$/i, '')
    .replace(/\(\)/g, '')
    .trim();
}

function checkAnswer(problem: Problem, answer: string): boolean {
  const expected = normalizeAnswer(problem.correctAnswer);
  const given = normalizeAnswer(answer);
  if (expected === given) return true;
  const expNum = parseFloat(expected);
  const givenNum = parseFloat(given);
  if (!isNaN(expNum) && !isNaN(givenNum)) {
    return Math.abs(expNum - givenNum) <= (problem.tolerance || 0.01);
  }
  return false;
}

const SPEED_DURATION = 60;
const TOPICS = [
  'intro-to-limits',
  'basic-differentiation-rules',
  'antiderivatives',
  'definite-integrals-area',
  'sequences',
];

export default function ArcadeMode() {
  const [mode, setMode] = useState<GameMode>('menu');
  const [problems, setProblems] = useState<Problem[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answer, setAnswer] = useState('');
  const [stats, setStats] = useState<GameStats>({
    score: 0,
    correct: 0,
    incorrect: 0,
    combo: 0,
    maxCombo: 0,
    totalTime: 0,
    problemsSeen: 0,
  });
  const [timeLeft, setTimeLeft] = useState(SPEED_DURATION);
  const [flash, setFlash] = useState<'correct' | 'wrong' | null>(null);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);

  /* ---------- fetch a shuffled batch of problems ---------- */
  const fetchProblems = useCallback(async () => {
    setLoading(true);
    try {
      const results: Problem[] = [];
      for (const topic of TOPICS) {
        try {
          const r = await Api.get(`/problems/batch?topic=${topic}&count=5`);
          if (r.data.problems) results.push(...r.data.problems);
        } catch {
          /* skip unavailable topics */
        }
      }
      for (let i = results.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [results[i], results[j]] = [results[j], results[i]];
      }
      setProblems(results);
    } catch {
      setProblems([]);
    }
    setLoading(false);
  }, []);

  /* ---------- start a game ---------- */
  const startGame = async (gameMode: 'speed' | 'streak') => {
    await fetchProblems();
    setCurrentIdx(0);
    setAnswer('');
    setStats({
      score: 0,
      correct: 0,
      incorrect: 0,
      combo: 0,
      maxCombo: 0,
      totalTime: 0,
      problemsSeen: 0,
    });
    setTimeLeft(SPEED_DURATION);
    setFlash(null);
    startTimeRef.current = Date.now();
    setMode(gameMode);

    if (gameMode === 'speed') {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            timerRef.current = null;
            setMode('results');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
  };

  /* cleanup timer */
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  /* auto-focus input */
  useEffect(() => {
    if (mode === 'speed' || mode === 'streak') {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [currentIdx, mode]);

  /* ---------- submit answer ---------- */
  const submitAnswer = () => {
    if (!answer.trim()) return;
    const problem = problems[currentIdx];
    if (!problem) return;

    const correct = checkAnswer(problem, answer);

    setStats((prev) => {
      const newCombo = correct ? prev.combo + 1 : 0;
      const multiplier = Math.min(1 + Math.floor(newCombo / 3), 5);
      const points = correct ? (10 + (problem.xpReward || 5)) * multiplier : 0;
      return {
        score: prev.score + points,
        correct: prev.correct + (correct ? 1 : 0),
        incorrect: prev.incorrect + (correct ? 0 : 1),
        combo: newCombo,
        maxCombo: Math.max(prev.maxCombo, newCombo),
        totalTime: (Date.now() - startTimeRef.current) / 1000,
        problemsSeen: prev.problemsSeen + 1,
      };
    });

    setFlash(correct ? 'correct' : 'wrong');
    setTimeout(() => setFlash(null), 400);

    /* streak mode: wrong answer ends the game */
    if (mode === 'streak' && !correct) {
      setTimeout(() => {
        setStats((prev) => ({
          ...prev,
          totalTime: (Date.now() - startTimeRef.current) / 1000,
        }));
        setMode('results');
      }, 600);
      return;
    }

    setAnswer('');
    if (currentIdx + 1 < problems.length) {
      setCurrentIdx((prev) => prev + 1);
    } else {
      setStats((prev) => ({
        ...prev,
        totalTime: (Date.now() - startTimeRef.current) / 1000,
      }));
      if (timerRef.current) clearInterval(timerRef.current);
      setMode('results');
    }
  };

  const problem = problems[currentIdx] || null;
  const comboMultiplier = Math.min(1 + Math.floor(stats.combo / 3), 5);

  /* ==================== MENU ==================== */
  if (mode === 'menu') {
    return (
      <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
        <div className="top-bar">
          <h1>🎮 Arcade Mode</h1>
          <div className="version">v0.1.0-mvp</div>
        </div>
        <div className="page-shell">
          <div className="hero">
            <CharacterPortrait character={TEMPO} size="md" showQuote quoteType="idle" style={{ marginBottom: '0.75rem' }} />
            <h2>Quick Challenges</h2>
            <p>
              Test your calculus skills under pressure. Earn combos, rack up
              points, and push your limits.
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '1rem',
              marginBottom: '2rem',
            }}
          >
            {/* SPEED ROUND */}
            <div
              className="card"
              style={{ padding: '1.5rem', textAlign: 'center' }}
            >
              <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>
                ⚡
              </div>
              <h3 style={{ margin: '0 0 0.5rem', fontSize: '1.15rem' }}>
                Speed Round
              </h3>
              <p
                style={{
                  color: 'var(--text-light)',
                  fontSize: '0.85rem',
                  marginBottom: '1rem',
                }}
              >
                60 seconds. As many problems as you can. Combos multiply your
                score!
              </p>
              <button
                onClick={() => startGame('speed')}
                className="btn"
                style={{ width: '100%' }}
              >
                {loading ? 'Loading...' : 'Start'}
              </button>
            </div>

            {/* STREAK MODE */}
            <div
              className="card"
              style={{ padding: '1.5rem', textAlign: 'center' }}
            >
              <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>
                🔥
              </div>
              <h3 style={{ margin: '0 0 0.5rem', fontSize: '1.15rem' }}>
                Streak
              </h3>
              <p
                style={{
                  color: 'var(--text-light)',
                  fontSize: '0.85rem',
                  marginBottom: '1rem',
                }}
              >
                No timer. No mercy. One wrong answer ends your run. How far can
                you go?
              </p>
              <button
                onClick={() => startGame('streak')}
                className="btn"
                style={{ width: '100%' }}
              >
                {loading ? 'Loading...' : 'Start'}
              </button>
            </div>
          </div>

          {/* HOW TO PLAY */}
          <div className="card" style={{ padding: '1.25rem' }}>
            <h4 style={{ margin: '0 0 0.75rem', fontWeight: 600 }}>
              How It Works
            </h4>
            <ul
              style={{
                margin: 0,
                paddingLeft: '1.25rem',
                color: 'var(--text-light)',
                fontSize: '0.9rem',
                lineHeight: 1.7,
              }}
            >
              <li>
                <strong>Combo System:</strong> Every 3 correct answers in a row
                increases your multiplier (up to 5x)
              </li>
              <li>
                <strong>Speed Round:</strong> Race the clock for 60 seconds —
                wrong answers reset your combo but don't end the game
              </li>
              <li>
                <strong>Streak Mode:</strong> Untimed but unforgiving — one
                mistake and it's game over
              </li>
              <li>
                <strong>Mixed Topics:</strong> Problems from limits, derivatives,
                integrals, and series
              </li>
            </ul>
          </div>

          <div className="page-footer">
            <Link to="/">← Back Home</Link>
          </div>
        </div>
      </div>
    );
  }

  /* ==================== RESULTS ==================== */
  if (mode === 'results') {
    const accuracy =
      stats.problemsSeen > 0
        ? Math.round((stats.correct / stats.problemsSeen) * 100)
        : 0;
    const avgTime =
      stats.problemsSeen > 0
        ? (stats.totalTime / stats.problemsSeen).toFixed(1)
        : '0';

    return (
      <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
        <div className="top-bar">
          <h1>🎮 Results</h1>
          <div className="version">v0.1.0-mvp</div>
        </div>
        <div className="page-shell">
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <CharacterPortrait
              character={TEMPO}
              size="lg"
              showQuote
              quoteType={stats.score >= 100 ? 'encourage' : 'taunt'}
              style={{ marginBottom: '0.75rem' }}
            />
            <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>
              {stats.score >= 200
                ? '🏆'
                : stats.score >= 100
                  ? '🥈'
                  : '🥉'}
            </div>
            <h2
              style={{
                margin: 0,
                fontSize: '2rem',
                color: 'var(--accent)',
              }}
            >
              {stats.score} pts
            </h2>
            <p style={{ color: 'var(--text-light)', marginTop: '0.5rem' }}>
              {stats.score >= 200
                ? 'Outstanding!'
                : stats.score >= 100
                  ? 'Great job!'
                  : 'Keep practicing!'}
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '1rem',
              marginBottom: '2rem',
            }}
          >
            <div
              className="card"
              style={{ padding: '1rem', textAlign: 'center' }}
            >
              <div
                style={{
                  fontSize: '1.5rem',
                  fontWeight: 700,
                  color: '#22c55e',
                }}
              >
                {stats.correct}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>
                Correct
              </div>
            </div>
            <div
              className="card"
              style={{ padding: '1rem', textAlign: 'center' }}
            >
              <div
                style={{
                  fontSize: '1.5rem',
                  fontWeight: 700,
                  color: '#ef4444',
                }}
              >
                {stats.incorrect}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>
                Incorrect
              </div>
            </div>
            <div
              className="card"
              style={{ padding: '1rem', textAlign: 'center' }}
            >
              <div
                style={{
                  fontSize: '1.5rem',
                  fontWeight: 700,
                  color: 'var(--accent)',
                }}
              >
                {stats.maxCombo}x
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>
                Max Combo
              </div>
            </div>
            <div
              className="card"
              style={{ padding: '1rem', textAlign: 'center' }}
            >
              <div
                style={{
                  fontSize: '1.5rem',
                  fontWeight: 700,
                  color: 'var(--accent)',
                }}
              >
                {accuracy}%
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>
                Accuracy
              </div>
            </div>
            <div
              className="card"
              style={{ padding: '1rem', textAlign: 'center' }}
            >
              <div
                style={{
                  fontSize: '1.5rem',
                  fontWeight: 700,
                  color: 'var(--text)',
                }}
              >
                {stats.problemsSeen}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>
                Problems Attempted
              </div>
            </div>
            <div
              className="card"
              style={{ padding: '1rem', textAlign: 'center' }}
            >
              <div
                style={{
                  fontSize: '1.5rem',
                  fontWeight: 700,
                  color: 'var(--text)',
                }}
              >
                {avgTime}s
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>
                Avg per Problem
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              onClick={() => setMode('menu')}
              className="btn"
              style={{ flex: 1 }}
            >
              Play Again
            </button>
            <Link
              to="/"
              className="btn btn-ghost"
              style={{ flex: 1, textAlign: 'center' }}
            >
              Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  /* ==================== GAMEPLAY ==================== */
  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      <div className="top-bar">
        <h1>🎮 {mode === 'speed' ? 'Speed Round' : 'Streak'}</h1>
        <div className="version">v0.1.0-mvp</div>
      </div>

      <div className="page-shell">
        {/* HUD */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns:
              mode === 'speed' ? 'repeat(4, 1fr)' : 'repeat(3, 1fr)',
            gap: '0.75rem',
            marginBottom: '1.5rem',
          }}
        >
          {/* Timer (speed mode only) */}
          {mode === 'speed' && (
            <div
              className="card"
              style={{ padding: '0.75rem', textAlign: 'center' }}
            >
              <div
                style={{
                  fontSize: '1.5rem',
                  fontWeight: 700,
                  color:
                    timeLeft <= 10
                      ? '#ef4444'
                      : timeLeft <= 20
                        ? '#f59e0b'
                        : 'var(--text)',
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                {timeLeft}s
              </div>
              <div
                style={{
                  fontSize: '0.7rem',
                  color: 'var(--muted)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                Time
              </div>
            </div>
          )}

          {/* Score */}
          <div
            className="card"
            style={{ padding: '0.75rem', textAlign: 'center' }}
          >
            <div
              style={{
                fontSize: '1.5rem',
                fontWeight: 700,
                color: 'var(--accent)',
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {stats.score}
            </div>
            <div
              style={{
                fontSize: '0.7rem',
                color: 'var(--muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              Score
            </div>
          </div>

          {/* Combo */}
          <div
            className="card"
            style={{
              padding: '0.75rem',
              textAlign: 'center',
              background:
                stats.combo >= 3
                  ? 'linear-gradient(135deg, #fef3c7, #fde68a)'
                  : 'var(--card)',
              transition: 'background 0.3s',
            }}
          >
            <div
              style={{
                fontSize: '1.5rem',
                fontWeight: 700,
                color:
                  stats.combo >= 6
                    ? '#dc2626'
                    : stats.combo >= 3
                      ? '#d97706'
                      : 'var(--text)',
              }}
            >
              {stats.combo > 0 ? `${stats.combo}🔥` : '—'}
            </div>
            <div
              style={{
                fontSize: '0.7rem',
                color: 'var(--muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              Combo {comboMultiplier > 1 ? `(${comboMultiplier}x)` : ''}
            </div>
          </div>

          {/* Correct / Total */}
          <div
            className="card"
            style={{ padding: '0.75rem', textAlign: 'center' }}
          >
            <div
              style={{
                fontSize: '1.5rem',
                fontWeight: 700,
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              <span style={{ color: '#22c55e' }}>{stats.correct}</span>
              <span style={{ color: 'var(--muted)', fontSize: '1rem' }}>
                /
              </span>
              <span style={{ color: 'var(--text)' }}>{stats.problemsSeen}</span>
            </div>
            <div
              style={{
                fontSize: '0.7rem',
                color: 'var(--muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              Solved
            </div>
          </div>
        </div>

        {/* PROBLEM */}
        {problem ? (
          <div
            className="card"
            style={{
              padding: '1.5rem',
              marginBottom: '1.5rem',
              transition: 'box-shadow 0.3s, border-color 0.3s',
              borderLeft:
                flash === 'correct'
                  ? '4px solid #22c55e'
                  : flash === 'wrong'
                    ? '4px solid #ef4444'
                    : '4px solid var(--accent)',
              boxShadow:
                flash === 'correct'
                  ? '0 0 20px rgba(34,197,94,0.2)'
                  : flash === 'wrong'
                    ? '0 0 20px rgba(239,68,68,0.2)'
                    : 'none',
            }}
          >
            <div
              style={{
                fontSize: '0.75rem',
                color: 'var(--muted)',
                marginBottom: '0.5rem',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              #{stats.problemsSeen + 1} · {problem.difficulty || 'Mixed'} ·{' '}
              {problem.topicId?.replace(/-/g, ' ') || ''}
            </div>
            <div
              style={{
                fontSize: '1.25rem',
                padding: '1rem',
                background: 'var(--accent-soft)',
                borderRadius: 'var(--radius)',
                marginBottom: '1rem',
                textAlign: 'center',
                minHeight: '3rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {renderLatex(problem.statementLatex) ||
                problem.statement ||
                'No problem text'}
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                ref={inputRef}
                type="text"
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') submitAnswer();
                }}
                placeholder="Type your answer..."
                autoFocus
                style={{
                  flex: 1,
                  padding: '0.65rem 0.75rem',
                  borderRadius: 'var(--radius)',
                  border: '2px solid var(--accent)',
                  background: 'var(--bg)',
                  fontSize: '1rem',
                  outline: 'none',
                }}
              />
              <button
                onClick={submitAnswer}
                className="btn"
                style={{ padding: '0.65rem 1.25rem', fontSize: '1rem' }}
              >
                →
              </button>
            </div>
          </div>
        ) : (
          <div
            className="card"
            style={{
              padding: '2rem',
              textAlign: 'center',
              color: 'var(--muted)',
            }}
          >
            {loading ? 'Loading problems...' : 'No problems available.'}
          </div>
        )}

        {/* Tempo reaction */}
        {flash && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            marginBottom: '1rem',
            padding: '0.5rem',
            borderRadius: 'var(--radius)',
            background: flash === 'correct' ? '#dcfce740' : '#fee2e240',
            transition: 'all 0.3s',
          }}>
            <span style={{ fontSize: '1.5rem' }}>{TEMPO.emoji}</span>
            <span style={{
              fontSize: '0.85rem',
              fontStyle: 'italic',
              color: flash === 'correct' ? '#166534' : '#991b1b',
            }}>
              {flash === 'correct'
                ? getRandomQuote(TEMPO, 'encourage')
                : getRandomQuote(TEMPO, 'taunt')}
            </span>
          </div>
        )}

        {/* Quit button */}
        <button
          onClick={() => {
            if (timerRef.current) clearInterval(timerRef.current);
            setStats((prev) => ({
              ...prev,
              totalTime: (Date.now() - startTimeRef.current) / 1000,
            }));
            setMode('results');
          }}
          className="btn-ghost"
          style={{ width: '100%', fontSize: '0.85rem' }}
        >
          End Game
        </button>
      </div>
    </div>
  );
}
