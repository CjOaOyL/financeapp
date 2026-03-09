// ============================================================
// Harmonia — Problem & Quiz API Routes
// ============================================================

import { Router, Request, Response } from 'express';
import { CalcTopic, Difficulty } from '../models/types';
import {
  generateProblem, generateProblemBatch, generateMixedQuiz,
  getAvailableTopics, getAvailableDifficulties,
} from '../utils/problemGenerator';

const router = Router();

// GET /api/problems/generate?topic=...&difficulty=...
router.get('/generate', (req: Request, res: Response) => {
  const { topic, difficulty } = req.query;
  if (!topic) return res.status(400).json({ error: 'topic parameter required' });

  const problem = generateProblem(
    topic as CalcTopic,
    difficulty as Difficulty | undefined,
  );
  if (!problem) return res.status(404).json({ error: 'No template for this topic/difficulty' });

  res.json({ problem });
});

// GET /api/problems/batch?topic=...&count=...&difficulty=...
router.get('/batch', (req: Request, res: Response) => {
  const { topic, count, difficulty } = req.query;
  if (!topic) return res.status(400).json({ error: 'topic parameter required' });

  const problems = generateProblemBatch(
    topic as CalcTopic,
    parseInt(count as string) || 5,
    difficulty as Difficulty | undefined,
  );
  res.json({ problems, count: problems.length });
});

// POST /api/problems/quiz — generate a mixed quiz
router.post('/quiz', (req: Request, res: Response) => {
  const { topics, count, difficulty } = req.body;
  if (!topics || !Array.isArray(topics) || topics.length === 0) {
    return res.status(400).json({ error: 'topics array required' });
  }

  const problems = generateMixedQuiz(
    topics as CalcTopic[],
    count || 10,
    difficulty as Difficulty | undefined,
  );
  res.json({ problems, count: problems.length });
});

// GET /api/problems/topics — available topics with templates
router.get('/topics', (_req: Request, res: Response) => {
  const topics = getAvailableTopics();
  const topicsWithDifficulties = topics.map(t => ({
    topicId: t,
    difficulties: getAvailableDifficulties(t),
  }));
  res.json({ topics: topicsWithDifficulties });
});

export default router;
