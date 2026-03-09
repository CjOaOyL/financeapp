// ============================================================
// Harmonia — Curriculum API Routes
// ============================================================

import { Router, Request, Response } from 'express';
import {
  regions, getAllLessons, getAllBosses,
  getLessonById, getLessonsByTopic, getRegionById, getRegionForTopic,
} from '../data/curriculum/index';
import { Region, CalcTopic } from '../models/types';

const router = Router();

// GET /api/curriculum/regions — list all regions
router.get('/regions', (_req: Request, res: Response) => {
  const summary = regions.map(r => ({
    id: r.id,
    name: r.name,
    subtitle: r.subtitle,
    description: r.description,
    characterGuide: r.characterGuide,
    artTheme: r.artTheme,
    unlockRequirement: r.unlockRequirement,
    topicCount: r.topics.length,
    lessonCount: r.lessons.length,
    lessons: r.lessons,
    bossId: r.boss.id,
  }));
  res.json({ regions: summary });
});

// GET /api/curriculum/regions/:regionId — single region with full lessons
router.get('/regions/:regionId', (req: Request, res: Response) => {
  const region = getRegionById(req.params.regionId as Region);
  if (!region) return res.status(404).json({ error: 'Region not found' });
  res.json({ region });
});

// GET /api/curriculum/lessons — all lessons
router.get('/lessons', (_req: Request, res: Response) => {
  const lessons = getAllLessons().map(l => ({
    id: l.id,
    topicId: l.topicId,
    regionId: l.regionId,
    title: l.title,
    order: l.order,
    characterId: l.characterId,
    xpReward: l.xpReward,
  }));
  res.json({ lessons });
});

// GET /api/curriculum/lessons/:lessonId — single lesson with full content
router.get('/lessons/:lessonId', (req: Request, res: Response) => {
  const lesson = getLessonById(req.params.lessonId);
  if (!lesson) return res.status(404).json({ error: 'Lesson not found' });
  res.json({ lesson });
});

// GET /api/curriculum/topics/:topicId/lessons — lessons for a topic
router.get('/topics/:topicId/lessons', (req: Request, res: Response) => {
  const lessons = getLessonsByTopic(req.params.topicId as CalcTopic);
  res.json({ lessons });
});

// GET /api/curriculum/bosses — all boss battles
router.get('/bosses', (_req: Request, res: Response) => {
  const bosses = getAllBosses().map(b => ({
    id: b.id,
    regionId: b.regionId,
    bossName: b.bossName,
    description: b.description,
    totalXpReward: b.totalXpReward,
    phaseCount: b.phases.length,
  }));
  res.json({ bosses });
});

// GET /api/curriculum/bosses/:bossId — single boss with full phases
router.get('/bosses/:bossId', (req: Request, res: Response) => {
  const boss = getAllBosses().find(b => b.id === req.params.bossId);
  if (!boss) return res.status(404).json({ error: 'Boss not found' });
  res.json({ boss });
});

export default router;
