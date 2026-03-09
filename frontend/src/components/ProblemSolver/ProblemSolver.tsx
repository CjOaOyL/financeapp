import React, { useEffect, useState } from 'react';
import Api from '../../services/api';
import katex from 'katex';

interface Props { playerId?: string }

export default function ProblemSolver({ playerId = 'player-1' }: Props) {
  const [topics, setTopics] = useState<any[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<string>('');
  const [problem, setProblem] = useState<any | null>(null);
  const [answer, setAnswer] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'info' | 'success' | 'error'>('info');
  const [startedAt, setStartedAt] = useState<number | null>(null);

  useEffect(() => {
    Api.get('/problems/topics').then(r => setTopics(r.data.topics || []));
  }, []);

  function renderLatex(latex?: string) {
    if (!latex) return null;
    try {
      return <span dangerouslySetInnerHTML={{ __html: katex.renderToString(latex, { throwOnError: false, strict: 'ignore' }) }} />;
    } catch {
      return <span>{latex}</span>;
    }
  }

  function generate() {
    if (!selectedTopic) return setMessage('Choose a topic');
    Api.get(`/problems/generate?topic=${selectedTopic}`).then(r => {
      setProblem(r.data.problem || null);
      setAnswer('');
      setMessage('');
      setStartedAt(Date.now());
    }).catch(() => setMessage('Could not generate problem'));
  }

  function submit() {
    if (!problem) return;
    const correct = checkAnswerLocally(problem, answer);
    const timeTakenMs = startedAt ? Date.now() - startedAt : 0;

    const payload = {
      problemId: problem.id || 'local-' + Math.random().toString(36).slice(2, 9),
      topicId: problem.topicId || selectedTopic,
      correct,
      attempts: 1,
      timeTakenMs,
      hintsUsed: 0,
      difficulty: problem.difficulty || 'moderato',
    };

    Api.post(`/player/${playerId}/solve`, payload).then(r => {
      setMessageType(correct ? 'success' : 'error');
      setMessage(correct ? '✓ Correct! Recorded to your profile.' : '✗ Incorrect — try again.');
    }).catch(() => {
      setMessageType(correct ? 'success' : 'error');
      setMessage(correct ? '✓ Correct! (local)' : '✗ Incorrect (local)');
    });
  }

  return (
    <div>
      {/* TOPIC SELECTOR */}
      <div style={{ marginBottom: '1.5rem' }}>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', fontSize: '0.9rem' }}>
          Choose a topic:
        </label>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <select
            value={selectedTopic}
            onChange={e => setSelectedTopic(e.target.value)}
            style={{
              flex: 1,
              padding: '0.5rem 0.75rem',
              borderRadius: 'var(--radius)',
              border: '1.5px solid var(--card-border)',
              background: 'var(--card)',
              fontSize: '0.9rem',
            }}
          >
            <option value="">-- choose --</option>
            {topics.map((t: any) => (
              <option key={t.topicId} value={t.topicId}>{t.topicId}</option>
            ))}
          </select>
          <button onClick={generate} className="btn" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}>
            Generate
          </button>
        </div>
      </div>

      {/* PROBLEM DISPLAY */}
      {problem ? (
        <div className="problem-card" style={{ marginBottom: '1.5rem' }}>
          <div style={{ marginBottom: '1rem' }}>
            <strong style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: 'var(--muted)' }}>
              Problem {problem.difficulty ? `· ${problem.difficulty}` : ''}
            </strong>
            {(problem.statementLatex || problem.problemLatex) ? (
              <div
                style={{
                  background: 'var(--accent-soft)',
                  padding: '0.75rem',
                  borderRadius: 'var(--radius)',
                  fontSize: '1.15rem',
                }}
              >
                {renderLatex(problem.statementLatex || problem.problemLatex)}
              </div>
            ) : problem.statement}
            {problem.hints?.length > 0 && (
              <details style={{ fontSize: '0.85rem', color: 'var(--text-light)' }}>
                <summary style={{ cursor: 'pointer', marginBottom: '0.5rem' }}>💡 Hints</summary>
                <ul style={{ margin: '0.5rem 0 0 1.5rem', paddingLeft: 0 }}>
                  {problem.hints.map((hint: string, i: number) => (
                    <li key={i} style={{ marginBottom: '0.25rem' }}>{hint}</li>
                  ))}
                </ul>
              </details>
            )}
          </div>

          {/* ANSWER INPUT */}
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input
              type="text"
              value={answer}
              onChange={e => setAnswer(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') submit(); }}
              placeholder="Your answer"
              style={{
                flex: 1,
                padding: '0.5rem 0.75rem',
                borderRadius: 'var(--radius)',
                border: '1.5px solid var(--card-border)',
                background: 'var(--bg)',
                fontSize: '0.9rem',
              }}
            />
            <button onClick={submit} className="btn" style={{ padding: '0.5rem 1rem' }}>
              Submit
            </button>
          </div>
        </div>
      ) : (
        <div className="card" style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--muted)' }}>
          {selectedTopic ? 'Click "Generate" to create a problem.' : 'Select a topic to begin.'}
        </div>
      )}

      {/* MESSAGE */}
      {message && (
        <div
          style={{
            padding: '0.75rem 1rem',
            borderRadius: 'var(--radius)',
            background: messageType === 'success' ? '#dcfce7' : messageType === 'error' ? '#fee2e2' : 'var(--accent-soft)',
            color: messageType === 'success' ? '#166534' : messageType === 'error' ? '#991b1b' : 'var(--accent)',
            fontSize: '0.9rem',
            fontWeight: '500',
          }}
        >
          {message}
        </div>
      )}
    </div>
  );
}

function checkAnswerLocally(problem: any, answer: string) {
  if (!problem) return false;
  if (problem.correctAnswer !== undefined) {
    const expected = normalizeAnswer(problem.correctAnswer);
    const given = normalizeAnswer(answer);
    
    // Try exact match
    if (expected === given) return true;
    
    // Try numeric comparison (with tolerance)
    const expNum = parseFloat(expected);
    const givenNum = parseFloat(given);
    if (!isNaN(expNum) && !isNaN(givenNum)) {
      const tolerance = problem.tolerance || 0.01;
      return Math.abs(expNum - givenNum) <= tolerance;
    }
    
    return false;
  }
  return answer.trim().length > 0;
}

function normalizeAnswer(answer: string): string {
  return String(answer)
    .replace(/\s+/g, '')           // Remove whitespace
    .toLowerCase()                 // Lowercase
    .replace(/\+c$/i, '')          // Remove trailing +C (for integrals)
    .replace(/\(\)/g, '')          // Remove empty parens
    .trim();
}
