// ============================================================
// Harmonia — Progression & Reward System (Simplified for MVP)
// ============================================================

import { PlayerState, Difficulty } from '../models/types';
import { calculateLevel } from '../models/playerState';

// ---- XP Constants ----

const BASE_XP: Record<Difficulty, number> = {
  [Difficulty.ANDANTE]: 5,
  [Difficulty.MODERATO]: 10,
  [Difficulty.ALLEGRO]: 18,
  [Difficulty.VIRTUOSO]: 30,
};

/**
 * Calculate XP earned from solving a problem (simplified for MVP).
 */
export function calculateXpAward(difficulty: Difficulty): number {
  return BASE_XP[difficulty] || 10;
}

/**
 * Apply XP to player and update level.
 */
export function awardXp(state: PlayerState, xp: number): PlayerState {
  const updated = { ...state };
  updated.totalXp += xp;
  updated.level = calculateLevel(updated.totalXp);
  updated.lastPlayedAt = new Date().toISOString();
  return updated;
}

/**
 * Mark a boss as defeated (MVP stub).
 */
export function defeatBoss(state: PlayerState, _bossId: string): PlayerState {
  return state;
}

/**
 * Get regions unlocked for a player (MVP: all unlocked).
 */
export function getUnlockedRegions(_state: PlayerState): string[] {
  return ['valley-of-limits', 'derivative-conservatory', 'integral-atelier', 'infinite-series-amphitheater'];
}
