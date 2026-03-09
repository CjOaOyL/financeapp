// ============================================================
// Harmonia — Player State Management
// ============================================================

import { v4 as uuidv4 } from 'uuid';
import {
  PlayerState,
  CalcTopic,
  Difficulty,
  MasteryLevel,
  Region,
  TopicProgress,
  Badge,
} from './types';

// ---- Default Player State Factory ----

export function createDefaultPlayerState(name: string = 'Anonymous'): PlayerState {
  const topicMastery = {} as Record<CalcTopic, TopicProgress>;

  for (const topic of Object.values(CalcTopic)) {
    topicMastery[topic] = createDefaultTopicProgress(topic);
  }

  return {
    id: uuidv4(),
    name,
    avatarConfig: {
      baseStyle: 'default',
      colorScheme: 'harmonia-blue',
      accessories: [],
    },
    level: 1,
    totalXp: 0,
    currentRegion: null,
    topicMastery,
    badges: [],
    unlockedAbilities: [],
    skillTree: {
      unlockedNodes: ['resonant-start'],
      activeNode: 'resonant-start',
      totalSkillPoints: 0,
      spentSkillPoints: 0,
    },
    streakData: {
      currentStreak: 0,
      longestStreak: 0,
      lastActiveDate: new Date().toISOString().split('T')[0],
      streakRewardsClaimed: [],
    },
    settings: {
      difficulty: 'adaptive',
      soundEnabled: true,
      musicVolume: 0.7,
      sfxVolume: 0.8,
      highContrastMode: false,
      textSize: 'medium',
      colorblindMode: false,
    },
    statistics: {
      totalProblemsAttempted: 0,
      totalProblemsCorrect: 0,
      totalTimePlayed: 0,
      bossesDefeated: 0,
      creativeTasksCompleted: 0,
      arcadeHighScore: 0,
      favoriteRegion: null,
    },
    createdAt: new Date().toISOString(),
    lastPlayedAt: new Date().toISOString(),
  };
}

function createDefaultTopicProgress(topicId: CalcTopic): TopicProgress {
  return {
    topicId,
    mastery: MasteryLevel.LOCKED,
    lessonsCompleted: false,
    problemsAttempted: 0,
    problemsCorrect: 0,
    averageTime: 0,
    hintUsageRate: 0,
    currentDifficulty: Difficulty.ANDANTE,
    bossDefeated: false,
    creativeTasksCompleted: [],
    recentAccuracy: [],
  };
}

// ---- XP & Leveling ----

export function calculateLevel(totalXp: number): number {
  // Level N requires N * 100 cumulative XP
  // Total XP for level L = sum(1..L) * 100 = L*(L+1)/2 * 100
  // Solve: L*(L+1)/2 * 100 <= totalXp
  // L^2 + L - 2*totalXp/100 <= 0
  // L = (-1 + sqrt(1 + 8*totalXp/100)) / 2
  const level = Math.floor((-1 + Math.sqrt(1 + 8 * totalXp / 100)) / 2);
  return Math.max(1, level);
}

export function xpForLevel(level: number): number {
  return (level * (level + 1)) / 2 * 100;
}

export function xpToNextLevel(totalXp: number): { current: number; needed: number; progress: number } {
  const currentLevel = calculateLevel(totalXp);
  const currentLevelXp = xpForLevel(currentLevel);
  const nextLevelXp = xpForLevel(currentLevel + 1);
  const progressXp = totalXp - currentLevelXp;
  const neededXp = nextLevelXp - currentLevelXp;
  return {
    current: progressXp,
    needed: neededXp,
    progress: progressXp / neededXp,
  };
}

// ---- Mastery Evaluation ----

export function evaluateMastery(progress: TopicProgress): MasteryLevel {
  if (!progress.lessonsCompleted) return MasteryLevel.NOVICE;

  const accuracy = progress.problemsAttempted > 0
    ? progress.problemsCorrect / progress.problemsAttempted
    : 0;

  if (accuracy >= 0.95 && progress.bossDefeated && progress.creativeTasksCompleted.length > 0) {
    return MasteryLevel.VIRTUOSO;
  }
  if (accuracy >= 0.90 && progress.bossDefeated) {
    return MasteryLevel.MASTER;
  }
  if (accuracy >= 0.80) {
    return MasteryLevel.JOURNEYMAN;
  }
  if (accuracy >= 0.60) {
    return MasteryLevel.APPRENTICE;
  }
  return MasteryLevel.NOVICE;
}

// ---- Adaptive Difficulty ----

export function calculateAdaptiveDifficulty(progress: TopicProgress): Difficulty {
  const recent = progress.recentAccuracy;
  if (recent.length < 3) return Difficulty.ANDANTE;

  const recentAccuracy = recent.reduce((a, b) => a + b, 0) / recent.length;

  if (recentAccuracy > 0.90 && recent.length >= 5) return Difficulty.VIRTUOSO;
  if (recentAccuracy > 0.85 && recent.length >= 5) return Difficulty.ALLEGRO;
  if (recentAccuracy > 0.60) return Difficulty.MODERATO;
  return Difficulty.ANDANTE;
}

// ---- Streak Management ----

export function updateStreak(state: PlayerState): PlayerState {
  const today = new Date().toISOString().split('T')[0];
  const lastActive = state.streakData.lastActiveDate;

  const todayDate = new Date(today);
  const lastDate = new Date(lastActive);
  const diffDays = Math.floor((todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));

  let newStreak = state.streakData.currentStreak;
  if (diffDays === 1) {
    newStreak += 1;
  } else if (diffDays > 1) {
    newStreak = 1;
  }
  // diffDays === 0 means same day, streak unchanged

  return {
    ...state,
    streakData: {
      ...state.streakData,
      currentStreak: newStreak,
      longestStreak: Math.max(state.streakData.longestStreak, newStreak),
      lastActiveDate: today,
    },
  };
}

// ---- XP Multiplier ----

export function getStreakMultiplier(streak: number): number {
  if (streak >= 7) return 2.0;
  if (streak >= 3) return 1.5;
  return 1.0;
}

// ---- Badge Checking ----

export const BADGE_DEFINITIONS: Omit<Badge, 'earnedAt'>[] = [
  {
    id: 'first-steps',
    name: 'First Steps',
    description: 'Complete your first lesson in Harmonia',
    iconTheme: 'musical-note',
    category: 'mastery',
  },
  {
    id: 'limit-breaker',
    name: 'Limit Breaker',
    description: 'Master all topics in the Valley of Limits',
    iconTheme: 'dancing-figure',
    category: 'mastery',
  },
  {
    id: 'derivative-virtuoso',
    name: 'Derivative Virtuoso',
    description: 'Master all topics in the Derivative Conservatory',
    iconTheme: 'conductors-baton',
    category: 'mastery',
  },
  {
    id: 'integral-artist',
    name: 'Integral Artist',
    description: 'Master all topics in the Integral Atelier',
    iconTheme: 'paintbrush',
    category: 'mastery',
  },
  {
    id: 'series-sage',
    name: 'Series Sage',
    description: 'Master all topics in the Infinite Series Amphitheater',
    iconTheme: 'quill-pen',
    category: 'mastery',
  },
  {
    id: 'speed-demon',
    name: 'Speed Demon',
    description: 'Complete 10 arcade rounds in under 30 seconds each',
    iconTheme: 'lightning-bolt',
    category: 'speed',
  },
  {
    id: 'creative-genius',
    name: 'Creative Genius',
    description: 'Complete 5 creative challenges',
    iconTheme: 'palette',
    category: 'creative',
  },
  {
    id: 'perfectionist',
    name: 'Perfectionist',
    description: 'Get 100% on any boss battle',
    iconTheme: 'gold-star',
    category: 'boss',
  },
  {
    id: 'harmonist',
    name: 'Harmonist',
    description: 'Complete all four regions of Harmonia',
    iconTheme: 'harmonia-crest',
    category: 'special',
  },
  {
    id: 'week-warrior',
    name: 'Week Warrior',
    description: 'Maintain a 7-day streak',
    iconTheme: 'flame',
    category: 'streak',
  },
  {
    id: 'month-master',
    name: 'Month Master',
    description: 'Maintain a 30-day streak',
    iconTheme: 'inferno',
    category: 'streak',
  },
];

export function checkForNewBadges(state: PlayerState): Badge[] {
  const earnedIds = new Set(state.badges.map(b => b.id));
  const newBadges: Badge[] = [];

  const topics = state.topicMastery;

  // First Steps: any lesson completed
  if (!earnedIds.has('first-steps')) {
    const anyCompleted = Object.values(topics).some(t => t.lessonsCompleted);
    if (anyCompleted) {
      newBadges.push({ ...BADGE_DEFINITIONS.find(b => b.id === 'first-steps')!, earnedAt: new Date().toISOString() });
    }
  }

  // Region mastery badges
  const regionTopics: Record<string, CalcTopic[]> = {
    'limit-breaker': [CalcTopic.INTRO_TO_LIMITS, CalcTopic.ONE_SIDED_LIMITS, CalcTopic.CONTINUITY, CalcTopic.SQUEEZE_THEOREM, CalcTopic.LIMITS_AT_INFINITY],
    'derivative-virtuoso': [CalcTopic.TANGENT_LINE_INTRO, CalcTopic.BASIC_DIFF_RULES, CalcTopic.PRODUCT_QUOTIENT_RULES, CalcTopic.CHAIN_RULE, CalcTopic.TRIG_EXP_LOG_DERIVATIVES, CalcTopic.DERIVATIVE_APPLICATIONS],
    'integral-artist': [CalcTopic.ANTIDERIVATIVES, CalcTopic.DEFINITE_INTEGRALS_AREA, CalcTopic.FUNDAMENTAL_THEOREM, CalcTopic.U_SUBSTITUTION, CalcTopic.INTEGRATION_BY_PARTS, CalcTopic.INTEGRAL_APPLICATIONS],
    'series-sage': [CalcTopic.SEQUENCES, CalcTopic.INFINITE_SERIES, CalcTopic.CONVERGENCE_TESTS, CalcTopic.POWER_SERIES, CalcTopic.TAYLOR_MACLAURIN],
  };

  for (const [badgeId, topicList] of Object.entries(regionTopics)) {
    if (!earnedIds.has(badgeId)) {
      const allMastered = topicList.every(t =>
        topics[t]?.mastery === MasteryLevel.MASTER || topics[t]?.mastery === MasteryLevel.VIRTUOSO
      );
      if (allMastered) {
        newBadges.push({ ...BADGE_DEFINITIONS.find(b => b.id === badgeId)!, earnedAt: new Date().toISOString() });
      }
    }
  }

  // Harmonist: all four region badges
  if (!earnedIds.has('harmonist')) {
    const allRegionBadges = ['limit-breaker', 'derivative-virtuoso', 'integral-artist', 'series-sage'];
    const allEarned = allRegionBadges.every(id => earnedIds.has(id) || newBadges.some(b => b.id === id));
    if (allEarned) {
      newBadges.push({ ...BADGE_DEFINITIONS.find(b => b.id === 'harmonist')!, earnedAt: new Date().toISOString() });
    }
  }

  // Creative Genius
  if (!earnedIds.has('creative-genius') && state.statistics.creativeTasksCompleted >= 5) {
    newBadges.push({ ...BADGE_DEFINITIONS.find(b => b.id === 'creative-genius')!, earnedAt: new Date().toISOString() });
  }

  // Streak badges
  if (!earnedIds.has('week-warrior') && state.streakData.currentStreak >= 7) {
    newBadges.push({ ...BADGE_DEFINITIONS.find(b => b.id === 'week-warrior')!, earnedAt: new Date().toISOString() });
  }
  if (!earnedIds.has('month-master') && state.streakData.currentStreak >= 30) {
    newBadges.push({ ...BADGE_DEFINITIONS.find(b => b.id === 'month-master')!, earnedAt: new Date().toISOString() });
  }

  return newBadges;
}

// ---- Region Unlocking ----

export function getUnlockedRegions(state: PlayerState): Region[] {
  const unlocked: Region[] = [Region.VALLEY_OF_LIMITS]; // Always available

  const limitTopics = [CalcTopic.INTRO_TO_LIMITS, CalcTopic.ONE_SIDED_LIMITS, CalcTopic.CONTINUITY, CalcTopic.SQUEEZE_THEOREM, CalcTopic.LIMITS_AT_INFINITY];
  const limitsComplete = limitTopics.every(t =>
    state.topicMastery[t]?.mastery !== MasteryLevel.LOCKED
  );

  if (limitsComplete) {
    unlocked.push(Region.DERIVATIVE_CONSERVATORY);
    unlocked.push(Region.INTEGRAL_ATELIER);
  }

  const derivTopics = [CalcTopic.TANGENT_LINE_INTRO, CalcTopic.BASIC_DIFF_RULES, CalcTopic.PRODUCT_QUOTIENT_RULES, CalcTopic.CHAIN_RULE, CalcTopic.TRIG_EXP_LOG_DERIVATIVES, CalcTopic.DERIVATIVE_APPLICATIONS];
  const integralTopics = [CalcTopic.ANTIDERIVATIVES, CalcTopic.DEFINITE_INTEGRALS_AREA, CalcTopic.FUNDAMENTAL_THEOREM, CalcTopic.U_SUBSTITUTION, CalcTopic.INTEGRATION_BY_PARTS, CalcTopic.INTEGRAL_APPLICATIONS];

  const derivsComplete = derivTopics.some(t => state.topicMastery[t]?.lessonsCompleted);
  const integralsComplete = integralTopics.some(t => state.topicMastery[t]?.lessonsCompleted);

  if (derivsComplete && integralsComplete) {
    unlocked.push(Region.INFINITE_SERIES_AMPHITHEATER);
  }

  return unlocked;
}
