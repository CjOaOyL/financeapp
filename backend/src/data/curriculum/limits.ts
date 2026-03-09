// ============================================================
// Harmonia — Region 1: The Valley of Limits — Full Curriculum
// ============================================================

import {
  Lesson, Problem, BossBattle, CalcTopic, Region, CharacterId,
  Difficulty, ProblemType, CreativeTask,
} from '../../models/types';

// ----------------------------------------------------------------
// LESSON 1.1: Introduction to Limits
// ----------------------------------------------------------------

export const introToLimitsLesson: Lesson = {
  id: 'lesson-1-1',
  topicId: CalcTopic.INTRO_TO_LIMITS,
  regionId: Region.VALLEY_OF_LIMITS,
  title: 'The Approach — Introduction to Limits',
  order: 1,
  characterId: CharacterId.LYRA,
  prerequisites: [],
  xpReward: 25,

  conceptExplanation: [
    {
      id: 'concept-1-1-1',
      title: 'What Is a Limit?',
      dialogue: [
        {
          characterId: CharacterId.LYRA,
          text: 'Welcome to the Valley of Limits, young Resonant. I am Lyra, and I will teach you the art of the approach.',
          emotion: 'encouraging',
        },
        {
          characterId: CharacterId.LYRA,
          text: 'Watch me dance toward that glowing point on the stage...',
          emotion: 'thoughtful',
        },
        {
          characterId: CharacterId.LYRA,
          text: 'Notice how I get closer and closer, but my destination is defined by WHERE I\'m heading — not whether I ever arrive.',
          emotion: 'thoughtful',
        },
        {
          characterId: CharacterId.LYRA,
          text: 'That, dear student, is a limit. We write it like this:',
          emotion: 'encouraging',
          latex: '\\lim_{x \\to a} f(x) = L',
        },
        {
          characterId: CharacterId.LYRA,
          text: 'It means: as x approaches a, the value f(x) approaches L.',
          emotion: 'neutral',
        },
      ],
      mathContent: [
        {
          type: 'definition',
          title: 'Limit (Informal Definition)',
          latex: '\\lim_{x \\to a} f(x) = L',
          explanation: 'We say the limit of f(x) as x approaches a equals L if f(x) gets arbitrarily close to L as x gets arbitrarily close to a (but x ≠ a).',
        },
        {
          type: 'note',
          latex: '\\text{The function does NOT need to be defined at } x = a \\text{ for the limit to exist!}',
          explanation: 'This is a crucial insight: limits describe behavior NEAR a point, not AT the point.',
        },
      ],
      interactiveElements: [
        {
          type: 'slider',
          id: 'limit-approach-slider',
          label: 'Move x toward the target value and watch f(x)',
          config: {
            min: -5,
            max: 5,
            step: 0.01,
            targetValue: 2,
            functionExpression: 'x^2',
          },
        },
      ],
    },
    {
      id: 'concept-1-1-2',
      title: 'Evaluating Simple Limits',
      dialogue: [
        {
          characterId: CharacterId.LYRA,
          text: 'For many well-behaved functions, finding a limit is as simple as substituting the value. We call this direct substitution.',
          emotion: 'encouraging',
        },
        {
          characterId: CharacterId.LYRA,
          text: 'But sometimes substitution gives us something... problematic. Like 0/0. That\'s when the real dance begins!',
          emotion: 'dramatic',
        },
      ],
      mathContent: [
        {
          type: 'theorem',
          title: 'Direct Substitution Property',
          latex: '\\text{If } f \\text{ is continuous at } a, \\text{ then } \\lim_{x \\to a} f(x) = f(a)',
          explanation: 'For polynomials, rational functions (where defined), trig functions, and other "nice" functions, just plug in the value!',
        },
        {
          type: 'formula',
          title: 'Indeterminate Form 0/0',
          latex: '\\text{If } \\lim_{x \\to a} f(x) = \\frac{0}{0}, \\text{ we must use algebraic techniques}',
          explanation: 'When direct substitution yields 0/0, try factoring, rationalizing, or simplifying before substituting.',
        },
      ],
    },
  ],

  visualMetaphor: {
    description: 'Lyra dances across the stage toward a glowing point. As she approaches, a trail of light follows her feet, showing the function curve. The glowing point represents the limit value.',
    animationType: 'dance',
    parameters: {
      danceStyle: 'approaching-steps',
      trailColor: '#7B68EE',
      targetGlow: '#FFD700',
    },
  },

  workedExamples: [
    {
      id: 'ex-1-1-1',
      problemStatement: 'Find the limit of (x²-4)/(x-2) as x approaches 2.',
      problemLatex: '\\lim_{x \\to 2} \\frac{x^2 - 4}{x - 2}',
      steps: [
        {
          stepNumber: 1,
          description: 'Try direct substitution: plug in x = 2',
          latex: '\\frac{2^2 - 4}{2 - 2} = \\frac{0}{0}',
          hint: 'We get 0/0 — an indeterminate form. We need another approach!',
        },
        {
          stepNumber: 2,
          description: 'Factor the numerator (difference of squares)',
          latex: '\\frac{x^2 - 4}{x - 2} = \\frac{(x-2)(x+2)}{x-2}',
        },
        {
          stepNumber: 3,
          description: 'Cancel the common factor (valid since x ≠ 2)',
          latex: '= x + 2 \\quad \\text{for } x \\neq 2',
        },
        {
          stepNumber: 4,
          description: 'Now substitute x = 2 into the simplified expression',
          latex: '\\lim_{x \\to 2} (x + 2) = 2 + 2 = 4',
        },
      ],
      finalAnswer: '4',
      finalAnswerLatex: '\\lim_{x \\to 2} \\frac{x^2 - 4}{x - 2} = 4',
    },
    {
      id: 'ex-1-1-2',
      problemStatement: 'Find the limit of sin(x)/x as x approaches 0.',
      problemLatex: '\\lim_{x \\to 0} \\frac{\\sin(x)}{x}',
      steps: [
        {
          stepNumber: 1,
          description: 'Direct substitution gives 0/0 — indeterminate',
          latex: '\\frac{\\sin(0)}{0} = \\frac{0}{0}',
        },
        {
          stepNumber: 2,
          description: 'This is a famous limit! We can verify by looking at a table of values approaching 0',
          latex: '\\begin{array}{c|c} x & \\sin(x)/x \\\\ \\hline 0.1 & 0.9983 \\\\ 0.01 & 0.99998 \\\\ 0.001 & 0.9999998 \\end{array}',
        },
        {
          stepNumber: 3,
          description: 'The values approach 1 as x approaches 0',
          latex: '\\lim_{x \\to 0} \\frac{\\sin(x)}{x} = 1',
          hint: 'This can be proven rigorously using the squeeze theorem (coming in a later lesson!)',
        },
      ],
      finalAnswer: '1',
      finalAnswerLatex: '\\lim_{x \\to 0} \\frac{\\sin(x)}{x} = 1',
    },
    {
      id: 'ex-1-1-3',
      problemStatement: 'Find the limit of (3x + 5) as x approaches 1.',
      problemLatex: '\\lim_{x \\to 1} (3x + 5)',
      steps: [
        {
          stepNumber: 1,
          description: 'This is a polynomial — we can use direct substitution',
          latex: '\\lim_{x \\to 1} (3x + 5) = 3(1) + 5',
        },
        {
          stepNumber: 2,
          description: 'Calculate',
          latex: '= 3 + 5 = 8',
        },
      ],
      finalAnswer: '8',
      finalAnswerLatex: '\\lim_{x \\to 1} (3x + 5) = 8',
    },
  ],

  practiceProblems: generateLimitPracticeProblems(),

  creativeTask: {
    id: 'creative-1-1',
    topicId: CalcTopic.INTRO_TO_LIMITS,
    title: 'Choreograph the Approach',
    description: 'Animate Lyra\'s dance by controlling how a point approaches its limit. Design a beautiful approach path!',
    type: 'dance-animator',
    instructions: [
      'Choose a function from the gallery',
      'Select a limit point',
      'Watch the animated approach from both sides',
      'Adjust the speed and style of approach',
      'Create a visual trail effect',
    ],
    constraints: { maxSteps: 100, minSteps: 10 },
    xpReward: 20,
    evaluationCriteria: [
      'Point approaches from left and right',
      'Function values converge to the limit',
      'Animation is smooth and visually appealing',
    ],
  },
};

function generateLimitPracticeProblems(): Problem[] {
  return [
    {
      id: 'prob-1-1-01',
      topicId: CalcTopic.INTRO_TO_LIMITS,
      type: ProblemType.NUMERIC_INPUT,
      difficulty: Difficulty.ANDANTE,
      statement: 'Evaluate the limit.',
      statementLatex: '\\lim_{x \\to 3} (2x + 1)',
      correctAnswer: '7',
      correctAnswerLatex: '7',
      tolerance: 0.01,
      hints: [
        'This is a polynomial — try direct substitution!',
        'Plug in x = 3: 2(3) + 1',
      ],
      detailedSolution: [
        { stepNumber: 1, description: 'Direct substitution', latex: '2(3) + 1 = 7' },
      ],
      xpReward: 5,
      tags: ['direct-substitution', 'polynomial'],
      artContext: 'Lyra takes 2x + 1 steps along the stage. How many steps when she reaches position 3?',
    },
    {
      id: 'prob-1-1-02',
      topicId: CalcTopic.INTRO_TO_LIMITS,
      type: ProblemType.NUMERIC_INPUT,
      difficulty: Difficulty.ANDANTE,
      statement: 'Evaluate the limit.',
      statementLatex: '\\lim_{x \\to 4} x^2',
      correctAnswer: '16',
      correctAnswerLatex: '16',
      tolerance: 0.01,
      hints: ['Polynomial — just plug in x = 4.'],
      detailedSolution: [
        { stepNumber: 1, description: 'Direct substitution', latex: '4^2 = 16' },
      ],
      xpReward: 5,
      tags: ['direct-substitution', 'polynomial'],
      artContext: 'The brightness of the stage light is x² lumens. What brightness does Lyra approach at position 4?',
    },
    {
      id: 'prob-1-1-03',
      topicId: CalcTopic.INTRO_TO_LIMITS,
      type: ProblemType.NUMERIC_INPUT,
      difficulty: Difficulty.MODERATO,
      statement: 'Evaluate the limit by factoring.',
      statementLatex: '\\lim_{x \\to 3} \\frac{x^2 - 9}{x - 3}',
      correctAnswer: '6',
      correctAnswerLatex: '6',
      tolerance: 0.01,
      hints: [
        'Direct substitution gives 0/0. Try factoring the numerator.',
        'x² - 9 = (x-3)(x+3). Cancel the common factor.',
        'After canceling: x + 3. Now substitute x = 3.',
      ],
      detailedSolution: [
        { stepNumber: 1, description: 'Factor numerator', latex: '\\frac{(x-3)(x+3)}{x-3}' },
        { stepNumber: 2, description: 'Cancel common factor', latex: 'x + 3' },
        { stepNumber: 3, description: 'Substitute x = 3', latex: '3 + 3 = 6' },
      ],
      xpReward: 10,
      tags: ['factoring', 'indeterminate-form'],
      artContext: 'The harmony of two overlapping dance routines creates a pattern described by this function.',
    },
    {
      id: 'prob-1-1-04',
      topicId: CalcTopic.INTRO_TO_LIMITS,
      type: ProblemType.MULTIPLE_CHOICE,
      difficulty: Difficulty.ANDANTE,
      statement: 'What does the following limit notation mean?',
      statementLatex: '\\lim_{x \\to 5} f(x) = 12',
      options: [
        { id: 'a', text: 'f(5) equals 12', isCorrect: false },
        { id: 'b', text: 'As x approaches 5, f(x) approaches 12', latex: 'x \\to 5 \\Rightarrow f(x) \\to 12', isCorrect: true },
        { id: 'c', text: 'f(x) equals 12 when x is greater than 5', isCorrect: false },
        { id: 'd', text: 'f(x) never equals 12', isCorrect: false },
      ],
      correctAnswer: 'b',
      hints: ['Remember: a limit describes what value f(x) APPROACHES, not necessarily what it equals AT that point.'],
      detailedSolution: [
        { stepNumber: 1, description: 'The limit notation means', latex: '\\text{As } x \\to 5, f(x) \\to 12' },
      ],
      xpReward: 5,
      tags: ['notation', 'conceptual'],
    },
    {
      id: 'prob-1-1-05',
      topicId: CalcTopic.INTRO_TO_LIMITS,
      type: ProblemType.NUMERIC_INPUT,
      difficulty: Difficulty.MODERATO,
      statement: 'Evaluate the limit.',
      statementLatex: '\\lim_{x \\to 1} \\frac{x^2 - 1}{x - 1}',
      correctAnswer: '2',
      correctAnswerLatex: '2',
      tolerance: 0.01,
      hints: [
        'Direct substitution gives 0/0.',
        'Factor: x² - 1 = (x-1)(x+1)',
      ],
      detailedSolution: [
        { stepNumber: 1, description: 'Factor', latex: '\\frac{(x-1)(x+1)}{x-1} = x+1' },
        { stepNumber: 2, description: 'Substitute', latex: '1 + 1 = 2' },
      ],
      xpReward: 10,
      tags: ['factoring', 'indeterminate-form'],
    },
    {
      id: 'prob-1-1-06',
      topicId: CalcTopic.INTRO_TO_LIMITS,
      type: ProblemType.NUMERIC_INPUT,
      difficulty: Difficulty.ALLEGRO,
      statement: 'Evaluate the limit by rationalizing.',
      statementLatex: '\\lim_{x \\to 0} \\frac{\\sqrt{x+4} - 2}{x}',
      correctAnswer: '0.25',
      correctAnswerLatex: '\\frac{1}{4}',
      tolerance: 0.01,
      hints: [
        'Direct substitution gives 0/0.',
        'Multiply by the conjugate: (√(x+4) + 2) / (√(x+4) + 2)',
        'The numerator becomes (x+4) - 4 = x',
      ],
      detailedSolution: [
        { stepNumber: 1, description: 'Multiply by conjugate', latex: '\\frac{\\sqrt{x+4}-2}{x} \\cdot \\frac{\\sqrt{x+4}+2}{\\sqrt{x+4}+2}' },
        { stepNumber: 2, description: 'Simplify numerator', latex: '\\frac{(x+4)-4}{x(\\sqrt{x+4}+2)} = \\frac{x}{x(\\sqrt{x+4}+2)}' },
        { stepNumber: 3, description: 'Cancel x', latex: '\\frac{1}{\\sqrt{x+4}+2}' },
        { stepNumber: 4, description: 'Substitute x=0', latex: '\\frac{1}{\\sqrt{4}+2} = \\frac{1}{4}' },
      ],
      xpReward: 15,
      tags: ['rationalization', 'indeterminate-form'],
      artContext: 'The width of Lyra\'s spotlight shrinks according to this expression as she approaches center stage.',
    },
    {
      id: 'prob-1-1-07',
      topicId: CalcTopic.INTRO_TO_LIMITS,
      type: ProblemType.TRUE_FALSE,
      difficulty: Difficulty.ANDANTE,
      statement: 'True or False: If f(2) = 5, then the limit as x→2 of f(x) must equal 5.',
      statementLatex: '\\text{If } f(2)=5, \\text{ then } \\lim_{x \\to 2}f(x) = 5',
      correctAnswer: 'false',
      hints: ['Think about piecewise functions. Can a function be defined at a point but behave differently nearby?'],
      detailedSolution: [
        { stepNumber: 1, description: 'False! The function could have a removable discontinuity at x=2.', latex: '\\text{Example: } f(x) = \\begin{cases} x+1 & x \\neq 2 \\\\ 5 & x = 2 \\end{cases}' },
        { stepNumber: 2, description: 'Here f(2) = 5 but', latex: '\\lim_{x \\to 2} f(x) = 3 \\neq 5' },
      ],
      xpReward: 8,
      tags: ['conceptual', 'true-false'],
    },
    {
      id: 'prob-1-1-08',
      topicId: CalcTopic.INTRO_TO_LIMITS,
      type: ProblemType.NUMERIC_INPUT,
      difficulty: Difficulty.MODERATO,
      statement: 'Evaluate the limit.',
      statementLatex: '\\lim_{x \\to -1} \\frac{x^2 + 3x + 2}{x + 1}',
      correctAnswer: '1',
      correctAnswerLatex: '1',
      tolerance: 0.01,
      hints: [
        'Factor the numerator: x² + 3x + 2 = (x+1)(x+2)',
      ],
      detailedSolution: [
        { stepNumber: 1, description: 'Factor', latex: '\\frac{(x+1)(x+2)}{x+1} = x+2' },
        { stepNumber: 2, description: 'Substitute x = -1', latex: '-1 + 2 = 1' },
      ],
      xpReward: 10,
      tags: ['factoring'],
    },
    {
      id: 'prob-1-1-09',
      topicId: CalcTopic.INTRO_TO_LIMITS,
      type: ProblemType.MULTIPLE_CHOICE,
      difficulty: Difficulty.ALLEGRO,
      statement: 'Which technique should you use to evaluate this limit?',
      statementLatex: '\\lim_{x \\to 9} \\frac{\\sqrt{x} - 3}{x - 9}',
      options: [
        { id: 'a', text: 'Direct substitution', isCorrect: false },
        { id: 'b', text: 'Factoring the numerator', isCorrect: false },
        { id: 'c', text: 'Rationalizing the numerator', isCorrect: true },
        { id: 'd', text: 'L\'Hôpital\'s Rule', isCorrect: false },
      ],
      correctAnswer: 'c',
      hints: [
        'Direct substitution gives 0/0.',
        'Look at the numerator — it has a square root. What technique handles that?',
      ],
      detailedSolution: [
        { stepNumber: 1, description: 'Direct substitution gives 0/0', latex: '\\frac{3-3}{9-9}=\\frac{0}{0}' },
        { stepNumber: 2, description: 'Rationalize: multiply by conjugate', latex: '\\frac{\\sqrt{x}-3}{x-9} \\cdot \\frac{\\sqrt{x}+3}{\\sqrt{x}+3} = \\frac{1}{\\sqrt{x}+3}' },
        { stepNumber: 3, description: 'Substitute', latex: '\\frac{1}{\\sqrt{9}+3} = \\frac{1}{6}' },
      ],
      xpReward: 12,
      tags: ['technique-selection', 'rationalization'],
    },
    {
      id: 'prob-1-1-10',
      topicId: CalcTopic.INTRO_TO_LIMITS,
      type: ProblemType.NUMERIC_INPUT,
      difficulty: Difficulty.VIRTUOSO,
      statement: 'Evaluate the limit.',
      statementLatex: '\\lim_{x \\to 0} \\frac{\\sqrt{1+x} - \\sqrt{1-x}}{x}',
      correctAnswer: '1',
      correctAnswerLatex: '1',
      tolerance: 0.01,
      hints: [
        'Multiply by conjugate: (√(1+x) + √(1-x)) / (√(1+x) + √(1-x))',
        'Numerator becomes (1+x)-(1-x) = 2x',
        'Simplify and substitute x=0',
      ],
      detailedSolution: [
        { stepNumber: 1, description: 'Multiply by conjugate', latex: '\\frac{(\\sqrt{1+x}-\\sqrt{1-x})(\\sqrt{1+x}+\\sqrt{1-x})}{x(\\sqrt{1+x}+\\sqrt{1-x})}' },
        { stepNumber: 2, description: 'Simplify numerator', latex: '\\frac{(1+x)-(1-x)}{x(\\sqrt{1+x}+\\sqrt{1-x})} = \\frac{2x}{x(\\sqrt{1+x}+\\sqrt{1-x})}' },
        { stepNumber: 3, description: 'Cancel x', latex: '\\frac{2}{\\sqrt{1+x}+\\sqrt{1-x}}' },
        { stepNumber: 4, description: 'Substitute x=0', latex: '\\frac{2}{1+1} = 1' },
      ],
      xpReward: 20,
      tags: ['rationalization', 'advanced'],
      artContext: 'The balance between two opposing dance forces creates this ratio as Lyra reaches equilibrium at center stage.',
    },
  ];
}

// ----------------------------------------------------------------
// LESSON 1.2: One-Sided Limits
// ----------------------------------------------------------------

export const oneSidedLimitsLesson: Lesson = {
  id: 'lesson-1-2',
  topicId: CalcTopic.ONE_SIDED_LIMITS,
  regionId: Region.VALLEY_OF_LIMITS,
  title: 'Left & Right — One-Sided Limits',
  order: 2,
  characterId: CharacterId.LYRA,
  prerequisites: [CalcTopic.INTRO_TO_LIMITS],
  xpReward: 25,

  conceptExplanation: [
    {
      id: 'concept-1-2-1',
      title: 'Approaching from One Side',
      dialogue: [
        {
          characterId: CharacterId.LYRA,
          text: 'Sometimes, the journey matters as much as the destination. Watch — I\'ll approach this point from stage LEFT only.',
          emotion: 'thoughtful',
        },
        {
          characterId: CharacterId.LYRA,
          text: 'Now from stage RIGHT. See? Different approaches can give different destinations!',
          emotion: 'excited',
        },
        {
          characterId: CharacterId.LYRA,
          text: 'When we only consider x approaching from the left (values less than a), we write:',
          emotion: 'neutral',
          latex: '\\lim_{x \\to a^-} f(x)',
        },
        {
          characterId: CharacterId.LYRA,
          text: 'And from the right (values greater than a):',
          emotion: 'neutral',
          latex: '\\lim_{x \\to a^+} f(x)',
        },
      ],
      mathContent: [
        {
          type: 'definition',
          title: 'One-Sided Limits',
          latex: '\\lim_{x \\to a^-} f(x) = L_1 \\quad \\text{(left-hand limit)}',
          explanation: 'The limit as x approaches a from values LESS than a.',
        },
        {
          type: 'definition',
          title: 'Right-Hand Limit',
          latex: '\\lim_{x \\to a^+} f(x) = L_2 \\quad \\text{(right-hand limit)}',
          explanation: 'The limit as x approaches a from values GREATER than a.',
        },
        {
          type: 'theorem',
          title: 'Existence of Two-Sided Limit',
          latex: '\\lim_{x \\to a} f(x) = L \\iff \\lim_{x \\to a^-} f(x) = \\lim_{x \\to a^+} f(x) = L',
          explanation: 'A two-sided limit exists if and only if both one-sided limits exist AND are equal.',
        },
      ],
    },
  ],

  visualMetaphor: {
    description: 'Lyra approaches a point from stage left (dimly lit) and stage right (brightly lit). If both approaches converge to the same spot, the full spotlight appears.',
    animationType: 'dance',
    parameters: {
      leftApproachColor: '#4169E1',
      rightApproachColor: '#FF6347',
      convergenceEffect: 'spotlight-merge',
    },
  },

  workedExamples: [
    {
      id: 'ex-1-2-1',
      problemStatement: 'Find the left-hand and right-hand limits of |x|/x as x approaches 0.',
      problemLatex: '\\lim_{x \\to 0^-} \\frac{|x|}{x} \\quad \\text{and} \\quad \\lim_{x \\to 0^+} \\frac{|x|}{x}',
      steps: [
        {
          stepNumber: 1,
          description: 'For x < 0: |x| = -x, so |x|/x = -x/x = -1',
          latex: 'x < 0: \\frac{|x|}{x} = \\frac{-x}{x} = -1',
        },
        {
          stepNumber: 2,
          description: 'For x > 0: |x| = x, so |x|/x = x/x = 1',
          latex: 'x > 0: \\frac{|x|}{x} = \\frac{x}{x} = 1',
        },
        {
          stepNumber: 3,
          description: 'Therefore the one-sided limits are different',
          latex: '\\lim_{x \\to 0^-} \\frac{|x|}{x} = -1, \\quad \\lim_{x \\to 0^+} \\frac{|x|}{x} = 1',
        },
        {
          stepNumber: 4,
          description: 'Since the one-sided limits are not equal, the two-sided limit does not exist',
          latex: '\\lim_{x \\to 0} \\frac{|x|}{x} \\text{ does not exist (DNE)}',
        },
      ],
      finalAnswer: 'Left: -1, Right: 1, Two-sided: DNE',
      finalAnswerLatex: '\\lim_{x \\to 0^-} = -1, \\quad \\lim_{x \\to 0^+} = 1, \\quad \\lim_{x \\to 0} \\text{ DNE}',
    },
  ],

  practiceProblems: [
    {
      id: 'prob-1-2-01',
      topicId: CalcTopic.ONE_SIDED_LIMITS,
      type: ProblemType.NUMERIC_INPUT,
      difficulty: Difficulty.ANDANTE,
      statement: 'For the piecewise function, find the left-hand limit as x approaches 1.',
      statementLatex: 'f(x) = \\begin{cases} 2x & x < 1 \\\\ x + 3 & x \\geq 1 \\end{cases} \\quad \\lim_{x \\to 1^-} f(x) = ?',
      correctAnswer: '2',
      tolerance: 0.01,
      hints: ['For x < 1, use the first piece: f(x) = 2x.', 'Substitute x = 1 into 2x.'],
      detailedSolution: [
        { stepNumber: 1, description: 'For x approaching 1 from the left, x < 1, so f(x) = 2x', latex: '\\lim_{x \\to 1^-} 2x = 2(1) = 2' },
      ],
      xpReward: 5,
      tags: ['piecewise', 'one-sided'],
      artContext: 'Lyra performs two different routines on each side of the stage. What\'s the finale from the left?',
    },
    {
      id: 'prob-1-2-02',
      topicId: CalcTopic.ONE_SIDED_LIMITS,
      type: ProblemType.MULTIPLE_CHOICE,
      difficulty: Difficulty.MODERATO,
      statement: 'Does the two-sided limit exist?',
      statementLatex: 'f(x) = \\begin{cases} x^2 & x < 2 \\\\ 3x - 2 & x \\geq 2 \\end{cases} \\quad \\text{Does } \\lim_{x \\to 2} f(x) \\text{ exist?}',
      options: [
        { id: 'a', text: 'Yes, it equals 4', isCorrect: true },
        { id: 'b', text: 'No, the one-sided limits differ', isCorrect: false },
        { id: 'c', text: 'Yes, it equals 2', isCorrect: false },
        { id: 'd', text: 'Cannot be determined', isCorrect: false },
      ],
      correctAnswer: 'a',
      hints: ['Check both one-sided limits. Left: x² at x=2. Right: 3x-2 at x=2.'],
      detailedSolution: [
        { stepNumber: 1, description: 'Left-hand limit', latex: '\\lim_{x \\to 2^-} x^2 = 4' },
        { stepNumber: 2, description: 'Right-hand limit', latex: '\\lim_{x \\to 2^+} (3x-2) = 4' },
        { stepNumber: 3, description: 'Both equal 4, so the limit exists', latex: '\\lim_{x \\to 2} f(x) = 4' },
      ],
      xpReward: 10,
      tags: ['piecewise', 'existence'],
    },
  ],

  creativeTask: {
    id: 'creative-1-2',
    topicId: CalcTopic.ONE_SIDED_LIMITS,
    title: 'Design a Piecewise Dance',
    description: 'Create a piecewise function where Lyra dances differently from each side. Choose whether the two sides agree!',
    type: 'dance-animator',
    instructions: [
      'Define a left-side function for x < a',
      'Define a right-side function for x ≥ a',
      'Watch Lyra dance both pieces',
      'Toggle between matching and non-matching limits',
    ],
    constraints: { minPieces: 2, maxPieces: 4 },
    xpReward: 15,
    evaluationCriteria: ['Creates valid piecewise function', 'Correctly identifies whether limit exists'],
  },
};

// ----------------------------------------------------------------
// BOSS BATTLE: The Discontinuity Phantom
// ----------------------------------------------------------------

export const discontinuityPhantomBoss: BossBattle = {
  id: 'boss-limits',
  regionId: Region.VALLEY_OF_LIMITS,
  bossName: 'The Discontinuity Phantom',
  bossCharacterId: CharacterId.THE_STATIC,
  description: 'A spectral dancer whose movements are riddled with discontinuities — teleportations, jumps, and undefined moments. Defeat it by mastering limits!',

  totalXpReward: 200,

  phases: [
    {
      phaseNumber: 1,
      title: 'The Approaching Storm',
      description: 'Evaluate limits to dodge the Phantom\'s teleportation attacks!',
      bossHealthPerPhase: 100,
      playerDamagePerCorrect: 25,
      bossDamagePerIncorrect: 15,
      timeLimit: 120,
      dialogue: [
        {
          characterId: CharacterId.THE_STATIC,
          text: 'You think you can approach me? I exist at NO point!',
          emotion: 'dramatic',
        },
        {
          characterId: CharacterId.LYRA,
          text: 'Focus, Resonant! Evaluate the limits to predict where the Phantom will appear!',
          emotion: 'encouraging',
        },
      ],
      problems: [
        {
          id: 'boss-1-p1-01',
          topicId: CalcTopic.INTRO_TO_LIMITS,
          type: ProblemType.NUMERIC_INPUT,
          difficulty: Difficulty.MODERATO,
          statement: 'The Phantom teleports along f(x) = (x²-25)/(x-5). Where does it appear near x=5?',
          statementLatex: '\\lim_{x \\to 5} \\frac{x^2 - 25}{x - 5}',
          correctAnswer: '10',
          tolerance: 0.01,
          hints: ['Factor: x²-25 = (x-5)(x+5)'],
          detailedSolution: [
            { stepNumber: 1, description: 'Factor and cancel', latex: '\\frac{(x-5)(x+5)}{x-5} = x+5' },
            { stepNumber: 2, description: 'Substitute', latex: '5 + 5 = 10' },
          ],
          xpReward: 15,
          tags: ['boss', 'factoring'],
        },
        {
          id: 'boss-1-p1-02',
          topicId: CalcTopic.INTRO_TO_LIMITS,
          type: ProblemType.NUMERIC_INPUT,
          difficulty: Difficulty.MODERATO,
          statement: 'Predict the Phantom\'s position!',
          statementLatex: '\\lim_{x \\to -2} \\frac{x^2 + 5x + 6}{x + 2}',
          correctAnswer: '1',
          tolerance: 0.01,
          hints: ['Factor: x²+5x+6 = (x+2)(x+3)'],
          detailedSolution: [
            { stepNumber: 1, description: 'Factor', latex: '\\frac{(x+2)(x+3)}{x+2} = x+3' },
            { stepNumber: 2, description: 'Substitute', latex: '-2+3 = 1' },
          ],
          xpReward: 15,
          tags: ['boss', 'factoring'],
        },
      ],
    },
    {
      phaseNumber: 2,
      title: 'Cracks in the Dance',
      description: 'Identify the types of discontinuities to find the Phantom\'s weak points!',
      bossHealthPerPhase: 100,
      playerDamagePerCorrect: 30,
      bossDamagePerIncorrect: 20,
      timeLimit: 90,
      dialogue: [
        {
          characterId: CharacterId.THE_STATIC,
          text: 'I am EVERY discontinuity! Jump! Removable! Infinite!',
          emotion: 'dramatic',
        },
      ],
      problems: [
        {
          id: 'boss-1-p2-01',
          topicId: CalcTopic.CONTINUITY,
          type: ProblemType.MULTIPLE_CHOICE,
          difficulty: Difficulty.ALLEGRO,
          statement: 'What type of discontinuity does f(x) = (x²-1)/(x-1) have at x=1?',
          statementLatex: 'f(x) = \\frac{x^2-1}{x-1} \\text{ at } x=1',
          options: [
            { id: 'a', text: 'Removable (hole)', isCorrect: true },
            { id: 'b', text: 'Jump discontinuity', isCorrect: false },
            { id: 'c', text: 'Infinite discontinuity', isCorrect: false },
            { id: 'd', text: 'No discontinuity', isCorrect: false },
          ],
          correctAnswer: 'a',
          hints: ['Can you simplify f(x)?'],
          detailedSolution: [
            { stepNumber: 1, description: 'Factor', latex: '\\frac{(x-1)(x+1)}{x-1} = x+1 \\text{ for } x \\neq 1' },
            { stepNumber: 2, description: 'The limit exists (equals 2) but f(1) is undefined — removable discontinuity', latex: '\\lim_{x\\to 1} f(x) = 2, \\text{ but } f(1) \\text{ undefined}' },
          ],
          xpReward: 20,
          tags: ['boss', 'discontinuity-classification'],
        },
      ],
    },
    {
      phaseNumber: 3,
      title: 'The Squeeze',
      description: 'Use the Squeeze Theorem to trap the Phantom once and for all!',
      bossHealthPerPhase: 100,
      playerDamagePerCorrect: 35,
      bossDamagePerIncorrect: 25,
      timeLimit: 120,
      dialogue: [
        {
          characterId: CharacterId.LYRA,
          text: 'We can trap it! If we can bound it from above and below...',
          emotion: 'excited',
        },
      ],
      problems: [
        {
          id: 'boss-1-p3-01',
          topicId: CalcTopic.SQUEEZE_THEOREM,
          type: ProblemType.NUMERIC_INPUT,
          difficulty: Difficulty.ALLEGRO,
          statement: 'Use the Squeeze Theorem. We know -x² ≤ x²sin(1/x) ≤ x². Find the limit as x→0.',
          statementLatex: '-x^2 \\leq x^2\\sin\\left(\\frac{1}{x}\\right) \\leq x^2 \\quad \\lim_{x \\to 0} x^2\\sin\\left(\\frac{1}{x}\\right) = ?',
          correctAnswer: '0',
          tolerance: 0.01,
          hints: [
            'Both bounds, -x² and x², approach 0 as x → 0.',
            'By the Squeeze Theorem, the middle function must also approach 0.',
          ],
          detailedSolution: [
            { stepNumber: 1, description: 'Both bounds approach 0', latex: '\\lim_{x\\to 0} -x^2 = 0, \\quad \\lim_{x\\to 0} x^2 = 0' },
            { stepNumber: 2, description: 'By the Squeeze Theorem', latex: '\\lim_{x\\to 0} x^2\\sin(1/x) = 0' },
          ],
          xpReward: 25,
          tags: ['boss', 'squeeze-theorem'],
        },
      ],
    },
  ],

  defeatDialogue: [
    {
      characterId: CharacterId.THE_STATIC,
      text: 'No... you\'ve bounded me... squeezed me... I cannot diverge...',
      emotion: 'dramatic',
    },
  ],
  victoryDialogue: [
    {
      characterId: CharacterId.LYRA,
      text: 'Magnificent! The Font of Motion flows again! You\'ve mastered the art of limits, Resonant.',
      emotion: 'excited',
    },
    {
      characterId: CharacterId.LYRA,
      text: 'Two paths now open before you: the Derivative Conservatory, and the Integral Atelier. Choose wisely... or explore both!',
      emotion: 'encouraging',
    },
  ],
};

// ---- Export all limits content ----

export const limitsLessons: Lesson[] = [
  introToLimitsLesson,
  oneSidedLimitsLesson,
  // Additional lessons (continuity, squeeze theorem, limits at infinity) follow the same pattern
];

export const limitsBoss = discontinuityPhantomBoss;
