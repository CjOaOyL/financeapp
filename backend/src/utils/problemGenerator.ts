// ============================================================
// Harmonia — Procedural Problem Generator
// Generates randomized practice problems from templates
// ============================================================

import {
  Problem, ProblemType, CalcTopic, Difficulty,
} from '../models/types';
import { v4 as uuidv4 } from 'uuid';

// ---- Template Interfaces ----

interface ParameterRange {
  min: number;
  max: number;
  integer?: boolean;   // default true
  nonZero?: boolean;
  positive?: boolean;
}

interface ProblemTemplate {
  topicId: CalcTopic;
  type: ProblemType;
  difficulty: Difficulty;
  tags: string[];
  artContext?: string;
  /** Use {a}, {b}, {c} etc. for parameters */
  statementTemplate: string;
  statementLatexTemplate: string;
  parameters: Record<string, ParameterRange>;
  /** Function that computes the correct answer from parameters */
  answerFn: (params: Record<string, number>) => string;
  answerLatexFn?: (params: Record<string, number>) => string;
  tolerance?: number;
  hintTemplates?: string[];
  xpReward: number;
}

// ---- Random Utilities ----

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randFloat(min: number, max: number, decimals = 2): number {
  const val = Math.random() * (max - min) + min;
  return parseFloat(val.toFixed(decimals));
}

function sampleParam(range: ParameterRange): number {
  const isInt = range.integer !== false;
  let attempts = 0;
  while (attempts < 100) {
    let val = isInt ? randInt(range.min, range.max) : randFloat(range.min, range.max);
    if (range.nonZero && val === 0) { attempts++; continue; }
    if (range.positive && val <= 0) { attempts++; continue; }
    return val;
  }
  return range.min || 1; // fallback
}

function fillTemplate(template: string, params: Record<string, number>): string {
  let result = template;
  for (const [key, value] of Object.entries(params)) {
    result = result.replace(new RegExp(`\\{${key}\\}`, 'g'), value.toString());
  }
  return result;
}

// ---- Template Library ----

const templates: ProblemTemplate[] = [
  // -------- LIMITS --------
  {
    topicId: CalcTopic.INTRO_TO_LIMITS,
    type: ProblemType.NUMERIC_INPUT,
    difficulty: Difficulty.ANDANTE,
    tags: ['limit', 'polynomial'],
    statementTemplate: 'Evaluate the limit.',
    statementLatexTemplate: '\\lim_{x \\to {a}} ({b}x + {c}) = ?',
    parameters: {
      a: { min: -5, max: 5 },
      b: { min: 1, max: 6, nonZero: true },
      c: { min: -10, max: 10 },
    },
    answerFn: (p) => (p.b * p.a + p.c).toString(),
    answerLatexFn: (p) => `${p.b * p.a + p.c}`,
    tolerance: 0.01,
    hintTemplates: ['Substitute x = {a} into the expression.'],
    xpReward: 5,
    artContext: 'Lyra dances toward position {a}. Where does the melody lead?',
  },
  {
    topicId: CalcTopic.INTRO_TO_LIMITS,
    type: ProblemType.NUMERIC_INPUT,
    difficulty: Difficulty.MODERATO,
    tags: ['limit', 'rational', 'factor-cancel'],
    statementTemplate: 'Evaluate the limit by factoring.',
    statementLatexTemplate: '\\lim_{x \\to {a}} \\frac{x^2 - {aSq}}{x - {a}} = ?',
    parameters: {
      a: { min: 1, max: 8 },
    },
    answerFn: (p) => (2 * p.a).toString(),
    answerLatexFn: (p) => `${2 * p.a}`,
    tolerance: 0.01,
    hintTemplates: [
      'Factor the numerator as (x-{a})(x+{a}).',
      'Cancel (x-{a}) from numerator and denominator, then substitute.',
    ],
    xpReward: 8,
  },

  // -------- DERIVATIVES --------
  {
    topicId: CalcTopic.BASIC_DIFF_RULES,
    type: ProblemType.EXPRESSION_INPUT,
    difficulty: Difficulty.ANDANTE,
    tags: ['derivative', 'power-rule'],
    statementTemplate: 'Find the derivative.',
    statementLatexTemplate: '\\frac{d}{dx}\\left({a}x^{n}\\right) = ?',
    parameters: {
      a: { min: 1, max: 10, nonZero: true },
      n: { min: 2, max: 6 },
    },
    answerFn: (p) => `${p.a * p.n}x^${p.n - 1}`,
    answerLatexFn: (p) => `${p.a * p.n}x^{${p.n - 1}}`,
    hintTemplates: ['Power rule: d/dx(axⁿ) = a·n·xⁿ⁻¹'],
    xpReward: 5,
    artContext: 'Maestro Forte plays a note at power {n}. What tempo does it produce?',
  },
  {
    topicId: CalcTopic.BASIC_DIFF_RULES,
    type: ProblemType.NUMERIC_INPUT,
    difficulty: Difficulty.MODERATO,
    tags: ['derivative', 'evaluate'],
    statementTemplate: 'Find the value of the derivative at x = {c}.',
    statementLatexTemplate: 'f(x) = {a}x^2 + {b}x, \\quad f\'({c}) = ?',
    parameters: {
      a: { min: 1, max: 5 },
      b: { min: -5, max: 5 },
      c: { min: -3, max: 3 },
    },
    answerFn: (p) => (2 * p.a * p.c + p.b).toString(),
    tolerance: 0.01,
    hintTemplates: ['f\'(x) = {a}·2·x + {b}. Substitute x = {c}.'],
    xpReward: 8,
  },
  {
    topicId: CalcTopic.CHAIN_RULE,
    type: ProblemType.EXPRESSION_INPUT,
    difficulty: Difficulty.ALLEGRO,
    tags: ['derivative', 'chain-rule'],
    statementTemplate: 'Find the derivative using the chain rule.',
    statementLatexTemplate: '\\frac{d}{dx}\\left({a}x + {b}\\right)^{n} = ?',
    parameters: {
      a: { min: 1, max: 5, nonZero: true },
      b: { min: -5, max: 5 },
      n: { min: 2, max: 5 },
    },
    answerFn: (p) => `${p.n * p.a}(${p.a}x+${p.b})^${p.n - 1}`,
    answerLatexFn: (p) => `${p.n * p.a}(${p.a}x+${p.b})^{${p.n - 1}}`,
    hintTemplates: ['Let u = {a}x+{b}. Then d/dx(uⁿ) = n·uⁿ⁻¹ · du/dx.'],
    xpReward: 12,
  },

  // -------- INTEGRALS --------
  {
    topicId: CalcTopic.ANTIDERIVATIVES,
    type: ProblemType.EXPRESSION_INPUT,
    difficulty: Difficulty.ANDANTE,
    tags: ['integral', 'power-rule'],
    statementTemplate: 'Find the antiderivative.',
    statementLatexTemplate: '\\int {a}x^{n}\\,dx = ?',
    parameters: {
      a: { min: 1, max: 8, nonZero: true },
      n: { min: 1, max: 5 },
    },
    answerFn: (p) => {
      const coeff = p.a / (p.n + 1);
      const coeffStr = Number.isInteger(coeff) ? coeff.toString() : `${p.a}/${p.n + 1}`;
      return `${coeffStr}x^${p.n + 1}+C`;
    },
    answerLatexFn: (p) => {
      const newPow = p.n + 1;
      return `\\frac{${p.a}}{${newPow}}x^{${newPow}}+C`;
    },
    hintTemplates: ['Reverse power rule: ∫axⁿ dx = a·xⁿ⁺¹/(n+1) + C'],
    xpReward: 5,
    artContext: 'Iris paints a colour field. What full painting emerges from this brushstroke?',
  },
  {
    topicId: CalcTopic.DEFINITE_INTEGRALS_AREA,
    type: ProblemType.NUMERIC_INPUT,
    difficulty: Difficulty.MODERATO,
    tags: ['integral', 'definite', 'evaluate'],
    statementTemplate: 'Evaluate the definite integral.',
    statementLatexTemplate: '\\int_{0}^{{b}} {a}x\\,dx = ?',
    parameters: {
      a: { min: 1, max: 6 },
      b: { min: 1, max: 5 },
    },
    answerFn: (p) => ((p.a * p.b * p.b) / 2).toString(),
    tolerance: 0.01,
    hintTemplates: ['∫ax dx = (a/2)x². Evaluate from 0 to {b}.'],
    xpReward: 8,
    artContext: 'How much paint fills the canvas from x = 0 to x = {b}?',
  },

  // -------- SERIES --------
  {
    topicId: CalcTopic.SEQUENCES,
    type: ProblemType.NUMERIC_INPUT,
    difficulty: Difficulty.ANDANTE,
    tags: ['sequence', 'limit'],
    statementTemplate: 'Find the limit of the sequence.',
    statementLatexTemplate: 'a_n = \\frac{{a}n + {b}}{n + {c}}, \\quad \\lim_{n \\to \\infty} a_n = ?',
    parameters: {
      a: { min: 1, max: 7 },
      b: { min: -5, max: 5 },
      c: { min: 1, max: 8 },
    },
    answerFn: (p) => p.a.toString(),
    tolerance: 0.01,
    hintTemplates: ['Divide numerator and denominator by n. As n → ∞, the constants vanish.'],
    xpReward: 5,
  },
  {
    topicId: CalcTopic.INFINITE_SERIES,
    type: ProblemType.NUMERIC_INPUT,
    difficulty: Difficulty.MODERATO,
    tags: ['geometric-series', 'sum'],
    statementTemplate: 'Find the sum of the infinite geometric series.',
    statementLatexTemplate: '\\sum_{n=0}^{\\infty} \\frac{1}{{r}^n} = ?',
    parameters: {
      r: { min: 2, max: 8 },
    },
    answerFn: (p) => {
      // sum = 1/(1-1/r) = r/(r-1)
      const val = p.r / (p.r - 1);
      return val.toFixed(4);
    },
    tolerance: 0.01,
    hintTemplates: [
      'This is a geometric series with ratio 1/{r}.',
      'Sum = a/(1-r) where a=1 and r=1/{r}.',
    ],
    xpReward: 8,
    artContext: 'The echoing verses of the Amphitheater reduce by a factor of {r} each time. What total resonance builds up?',
  },
];

// Add computed property for the factoring template
// (inject aSq = a² into parameters at generation time)
function enrichParams(template: ProblemTemplate, params: Record<string, number>): Record<string, number> {
  const enriched = { ...params };
  if ('a' in params) {
    enriched.aSq = params.a * params.a;
  }
  return enriched;
}

/**
 * Normalize answer for flexible comparison.
 * Handles: fractions (1/2), decimals (.5), polynomial expressions (2x+3), constants with +C, etc.
 */
function normalizeAnswer(answer: string): string {
  return answer
    .replace(/\s+/g, '')           // Remove whitespace
    .toLowerCase()                 // Lowercase
    .replace(/\+c$/i, '')          // Remove trailing +C (for integrals)
    .replace(/\(\)/g, '');         // Remove empty parens
}

// ---- Generator API ----

/**
 * Generate a randomized problem from a template for the given topic/difficulty.
 * Returns undefined if no matching template exists.
 */
export function generateProblem(
  topic: CalcTopic,
  difficulty?: Difficulty,
): Problem | undefined {
  let pool = templates.filter(t => t.topicId === topic);
  if (difficulty) {
    pool = pool.filter(t => t.difficulty === difficulty);
  }
  if (pool.length === 0) return undefined;

  const template = pool[Math.floor(Math.random() * pool.length)];
  const rawParams: Record<string, number> = {};
  for (const [key, range] of Object.entries(template.parameters)) {
    rawParams[key] = sampleParam(range);
  }
  const params = enrichParams(template, rawParams);

  const answer = template.answerFn(params);
  const answerLatex = template.answerLatexFn?.(params);
  const hints = template.hintTemplates?.map(h => fillTemplate(h, params));
  const artCtx = template.artContext ? fillTemplate(template.artContext, params) : undefined;

  // Normalize answer for comparison (trim, lowercase, remove +C variations)
  const normalizedAnswer = normalizeAnswer(answer);

  const problem: Problem = {
    id: `gen-${uuidv4()}`,
    topicId: template.topicId,
    type: template.type,
    difficulty: template.difficulty,
    statement: fillTemplate(template.statementTemplate, params),
    statementLatex: fillTemplate(template.statementLatexTemplate, params),
    correctAnswer: normalizedAnswer,
    correctAnswerLatex: answerLatex,
    tolerance: template.tolerance,
    hints: hints ?? [],
    detailedSolution: [
      {
        stepNumber: 1,
        description: 'Generated answer',
        latex: answerLatex ?? answer,
      },
    ],
    xpReward: template.xpReward,
    tags: template.tags,
    artContext: artCtx,
  };

  return problem;
}

/**
 * Generate a batch of problems for a topic.
 */
export function generateProblemBatch(
  topic: CalcTopic,
  count: number,
  difficulty?: Difficulty,
): Problem[] {
  const problems: Problem[] = [];
  for (let i = 0; i < count; i++) {
    const p = generateProblem(topic, difficulty);
    if (p) problems.push(p);
  }
  return problems;
}

/**
 * Generate a mixed quiz across multiple topics (for arcade mode / daily challenge).
 */
export function generateMixedQuiz(
  topics: CalcTopic[],
  totalCount: number,
  difficulty?: Difficulty,
): Problem[] {
  const perTopic = Math.max(1, Math.floor(totalCount / topics.length));
  const problems: Problem[] = [];
  for (const topic of topics) {
    problems.push(...generateProblemBatch(topic, perTopic, difficulty));
  }
  // Shuffle
  for (let i = problems.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [problems[i], problems[j]] = [problems[j], problems[i]];
  }
  return problems.slice(0, totalCount);
}

/**
 * Get all available topics that have templates.
 */
export function getAvailableTopics(): CalcTopic[] {
  return [...new Set(templates.map(t => t.topicId))];
}

/**
 * Get available difficulty levels for a topic.
 */
export function getAvailableDifficulties(topic: CalcTopic): Difficulty[] {
  return [...new Set(templates.filter(t => t.topicId === topic).map(t => t.difficulty))];
}
