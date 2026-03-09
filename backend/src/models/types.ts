// ============================================================
// Harmonia: The Calculus of Creation — Core Type Definitions
// ============================================================

// ---- Enums ----

export enum Region {
  VALLEY_OF_LIMITS = 'valley-of-limits',
  DERIVATIVE_CONSERVATORY = 'derivative-conservatory',
  INTEGRAL_ATELIER = 'integral-atelier',
  INFINITE_SERIES_AMPHITHEATER = 'infinite-series-amphitheater',
}

export enum CalcTopic {
  // Limits
  INTRO_TO_LIMITS = 'intro-to-limits',
  ONE_SIDED_LIMITS = 'one-sided-limits',
  CONTINUITY = 'continuity',
  SQUEEZE_THEOREM = 'squeeze-theorem',
  LIMITS_AT_INFINITY = 'limits-at-infinity',
  // Derivatives
  TANGENT_LINE_INTRO = 'tangent-line-intro',
  BASIC_DIFF_RULES = 'basic-differentiation-rules',
  PRODUCT_QUOTIENT_RULES = 'product-quotient-rules',
  CHAIN_RULE = 'chain-rule',
  TRIG_EXP_LOG_DERIVATIVES = 'trig-exp-log-derivatives',
  DERIVATIVE_APPLICATIONS = 'derivative-applications',
  // Integrals
  ANTIDERIVATIVES = 'antiderivatives',
  DEFINITE_INTEGRALS_AREA = 'definite-integrals-area',
  FUNDAMENTAL_THEOREM = 'fundamental-theorem-calculus',
  U_SUBSTITUTION = 'u-substitution',
  INTEGRATION_BY_PARTS = 'integration-by-parts',
  INTEGRAL_APPLICATIONS = 'integral-applications',
  // Series
  SEQUENCES = 'sequences',
  INFINITE_SERIES = 'infinite-series-convergence',
  CONVERGENCE_TESTS = 'convergence-tests',
  POWER_SERIES = 'power-series',
  TAYLOR_MACLAURIN = 'taylor-maclaurin-series',
}

export enum Difficulty {
  ANDANTE = 'andante',       // Easy
  MODERATO = 'moderato',     // Medium
  ALLEGRO = 'allegro',       // Hard
  VIRTUOSO = 'virtuoso',     // Expert
}

export enum MasteryLevel {
  LOCKED = 'locked',
  NOVICE = 'novice',
  APPRENTICE = 'apprentice',
  JOURNEYMAN = 'journeyman',
  MASTER = 'master',
  VIRTUOSO = 'virtuoso',
}

export enum GameMode {
  STORY = 'story',
  ARCADE = 'arcade',
  CREATIVE = 'creative',
  CHALLENGE = 'challenge',
}

export enum ProblemType {
  MULTIPLE_CHOICE = 'multiple-choice',
  NUMERIC_INPUT = 'numeric-input',
  EXPRESSION_INPUT = 'expression-input',
  GRAPH_INTERACTION = 'graph-interaction',
  ORDERING = 'ordering',
  TRUE_FALSE = 'true-false',
  FILL_IN_BLANK = 'fill-in-blank',
}

export enum CharacterId {
  LYRA = 'lyra',
  MAESTRO_FORTE = 'forte',
  IRIS = 'iris',
  VERSE = 'verse',
  THE_STATIC = 'the-static',
  RESONANT = 'resonant',
}

// ---- Core Data Structures ----

export interface Lesson {
  id: string;
  topicId: CalcTopic;
  regionId: Region;
  title: string;
  order: number;
  characterId: CharacterId;
  conceptExplanation: ConceptSection[];
  workedExamples: WorkedExample[];
  visualMetaphor: VisualMetaphor;
  practiceProblems: Problem[];
  creativeTask?: CreativeTask;
  prerequisites: CalcTopic[];
  xpReward: number;
}

export interface ConceptSection {
  id: string;
  title: string;
  dialogue: DialogueLine[];
  mathContent: MathContent[];
  interactiveElements?: InteractiveElement[];
}

export interface DialogueLine {
  characterId: CharacterId;
  text: string;
  emotion?: 'neutral' | 'excited' | 'thoughtful' | 'encouraging' | 'dramatic' | 'mysterious';
  latex?: string;  // Optional LaTeX expression spoken by character
}

export interface MathContent {
  type: 'definition' | 'theorem' | 'formula' | 'note' | 'example';
  title?: string;
  latex: string;
  explanation: string;
}

export interface VisualMetaphor {
  description: string;
  animationType: 'dance' | 'music' | 'painting' | 'poetry' | 'graph';
  parameters: Record<string, unknown>;
}

export interface WorkedExample {
  id: string;
  problemStatement: string;
  problemLatex: string;
  steps: SolutionStep[];
  finalAnswer: string;
  finalAnswerLatex: string;
}

export interface SolutionStep {
  stepNumber: number;
  description: string;
  latex: string;
  hint?: string;
}

export interface InteractiveElement {
  type: 'slider' | 'draggable-point' | 'graph-input' | 'toggle' | 'function-input';
  id: string;
  label: string;
  config: Record<string, unknown>;
}

// ---- Problem System ----

export interface Problem {
  id: string;
  topicId: CalcTopic;
  type: ProblemType;
  difficulty: Difficulty;
  statement: string;
  statementLatex: string;
  options?: ProblemOption[];       // For multiple choice
  correctAnswer: string;
  correctAnswerLatex?: string;
  tolerance?: number;              // For numeric answers
  hints: string[];
  detailedSolution: SolutionStep[];
  xpReward: number;
  tags: string[];
  artContext?: string;             // How this problem relates to the art theme
}

export interface ProblemOption {
  id: string;
  text: string;
  latex?: string;
  isCorrect: boolean;
}

export interface ProblemTemplate {
  id: string;
  topicId: CalcTopic;
  type: ProblemType;
  difficulty: Difficulty;
  templateStatement: string;
  templateLatex: string;
  parameters: ParameterDef[];
  answerFormula: string;
  solutionTemplate: SolutionStep[];
  tags: string[];
}

export interface ParameterDef {
  name: string;
  type: 'integer' | 'float' | 'choice';
  min?: number;
  max?: number;
  choices?: (string | number)[];
}

// ---- Creative Tasks ----

export interface CreativeTask {
  id: string;
  topicId: CalcTopic;
  title: string;
  description: string;
  type: 'melody-maker' | 'canvas-painter' | 'dance-animator' | 'poetry-generator';
  instructions: string[];
  constraints: Record<string, unknown>;
  xpReward: number;
  evaluationCriteria: string[];
}

// ---- Boss Battles ----

export interface BossBattle {
  id: string;
  regionId: Region;
  bossName: string;
  bossCharacterId: CharacterId;
  description: string;
  phases: BossPhase[];
  totalXpReward: number;
  defeatDialogue: DialogueLine[];
  victoryDialogue: DialogueLine[];
}

export interface BossPhase {
  phaseNumber: number;
  title: string;
  description: string;
  problems: Problem[];
  bossHealthPerPhase: number;
  playerDamagePerCorrect: number;
  bossDamagePerIncorrect: number;
  timeLimit?: number; // seconds
  dialogue: DialogueLine[];
}

// ---- Player State ----

export interface PlayerState {
  id: string;
  name: string;
  avatarConfig: AvatarConfig;
  level: number;
  totalXp: number;
  currentRegion: Region | null;
  topicMastery: Record<CalcTopic, TopicProgress>;
  badges: Badge[];
  unlockedAbilities: string[];
  skillTree: SkillTreeState;
  streakData: StreakData;
  settings: PlayerSettings;
  statistics: PlayerStatistics;
  createdAt: string;
  lastPlayedAt: string;
}

export interface AvatarConfig {
  baseStyle: string;
  colorScheme: string;
  accessories: string[];
}

export interface TopicProgress {
  topicId: CalcTopic;
  mastery: MasteryLevel;
  lessonsCompleted: boolean;
  problemsAttempted: number;
  problemsCorrect: number;
  averageTime: number; // seconds
  hintUsageRate: number;
  currentDifficulty: Difficulty;
  bossDefeated: boolean;
  creativeTasksCompleted: string[];
  recentAccuracy: number[]; // last 10 attempts (1=correct, 0=incorrect)
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  iconTheme: string;
  earnedAt: string;
  category: 'mastery' | 'speed' | 'creative' | 'streak' | 'boss' | 'special';
}

export interface SkillTreeState {
  unlockedNodes: string[];
  activeNode: string | null;
  totalSkillPoints: number;
  spentSkillPoints: number;
}

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string;
  streakRewardsClaimed: number[];
}

export interface PlayerSettings {
  difficulty: 'adaptive' | Difficulty;
  soundEnabled: boolean;
  musicVolume: number;
  sfxVolume: number;
  highContrastMode: boolean;
  textSize: 'small' | 'medium' | 'large';
  colorblindMode: boolean;
}

export interface PlayerStatistics {
  totalProblemsAttempted: number;
  totalProblemsCorrect: number;
  totalTimePlayed: number; // seconds
  bossesDefeated: number;
  creativeTasksCompleted: number;
  arcadeHighScore: number;
  favoriteRegion: Region | null;
}

// ---- Skill Tree ----

export interface SkillNode {
  id: string;
  name: string;
  description: string;
  branch: 'limits' | 'derivatives' | 'integrals' | 'series' | 'core' | 'creative' | 'visual' | 'musical';
  tier: number;
  prerequisites: string[];
  cost: number;
  effect: string;
  relatedTopics: CalcTopic[];
}

// ---- Game Session ----

export interface GameSession {
  sessionId: string;
  playerId: string;
  mode: GameMode;
  startedAt: string;
  currentLesson?: string;
  currentProblem?: string;
  problemResults: ProblemResult[];
  xpEarned: number;
}

export interface ProblemResult {
  problemId: string;
  topicId: CalcTopic;
  correct: boolean;
  timeSpent: number;
  hintsUsed: number;
  attemptNumber: number;
  answer: string;
  timestamp: string;
}

// ---- Arcade Mode ----

export interface ArcadeRound {
  roundNumber: number;
  problems: Problem[];
  timeLimit: number;
  difficultyScaling: number;
}

export interface ArcadeSession {
  sessionId: string;
  playerId: string;
  rounds: ArcadeRound[];
  currentRound: number;
  score: number;
  streak: number;
  maxStreak: number;
  startedAt: string;
}

// ---- API Response Types ----

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface LessonResponse {
  lesson: Lesson;
  playerProgress: TopicProgress;
  nextLesson?: string;
}

export interface ProblemResponse {
  problem: Problem;
  context?: string;
}

export interface SubmitAnswerRequest {
  problemId: string;
  answer: string;
  timeSpent: number;
  hintsUsed: number;
}

export interface SubmitAnswerResponse {
  correct: boolean;
  correctAnswer: string;
  correctAnswerLatex?: string;
  xpEarned: number;
  detailedSolution: SolutionStep[];
  feedback: string;
  newLevel?: number;
  newBadges?: Badge[];
  masteryUpdate?: { topic: CalcTopic; newMastery: MasteryLevel };
}
