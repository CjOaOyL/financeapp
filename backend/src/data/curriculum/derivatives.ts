// ============================================================
// Harmonia — Region 2: The Derivative Conservatory — Full Curriculum
// ============================================================

import {
  Lesson, Problem, BossBattle, CalcTopic, Region, CharacterId,
  Difficulty, ProblemType,
} from '../../models/types';

// ----------------------------------------------------------------
// LESSON 2.1: Introduction to Derivatives (Tangent Line)
// ----------------------------------------------------------------

export const tangentLineLesson: Lesson = {
  id: 'lesson-2-1',
  topicId: CalcTopic.TANGENT_LINE_INTRO,
  regionId: Region.DERIVATIVE_CONSERVATORY,
  title: 'The Tangent Line — Introduction to Derivatives',
  order: 1,
  characterId: CharacterId.MAESTRO_FORTE,
  prerequisites: [CalcTopic.INTRO_TO_LIMITS],
  xpReward: 25,

  conceptExplanation: [
    {
      id: 'concept-2-1-1',
      title: 'The Rate of Change',
      dialogue: [
        {
          characterId: CharacterId.MAESTRO_FORTE,
          text: 'Welcome to my Conservatory, young Resonant! I am Maestro Forte, and I will teach you the SOUL of mathematics — the DERIVATIVE!',
          emotion: 'dramatic',
        },
        {
          characterId: CharacterId.MAESTRO_FORTE,
          text: 'Listen to this melody... *plays ascending notes* ...The pitch is RISING. But HOW FAST? That rate of change — THAT is the derivative!',
          emotion: 'excited',
        },
        {
          characterId: CharacterId.MAESTRO_FORTE,
          text: 'Geometrically, the derivative at a point is the slope of the TANGENT LINE at that point.',
          emotion: 'neutral',
          latex: 'f\'(a) = \\lim_{h \\to 0} \\frac{f(a+h) - f(a)}{h}',
        },
      ],
      mathContent: [
        {
          type: 'definition',
          title: 'The Derivative (Limit Definition)',
          latex: 'f\'(x) = \\lim_{h \\to 0} \\frac{f(x+h) - f(x)}{h}',
          explanation: 'The derivative of f at x is defined as this limit, provided it exists. It represents the instantaneous rate of change of f at x.',
        },
        {
          type: 'definition',
          title: 'Alternative Definition',
          latex: 'f\'(a) = \\lim_{x \\to a} \\frac{f(x) - f(a)}{x - a}',
          explanation: 'Equivalent definition: the limit of the difference quotient as x approaches a.',
        },
        {
          type: 'note',
          latex: '\\text{Notation: } f\'(x) = \\frac{dy}{dx} = \\frac{df}{dx} = Df(x)',
          explanation: 'There are many ways to denote the derivative. f\'(x) (Lagrange) and dy/dx (Leibniz) are most common.',
        },
      ],
      interactiveElements: [
        {
          type: 'draggable-point',
          id: 'tangent-line-explorer',
          label: 'Drag the point along the curve to see how the tangent line changes',
          config: {
            functionExpression: 'x^2',
            domain: [-3, 3],
            showSecantLine: true,
            showTangentLine: true,
            audioFeedback: true, // Pitch changes with slope
          },
        },
      ],
    },
    {
      id: 'concept-2-1-2',
      title: 'From Secant to Tangent',
      dialogue: [
        {
          characterId: CharacterId.MAESTRO_FORTE,
          text: 'Watch! This secant line connects two points on our melody curve. As I bring the second point closer to the first...',
          emotion: 'thoughtful',
        },
        {
          characterId: CharacterId.MAESTRO_FORTE,
          text: 'The secant becomes the tangent! The average rate of change becomes the INSTANTANEOUS rate! *dramatic chord*',
          emotion: 'dramatic',
        },
      ],
      mathContent: [
        {
          type: 'formula',
          title: 'Average vs. Instantaneous Rate',
          latex: '\\text{Average: } \\frac{f(b)-f(a)}{b-a} \\quad \\xrightarrow{b \\to a} \\quad \\text{Instantaneous: } f\'(a)',
          explanation: 'The average rate of change over an interval [a,b] becomes the instantaneous rate as the interval shrinks to a single point.',
        },
      ],
    },
  ],

  visualMetaphor: {
    description: 'Maestro Forte\'s baton traces a curve on a musical staff. As he moves his baton along the curve, a tangent line appears and rotates — its slope is rendered as a musical pitch that changes in real time. Steeper positive slope = higher pitch. Zero slope = middle C. Negative slope = lower pitch.',
    animationType: 'music',
    parameters: {
      curveFunction: 'sin(x)',
      pitchMapping: 'slope-to-frequency',
      baseFrequency: 261.63, // Middle C
      slopeScale: 100,
    },
  },

  workedExamples: [
    {
      id: 'ex-2-1-1',
      problemStatement: 'Find f\'(x) for f(x) = x² using the limit definition.',
      problemLatex: 'f(x) = x^2, \\quad f\'(x) = \\lim_{h \\to 0} \\frac{f(x+h)-f(x)}{h}',
      steps: [
        {
          stepNumber: 1,
          description: 'Write f(x+h)',
          latex: 'f(x+h) = (x+h)^2 = x^2 + 2xh + h^2',
        },
        {
          stepNumber: 2,
          description: 'Form the difference quotient',
          latex: '\\frac{f(x+h)-f(x)}{h} = \\frac{x^2+2xh+h^2-x^2}{h} = \\frac{2xh+h^2}{h}',
        },
        {
          stepNumber: 3,
          description: 'Simplify',
          latex: '= \\frac{h(2x+h)}{h} = 2x + h',
        },
        {
          stepNumber: 4,
          description: 'Take the limit as h → 0',
          latex: 'f\'(x) = \\lim_{h \\to 0} (2x + h) = 2x',
        },
      ],
      finalAnswer: 'f\'(x) = 2x',
      finalAnswerLatex: 'f\'(x) = 2x',
    },
    {
      id: 'ex-2-1-2',
      problemStatement: 'Find the equation of the tangent line to y = x² at x = 3.',
      problemLatex: 'y = x^2 \\text{ at } x = 3',
      steps: [
        {
          stepNumber: 1,
          description: 'Find the point: f(3) = 9, so the point is (3, 9)',
          latex: 'f(3) = 3^2 = 9 \\Rightarrow (3, 9)',
        },
        {
          stepNumber: 2,
          description: 'Find the slope: f\'(x) = 2x, so f\'(3) = 6',
          latex: 'f\'(3) = 2(3) = 6',
        },
        {
          stepNumber: 3,
          description: 'Use point-slope form',
          latex: 'y - 9 = 6(x - 3) \\Rightarrow y = 6x - 9',
        },
      ],
      finalAnswer: 'y = 6x - 9',
      finalAnswerLatex: 'y = 6x - 9',
    },
    {
      id: 'ex-2-1-3',
      problemStatement: 'Find f\'(2) for f(x) = 1/x using the limit definition.',
      problemLatex: 'f(x) = \\frac{1}{x}, \\quad f\'(2) = ?',
      steps: [
        {
          stepNumber: 1,
          description: 'Write the difference quotient at x = 2',
          latex: '\\frac{f(2+h)-f(2)}{h} = \\frac{\\frac{1}{2+h}-\\frac{1}{2}}{h}',
        },
        {
          stepNumber: 2,
          description: 'Combine fractions in numerator',
          latex: '= \\frac{\\frac{2-(2+h)}{2(2+h)}}{h} = \\frac{-h}{2h(2+h)}',
        },
        {
          stepNumber: 3,
          description: 'Simplify',
          latex: '= \\frac{-1}{2(2+h)}',
        },
        {
          stepNumber: 4,
          description: 'Take the limit',
          latex: 'f\'(2) = \\lim_{h \\to 0} \\frac{-1}{2(2+h)} = \\frac{-1}{4}',
        },
      ],
      finalAnswer: '-1/4',
      finalAnswerLatex: 'f\'(2) = -\\frac{1}{4}',
    },
  ],

  practiceProblems: generateDerivativePracticeProblems(),

  creativeTask: {
    id: 'creative-2-1',
    topicId: CalcTopic.TANGENT_LINE_INTRO,
    title: 'Conduct the Slope',
    description: 'Move Maestro Forte\'s baton along a function curve and listen to the derivative as changing pitch!',
    type: 'melody-maker',
    instructions: [
      'Select a function from the gallery',
      'Drag the baton along the curve',
      'Listen as the pitch changes with the slope',
      'Positive slope = ascending pitch, negative = descending',
      'Find the critical points where the pitch is at middle C (slope = 0)',
    ],
    constraints: { functions: ['x^2', 'sin(x)', 'x^3 - 3*x'] },
    xpReward: 20,
    evaluationCriteria: [
      'Identifies critical points (slope = 0) correctly',
      'Recognizes intervals of positive vs negative slope',
    ],
  },
};

function generateDerivativePracticeProblems(): Problem[] {
  return [
    {
      id: 'prob-2-1-01',
      topicId: CalcTopic.TANGENT_LINE_INTRO,
      type: ProblemType.NUMERIC_INPUT,
      difficulty: Difficulty.ANDANTE,
      statement: 'Find f\'(x) for f(x) = 3x using the limit definition.',
      statementLatex: 'f(x) = 3x, \\quad f\'(x) = ?',
      correctAnswer: '3',
      correctAnswerLatex: '3',
      tolerance: 0.01,
      hints: [
        'f(x+h) = 3(x+h) = 3x + 3h',
        '[f(x+h) - f(x)]/h = 3h/h = 3',
      ],
      detailedSolution: [
        { stepNumber: 1, description: 'Difference quotient', latex: '\\frac{3(x+h)-3x}{h} = \\frac{3h}{h} = 3' },
        { stepNumber: 2, description: 'Take limit', latex: '\\lim_{h \\to 0} 3 = 3' },
      ],
      xpReward: 5,
      tags: ['limit-definition', 'linear'],
      artContext: 'A melody climbing at a constant rate — what\'s the tempo of this steady ascent?',
    },
    {
      id: 'prob-2-1-02',
      topicId: CalcTopic.TANGENT_LINE_INTRO,
      type: ProblemType.EXPRESSION_INPUT,
      difficulty: Difficulty.MODERATO,
      statement: 'Find f\'(x) for f(x) = x³ using the limit definition.',
      statementLatex: 'f(x) = x^3, \\quad f\'(x) = ?',
      correctAnswer: '3x^2',
      correctAnswerLatex: '3x^2',
      hints: [
        '(x+h)³ = x³ + 3x²h + 3xh² + h³',
        'The difference quotient simplifies to 3x² + 3xh + h²',
      ],
      detailedSolution: [
        { stepNumber: 1, description: 'Expand', latex: '(x+h)^3 = x^3+3x^2h+3xh^2+h^3' },
        { stepNumber: 2, description: 'Difference quotient', latex: '\\frac{3x^2h+3xh^2+h^3}{h} = 3x^2+3xh+h^2' },
        { stepNumber: 3, description: 'Take limit', latex: '\\lim_{h \\to 0}(3x^2+3xh+h^2) = 3x^2' },
      ],
      xpReward: 10,
      tags: ['limit-definition', 'polynomial'],
    },
    {
      id: 'prob-2-1-03',
      topicId: CalcTopic.TANGENT_LINE_INTRO,
      type: ProblemType.EXPRESSION_INPUT,
      difficulty: Difficulty.MODERATO,
      statement: 'Find the equation of the tangent line to y = x² at x = -1.',
      statementLatex: 'y = x^2 \\text{ at } x = -1',
      correctAnswer: 'y = -2x - 1',
      correctAnswerLatex: 'y = -2x - 1',
      hints: [
        'Find the point: f(-1) = 1',
        'Find the slope: f\'(-1) = 2(-1) = -2',
        'Use point-slope form: y - 1 = -2(x - (-1))',
      ],
      detailedSolution: [
        { stepNumber: 1, description: 'Point', latex: '(-1, 1)' },
        { stepNumber: 2, description: 'Slope', latex: 'f\'(-1) = -2' },
        { stepNumber: 3, description: 'Tangent line', latex: 'y - 1 = -2(x+1) \\Rightarrow y = -2x - 1' },
      ],
      xpReward: 10,
      tags: ['tangent-line', 'point-slope'],
      artContext: 'What note does Forte\'s baton hit when he reaches this point in the melody?',
    },
    {
      id: 'prob-2-1-04',
      topicId: CalcTopic.TANGENT_LINE_INTRO,
      type: ProblemType.MULTIPLE_CHOICE,
      difficulty: Difficulty.ANDANTE,
      statement: 'What does the derivative f\'(a) represent geometrically?',
      statementLatex: 'f\'(a) = ?',
      options: [
        { id: 'a', text: 'The y-intercept of f at x = a', isCorrect: false },
        { id: 'b', text: 'The slope of the tangent line to f at x = a', isCorrect: true },
        { id: 'c', text: 'The area under f from 0 to a', isCorrect: false },
        { id: 'd', text: 'The average value of f near a', isCorrect: false },
      ],
      correctAnswer: 'b',
      hints: ['Think about what "instantaneous rate of change" looks like on a graph.'],
      detailedSolution: [
        { stepNumber: 1, description: 'The derivative at a point is the slope of the tangent line at that point', latex: 'f\'(a) = \\text{slope of tangent line at } x = a' },
      ],
      xpReward: 5,
      tags: ['conceptual'],
    },
    {
      id: 'prob-2-1-05',
      topicId: CalcTopic.TANGENT_LINE_INTRO,
      type: ProblemType.NUMERIC_INPUT,
      difficulty: Difficulty.ALLEGRO,
      statement: 'Find f\'(1) for f(x) = √x using the limit definition.',
      statementLatex: 'f(x) = \\sqrt{x}, \\quad f\'(1) = ?',
      correctAnswer: '0.5',
      correctAnswerLatex: '\\frac{1}{2}',
      tolerance: 0.01,
      hints: [
        'Difference quotient: (√(1+h) - 1)/h',
        'Rationalize by multiplying by (√(1+h)+1)/(√(1+h)+1)',
      ],
      detailedSolution: [
        { stepNumber: 1, description: 'Difference quotient', latex: '\\frac{\\sqrt{1+h}-1}{h}' },
        { stepNumber: 2, description: 'Rationalize', latex: '\\frac{(1+h)-1}{h(\\sqrt{1+h}+1)} = \\frac{1}{\\sqrt{1+h}+1}' },
        { stepNumber: 3, description: 'Take limit', latex: '\\frac{1}{1+1} = \\frac{1}{2}' },
      ],
      xpReward: 15,
      tags: ['limit-definition', 'rationalization'],
    },
  ];
}

// ----------------------------------------------------------------
// LESSON 2.2: Basic Differentiation Rules
// ----------------------------------------------------------------

export const basicDiffRulesLesson: Lesson = {
  id: 'lesson-2-2',
  topicId: CalcTopic.BASIC_DIFF_RULES,
  regionId: Region.DERIVATIVE_CONSERVATORY,
  title: 'Musical Scales — Basic Differentiation Rules',
  order: 2,
  characterId: CharacterId.MAESTRO_FORTE,
  prerequisites: [CalcTopic.TANGENT_LINE_INTRO],
  xpReward: 25,

  conceptExplanation: [
    {
      id: 'concept-2-2-1',
      title: 'The Power Rule',
      dialogue: [
        {
          characterId: CharacterId.MAESTRO_FORTE,
          text: 'Now we learn the shortcuts! Using the limit definition every time is like writing out every note by hand. The RULES let us compose at the speed of thought!',
          emotion: 'excited',
        },
        {
          characterId: CharacterId.MAESTRO_FORTE,
          text: 'The most powerful rule — the POWER RULE! Bring the exponent down and reduce it by one:',
          emotion: 'dramatic',
          latex: '\\frac{d}{dx}[x^n] = nx^{n-1}',
        },
      ],
      mathContent: [
        {
          type: 'theorem',
          title: 'The Power Rule',
          latex: '\\frac{d}{dx}[x^n] = nx^{n-1} \\quad \\text{for any real } n',
          explanation: 'Multiply by the exponent, then reduce the exponent by 1. Works for integers, fractions, negatives — any real power!',
        },
        {
          type: 'formula',
          title: 'Constant Rule',
          latex: '\\frac{d}{dx}[c] = 0',
          explanation: 'The derivative of any constant is zero. A flat melody has no change in pitch.',
        },
        {
          type: 'formula',
          title: 'Constant Multiple Rule',
          latex: '\\frac{d}{dx}[cf(x)] = c \\cdot f\'(x)',
          explanation: 'Constants can be "pulled out" of the derivative. Amplifying a melody doesn\'t change when the notes change.',
        },
        {
          type: 'formula',
          title: 'Sum/Difference Rule',
          latex: '\\frac{d}{dx}[f(x) \\pm g(x)] = f\'(x) \\pm g\'(x)',
          explanation: 'The derivative of a sum/difference is the sum/difference of derivatives. Differentiate each part of the harmony separately.',
        },
      ],
    },
  ],

  visualMetaphor: {
    description: 'Each differentiation rule is a musical scale. The Power Rule is a dramatic descending scale (bringing the exponent down). The Constant Rule is silence (no change). The Sum Rule is two instruments playing their derivatives independently.',
    animationType: 'music',
    parameters: {
      scaleType: 'major',
      ruleVisualization: 'animated-notation',
    },
  },

  workedExamples: [
    {
      id: 'ex-2-2-1',
      problemStatement: 'Differentiate f(x) = 5x⁴ - 3x² + 7x - 2.',
      problemLatex: 'f(x) = 5x^4 - 3x^2 + 7x - 2',
      steps: [
        {
          stepNumber: 1,
          description: 'Apply power rule to each term',
          latex: 'f\'(x) = 5 \\cdot 4x^3 - 3 \\cdot 2x + 7 \\cdot 1 - 0',
        },
        {
          stepNumber: 2,
          description: 'Simplify',
          latex: 'f\'(x) = 20x^3 - 6x + 7',
        },
      ],
      finalAnswer: '20x³ - 6x + 7',
      finalAnswerLatex: "f'(x) = 20x^3 - 6x + 7",
    },
    {
      id: 'ex-2-2-2',
      problemStatement: 'Differentiate g(x) = √x + 1/x².',
      problemLatex: 'g(x) = \\sqrt{x} + \\frac{1}{x^2} = x^{1/2} + x^{-2}',
      steps: [
        {
          stepNumber: 1,
          description: 'Rewrite using exponents',
          latex: 'g(x) = x^{1/2} + x^{-2}',
        },
        {
          stepNumber: 2,
          description: 'Apply power rule',
          latex: "g'(x) = \\frac{1}{2}x^{-1/2} + (-2)x^{-3}",
        },
        {
          stepNumber: 3,
          description: 'Rewrite in standard form',
          latex: "g'(x) = \\frac{1}{2\\sqrt{x}} - \\frac{2}{x^3}",
        },
      ],
      finalAnswer: '1/(2√x) - 2/x³',
      finalAnswerLatex: "g'(x) = \\frac{1}{2\\sqrt{x}} - \\frac{2}{x^3}",
    },
  ],

  practiceProblems: [
    {
      id: 'prob-2-2-01',
      topicId: CalcTopic.BASIC_DIFF_RULES,
      type: ProblemType.EXPRESSION_INPUT,
      difficulty: Difficulty.ANDANTE,
      statement: 'Differentiate.',
      statementLatex: 'f(x) = x^5',
      correctAnswer: '5x^4',
      correctAnswerLatex: '5x^4',
      hints: ['Power rule: bring down the 5, reduce exponent by 1.'],
      detailedSolution: [
        { stepNumber: 1, description: 'Power rule', latex: 'f\'(x) = 5x^4' },
      ],
      xpReward: 5,
      tags: ['power-rule'],
      artContext: 'The fifth harmonic of a vibrating string — what\'s its rate of change?',
    },
    {
      id: 'prob-2-2-02',
      topicId: CalcTopic.BASIC_DIFF_RULES,
      type: ProblemType.EXPRESSION_INPUT,
      difficulty: Difficulty.MODERATO,
      statement: 'Differentiate.',
      statementLatex: 'g(x) = 4x^3 - 2x^2 + x - 7',
      correctAnswer: '12x^2 - 4x + 1',
      correctAnswerLatex: '12x^2 - 4x + 1',
      hints: ['Apply the power rule to each term. The derivative of -7 is 0.'],
      detailedSolution: [
        { stepNumber: 1, description: 'Term by term', latex: "g'(x) = 12x^2 - 4x + 1 - 0" },
      ],
      xpReward: 8,
      tags: ['power-rule', 'sum-rule'],
    },
    {
      id: 'prob-2-2-03',
      topicId: CalcTopic.BASIC_DIFF_RULES,
      type: ProblemType.EXPRESSION_INPUT,
      difficulty: Difficulty.ALLEGRO,
      statement: 'Differentiate.',
      statementLatex: 'h(x) = \\frac{3}{x^4} + 2\\sqrt[3]{x}',
      correctAnswer: '-12/x^5 + 2/(3x^(2/3))',
      correctAnswerLatex: "h'(x) = -\\frac{12}{x^5} + \\frac{2}{3}x^{-2/3}",
      hints: [
        'Rewrite: 3/x⁴ = 3x⁻⁴ and ∛x = x^(1/3)',
        'Apply power rule to each',
      ],
      detailedSolution: [
        { stepNumber: 1, description: 'Rewrite', latex: 'h(x) = 3x^{-4} + 2x^{1/3}' },
        { stepNumber: 2, description: 'Differentiate', latex: "h'(x) = -12x^{-5} + \\frac{2}{3}x^{-2/3}" },
      ],
      xpReward: 12,
      tags: ['power-rule', 'rewrite'],
    },
  ],

  creativeTask: {
    id: 'creative-2-2',
    topicId: CalcTopic.BASIC_DIFF_RULES,
    title: 'Compose by Differentiating',
    description: 'Input a polynomial function and hear its derivative as a melody. Each coefficient becomes a note!',
    type: 'melody-maker',
    instructions: [
      'Enter a polynomial (e.g., 3x⁴ - 2x² + x)',
      'Watch as the derivative is computed step by step',
      'Listen to the original and derivative as two melodies',
      'Notice how the derivative melody is "one degree simpler"',
    ],
    constraints: { maxDegree: 6, maxCoefficient: 10 },
    xpReward: 20,
    evaluationCriteria: ['Correctly computes derivative', 'Creates a pleasing polynomial'],
  },
};

// ----------------------------------------------------------------
// BOSS BATTLE: The Tempo Tyrant
// ----------------------------------------------------------------

export const tempoTyrantBoss: BossBattle = {
  id: 'boss-derivatives',
  regionId: Region.DERIVATIVE_CONSERVATORY,
  bossName: 'The Tempo Tyrant',
  bossCharacterId: CharacterId.THE_STATIC,
  description: 'A corrupted conductor whose music changes chaotically. Its tempo shifts are derivative attacks — match them to survive!',
  totalXpReward: 250,

  phases: [
    {
      phaseNumber: 1,
      title: 'The Warming Up',
      description: 'Differentiate functions to match the Tyrant\'s tempo attacks!',
      bossHealthPerPhase: 100,
      playerDamagePerCorrect: 25,
      bossDamagePerIncorrect: 15,
      timeLimit: 120,
      dialogue: [
        {
          characterId: CharacterId.THE_STATIC,
          text: 'My tempo is UNDEFINED! You cannot keep up with CHAOS!',
          emotion: 'dramatic',
        },
        {
          characterId: CharacterId.MAESTRO_FORTE,
          text: 'Every tempo has a derivative, Resonant! Find it and you control the music!',
          emotion: 'encouraging',
        },
      ],
      problems: [
        {
          id: 'boss-2-p1-01',
          topicId: CalcTopic.BASIC_DIFF_RULES,
          type: ProblemType.EXPRESSION_INPUT,
          difficulty: Difficulty.MODERATO,
          statement: 'The Tyrant\'s tempo follows f(t) = 3t² - 4t + 1. Find the rate of tempo change f\'(t).',
          statementLatex: 'f(t) = 3t^2 - 4t + 1, \\quad f\'(t) = ?',
          correctAnswer: '6t - 4',
          correctAnswerLatex: '6t - 4',
          hints: ['Apply the power rule term by term.'],
          detailedSolution: [
            { stepNumber: 1, description: 'Differentiate', latex: "f'(t) = 6t - 4" },
          ],
          xpReward: 20,
          tags: ['boss', 'power-rule'],
        },
      ],
    },
    {
      phaseNumber: 2,
      title: 'Chain of Chaos',
      description: 'Apply the chain rule under pressure — the Tyrant nests functions within functions!',
      bossHealthPerPhase: 120,
      playerDamagePerCorrect: 30,
      bossDamagePerIncorrect: 20,
      timeLimit: 90,
      dialogue: [
        {
          characterId: CharacterId.THE_STATIC,
          text: 'A function WITHIN a function! An INFINITE regression of noise!',
          emotion: 'dramatic',
        },
      ],
      problems: [
        {
          id: 'boss-2-p2-01',
          topicId: CalcTopic.CHAIN_RULE,
          type: ProblemType.EXPRESSION_INPUT,
          difficulty: Difficulty.ALLEGRO,
          statement: 'Differentiate the Tyrant\'s nested tempo function.',
          statementLatex: 'g(t) = (2t + 1)^5, \\quad g\'(t) = ?',
          correctAnswer: '10(2t+1)^4',
          correctAnswerLatex: '10(2t+1)^4',
          hints: ['Chain rule: derivative of outside × derivative of inside.', 'Outside: u⁵ → 5u⁴. Inside: 2t+1 → 2.'],
          detailedSolution: [
            { stepNumber: 1, description: 'Chain rule', latex: "g'(t) = 5(2t+1)^4 \\cdot 2 = 10(2t+1)^4" },
          ],
          xpReward: 25,
          tags: ['boss', 'chain-rule'],
        },
      ],
    },
    {
      phaseNumber: 3,
      title: 'The Optimization Finale',
      description: 'Find the critical points to locate the Tyrant\'s weakness!',
      bossHealthPerPhase: 80,
      playerDamagePerCorrect: 40,
      bossDamagePerIncorrect: 25,
      timeLimit: 120,
      dialogue: [
        {
          characterId: CharacterId.MAESTRO_FORTE,
          text: 'Its power peaks at a maximum! Find the critical point where f\'(t) = 0!',
          emotion: 'excited',
        },
      ],
      problems: [
        {
          id: 'boss-2-p3-01',
          topicId: CalcTopic.DERIVATIVE_APPLICATIONS,
          type: ProblemType.NUMERIC_INPUT,
          difficulty: Difficulty.ALLEGRO,
          statement: 'The Tyrant\'s power is P(t) = -t² + 6t - 5. At what time t does its power peak?',
          statementLatex: 'P(t) = -t^2 + 6t - 5, \\quad P\'(t) = 0 \\text{ when } t = ?',
          correctAnswer: '3',
          correctAnswerLatex: 't = 3',
          tolerance: 0.01,
          hints: ['P\'(t) = -2t + 6. Set equal to 0 and solve.'],
          detailedSolution: [
            { stepNumber: 1, description: 'Differentiate', latex: "P'(t) = -2t + 6" },
            { stepNumber: 2, description: 'Set to zero', latex: '-2t + 6 = 0 \\Rightarrow t = 3' },
          ],
          xpReward: 30,
          tags: ['boss', 'optimization', 'critical-points'],
        },
      ],
    },
  ],

  defeatDialogue: [
    {
      characterId: CharacterId.THE_STATIC,
      text: 'My tempo... you\'ve found my critical point... my derivative is ZERO...',
      emotion: 'dramatic',
    },
  ],
  victoryDialogue: [
    {
      characterId: CharacterId.MAESTRO_FORTE,
      text: 'BRAVO! *thunderous applause* The Conservatory\'s Font of Change flows once more! You are a true virtuoso of derivatives!',
      emotion: 'excited',
    },
  ],
};

// ---- Exports ----

export const derivativesLessons: Lesson[] = [
  tangentLineLesson,
  basicDiffRulesLesson,
  // chain rule, product/quotient, trig/exp/log, applications follow same pattern
];

export const derivativesBoss = tempoTyrantBoss;
