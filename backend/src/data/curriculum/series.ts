// ============================================================
// Harmonia — Region 4: The Infinite Series Amphitheater
// ============================================================

import {
  Lesson, Problem, BossBattle, CalcTopic, Region, CharacterId,
  Difficulty, ProblemType,
} from '../../models/types';

// ----------------------------------------------------------------
// LESSON 4.1: Sequences
// ----------------------------------------------------------------

export const sequencesLesson: Lesson = {
  id: 'lesson-4-1',
  topicId: CalcTopic.SEQUENCES,
  regionId: Region.INFINITE_SERIES_AMPHITHEATER,
  title: 'The Opening Verse — Sequences',
  order: 1,
  characterId: CharacterId.VERSE,
  prerequisites: [CalcTopic.INTRO_TO_LIMITS, CalcTopic.BASIC_DIFF_RULES],
  xpReward: 25,

  conceptExplanation: [
    {
      id: 'concept-4-1-1',
      title: 'What Is a Sequence?',
      dialogue: [
        {
          characterId: CharacterId.VERSE,
          text: 'Welcome, young Resonant, to the Amphitheater of Infinite Series. I am Verse, keeper of patterns and poetry.',
          emotion: 'mysterious',
        },
        {
          characterId: CharacterId.VERSE,
          text: 'A sequence is like a poem — line after line, term after term, each following a rule. Listen:',
          emotion: 'thoughtful',
        },
        {
          characterId: CharacterId.VERSE,
          text: 'One... one-half... one-third... one-fourth... Each line smaller than the last. Does this poem have an ending?',
          emotion: 'mysterious',
          latex: 'a_n = \\frac{1}{n}: \\quad 1, \\frac{1}{2}, \\frac{1}{3}, \\frac{1}{4}, \\ldots',
        },
        {
          characterId: CharacterId.VERSE,
          text: 'When a sequence approaches a finite value as n grows without bound, we say it CONVERGES. This is the poem\'s conclusion.',
          emotion: 'neutral',
          latex: '\\lim_{n \\to \\infty} a_n = L \\quad \\text{(converges to } L\\text{)}',
        },
      ],
      mathContent: [
        {
          type: 'definition',
          title: 'Sequence',
          latex: '\\{a_n\\}_{n=1}^{\\infty} = a_1, a_2, a_3, \\ldots',
          explanation: 'A sequence is an ordered list of numbers defined by a formula aₙ for each positive integer n.',
        },
        {
          type: 'definition',
          title: 'Convergence of a Sequence',
          latex: '\\lim_{n \\to \\infty} a_n = L \\quad \\text{means } a_n \\text{ gets arbitrarily close to } L',
          explanation: 'If the terms approach a finite number L as n → ∞, the sequence converges to L. Otherwise it diverges.',
        },
        {
          type: 'theorem',
          title: 'Monotone Convergence Theorem',
          latex: '\\text{A bounded monotonic sequence always converges.}',
          explanation: 'If a sequence is always increasing (or always decreasing) AND bounded, it must converge.',
        },
      ],
    },
  ],

  visualMetaphor: {
    description: 'Verse recites lines of a poem. Each line appears as a term plotted on a number line. Convergent sequences show terms clustering toward a point (the poem\'s conclusion). Divergent sequences show terms wandering away (a poem that never ends).',
    animationType: 'poetry',
    parameters: {
      plotType: 'term-by-term',
      convergenceHighlight: true,
      rhythmicPacing: true,
    },
  },

  workedExamples: [
    {
      id: 'ex-4-1-1',
      problemStatement: 'Determine whether the sequence aₙ = (2n+1)/(3n-1) converges, and if so, find its limit.',
      problemLatex: 'a_n = \\frac{2n+1}{3n-1}',
      steps: [
        {
          stepNumber: 1,
          description: 'Divide numerator and denominator by n',
          latex: '\\frac{2n+1}{3n-1} = \\frac{2 + 1/n}{3 - 1/n}',
        },
        {
          stepNumber: 2,
          description: 'Take the limit as n → ∞',
          latex: '\\lim_{n \\to \\infty} \\frac{2 + 1/n}{3 - 1/n} = \\frac{2 + 0}{3 - 0} = \\frac{2}{3}',
        },
      ],
      finalAnswer: 'Converges to 2/3',
      finalAnswerLatex: '\\lim_{n \\to \\infty} a_n = \\frac{2}{3}',
    },
    {
      id: 'ex-4-1-2',
      problemStatement: 'Does the sequence aₙ = (-1)ⁿ converge?',
      problemLatex: 'a_n = (-1)^n: \\quad -1, 1, -1, 1, \\ldots',
      steps: [
        {
          stepNumber: 1,
          description: 'List the terms: -1, 1, -1, 1, ...',
          latex: 'a_1=-1, a_2=1, a_3=-1, a_4=1, \\ldots',
        },
        {
          stepNumber: 2,
          description: 'The terms oscillate between -1 and 1, never settling on a single value',
          latex: '\\text{The sequence diverges (oscillation)}',
        },
      ],
      finalAnswer: 'Diverges',
      finalAnswerLatex: '\\text{Diverges}',
    },
  ],

  practiceProblems: [
    {
      id: 'prob-4-1-01',
      topicId: CalcTopic.SEQUENCES,
      type: ProblemType.NUMERIC_INPUT,
      difficulty: Difficulty.ANDANTE,
      statement: 'Find the limit of the sequence.',
      statementLatex: 'a_n = \\frac{5n}{n+2}, \\quad \\lim_{n \\to \\infty} a_n = ?',
      correctAnswer: '5',
      tolerance: 0.01,
      hints: ['Divide top and bottom by n.', '(5)/(1+2/n) → 5/1 = 5'],
      detailedSolution: [
        { stepNumber: 1, description: 'Divide by n', latex: '\\frac{5}{1+2/n} \\to \\frac{5}{1} = 5' },
      ],
      xpReward: 5,
      tags: ['sequence-limit', 'rational'],
      artContext: 'The echoes in Verse\'s Amphitheater repeat at ratio 5n/(n+2). What volume do they settle to?',
    },
    {
      id: 'prob-4-1-02',
      topicId: CalcTopic.SEQUENCES,
      type: ProblemType.MULTIPLE_CHOICE,
      difficulty: Difficulty.MODERATO,
      statement: 'Does this sequence converge or diverge?',
      statementLatex: 'a_n = \\frac{n^2}{n+1}',
      options: [
        { id: 'a', text: 'Converges to 0', isCorrect: false },
        { id: 'b', text: 'Converges to 1', isCorrect: false },
        { id: 'c', text: 'Diverges to ∞', isCorrect: true },
        { id: 'd', text: 'Converges to ∞', isCorrect: false },
      ],
      correctAnswer: 'c',
      hints: ['n²/(n+1) ≈ n for large n. Does n approach a finite limit?'],
      detailedSolution: [
        { stepNumber: 1, description: 'For large n', latex: '\\frac{n^2}{n+1} \\approx n \\to \\infty' },
      ],
      xpReward: 8,
      tags: ['convergence', 'divergence'],
    },
    {
      id: 'prob-4-1-03',
      topicId: CalcTopic.SEQUENCES,
      type: ProblemType.NUMERIC_INPUT,
      difficulty: Difficulty.ALLEGRO,
      statement: 'Find the limit.',
      statementLatex: 'a_n = \\left(1 + \\frac{1}{n}\\right)^n, \\quad \\lim_{n \\to \\infty} a_n = ?',
      correctAnswer: '2.7183',
      correctAnswerLatex: 'e',
      tolerance: 0.01,
      hints: ['This is one of the most famous limits in mathematics!', 'It defines the number e ≈ 2.71828...'],
      detailedSolution: [
        { stepNumber: 1, description: 'This is the definition of e', latex: '\\lim_{n \\to \\infty} \\left(1+\\frac{1}{n}\\right)^n = e \\approx 2.71828' },
      ],
      xpReward: 15,
      tags: ['famous-limit', 'e'],
      artContext: 'The fundamental rhythm of Harmonia itself — the growth constant e — emerges from this infinite pattern.',
    },
  ],

  creativeTask: {
    id: 'creative-4-1',
    topicId: CalcTopic.SEQUENCES,
    title: 'Write the Next Verse',
    description: 'Compose a sequence poem! Each line\'s length is determined by the sequence terms. Watch as convergent poems reach a satisfying conclusion.',
    type: 'poetry-generator',
    instructions: [
      'Define a sequence formula aₙ',
      'Watch terms generate one by one as "verses"',
      'Convergent sequences create poems with closure',
      'Divergent sequences create endless, unresolved epic poems',
      'Classify your sequence as convergent or divergent',
    ],
    constraints: { maxTerms: 50, visualizationType: 'poem-lines' },
    xpReward: 20,
    evaluationCriteria: ['Correctly identifies convergence/divergence', 'Creates an interesting sequence'],
  },
};

// ----------------------------------------------------------------
// LESSON 4.5: Taylor & Maclaurin Series
// ----------------------------------------------------------------

export const taylorSeriesLesson: Lesson = {
  id: 'lesson-4-5',
  topicId: CalcTopic.TAYLOR_MACLAURIN,
  regionId: Region.INFINITE_SERIES_AMPHITHEATER,
  title: 'Infinite Drafts — Taylor & Maclaurin Series',
  order: 5,
  characterId: CharacterId.VERSE,
  prerequisites: [CalcTopic.POWER_SERIES],
  xpReward: 35,

  conceptExplanation: [
    {
      id: 'concept-4-5-1',
      title: 'Taylor Series',
      dialogue: [
        {
          characterId: CharacterId.VERSE,
          text: 'We arrive at the pinnacle, Resonant. The Taylor series — the power to approximate ANY function as an infinite polynomial poem.',
          emotion: 'mysterious',
        },
        {
          characterId: CharacterId.VERSE,
          text: 'Each term is a refinement, a revision. The zeroth term captures the value. The first captures the slope. The second captures the curvature. On and on, toward perfection:',
          emotion: 'thoughtful',
          latex: 'f(x) = \\sum_{n=0}^{\\infty} \\frac{f^{(n)}(a)}{n!}(x-a)^n',
        },
      ],
      mathContent: [
        {
          type: 'definition',
          title: 'Taylor Series',
          latex: 'f(x) = \\sum_{n=0}^{\\infty} \\frac{f^{(n)}(a)}{n!}(x-a)^n',
          explanation: 'The Taylor series of f centered at a uses all derivatives of f at a to build a polynomial approximation.',
        },
        {
          type: 'definition',
          title: 'Maclaurin Series',
          latex: 'f(x) = \\sum_{n=0}^{\\infty} \\frac{f^{(n)}(0)}{n!}x^n',
          explanation: 'A Maclaurin series is a Taylor series centered at a = 0.',
        },
        {
          type: 'formula',
          title: 'Key Maclaurin Series',
          latex: '\\begin{aligned} e^x &= \\sum_{n=0}^\\infty \\frac{x^n}{n!} = 1+x+\\frac{x^2}{2!}+\\frac{x^3}{3!}+\\cdots \\\\ \\sin(x) &= \\sum_{n=0}^\\infty \\frac{(-1)^n x^{2n+1}}{(2n+1)!} = x - \\frac{x^3}{3!} + \\frac{x^5}{5!} - \\cdots \\\\ \\cos(x) &= \\sum_{n=0}^\\infty \\frac{(-1)^n x^{2n}}{(2n)!} = 1 - \\frac{x^2}{2!} + \\frac{x^4}{4!} - \\cdots \\\\ \\frac{1}{1-x} &= \\sum_{n=0}^\\infty x^n = 1+x+x^2+x^3+\\cdots \\quad |x|<1 \\end{aligned}',
          explanation: 'These are the most important Maclaurin series. Memorize them — they are the four great poems of Harmonia!',
        },
      ],
      interactiveElements: [
        {
          type: 'slider',
          id: 'taylor-order-slider',
          label: 'Increase the Taylor polynomial degree and watch it converge to the actual function',
          config: {
            min: 0,
            max: 20,
            step: 1,
            functionExpression: 'sin(x)',
            center: 0,
            domain: [-6, 6],
          },
        },
      ],
    },
  ],

  visualMetaphor: {
    description: 'Verse writes successive drafts of a poem. The 0th draft is a single word (constant). The 1st draft adds a phrase (linear). The 2nd adds a sentence (quadratic). Each draft is overlaid on the "true poem" (the function), showing how the approximation improves with each term.',
    animationType: 'poetry',
    parameters: {
      buildupAnimation: true,
      overlayOriginal: true,
      convergenceGlow: true,
    },
  },

  workedExamples: [
    {
      id: 'ex-4-5-1',
      problemStatement: 'Find the Maclaurin series for eˣ up to the x⁴ term.',
      problemLatex: 'e^x = \\sum_{n=0}^{\\infty} \\frac{x^n}{n!}',
      steps: [
        {
          stepNumber: 1,
          description: 'All derivatives of eˣ are eˣ, and e⁰ = 1',
          latex: 'f^{(n)}(0) = e^0 = 1 \\text{ for all } n',
        },
        {
          stepNumber: 2,
          description: 'Substitute into the Taylor formula',
          latex: 'e^x = \\frac{1}{0!} + \\frac{x}{1!} + \\frac{x^2}{2!} + \\frac{x^3}{3!} + \\frac{x^4}{4!} + \\cdots',
        },
        {
          stepNumber: 3,
          description: 'Simplify',
          latex: 'e^x = 1 + x + \\frac{x^2}{2} + \\frac{x^3}{6} + \\frac{x^4}{24} + \\cdots',
        },
      ],
      finalAnswer: '1 + x + x²/2 + x³/6 + x⁴/24 + ...',
      finalAnswerLatex: 'e^x = 1 + x + \\frac{x^2}{2} + \\frac{x^3}{6} + \\frac{x^4}{24} + \\cdots',
    },
    {
      id: 'ex-4-5-2',
      problemStatement: 'Find the Taylor series for ln(x) centered at a = 1, up to the (x-1)³ term.',
      problemLatex: '\\ln(x) \\text{ centered at } a = 1',
      steps: [
        {
          stepNumber: 1,
          description: 'Find derivatives and evaluate at x = 1',
          latex: '\\begin{aligned} f(x) &= \\ln(x), & f(1) &= 0 \\\\ f\'(x) &= 1/x, & f\'(1) &= 1 \\\\ f\'\'(x) &= -1/x^2, & f\'\'(1) &= -1 \\\\ f\'\'\'(x) &= 2/x^3, & f\'\'\'(1) &= 2 \\end{aligned}',
        },
        {
          stepNumber: 2,
          description: 'Substitute into Taylor formula',
          latex: '\\ln(x) = 0 + 1(x-1) + \\frac{-1}{2!}(x-1)^2 + \\frac{2}{3!}(x-1)^3 + \\cdots',
        },
        {
          stepNumber: 3,
          description: 'Simplify',
          latex: '\\ln(x) = (x-1) - \\frac{(x-1)^2}{2} + \\frac{(x-1)^3}{3} - \\cdots',
        },
      ],
      finalAnswer: '(x-1) - (x-1)²/2 + (x-1)³/3 - ...',
      finalAnswerLatex: '\\ln(x) = (x-1) - \\frac{(x-1)^2}{2} + \\frac{(x-1)^3}{3} - \\cdots',
    },
  ],

  practiceProblems: [
    {
      id: 'prob-4-5-01',
      topicId: CalcTopic.TAYLOR_MACLAURIN,
      type: ProblemType.EXPRESSION_INPUT,
      difficulty: Difficulty.MODERATO,
      statement: 'Write the first 4 nonzero terms of the Maclaurin series for sin(x).',
      statementLatex: '\\sin(x) = ?',
      correctAnswer: 'x - x^3/6 + x^5/120 - x^7/5040',
      correctAnswerLatex: 'x - \\frac{x^3}{3!} + \\frac{x^5}{5!} - \\frac{x^7}{7!}',
      hints: ['Only odd powers of x appear in sin(x) series.', 'Signs alternate: +, -, +, -'],
      detailedSolution: [
        { stepNumber: 1, description: 'Maclaurin series for sin(x)', latex: '\\sin(x) = x - \\frac{x^3}{6} + \\frac{x^5}{120} - \\frac{x^7}{5040} + \\cdots' },
      ],
      xpReward: 10,
      tags: ['maclaurin', 'sin'],
      artContext: 'The four opening stanzas of Harmonia\'s greatest sine poem.',
    },
    {
      id: 'prob-4-5-02',
      topicId: CalcTopic.TAYLOR_MACLAURIN,
      type: ProblemType.NUMERIC_INPUT,
      difficulty: Difficulty.ALLEGRO,
      statement: 'Use the 3rd-degree Maclaurin polynomial for eˣ to approximate e^(0.1).',
      statementLatex: 'P_3(0.1) = 1 + 0.1 + \\frac{0.1^2}{2} + \\frac{0.1^3}{6} = ?',
      correctAnswer: '1.10517',
      tolerance: 0.001,
      hints: ['Just substitute x = 0.1 into 1 + x + x²/2 + x³/6'],
      detailedSolution: [
        { stepNumber: 1, description: 'Substitute', latex: '1 + 0.1 + 0.005 + 0.000167 = 1.105167' },
      ],
      xpReward: 12,
      tags: ['approximation', 'taylor-polynomial'],
    },
  ],

  creativeTask: {
    id: 'creative-4-5',
    topicId: CalcTopic.TAYLOR_MACLAURIN,
    title: 'Draft the Poem',
    description: 'Build Taylor polynomials term by term and watch them converge to the original function — like writing drafts of a poem that approaches perfection!',
    type: 'poetry-generator',
    instructions: [
      'Choose a function (eˣ, sin(x), cos(x), ln(1+x))',
      'Add one term at a time to the Taylor polynomial',
      'Watch the polynomial curve approach the true function',
      'Note the radius where the approximation is valid',
    ],
    constraints: { maxDegree: 20, availableFunctions: ['e^x', 'sin(x)', 'cos(x)', 'ln(1+x)'] },
    xpReward: 25,
    evaluationCriteria: ['Correctly builds Taylor polynomial', 'Observes convergence behavior'],
  },
};

// ----------------------------------------------------------------
// BOSS BATTLE: The Infinite Orator
// ----------------------------------------------------------------

export const infiniteOratorBoss: BossBattle = {
  id: 'boss-series',
  regionId: Region.INFINITE_SERIES_AMPHITHEATER,
  bossName: 'The Infinite Orator',
  bossCharacterId: CharacterId.THE_STATIC,
  description: 'A spectral speaker whose words never converge to meaning — an infinite, divergent monologue. Counter its spells by determining convergence and constructing Taylor series!',
  totalXpReward: 300,

  phases: [
    {
      phaseNumber: 1,
      title: 'Test the Spells',
      description: 'Determine whether the Orator\'s series spells converge or diverge!',
      bossHealthPerPhase: 100,
      playerDamagePerCorrect: 25,
      bossDamagePerIncorrect: 15,
      timeLimit: 120,
      dialogue: [
        {
          characterId: CharacterId.THE_STATIC,
          text: 'I speak in INFINITE series! My words NEVER end! 1 + 1 + 1 + 1 + ...',
          emotion: 'dramatic',
        },
        {
          characterId: CharacterId.VERSE,
          text: 'Not all infinite words are powerful, Resonant. Some diverge to nothing. Test them!',
          emotion: 'encouraging',
        },
      ],
      problems: [
        {
          id: 'boss-4-p1-01',
          topicId: CalcTopic.CONVERGENCE_TESTS,
          type: ProblemType.MULTIPLE_CHOICE,
          difficulty: Difficulty.MODERATO,
          statement: 'Does this series converge or diverge?',
          statementLatex: '\\sum_{n=1}^{\\infty} \\frac{1}{n^2}',
          options: [
            { id: 'a', text: 'Converges (p-series, p=2 > 1)', isCorrect: true },
            { id: 'b', text: 'Diverges', isCorrect: false },
          ],
          correctAnswer: 'a',
          hints: ['p-series test: Σ1/nᵖ converges when p > 1.'],
          detailedSolution: [
            { stepNumber: 1, description: 'p-series with p=2 > 1', latex: '\\sum \\frac{1}{n^2} \\text{ converges}' },
          ],
          xpReward: 20,
          tags: ['boss', 'p-series'],
        },
        {
          id: 'boss-4-p1-02',
          topicId: CalcTopic.CONVERGENCE_TESTS,
          type: ProblemType.MULTIPLE_CHOICE,
          difficulty: Difficulty.ALLEGRO,
          statement: 'Does this series converge or diverge?',
          statementLatex: '\\sum_{n=1}^{\\infty} \\frac{n!}{2^n}',
          options: [
            { id: 'a', text: 'Converges', isCorrect: false },
            { id: 'b', text: 'Diverges (ratio test: limit > 1)', isCorrect: true },
          ],
          correctAnswer: 'b',
          hints: ['Try the ratio test: look at a_{n+1}/a_n.'],
          detailedSolution: [
            { stepNumber: 1, description: 'Ratio test', latex: '\\frac{a_{n+1}}{a_n} = \\frac{(n+1)!}{2^{n+1}} \\cdot \\frac{2^n}{n!} = \\frac{n+1}{2} \\to \\infty' },
            { stepNumber: 2, description: 'Since limit > 1', latex: '\\text{Diverges by ratio test}' },
          ],
          xpReward: 25,
          tags: ['boss', 'ratio-test'],
        },
      ],
    },
    {
      phaseNumber: 2,
      title: 'Contain the Radius',
      description: 'Find the radius of convergence to limit the Orator\'s power!',
      bossHealthPerPhase: 120,
      playerDamagePerCorrect: 30,
      bossDamagePerIncorrect: 20,
      timeLimit: 120,
      dialogue: [
        {
          characterId: CharacterId.THE_STATIC,
          text: 'My power extends to INFINITY in all directions!',
          emotion: 'dramatic',
        },
        {
          characterId: CharacterId.VERSE,
          text: 'Find its radius of convergence! Its power is finite within those bounds!',
          emotion: 'excited',
        },
      ],
      problems: [
        {
          id: 'boss-4-p2-01',
          topicId: CalcTopic.POWER_SERIES,
          type: ProblemType.NUMERIC_INPUT,
          difficulty: Difficulty.ALLEGRO,
          statement: 'Find the radius of convergence.',
          statementLatex: '\\sum_{n=0}^{\\infty} \\frac{x^n}{3^n} \\quad R = ?',
          correctAnswer: '3',
          tolerance: 0.01,
          hints: ['Ratio test: |x/3| < 1, so |x| < 3.'],
          detailedSolution: [
            { stepNumber: 1, description: 'Ratio test', latex: '\\left|\\frac{x^{n+1}/3^{n+1}}{x^n/3^n}\\right| = \\left|\\frac{x}{3}\\right| < 1' },
            { stepNumber: 2, description: 'Solve', latex: '|x| < 3 \\Rightarrow R = 3' },
          ],
          xpReward: 25,
          tags: ['boss', 'radius-of-convergence'],
        },
      ],
    },
    {
      phaseNumber: 3,
      title: 'The Counter-Incantation',
      description: 'Construct a Taylor series to perfectly counter the Orator\'s infinite spell!',
      bossHealthPerPhase: 80,
      playerDamagePerCorrect: 40,
      bossDamagePerIncorrect: 25,
      timeLimit: 150,
      dialogue: [
        {
          characterId: CharacterId.VERSE,
          text: 'Now, Resonant! Construct the Taylor series — the perfect counter-poem!',
          emotion: 'dramatic',
        },
      ],
      problems: [
        {
          id: 'boss-4-p3-01',
          topicId: CalcTopic.TAYLOR_MACLAURIN,
          type: ProblemType.EXPRESSION_INPUT,
          difficulty: Difficulty.VIRTUOSO,
          statement: 'Write the first 3 nonzero terms of the Maclaurin series for eˣ and use it to approximate e^1.',
          statementLatex: 'e^x \\approx ? \\quad \\text{(first 3 terms at } x=1\\text{)}',
          correctAnswer: '1 + 1 + 1/2 = 2.5',
          correctAnswerLatex: '1 + 1 + \\frac{1}{2} = 2.5',
          hints: ['eˣ ≈ 1 + x + x²/2! for 3 terms.', 'Plug in x = 1.'],
          detailedSolution: [
            { stepNumber: 1, description: '3-term approximation', latex: 'e^1 \\approx 1 + 1 + \\frac{1}{2} = 2.5' },
            { stepNumber: 2, description: 'Actual value e ≈ 2.718; more terms improve accuracy', latex: 'e \\approx 2.71828...' },
          ],
          xpReward: 30,
          tags: ['boss', 'taylor-approximation'],
        },
      ],
    },
  ],

  defeatDialogue: [
    {
      characterId: CharacterId.THE_STATIC,
      text: 'My series... converges... to... silence...',
      emotion: 'dramatic',
    },
  ],
  victoryDialogue: [
    {
      characterId: CharacterId.VERSE,
      text: 'The infinite is now contained. The Font of Pattern is restored, and all of Harmonia breathes again.',
      emotion: 'encouraging',
    },
    {
      characterId: CharacterId.VERSE,
      text: 'You have mastered the poetry of infinity, Resonant. You are now a true Harmonist.',
      emotion: 'mysterious',
    },
  ],
};

// ---- Exports ----

export const seriesLessons: Lesson[] = [
  sequencesLesson,
  taylorSeriesLesson,
  // infinite series, convergence tests, power series follow same pattern
];

export const seriesBoss = infiniteOratorBoss;
