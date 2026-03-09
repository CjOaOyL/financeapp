// ============================================================
// Harmonia — Player State & Progression API Routes (MVP)
// ============================================================

import { Router, Request, Response } from 'express';
import { createDefaultPlayerState } from '../models/playerState';
import { Difficulty } from '../models/types';
import {
  calculateXpAward, awardXp, defeatBoss, getUnlockedRegions,
} from '../utils/progression';

const router = Router();

// ---- In-memory store (MVP; replace with DB later) ----
const playerStates: Map<string, any> = new Map();

function getOrCreatePlayer(playerId: string) {
  if (!playerStates.has(playerId)) {
    const state = createDefaultPlayerState();
    state.id = playerId;
    playerStates.set(playerId, state);
  }
  return playerStates.get(playerId)!;
}

// GET /api/player/:id — get player state
router.get('/:id', (req: Request, res: Response) => {
  const state = getOrCreatePlayer(req.params.id);
  res.json({
    player: state,
    unlockedRegions: getUnlockedRegions(state),
  });
});

// POST /api/player/:id/solve — submit a problem result (MVP: just award XP)
router.post('/:id/solve', (req: Request, res: Response) => {
  const state = getOrCreatePlayer(req.params.id);
  const { difficulty, correct } = req.body;

  if (!difficulty || typeof correct !== 'boolean') {
    return res.status(400).json({ error: 'difficulty and correct required' });
  }

  // Award XP only if correct
  let updatedState = state;
  if (correct) {
    const xp = calculateXpAward(difficulty as Difficulty);
    updatedState = awardXp(state, xp);
    playerStates.set(req.params.id, updatedState);
  }

  res.json({
    success: correct,
    xpAwarded: correct ? calculateXpAward(difficulty as Difficulty) : 0,
    player: updatedState,
  });
});

// POST /api/player/:id/boss-defeat — mark a boss as defeated
router.post('/:id/boss-defeat', (req: Request, res: Response) => {
  const state = getOrCreatePlayer(req.params.id);
  const { bossId } = req.body;

  if (!bossId) return res.status(400).json({ error: 'bossId required' });

  const updatedState = defeatBoss(state, bossId);
  playerStates.set(req.params.id, updatedState);

  res.json({
    player: updatedState,
    unlockedRegions: getUnlockedRegions(updatedState),
  });
});

// DELETE /api/player/:id — reset player (dev/debug)
router.delete('/:id', (req: Request, res: Response) => {
  playerStates.delete(req.params.id);
  res.json({ message: 'Player state reset' });
});

export default router;
