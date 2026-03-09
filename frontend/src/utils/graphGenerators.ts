// ============================================================
// Smart graph data generators — produces contextual graphs
// based on lesson topic, concept section, and worked examples
// ============================================================

import type { GraphSeries, SpecialPoint, ShadedRegion, AsymptoteLine, Point } from '../components/Graph/Graph';

export interface GraphData {
  series: GraphSeries[];
  specialPoints?: SpecialPoint[];
  shadedRegions?: ShadedRegion[];
  asymptotes?: AsymptoteLine[];
  title?: string;
  xLabel?: string;
  yLabel?: string;
}

// ---- Safe math evaluator ----

function safeEval(expr: string, x: number): number {
  try {
    const prepared = expr
      .replace(/\bsin\b/g, 'Math.sin')
      .replace(/\bcos\b/g, 'Math.cos')
      .replace(/\btan\b/g, 'Math.tan')
      .replace(/\babs\b/g, 'Math.abs')
      .replace(/\bsqrt\b/g, 'Math.sqrt')
      .replace(/\bln\b/g, 'Math.log')
      .replace(/\blog\b/g, 'Math.log10')
      .replace(/\bexp\b/g, 'Math.exp')
      .replace(/\bpi\b/gi, 'Math.PI')
      .replace(/\be\b/g, 'Math.E')
      .replace(/\^/g, '**')
      .replace(/x/g, `(${x})`);
    const result = Function(`"use strict"; return (${prepared})`)();
    return typeof result === 'number' && isFinite(result) ? result : NaN;
  } catch {
    return NaN;
  }
}

function sampleFunction(expr: string, from: number, to: number, n = 200): Point[] {
  const step = (to - from) / n;
  const pts: Point[] = [];
  for (let i = 0; i <= n; i++) {
    const x = from + i * step;
    const y = safeEval(expr, x);
    pts.push({ x, y });
  }
  return pts;
}

function numericDerivative(expr: string, x: number, h = 0.0001): number {
  return (safeEval(expr, x + h) - safeEval(expr, x - h)) / (2 * h);
}

function sampleDerivative(expr: string, from: number, to: number, n = 200): Point[] {
  const step = (to - from) / n;
  const pts: Point[] = [];
  for (let i = 0; i <= n; i++) {
    const x = from + i * step;
    const y = numericDerivative(expr, x);
    pts.push({ x, y: isFinite(y) ? y : NaN });
  }
  return pts;
}

function numericIntegral(expr: string, from: number, to: number, n = 200): Point[] {
  const step = (to - from) / n;
  const pts: Point[] = [];
  let sum = 0;
  for (let i = 0; i <= n; i++) {
    const x = from + i * step;
    if (i > 0) {
      const y0 = safeEval(expr, x - step);
      const y1 = safeEval(expr, x);
      if (isFinite(y0) && isFinite(y1)) {
        sum += (y0 + y1) / 2 * step;
      }
    }
    pts.push({ x, y: sum });
  }
  return pts;
}

// ============================================================
// Topic-specific graph generators
// ============================================================

/** Limits: show (x²-4)/(x-2) with a hole at x=2 approaching 4 */
function graphLimitHole(): GraphData {
  const pts = sampleFunction('(x^2-4)/(x-2)', -1, 5, 300);
  return {
    series: [{ points: pts, color: '#6366f1', label: 'f(x) = (x²−4)/(x−2)', width: 2 }],
    specialPoints: [
      { x: 2, y: 4, type: 'hole', label: 'hole at x = 2', color: '#ef4444' },
      { x: 2, y: 4, type: 'target', label: 'L = 4' },
    ],
    asymptotes: [],
    title: 'Limit with a removable discontinuity',
    xLabel: 'x',
    yLabel: 'f(x)',
  };
}

/** Limits: show sin(x)/x approaching 1 */
function graphSinXOverX(): GraphData {
  const pts = sampleFunction('sin(x)/x', -12, 12, 400);
  return {
    series: [{ points: pts, color: '#6366f1', label: 'f(x) = sin(x)/x', width: 2 }],
    specialPoints: [
      { x: 0, y: 1, type: 'hole', label: 'limit = 1', color: '#22c55e' },
    ],
    asymptotes: [{ axis: 'horizontal', value: 0, color: '#94a3b8', label: 'y = 0' }],
    title: 'The famous limit: sin(x)/x → 1',
    xLabel: 'x',
    yLabel: 'f(x)',
  };
}

/** One-sided limits: piecewise function with jump */
function graphOneSidedLimits(): GraphData {
  const left = sampleFunction('x^2', -3, 1, 100);
  const right = sampleFunction('x + 2', 1, 4, 100);
  return {
    series: [
      { points: left, color: '#6366f1', label: 'x² (x < 1)', width: 2 },
      { points: right, color: '#22c55e', label: 'x + 2 (x ≥ 1)', width: 2 },
    ],
    specialPoints: [
      { x: 1, y: 1, type: 'hole', label: 'left: 1', color: '#6366f1' },
      { x: 1, y: 3, type: 'filled', label: 'right: 3', color: '#22c55e' },
    ],
    title: 'One-sided limits: left ≠ right (limit DNE)',
    xLabel: 'x',
    yLabel: 'f(x)',
  };
}

/** Tangent line: show f(x) = x² with tangent at x = 1 */
function graphTangentLine(): GraphData {
  const curve = sampleFunction('x^2', -2, 3, 200);
  // Tangent at x=1: slope = 2, point (1,1), y = 2(x-1) + 1 = 2x - 1
  const tangent = sampleFunction('2*x - 1', -1, 3, 100);
  return {
    series: [
      { points: curve, color: '#6366f1', label: 'f(x) = x²', width: 2.5 },
      { points: tangent, color: '#ef4444', label: "tangent: y = 2x − 1", width: 2, dashed: true },
    ],
    specialPoints: [
      { x: 1, y: 1, type: 'filled', label: '(1, 1)', color: '#ef4444' },
    ],
    title: 'Tangent line to f(x) = x² at x = 1',
    xLabel: 'x',
    yLabel: 'f(x)',
  };
}

/** Secant to tangent animation (multiple secant lines converging) */
function graphSecantToTangent(): GraphData {
  const curve = sampleFunction('x^2', -1, 4, 200);
  const a = 1;
  const fa = 1;
  const series: GraphSeries[] = [
    { points: curve, color: '#6366f1', label: 'f(x) = x²', width: 2.5 },
  ];
  const specials: SpecialPoint[] = [
    { x: a, y: fa, type: 'filled', label: 'a = 1', color: '#6366f1' },
  ];

  // Secant lines from b approaching a
  const secantBs = [3, 2.5, 2, 1.5];
  const secantColors = ['#fca5a520', '#f59e0b60', '#f59e0ba0', '#f59e0b'];
  secantBs.forEach((b, i) => {
    const fb = b * b;
    const slope = (fb - fa) / (b - a);
    const line = sampleFunction(`${slope}*(x - ${a}) + ${fa}`, -0.5, 3.5, 50);
    series.push({
      points: line,
      color: secantColors[i],
      width: 1.5,
      dashed: true,
      label: i === secantBs.length - 1 ? `secant (b=${b})` : undefined,
    });
    specials.push({ x: b, y: fb, type: 'filled', color: secantColors[i] });
  });

  // Final tangent
  const tangent = sampleFunction('2*x - 1', -0.5, 3.5, 50);
  series.push({ points: tangent, color: '#ef4444', width: 2.5, label: 'tangent (b→a)' });

  return {
    series,
    specialPoints: specials,
    title: 'Secant lines converge to the tangent',
    xLabel: 'x',
    yLabel: 'f(x)',
  };
}

/** Basic differentiation rules: show f(x) and f'(x) side by side */
function graphFunctionAndDerivative(): GraphData {
  const expr = 'x^3 - 3*x';
  const curve = sampleFunction(expr, -2.5, 2.5, 200);
  const deriv = sampleDerivative(expr, -2.5, 2.5, 200);
  return {
    series: [
      { points: curve, color: '#6366f1', label: 'f(x) = x³ − 3x', width: 2.5 },
      { points: deriv, color: '#22c55e', label: "f'(x) = 3x² − 3", width: 2, dashed: true },
    ],
    specialPoints: [
      { x: -1, y: 2, type: 'filled', label: 'max', color: '#6366f1' },
      { x: 1, y: -2, type: 'filled', label: 'min', color: '#6366f1' },
      { x: -1, y: 0, type: 'target', label: "f'=0", color: '#22c55e' },
      { x: 1, y: 0, type: 'target', label: "f'=0", color: '#22c55e' },
    ],
    title: 'Function and its derivative',
    xLabel: 'x',
    yLabel: 'y',
  };
}

/** Antiderivatives: show f(x) and F(x) */
function graphAntiderivative(): GraphData {
  const expr = '2*x';
  const curve = sampleFunction(expr, -3, 3, 200);
  const integral = numericIntegral(expr, -3, 3, 200);
  return {
    series: [
      { points: curve, color: '#22c55e', label: "f(x) = 2x", width: 2 },
      { points: integral, color: '#a855f7', label: 'F(x) = x² + C', width: 2.5 },
    ],
    title: 'A function and its antiderivative',
    xLabel: 'x',
    yLabel: 'y',
  };
}

/** Definite integral: shaded area under a curve */
function graphDefiniteIntegral(): GraphData {
  const expr = 'x^2';
  const curve = sampleFunction(expr, -1, 4, 200);
  const areaPts = sampleFunction(expr, 0, 3, 100);
  return {
    series: [
      { points: curve, color: '#6366f1', label: 'f(x) = x²', width: 2.5 },
    ],
    shadedRegions: [
      { points: areaPts, color: '#6366f1', opacity: 0.2 },
    ],
    specialPoints: [
      { x: 0, y: 0, type: 'filled', label: 'a = 0', color: '#6366f1' },
      { x: 3, y: 9, type: 'filled', label: 'b = 3', color: '#6366f1' },
    ],
    title: '∫₀³ x² dx = 9 (shaded area)',
    xLabel: 'x',
    yLabel: 'f(x)',
  };
}

/** Fundamental theorem: accumulation function */
function graphFundamentalTheorem(): GraphData {
  const expr = 'sin(x)';
  const curve = sampleFunction(expr, 0, 4 * Math.PI, 300);
  const accum = numericIntegral(expr, 0, 4 * Math.PI, 300);
  return {
    series: [
      { points: curve, color: '#22c55e', label: 'f(t) = sin(t)', width: 2 },
      { points: accum, color: '#a855f7', label: 'F(x) = ∫₀ˣ sin(t) dt', width: 2.5 },
    ],
    title: 'Fundamental Theorem: area accumulation',
    xLabel: 'x',
    yLabel: 'y',
  };
}

/** Sequences: show terms of 1/n converging to 0 */
function graphSequences(): GraphData {
  const terms: Point[] = [];
  for (let n = 1; n <= 20; n++) {
    terms.push({ x: n, y: 1 / n });
  }
  return {
    series: [
      { points: terms, color: '#6366f1', showDots: true, dotRadius: 4, label: 'aₙ = 1/n', width: 1 },
    ],
    asymptotes: [
      { axis: 'horizontal', value: 0, color: '#22c55e', label: 'limit = 0' },
    ],
    title: 'Sequence 1/n converging to 0',
    xLabel: 'n',
    yLabel: 'aₙ',
  };
}

/** Geometric series partial sums */
function graphInfiniteSeries(): GraphData {
  const partials: Point[] = [];
  let sum = 0;
  for (let n = 0; n <= 15; n++) {
    sum += Math.pow(0.5, n);
    partials.push({ x: n, y: sum });
  }
  return {
    series: [
      { points: partials, color: '#a855f7', showDots: true, dotRadius: 4, label: 'Sₙ = Σ (1/2)ᵏ', width: 1.5 },
    ],
    asymptotes: [
      { axis: 'horizontal', value: 2, color: '#22c55e', label: 'S = 2' },
    ],
    title: 'Geometric series converging to 2',
    xLabel: 'n (partial sum index)',
    yLabel: 'Sₙ',
  };
}

/** Taylor polynomials approaching sin(x) */
function graphTaylorPolynomials(): GraphData {
  const sinPts = sampleFunction('sin(x)', -6, 6, 300);

  // Taylor polynomials for sin(x) of degree 1, 3, 5, 7
  const taylor1 = sampleFunction('x', -6, 6, 200);
  const taylor3 = sampleFunction('x - x^3/6', -6, 6, 200);
  const taylor5 = sampleFunction('x - x^3/6 + x^5/120', -6, 6, 200);
  const taylor7 = sampleFunction('x - x^3/6 + x^5/120 - x^7/5040', -6, 6, 200);

  // Clamp wild values for display
  const clamp = (pts: Point[]) => pts.map(p => ({
    x: p.x,
    y: Math.abs(p.y) > 8 ? NaN : p.y,
  }));

  return {
    series: [
      { points: sinPts, color: '#6366f1', label: 'sin(x)', width: 3 },
      { points: clamp(taylor1), color: '#fca5a5', label: 'T₁(x)', width: 1.5, dashed: true },
      { points: clamp(taylor3), color: '#f59e0b', label: 'T₃(x)', width: 1.5, dashed: true },
      { points: clamp(taylor5), color: '#22c55e', label: 'T₅(x)', width: 1.5, dashed: true },
      { points: clamp(taylor7), color: '#a855f7', label: 'T₇(x)', width: 2, dashed: true },
    ],
    title: 'Taylor polynomials approximating sin(x)',
    xLabel: 'x',
    yLabel: 'y',
  };
}

/** Power rule: show x, x², x³ and their derivatives */
function graphPowerRule(): GraphData {
  return {
    series: [
      { points: sampleFunction('x^2', -2, 2, 150), color: '#6366f1', label: 'x²', width: 2 },
      { points: sampleFunction('2*x', -2, 2, 150), color: '#6366f1', label: "2x (derivative)", width: 1.5, dashed: true },
      { points: sampleFunction('x^3', -1.5, 1.5, 150), color: '#a855f7', label: 'x³', width: 2 },
      { points: sampleFunction('3*x^2', -1.5, 1.5, 150), color: '#a855f7', label: "3x² (derivative)", width: 1.5, dashed: true },
    ],
    title: 'Power rule: d/dx[xⁿ] = nxⁿ⁻¹',
    xLabel: 'x',
    yLabel: 'y',
  };
}

/** Chain rule: show composite function and its derivative */
function graphChainRule(): GraphData {
  const expr = 'sin(x^2)';
  const curve = sampleFunction(expr, -3, 3, 300);
  const deriv = sampleDerivative(expr, -3, 3, 300);
  return {
    series: [
      { points: curve, color: '#6366f1', label: 'sin(x²)', width: 2.5 },
      { points: deriv, color: '#ef4444', label: "2x·cos(x²)", width: 2, dashed: true },
    ],
    title: 'Chain rule: d/dx[sin(x²)] = 2x·cos(x²)',
    xLabel: 'x',
    yLabel: 'y',
  };
}

/** u-Substitution: show area under 2x·eˣ² */
function graphUSubstitution(): GraphData {
  const expr = '2*x*exp(x^2/4)';
  const curve = sampleFunction(expr, -1, 2.5, 200);
  const areaPts = sampleFunction(expr, 0, 2, 100);
  return {
    series: [
      { points: curve, color: '#a855f7', label: 'f(x) = 2x·e^(x²/4)', width: 2.5 },
    ],
    shadedRegions: [
      { points: areaPts, color: '#a855f7', opacity: 0.2 },
    ],
    title: 'u-Substitution: let u = x²/4',
    xLabel: 'x',
    yLabel: 'f(x)',
  };
}

/** Continuity: show a continuous vs discontinuous function */
function graphContinuity(): GraphData {
  const cont = sampleFunction('x^2', -2, 2, 150);
  // Discontinuous: 1/(x-1)
  const disc = sampleFunction('1/(x-1)', -2, 4, 300);
  return {
    series: [
      { points: cont, color: '#22c55e', label: 'x² (continuous)', width: 2 },
      { points: disc, color: '#ef4444', label: '1/(x−1) (discontinuous)', width: 2 },
    ],
    asymptotes: [
      { axis: 'vertical', value: 1, color: '#ef4444', label: 'x = 1' },
    ],
    title: 'Continuous vs. discontinuous functions',
    xLabel: 'x',
    yLabel: 'f(x)',
  };
}

/** Squeeze theorem */
function graphSqueezeTheorem(): GraphData {
  const lower = sampleFunction('-abs(x)', -6, 6, 200);
  const upper = sampleFunction('abs(x)', -6, 6, 200);
  const squeezed = sampleFunction('x*sin(1/x)', -6, 6, 600);
  return {
    series: [
      { points: upper, color: '#f59e0b', label: '|x|', width: 1.5, dashed: true },
      { points: lower, color: '#f59e0b', label: '−|x|', width: 1.5, dashed: true },
      { points: squeezed, color: '#6366f1', label: 'x·sin(1/x)', width: 2 },
    ],
    specialPoints: [
      { x: 0, y: 0, type: 'target', label: 'limit = 0', color: '#22c55e' },
    ],
    title: 'Squeeze theorem: −|x| ≤ x·sin(1/x) ≤ |x|',
    xLabel: 'x',
    yLabel: 'y',
  };
}

/** Limits at infinity */
function graphLimitsAtInfinity(): GraphData {
  const expr = '(2*x^2 + 1)/(x^2 - 1)';
  const curve = sampleFunction(expr, -10, 10, 400);
  return {
    series: [
      { points: curve, color: '#6366f1', label: '(2x²+1)/(x²−1)', width: 2.5 },
    ],
    asymptotes: [
      { axis: 'horizontal', value: 2, color: '#22c55e', label: 'y = 2' },
      { axis: 'vertical', value: 1, color: '#ef4444', label: 'x = 1' },
      { axis: 'vertical', value: -1, color: '#ef4444', label: 'x = −1' },
    ],
    title: 'Horizontal asymptote: y = 2 as x → ±∞',
    xLabel: 'x',
    yLabel: 'f(x)',
  };
}

/** Convergence tests: compare p-series */
function graphConvergenceTests(): GraphData {
  const seriesData = (p: number): Point[] => {
    const pts: Point[] = [];
    let sum = 0;
    for (let n = 1; n <= 20; n++) {
      sum += 1 / Math.pow(n, p);
      pts.push({ x: n, y: sum });
    }
    return pts;
  };
  return {
    series: [
      { points: seriesData(0.5), color: '#ef4444', label: 'p=0.5 (diverges)', width: 2, showDots: true, dotRadius: 3 },
      { points: seriesData(1), color: '#f59e0b', label: 'p=1 harmonic (diverges)', width: 2, showDots: true, dotRadius: 3 },
      { points: seriesData(2), color: '#22c55e', label: 'p=2 (converges → π²/6)', width: 2, showDots: true, dotRadius: 3 },
      { points: seriesData(3), color: '#6366f1', label: 'p=3 (converges)', width: 2, showDots: true, dotRadius: 3 },
    ],
    title: 'p-Series: Σ 1/nᵖ',
    xLabel: 'n',
    yLabel: 'Partial sum Sₙ',
  };
}

/** Power series: radius of convergence */
function graphPowerSeries(): GraphData {
  // Show partial sums of geometric series Σ xⁿ for |x| < 1
  const exact = sampleFunction('1/(1-x)', -0.95, 0.95, 200);
  const partial3: Point[] = sampleFunction('1 + x + x^2 + x^3', -1.5, 1.5, 200);
  const partial6: Point[] = sampleFunction('1 + x + x^2 + x^3 + x^4 + x^5 + x^6', -1.5, 1.5, 200);

  const clamp = (pts: Point[]) => pts.map(p => ({
    x: p.x,
    y: Math.abs(p.y) > 10 ? NaN : p.y,
  }));

  return {
    series: [
      { points: exact, color: '#6366f1', label: '1/(1−x)', width: 3 },
      { points: clamp(partial3), color: '#f59e0b', label: 'S₃(x)', width: 1.5, dashed: true },
      { points: clamp(partial6), color: '#22c55e', label: 'S₆(x)', width: 1.5, dashed: true },
    ],
    asymptotes: [
      { axis: 'vertical', value: 1, color: '#ef4444', label: 'R = 1' },
      { axis: 'vertical', value: -1, color: '#ef4444', label: 'R = −1' },
    ],
    title: 'Power series Σxⁿ = 1/(1−x), |x| < 1',
    xLabel: 'x',
    yLabel: 'y',
  };
}

// ============================================================
// Master router: pick graph based on topicId
// ============================================================

const TOPIC_GRAPHS: Record<string, () => GraphData[]> = {
  'intro-to-limits': () => [graphLimitHole(), graphSinXOverX()],
  'one-sided-limits': () => [graphOneSidedLimits()],
  'continuity': () => [graphContinuity()],
  'squeeze-theorem': () => [graphSqueezeTheorem()],
  'limits-at-infinity': () => [graphLimitsAtInfinity()],

  'tangent-line-intro': () => [graphTangentLine(), graphSecantToTangent()],
  'basic-differentiation-rules': () => [graphFunctionAndDerivative(), graphPowerRule()],
  'product-quotient-rules': () => [graphFunctionAndDerivative()],
  'chain-rule': () => [graphChainRule()],
  'trig-exp-log-derivatives': () => [graphChainRule()],
  'derivative-applications': () => [graphFunctionAndDerivative()],

  'antiderivatives': () => [graphAntiderivative()],
  'definite-integrals-area': () => [graphDefiniteIntegral()],
  'fundamental-theorem-calculus': () => [graphFundamentalTheorem()],
  'u-substitution': () => [graphUSubstitution()],
  'integration-by-parts': () => [graphDefiniteIntegral()],
  'integral-applications': () => [graphDefiniteIntegral()],

  'sequences': () => [graphSequences()],
  'infinite-series-convergence': () => [graphInfiniteSeries()],
  'convergence-tests': () => [graphConvergenceTests()],
  'power-series': () => [graphPowerSeries()],
  'taylor-maclaurin-series': () => [graphTaylorPolynomials()],
};

/**
 * Get all relevant graphs for a lesson.
 * Returns an array — one graph per concept section (or a shared set).
 */
export function getGraphsForLesson(lesson: any): GraphData[] {
  const topicId: string = lesson.topicId || '';
  const generator = TOPIC_GRAPHS[topicId];
  if (generator) return generator();

  // Fallback: try to extract function from interactive elements
  const exprs: string[] = [];
  for (const section of lesson.conceptExplanation || []) {
    for (const el of section.interactiveElements || []) {
      if (el.config?.functionExpression) {
        exprs.push(el.config.functionExpression);
      }
    }
  }

  if (exprs.length) {
    return exprs.map((expr, i) => ({
      series: [
        { points: sampleFunction(expr, -5, 5, 200), color: '#6366f1', label: `f(x) = ${expr}`, width: 2.5 },
      ],
      title: `Graph of f(x) = ${expr}`,
      xLabel: 'x',
      yLabel: 'f(x)',
    }));
  }

  // Last resort: generate something reasonable based on region
  const regionId: string = lesson.regionId || '';
  if (regionId.includes('limit')) return [graphLimitHole()];
  if (regionId.includes('deriv')) return [graphTangentLine()];
  if (regionId.includes('integral') || regionId.includes('atelier')) return [graphDefiniteIntegral()];
  if (regionId.includes('series') || regionId.includes('amphitheater')) return [graphSequences()];

  // True fallback
  return [{
    series: [{ points: sampleFunction('x^2', -3, 3, 150), color: '#6366f1', label: 'f(x) = x²', width: 2 }],
    title: 'f(x) = x²',
    xLabel: 'x',
    yLabel: 'f(x)',
  }];
}

/**
 * Get a graph for a specific concept section index within a lesson.
 */
export function getGraphForSection(lesson: any, sectionIndex: number): GraphData {
  const graphs = getGraphsForLesson(lesson);
  return graphs[sectionIndex % graphs.length];
}
