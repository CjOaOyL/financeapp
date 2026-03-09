// ============================================================
// Harmonia — Curriculum Registry
// Centralized access to all regions, lessons, and boss battles
// ============================================================

import { Region, CalcTopic, Lesson, BossBattle } from '../../models/types';
import { limitsLessons, limitsBoss } from './limits';
import { derivativesLessons, derivativesBoss } from './derivatives';
import { integralsLessons, integralsBoss } from './integrals';
import { seriesLessons, seriesBoss } from './series';

// ---- Region Metadata ----

export interface RegionInfo {
  id: Region;
  name: string;
  subtitle: string;
  description: string;
  characterGuide: string;
  artTheme: string;
  unlockRequirement: string;
  lessons: Lesson[];
  boss: BossBattle;
  topics: CalcTopic[];
}

export const regions: RegionInfo[] = [
  {
    id: Region.VALLEY_OF_LIMITS,
    name: 'The Valley of Limits',
    subtitle: 'Where Every Journey Has a Destination',
    description: 'A sweeping landscape of gently converging paths, guided by the dancer Lyra. Here you learn to approach values and understand continuity.',
    characterGuide: 'Lyra',
    artTheme: 'Dance & Movement',
    unlockRequirement: 'Available from start',
    lessons: limitsLessons,
    boss: limitsBoss,
    topics: [
      CalcTopic.INTRO_TO_LIMITS,
      CalcTopic.ONE_SIDED_LIMITS,
      CalcTopic.CONTINUITY,
      CalcTopic.LIMITS_AT_INFINITY,
      CalcTopic.SQUEEZE_THEOREM,
    ],
  },
  {
    id: Region.DERIVATIVE_CONSERVATORY,
    name: 'The Derivative Conservatory',
    subtitle: 'Where Change Becomes Music',
    description: 'A grand conservatory of shifting tempos and rhythms. Maestro Forte teaches you to hear the rate of change as melody.',
    characterGuide: 'Maestro Forte',
    artTheme: 'Music & Sound',
    unlockRequirement: 'Complete the Valley of Limits boss',
    lessons: derivativesLessons,
    boss: derivativesBoss,
    topics: [
      CalcTopic.TANGENT_LINE_INTRO,
      CalcTopic.BASIC_DIFF_RULES,
      CalcTopic.CHAIN_RULE,
      CalcTopic.PRODUCT_QUOTIENT_RULES,
      CalcTopic.TRIG_EXP_LOG_DERIVATIVES,
      CalcTopic.DERIVATIVE_APPLICATIONS,
    ],
  },
  {
    id: Region.INTEGRAL_ATELIER,
    name: 'The Integral Atelier',
    subtitle: 'Where Parts Become Wholes',
    description: 'A painter\'s studio where fragments reassemble into masterpieces. Iris teaches you to accumulate area, volume, and meaning.',
    characterGuide: 'Iris',
    artTheme: 'Visual Art & Painting',
    unlockRequirement: 'Complete the Derivative Conservatory boss',
    lessons: integralsLessons,
    boss: integralsBoss,
    topics: [
      CalcTopic.ANTIDERIVATIVES,
      CalcTopic.DEFINITE_INTEGRALS_AREA,
      CalcTopic.FUNDAMENTAL_THEOREM,
      CalcTopic.U_SUBSTITUTION,
      CalcTopic.INTEGRATION_BY_PARTS,
      CalcTopic.INTEGRAL_APPLICATIONS,
    ],
  },
  {
    id: Region.INFINITE_SERIES_AMPHITHEATER,
    name: 'The Infinite Series Amphitheater',
    subtitle: 'Where Infinity Finds Its Voice',
    description: 'A vast amphitheater echoing with infinite patterns. Verse teaches you the poetry of convergence and the power of series.',
    characterGuide: 'Verse',
    artTheme: 'Poetry & Language',
    unlockRequirement: 'Complete the Integral Atelier boss',
    lessons: seriesLessons,
    boss: seriesBoss,
    topics: [
      CalcTopic.SEQUENCES,
      CalcTopic.INFINITE_SERIES,
      CalcTopic.CONVERGENCE_TESTS,
      CalcTopic.POWER_SERIES,
      CalcTopic.TAYLOR_MACLAURIN,
    ],
  },
];

// ---- Lookup helpers ----

/** All lessons across all regions, flattened */
export function getAllLessons(): Lesson[] {
  return regions.flatMap(r => r.lessons);
}

/** All boss battles */
export function getAllBosses(): BossBattle[] {
  return regions.map(r => r.boss);
}

/** Find a lesson by ID */
export function getLessonById(id: string): Lesson | undefined {
  return getAllLessons().find(l => l.id === id);
}

/** Find all lessons for a given topic */
export function getLessonsByTopic(topic: CalcTopic): Lesson[] {
  return getAllLessons().filter(l => l.topicId === topic);
}

/** Find the region a topic belongs to */
export function getRegionForTopic(topic: CalcTopic): RegionInfo | undefined {
  return regions.find(r => r.topics.includes(topic));
}

/** Get a region by its enum value */
export function getRegionById(id: Region): RegionInfo | undefined {
  return regions.find(r => r.id === id);
}

/** Get the next region in sequence, or undefined if last */
export function getNextRegion(current: Region): RegionInfo | undefined {
  const idx = regions.findIndex(r => r.id === current);
  return idx >= 0 && idx < regions.length - 1 ? regions[idx + 1] : undefined;
}
