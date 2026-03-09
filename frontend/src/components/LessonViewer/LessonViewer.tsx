import React, { useEffect, useState, useMemo } from 'react';
import Api from '../../services/api';
import katex from 'katex';
import Graph from '../Graph/Graph';
import { ALL_CHARACTERS, HarmoniaCharacter, getRandomQuote } from '../../data/characters';
import { getGraphsForLesson, type GraphData } from '../../utils/graphGenerators';

interface Props { lessonId: string }

function SliderElement({ el, renderLatex }: { el: any; renderLatex: (s?: string) => React.ReactNode }) {
  const [xVal, setXVal] = useState<number>((el.config.min + el.config.max) / 2);
  const [fVal, setFVal] = useState<string>('');

  const evaluate = (x: number): string => {
    try {
      const expr = el.config.functionExpression
        .replace(/\^/g, '**')
        .replace(/x/g, `(${x})`);
      return String(parseFloat(eval(expr).toFixed(6)));
    } catch {
      return '?';
    }
  };

  useEffect(() => {
    setFVal(evaluate(xVal));
  }, [xVal]);

  const target = el.config.targetValue;
  const targetFVal = target != null ? evaluate(target) : null;

  return (
    <div className="card" style={{ marginTop: '1rem', padding: '1.25rem' }}>
      <label htmlFor={el.id} style={{ display: 'block', marginBottom: '0.75rem', fontWeight: '500' }}>
        {el.label}
      </label>
      <input
        id={el.id}
        type="range"
        min={el.config.min}
        max={el.config.max}
        step={el.config.step}
        value={xVal}
        onChange={(e) => setXVal(parseFloat(e.target.value))}
        style={{ width: '100%', accentColor: 'var(--accent)' }}
      />
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.75rem', fontSize: '0.95rem' }}>
        <div>
          <span style={{ color: 'var(--muted)' }}>x = </span>
          <strong style={{ color: 'var(--accent)' }}>{xVal}</strong>
        </div>
        <div>
          <span style={{ color: 'var(--muted)' }}>f(x) = </span>
          <strong style={{ color: 'var(--accent)' }}>{fVal}</strong>
        </div>
      </div>
      {target != null && (
        <div style={{
          marginTop: '0.75rem',
          padding: '0.5rem 0.75rem',
          background: Math.abs(xVal - target) < 0.05 ? '#dcfce7' : 'var(--accent-soft)',
          borderRadius: 'var(--radius)',
          fontSize: '0.85rem',
          textAlign: 'center',
          transition: 'background 0.2s',
        }}>
          {Math.abs(xVal - target) < 0.05
            ? `✓ As x → ${target}, f(x) → ${targetFVal}  — that's the limit!`
            : `Target: x → ${target} (limit = ${targetFVal}). Move the slider closer!`}
        </div>
      )}
    </div>
  );
}

export default function LessonViewer({ lessonId }: Props) {
  const [lesson, setLesson] = useState<any | null>(null);
  useEffect(() => {
    if (!lessonId) return;
    Api.get(`/curriculum/lessons/${lessonId}`).then(r => setLesson(r.data.lesson || null)).catch(() => setLesson(null));
  }, [lessonId]);

  // Generate topic-aware graphs once per lesson load
  const graphs: GraphData[] = useMemo(() => (lesson ? getGraphsForLesson(lesson) : []), [lesson]);

  function renderLatex(latex?: string) {
    if (!latex) return null;
    try {
      return <span dangerouslySetInnerHTML={{ __html: katex.renderToString(latex, { throwOnError: false, strict: 'ignore' }) }} />;
    } catch (e) {
      return <span>{latex}</span>;
    }
  }

  if (!lesson) return <div className="card" style={{ textAlign: 'center', padding: '2rem' }}>Loading lesson...</div>;

  return (
    <div>
      {/* HEADER */}
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ margin: 0, fontSize: '1.75rem', background: 'linear-gradient(135deg, var(--accent), #a855f7)', backgroundClip: 'text', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          {lesson.title}
        </h2>
        {(() => {
          const guideChar = ALL_CHARACTERS[lesson.characterId];
          return guideChar ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
              <div style={{
                width: 32, height: 32, borderRadius: '50%',
                background: `linear-gradient(135deg, ${guideChar.gradientFrom}, ${guideChar.gradientTo})`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                boxShadow: `0 0 6px ${guideChar.color}44`,
              }}>
                <span style={{ fontSize: '1rem' }}>{guideChar.emoji}</span>
              </div>
              <span style={{ color: guideChar.color, fontWeight: 600, fontSize: '0.9rem' }}>
                Guided by {guideChar.name}
              </span>
              <span style={{ color: 'var(--muted)', fontStyle: 'italic', fontSize: '0.8rem' }}>
                — {guideChar.title}
              </span>
            </div>
          ) : (
            <p style={{ color: 'var(--muted)', marginTop: '0.5rem' }}>Guided by {lesson.characterId}</p>
          );
        })()}
      </div>

      {/* MAIN CONTENT */}
      {lesson.conceptExplanation?.map((c: any, ci: number) => (
        <section key={c.id} style={{ marginBottom: '2.5rem' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: '2px solid var(--accent)' }}>
            {c.title}
          </h3>

          {/* DIALOGUE - BROKEN UP */}
          {c.dialogue?.map((d: any, i: number) => {
            const dialogueChar = ALL_CHARACTERS[d.characterId];
            return (
            <div key={i} style={{ marginBottom: '1rem', display: 'grid', gridTemplateColumns: '80px 1fr', gap: '1rem', alignItems: 'start' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.15rem' }}>
                {dialogueChar ? (
                  <>
                    <div style={{
                      width: 48, height: 48, borderRadius: '50%',
                      background: `linear-gradient(135deg, ${dialogueChar.gradientFrom}, ${dialogueChar.gradientTo})`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      boxShadow: `0 0 6px ${dialogueChar.color}44`,
                    }}>
                      <span style={{ fontSize: '1.5rem' }}>{dialogueChar.emoji}</span>
                    </div>
                    <span style={{ fontSize: '0.6rem', fontWeight: 600, color: dialogueChar.color }}>{dialogueChar.name}</span>
                  </>
                ) : (
                  <div style={{ fontSize: '2rem' }}>💬</div>
                )}
              </div>
              <div>
                {d.emotion && (
                  <span style={{ fontSize: '0.7rem', color: 'var(--muted)', fontStyle: 'italic', display: 'block', marginBottom: '0.2rem' }}>
                    ({d.emotion})
                  </span>
                )}
                <em style={{ display: 'block', color: 'var(--text-light)', marginBottom: '0.5rem' }}>{d.text}</em>
                {d.latex && (
                  <div className="card" style={{ padding: '0.75rem', background: 'var(--accent-soft)', marginTop: '0.5rem' }}>
                    {renderLatex(d.latex)}
                  </div>
                )}
              </div>
            </div>
            );
          })}

          {/* MATH CONTENT */}
          {c.mathContent?.map((m: any, mi: number) => (
            <div key={mi} className="card" style={{ marginBottom: '1rem', padding: '1.25rem', background: 'var(--accent-soft)', borderLeft: '3px solid var(--accent)' }}>
              <strong style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--accent)' }}>{m.title}</strong>
              <div style={{ margin: '0.75rem 0' }}>
                {renderLatex(m.latex)}
              </div>
              <p style={{ margin: '0.75rem 0 0', fontSize: '0.9rem', color: 'var(--text-light)' }}>{m.explanation}</p>
            </div>
          ))}

          {/* VISUAL — topic-aware graph */}
          {(c.visualMetaphor || lesson.visualMetaphor) && graphs.length > 0 && (() => {
            const g = graphs[ci % graphs.length];
            return (
              <div className="card" style={{ marginTop: '1rem', padding: '1rem', textAlign: 'center' }}>
                <Graph
                  series={g.series}
                  specialPoints={g.specialPoints}
                  shadedRegions={g.shadedRegions}
                  asymptotes={g.asymptotes}
                  title={g.title}
                  xLabel={g.xLabel}
                  yLabel={g.yLabel}
                  width={540}
                  height={260}
                />
              </div>
            );
          })()}

          {/* INTERACTIVE ELEMENTS */}
          {c.interactiveElements?.map((el: any, idx: number) => {
            if (el.type === 'slider') {
              return (
                <SliderElement key={el.id || idx} el={el} renderLatex={renderLatex} />
              );
            }
            return null;
          })}
        </section>
      ))}

      {/* WORKED EXAMPLES */}
      {lesson.workedExamples?.length ? (
        <section style={{ marginBottom: '2.5rem' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: '2px solid var(--warning)' }}>
            Worked Examples
          </h3>
          {lesson.workedExamples.map((we: any) => (
            <div key={we.id} className="card" style={{ marginBottom: '1rem', padding: '1.25rem', background: '#fffbeb', borderLeft: '3px solid var(--warning)' }}>
              <div style={{ marginBottom: '1rem ' }}>
                <strong style={{ display: 'block', marginBottom: '0.5rem' }}>Problem:</strong>
                <div style={{ background: 'rgba(0,0,0,.02)', padding: '0.75rem', borderRadius: 'var(--radius)' }}>
                  {we.problemLatex ? renderLatex(we.problemLatex) : (renderLatex(we.problemStatement) || we.problemStatement)}
                </div>
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <strong style={{ display: 'block', marginBottom: '0.5rem' }}>Solution:</strong>
                {we.steps?.map((s: any) => (
                  <div key={s.stepNumber} style={{ marginBottom: '0.75rem', paddingLeft: '1rem', borderLeft: '2px solid #fcd34d' }}>
                    <div style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>Step {s.stepNumber}</div>
                    <div style={{ margin: '0.25rem 0' }}>{s.description}</div>
                    {renderLatex(s.latex) && <div style={{ margin: '0.5rem 0' }}>{renderLatex(s.latex)}</div>}
                  </div>
                ))}
              </div>
              <div style={{ paddingTop: '0.75rem', borderTop: '1px solid #fce7f3' }}>
                <strong style={{ display: 'block', marginBottom: '0.25rem' }}>Answer:</strong>
                {renderLatex(we.finalAnswerLatex) || we.finalAnswer}
              </div>
            </div>
          ))}
        </section>
      ) : null}

      {/* PRACTICE PROBLEMS */}
      {lesson.practiceProblems?.length ? (
        <section>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: '2px solid var(--success)' }}>
            Practice Problems
          </h3>
          <div className="card" style={{ padding: '1.25rem' }}>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {lesson.practiceProblems.map((p: any, idx: number) => (
                <li key={p.id} style={{ marginBottom: '0.75rem', paddingBottom: '0.75rem', borderBottom: idx  < lesson.practiceProblems.length - 1 ? '1px solid var(--bg-alt)' : 'none' }}>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'baseline' }}>
                    <span style={{ minWidth: '1.5rem', color: 'var(--accent)', fontWeight: 600 }}>{idx + 1}.</span>
                    <div>
                      {p.problemLatex ? renderLatex(p.problemLatex) : renderLatex(p.statementLatex)}
                      <span style={{ fontSize: '0.8rem', color: 'var(--muted)', marginLeft: '0.5rem' }}>({p.difficulty})</span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}
    </div>
  );
}

// generateSamplePointsForLesson removed — replaced by smart graphGenerators
