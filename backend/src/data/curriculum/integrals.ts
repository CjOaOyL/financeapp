// ============================================================
// Harmonia — Region 3: The Integral Atelier — Full Curriculum
// ============================================================

import {
  Lesson, Problem, BossBattle, CalcTopic, Region, CharacterId,
  Difficulty, ProblemType,
} from '../../models/types';

// ----------------------------------------------------------------
// LESSON 3.1: Introduction to Antiderivatives
// ----------------------------------------------------------------

export const antiderivativesLesson: Lesson = {
  id: 'lesson-3-1',
  topicId: CalcTopic.ANTIDERIVATIVES,
  regionId: Region.INTEGRAL_ATELIER,
  title: 'The Original Sketch — Introduction to Antiderivatives',
  order: 1,
  characterId: CharacterId.IRIS,
  prerequisites: [CalcTopic.BASIC_DIFF_RULES],
  xpReward: 25,

  conceptExplanation: [
    {
      id: 'concept-3-1-1',
      title: 'What Is an Antiderivative?',
      dialogue: [
        {
          characterId: CharacterId.IRIS,
          text: 'Welcome to my Atelier, dear Resonant! I am Iris, and I paint with mathematics.',
          emotion: 'encouraging',
        },
        {
          characterId: CharacterId.IRIS,
          text: 'Look at this finished painting — it\'s actually a derivative, the rate of change. But what was the ORIGINAL sketch that led to it?',
          emotion: 'thoughtful',
        },
        {
          characterId: CharacterId.IRIS,
          text: 'Finding the original from its derivative — that\'s called finding the ANTIDERIVATIVE. We reverse the process of differentiation!',
          emotion: 'excited',
          latex: '\\int f(x)\\,dx = F(x) + C \\quad \\text{where } F\'(x) = f(x)',
        },
        {
          characterId: CharacterId.IRIS,
          text: 'And don\'t forget the +C, darling. Many different sketches could have led to the same painting — each one shifted up or down!',
          emotion: 'encouraging',
        },
      ],
      mathContent: [
        {
          type: 'definition',
          title: 'Antiderivative',
          latex: 'F(x) \\text{ is an antiderivative of } f(x) \\text{ if } F\'(x) = f(x)',
          explanation: 'An antiderivative is a function whose derivative equals the given function.',
        },
        {
          type: 'definition',
          title: 'Indefinite Integral',
          latex: '\\int f(x)\\,dx = F(x) + C',
          explanation: 'The indefinite integral represents the family of ALL antiderivatives, differing by a constant C.',
        },
        {
          type: 'formula',
          title: 'Power Rule for Integration',
          latex: '\\int x^n\\,dx = \\frac{x^{n+1}}{n+1} + C \\quad (n \\neq -1)',
          explanation: 'The reverse of the power rule for differentiation: increase the exponent by 1 and divide by the new exponent.',
        },
        {
          type: 'formula',
          title: 'Common Antiderivatives',
          latex: '\\begin{aligned} &\\int k\\,dx = kx + C \\\\ &\\int \\cos(x)\\,dx = \\sin(x) + C \\\\ &\\int \\sin(x)\\,dx = -\\cos(x) + C \\\\ &\\int e^x\\,dx = e^x + C \\\\ &\\int \\frac{1}{x}\\,dx = \\ln|x| + C \\end{aligned}',
          explanation: 'Memorize these fundamental antiderivatives — they are the colors on your palette!',
        },
      ],
    },
  ],

  visualMetaphor: {
    description: 'Iris shows a completed painting (the derivative f\'(x)). She challenges you to discover the original sketch (the antiderivative F(x)). Multiple possible originals appear, each shifted vertically (+C), all equally valid.',
    animationType: 'painting',
    parameters: {
      derivativeCurve: '2x',
      antiderivativeFamily: ['x^2', 'x^2 + 1', 'x^2 - 3', 'x^2 + 5'],
      colorPalette: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4'],
    },
  },

  workedExamples: [
    {
      id: 'ex-3-1-1',
      problemStatement: 'Find the indefinite integral of x² + 3x - 1.',
      problemLatex: '\\int (x^2 + 3x - 1)\\,dx',
      steps: [
        {
          stepNumber: 1,
          description: 'Integrate term by term using the power rule',
          latex: '\\int x^2\\,dx + \\int 3x\\,dx - \\int 1\\,dx',
        },
        {
          stepNumber: 2,
          description: 'Apply power rule to each term',
          latex: '\\frac{x^3}{3} + \\frac{3x^2}{2} - x + C',
        },
      ],
      finalAnswer: 'x³/3 + 3x²/2 - x + C',
      finalAnswerLatex: '\\frac{x^3}{3} + \\frac{3x^2}{2} - x + C',
    },
    {
      id: 'ex-3-1-2',
      problemStatement: 'Find the indefinite integral of cos(x) + eˣ.',
      problemLatex: '\\int (\\cos(x) + e^x)\\,dx',
      steps: [
        {
          stepNumber: 1,
          description: 'Integrate each term using known antiderivatives',
          latex: '\\int \\cos(x)\\,dx + \\int e^x\\,dx',
        },
        {
          stepNumber: 2,
          description: 'Apply formulas',
          latex: '\\sin(x) + e^x + C',
        },
      ],
      finalAnswer: 'sin(x) + eˣ + C',
      finalAnswerLatex: '\\sin(x) + e^x + C',
    },
  ],

  practiceProblems: [
    {
      id: 'prob-3-1-01',
      topicId: CalcTopic.ANTIDERIVATIVES,
      type: ProblemType.EXPRESSION_INPUT,
      difficulty: Difficulty.ANDANTE,
      statement: 'Find the indefinite integral.',
      statementLatex: '\\int 5x^4\\,dx',
      correctAnswer: 'x^5 + C',
      correctAnswerLatex: 'x^5 + C',
      hints: ['Power rule: increase exponent by 1, divide by new exponent.', '5 × x⁵/5 = x⁵'],
      detailedSolution: [
        { stepNumber: 1, description: 'Power rule', latex: '\\frac{5x^5}{5} + C = x^5 + C' },
      ],
      xpReward: 5,
      tags: ['power-rule', 'basic-integration'],
      artContext: 'Iris needs to find the original sketch that, when differentiated, produces 5x⁴ brushstrokes.',
    },
    {
      id: 'prob-3-1-02',
      topicId: CalcTopic.ANTIDERIVATIVES,
      type: ProblemType.EXPRESSION_INPUT,
      difficulty: Difficulty.MODERATO,
      statement: 'Find the indefinite integral.',
      statementLatex: '\\int (3x^2 - 4x + 7)\\,dx',
      correctAnswer: 'x^3 - 2x^2 + 7x + C',
      correctAnswerLatex: 'x^3 - 2x^2 + 7x + C',
      hints: ['Integrate term by term.'],
      detailedSolution: [
        { stepNumber: 1, description: 'Term by term', latex: '\\frac{3x^3}{3} - \\frac{4x^2}{2} + 7x + C = x^3 - 2x^2 + 7x + C' },
      ],
      xpReward: 8,
      tags: ['power-rule', 'sum-rule'],
    },
    {
      id: 'prob-3-1-03',
      topicId: CalcTopic.ANTIDERIVATIVES,
      type: ProblemType.EXPRESSION_INPUT,
      difficulty: Difficulty.MODERATO,
      statement: 'Find the indefinite integral.',
      statementLatex: '\\int \\sin(x)\\,dx',
      correctAnswer: '-cos(x) + C',
      correctAnswerLatex: '-\\cos(x) + C',
      hints: ['What function has sin(x) as its derivative? Remember the negative sign!'],
      detailedSolution: [
        { stepNumber: 1, description: 'Known antiderivative', latex: '-\\cos(x) + C' },
      ],
      xpReward: 5,
      tags: ['trig-integration'],
    },
    {
      id: 'prob-3-1-04',
      topicId: CalcTopic.ANTIDERIVATIVES,
      type: ProblemType.EXPRESSION_INPUT,
      difficulty: Difficulty.ALLEGRO,
      statement: 'Find the indefinite integral.',
      statementLatex: '\\int \\left(\\frac{2}{\\sqrt{x}} + \\frac{1}{x}\\right)\\,dx',
      correctAnswer: '4*sqrt(x) + ln|x| + C',
      correctAnswerLatex: '4\\sqrt{x} + \\ln|x| + C',
      hints: [
        '2/√x = 2x^(-1/2). Apply power rule.',
        '∫ 1/x dx = ln|x| + C',
      ],
      detailedSolution: [
        { stepNumber: 1, description: 'Rewrite', latex: '\\int (2x^{-1/2} + x^{-1})\\,dx' },
        { stepNumber: 2, description: 'Integrate', latex: '2 \\cdot \\frac{x^{1/2}}{1/2} + \\ln|x| + C = 4\\sqrt{x} + \\ln|x| + C' },
      ],
      xpReward: 12,
      tags: ['rewrite', 'ln-integral'],
    },
    {
      id: 'prob-3-1-05',
      topicId: CalcTopic.ANTIDERIVATIVES,
      type: ProblemType.TRUE_FALSE,
      difficulty: Difficulty.ANDANTE,
      statement: 'True or False: Two different antiderivatives of the same function can differ by a constant.',
      statementLatex: '\\text{If } F\'(x) = G\'(x) = f(x), \\text{ then } F(x) - G(x) = C',
      correctAnswer: 'true',
      hints: ['If two functions have the same derivative, what does that say about their difference?'],
      detailedSolution: [
        { stepNumber: 1, description: 'True! If F\'=G\'=f, then (F-G)\'=0, so F-G=constant', latex: '(F-G)\' = 0 \\Rightarrow F - G = C' },
      ],
      xpReward: 5,
      tags: ['conceptual', '+C'],
      artContext: 'Every painting (+C) by Iris starts from a slightly different shade of white, but the brushstrokes (derivative) are identical.',
    },
  ],

  creativeTask: {
    id: 'creative-3-1',
    topicId: CalcTopic.ANTIDERIVATIVES,
    title: 'Find the Sketch',
    description: 'Given a derivative "painting," discover and draw the original function! Explore how +C shifts the family of solutions.',
    type: 'canvas-painter',
    instructions: [
      'View the derivative function displayed as a colorful curve',
      'Draw what you think the antiderivative looks like',
      'Slide the +C slider to shift your sketch up and down',
      'Compare your sketch to the actual antiderivative family',
    ],
    constraints: { maxAttempts: 3, showHintAfterAttempt: 2 },
    xpReward: 20,
    evaluationCriteria: ['Shape of antiderivative is approximately correct', 'Student experiments with different C values'],
  },
};

// ----------------------------------------------------------------
// LESSON 3.2: Definite Integrals and Area
// ----------------------------------------------------------------

export const definiteIntegralsLesson: Lesson = {
  id: 'lesson-3-2',
  topicId: CalcTopic.DEFINITE_INTEGRALS_AREA,
  regionId: Region.INTEGRAL_ATELIER,
  title: 'Paint the Area — Definite Integrals',
  order: 2,
  characterId: CharacterId.IRIS,
  prerequisites: [CalcTopic.ANTIDERIVATIVES],
  xpReward: 30,

  conceptExplanation: [
    {
      id: 'concept-3-2-1',
      title: 'The Definite Integral',
      dialogue: [
        {
          characterId: CharacterId.IRIS,
          text: 'Now we come to the REAL magic of integration — calculating AREA. Look at this curve. The space between it and the x-axis? I\'m going to PAINT it!',
          emotion: 'excited',
        },
        {
          characterId: CharacterId.IRIS,
          text: 'We do this with a definite integral — it has limits (boundaries) telling us WHERE to paint:',
          emotion: 'neutral',
          latex: '\\int_a^b f(x)\\,dx = \\text{signed area under } f \\text{ from } a \\text{ to } b',
        },
        {
          characterId: CharacterId.IRIS,
          text: 'The idea starts with Riemann sums — painting with tiny rectangular strips that approximate the area. The more strips we use, the more precise our painting becomes!',
          emotion: 'thoughtful',
        },
      ],
      mathContent: [
        {
          type: 'definition',
          title: 'Riemann Sum',
          latex: '\\sum_{i=1}^{n} f(x_i^*) \\Delta x \\approx \\int_a^b f(x)\\,dx',
          explanation: 'Divide [a,b] into n strips of width Δx. The sum of rectangle areas approximates the integral. As n → ∞, the sum equals the integral.',
        },
        {
          type: 'definition',
          title: 'Definite Integral',
          latex: '\\int_a^b f(x)\\,dx = \\lim_{n \\to \\infty} \\sum_{i=1}^{n} f(x_i^*) \\Delta x',
          explanation: 'The definite integral is the exact area (with sign) under the curve from a to b.',
        },
        {
          type: 'note',
          latex: '\\text{Area above x-axis is positive; area below is negative}',
          explanation: 'The definite integral gives "signed area" — regions below the x-axis contribute negative values.',
        },
      ],
      interactiveElements: [
        {
          type: 'slider',
          id: 'riemann-sum-slider',
          label: 'Increase the number of rectangles and watch the approximation improve',
          config: {
            min: 1,
            max: 100,
            step: 1,
            functionExpression: 'x^2',
            lowerBound: 0,
            upperBound: 2,
            sumType: 'left|right|midpoint',
          },
        },
      ],
    },
  ],

  visualMetaphor: {
    description: 'Iris paints the area under a curve in real-time. She starts with wide, rough brushstrokes (few rectangles/Riemann sum) and progressively refines to thinner, more precise strokes. The final result is a perfectly filled region.',
    animationType: 'painting',
    parameters: {
      initialStrokes: 4,
      finalStrokes: 100,
      fillAnimation: 'progressive-refinement',
      colorGradient: ['#FF6B6B', '#FFA07A', '#FFD700'],
    },
  },

  workedExamples: [
    {
      id: 'ex-3-2-1',
      problemStatement: 'Evaluate the definite integral of x² from 0 to 2.',
      problemLatex: '\\int_0^2 x^2\\,dx',
      steps: [
        {
          stepNumber: 1,
          description: 'Find the antiderivative',
          latex: 'F(x) = \\frac{x^3}{3}',
        },
        {
          stepNumber: 2,
          description: 'Apply the Fundamental Theorem of Calculus',
          latex: '\\int_0^2 x^2\\,dx = F(2) - F(0) = \\frac{2^3}{3} - \\frac{0^3}{3}',
        },
        {
          stepNumber: 3,
          description: 'Calculate',
          latex: '= \\frac{8}{3} - 0 = \\frac{8}{3}',
        },
      ],
      finalAnswer: '8/3',
      finalAnswerLatex: '\\frac{8}{3}',
    },
  ],

  practiceProblems: [
    {
      id: 'prob-3-2-01',
      topicId: CalcTopic.DEFINITE_INTEGRALS_AREA,
      type: ProblemType.NUMERIC_INPUT,
      difficulty: Difficulty.ANDANTE,
      statement: 'Evaluate the definite integral.',
      statementLatex: '\\int_1^3 2x\\,dx',
      correctAnswer: '8',
      correctAnswerLatex: '8',
      tolerance: 0.01,
      hints: ['Antiderivative of 2x is x².', 'F(3) - F(1) = 9 - 1 = 8'],
      detailedSolution: [
        { stepNumber: 1, description: 'Antiderivative', latex: 'F(x) = x^2' },
        { stepNumber: 2, description: 'Evaluate', latex: 'F(3) - F(1) = 9 - 1 = 8' },
      ],
      xpReward: 5,
      tags: ['definite-integral', 'power-rule'],
      artContext: 'How much paint does Iris need to fill the region under 2x from x=1 to x=3?',
    },
    {
      id: 'prob-3-2-02',
      topicId: CalcTopic.DEFINITE_INTEGRALS_AREA,
      type: ProblemType.NUMERIC_INPUT,
      difficulty: Difficulty.MODERATO,
      statement: 'Evaluate the definite integral.',
      statementLatex: '\\int_0^{\\pi} \\sin(x)\\,dx',
      correctAnswer: '2',
      correctAnswerLatex: '2',
      tolerance: 0.01,
      hints: ['Antiderivative of sin(x) is -cos(x).', '-cos(π) - (-cos(0)) = -(-1) - (-1) = 2'],
      detailedSolution: [
        { stepNumber: 1, description: 'Antiderivative', latex: 'F(x) = -\\cos(x)' },
        { stepNumber: 2, description: 'Evaluate', latex: '-\\cos(\\pi) - (-\\cos(0)) = 1 + 1 = 2' },
      ],
      xpReward: 8,
      tags: ['definite-integral', 'trig'],
    },
    {
      id: 'prob-3-2-03',
      topicId: CalcTopic.DEFINITE_INTEGRALS_AREA,
      type: ProblemType.NUMERIC_INPUT,
      difficulty: Difficulty.ALLEGRO,
      statement: 'Find the area between y = x² and y = x from x = 0 to x = 1.',
      statementLatex: '\\int_0^1 (x - x^2)\\,dx',
      correctAnswer: '0.1667',
      correctAnswerLatex: '\\frac{1}{6}',
      tolerance: 0.01,
      hints: [
        'On [0,1], x ≥ x², so the area is ∫(x - x²)dx.',
        'Antiderivative: x²/2 - x³/3',
      ],
      detailedSolution: [
        { stepNumber: 1, description: 'Antiderivative', latex: '\\frac{x^2}{2} - \\frac{x^3}{3}' },
        { stepNumber: 2, description: 'Evaluate at bounds', latex: '\\left(\\frac{1}{2} - \\frac{1}{3}\\right) - 0 = \\frac{1}{6}' },
      ],
      xpReward: 12,
      tags: ['area-between-curves'],
      artContext: 'The crescent-shaped region between these two curves forms the outline of Iris\'s signature brushstroke.',
    },
  ],

  creativeTask: {
    id: 'creative-3-2',
    topicId: CalcTopic.DEFINITE_INTEGRALS_AREA,
    title: 'Paint the Area',
    description: 'Shade regions under curves to create pixel art! Each region you correctly integrate adds color to the canvas.',
    type: 'canvas-painter',
    instructions: [
      'Choose a function and bounds [a, b]',
      'Watch as the area fills with your chosen color',
      'Combine multiple integrals to build a picture',
      'Calculate each area to verify your painting',
    ],
    constraints: { maxRegions: 8, availableFunctions: ['x^2', 'sqrt(x)', 'sin(x)', 'cos(x)', 'x^3'] },
    xpReward: 25,
    evaluationCriteria: ['Correctly evaluates definite integrals', 'Creates a recognizable image'],
  },
};

// ----------------------------------------------------------------
// BOSS BATTLE: The Blank Canvas Colossus
// ----------------------------------------------------------------

export const blankCanvasColossusBoss: BossBattle = {
  id: 'boss-integrals',
  regionId: Region.INTEGRAL_ATELIER,
  bossName: 'The Blank Canvas Colossus',
  bossCharacterId: CharacterId.THE_STATIC,
  description: 'A towering, featureless white sculpture that absorbs all color. Defeat it by calculating integrals to paint its surface — fill it completely to seal it!',
  totalXpReward: 250,

  phases: [
    {
      phaseNumber: 1,
      title: 'Base Coat',
      description: 'Evaluate basic integrals to apply the first layers of color!',
      bossHealthPerPhase: 100,
      playerDamagePerCorrect: 25,
      bossDamagePerIncorrect: 15,
      timeLimit: 120,
      dialogue: [
        {
          characterId: CharacterId.THE_STATIC,
          text: 'BLANK... EMPTY... There is nothing to accumulate here!',
          emotion: 'dramatic',
        },
        {
          characterId: CharacterId.IRIS,
          text: 'We\'ll fill you with color, Colossus! Every integral adds another layer!',
          emotion: 'encouraging',
        },
      ],
      problems: [
        {
          id: 'boss-3-p1-01',
          topicId: CalcTopic.DEFINITE_INTEGRALS_AREA,
          type: ProblemType.NUMERIC_INPUT,
          difficulty: Difficulty.MODERATO,
          statement: 'Paint the first section! Evaluate:',
          statementLatex: '\\int_0^3 (x^2 + 1)\\,dx',
          correctAnswer: '12',
          tolerance: 0.01,
          hints: ['Antiderivative: x³/3 + x'],
          detailedSolution: [
            { stepNumber: 1, description: 'Antiderivative', latex: '\\frac{x^3}{3} + x' },
            { stepNumber: 2, description: 'Evaluate', latex: '(9 + 3) - (0 + 0) = 12' },
          ],
          xpReward: 20,
          tags: ['boss', 'definite-integral'],
        },
      ],
    },
    {
      phaseNumber: 2,
      title: 'Substitution Strokes',
      description: 'Use u-substitution to decode the Colossus\'s armor patterns!',
      bossHealthPerPhase: 120,
      playerDamagePerCorrect: 30,
      bossDamagePerIncorrect: 20,
      timeLimit: 120,
      dialogue: [
        {
          characterId: CharacterId.THE_STATIC,
          text: 'My patterns are NESTED! You cannot unwrap me!',
          emotion: 'dramatic',
        },
      ],
      problems: [
        {
          id: 'boss-3-p2-01',
          topicId: CalcTopic.U_SUBSTITUTION,
          type: ProblemType.NUMERIC_INPUT,
          difficulty: Difficulty.ALLEGRO,
          statement: 'Decode the pattern! Evaluate using u-substitution:',
          statementLatex: '\\int_0^1 2x \\cdot e^{x^2}\\,dx',
          correctAnswer: '1.7183',
          correctAnswerLatex: 'e - 1',
          tolerance: 0.05,
          hints: [
            'Let u = x². Then du = 2x dx.',
            'When x=0, u=0. When x=1, u=1.',
            '∫₀¹ eᵘ du = e¹ - e⁰ = e - 1',
          ],
          detailedSolution: [
            { stepNumber: 1, description: 'Substitution', latex: 'u = x^2, \\quad du = 2x\\,dx' },
            { stepNumber: 2, description: 'Transform', latex: '\\int_0^1 e^u\\,du = e^1 - e^0 = e - 1' },
          ],
          xpReward: 25,
          tags: ['boss', 'u-substitution'],
        },
      ],
    },
    {
      phaseNumber: 3,
      title: 'The Volume Seal',
      description: 'Calculate the volume to seal the Colossus in a crystalline sculpture!',
      bossHealthPerPhase: 80,
      playerDamagePerCorrect: 40,
      bossDamagePerIncorrect: 25,
      timeLimit: 120,
      dialogue: [
        {
          characterId: CharacterId.IRIS,
          text: 'We need to encase it! Calculate the exact volume of revolution!',
          emotion: 'excited',
        },
      ],
      problems: [
        {
          id: 'boss-3-p3-01',
          topicId: CalcTopic.INTEGRAL_APPLICATIONS,
          type: ProblemType.NUMERIC_INPUT,
          difficulty: Difficulty.ALLEGRO,
          statement: 'Find the volume of the solid formed by revolving y = x² around the x-axis from x=0 to x=2.',
          statementLatex: 'V = \\pi\\int_0^2 (x^2)^2\\,dx = \\pi\\int_0^2 x^4\\,dx',
          correctAnswer: '20.1062',
          correctAnswerLatex: '\\frac{32\\pi}{5}',
          tolerance: 0.1,
          hints: [
            'Disk method: V = π ∫[r(x)]² dx',
            '∫₀² x⁴ dx = x⁵/5 evaluated from 0 to 2 = 32/5',
          ],
          detailedSolution: [
            { stepNumber: 1, description: 'Set up', latex: 'V = \\pi \\int_0^2 x^4\\,dx' },
            { stepNumber: 2, description: 'Integrate', latex: '= \\pi \\left[\\frac{x^5}{5}\\right]_0^2 = \\frac{32\\pi}{5}' },
          ],
          xpReward: 30,
          tags: ['boss', 'volume-of-revolution'],
        },
      ],
    },
  ],

  defeatDialogue: [
    {
      characterId: CharacterId.THE_STATIC,
      text: 'Color... everywhere... I am... filled... contained...',
      emotion: 'dramatic',
    },
  ],
  victoryDialogue: [
    {
      characterId: CharacterId.IRIS,
      text: 'Beautiful! Look at what you\'ve created — a masterpiece of accumulation! The Font of Accumulation is restored!',
      emotion: 'excited',
    },
    {
      characterId: CharacterId.IRIS,
      text: 'You\'ve earned the Integral Sight ability. You can now see areas and volumes everywhere in Harmonia.',
      emotion: 'encouraging',
    },
  ],
};

// ---- Exports ----

export const integralsLessons: Lesson[] = [
  antiderivativesLesson,
  definiteIntegralsLesson,
  // FTC, u-substitution, integration by parts, applications follow same pattern
];

export const integralsBoss = blankCanvasColossusBoss;
