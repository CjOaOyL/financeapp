// ============================================================
// Harmonia — Express Server Entry Point
// ============================================================

import express from 'express';
import cors from 'cors';
import curriculumRoutes from './routes/curriculum';
import problemRoutes from './routes/problems';
import playerRoutes from './routes/player';

const app = express();
const PORT = process.env.PORT || 3001;

// ---- Middleware ----
app.use(cors());
app.use(express.json());

// ---- Health check ----
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    game: 'Harmonia: The Calculus of Creation',
    version: '0.1.0-mvp',
  });
});

// ---- API Routes ----
app.use('/api/curriculum', curriculumRoutes);
app.use('/api/problems', problemRoutes);
app.use('/api/player', playerRoutes);

// ---- Start ----
app.listen(PORT, () => {
  console.log(`\n🎵  Harmonia backend running on http://localhost:${PORT}`);
  console.log(`    GET  /api/health`);
  console.log(`    GET  /api/curriculum/regions`);
  console.log(`    GET  /api/curriculum/lessons`);
  console.log(`    GET  /api/problems/generate?topic=intro-to-limits`);
  console.log(`    GET  /api/player/:id\n`);
});

export default app;
