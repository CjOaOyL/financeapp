# Harmonia — Quick Start Guide

## Local Development (without Docker)

### Prerequisites
- Node.js 18+
- npm 9+

### 1. Install Backend

```bash
cd backend
npm install
```

### 2. Install Frontend

```bash
cd ../frontend
npm install
npm install @vitejs/plugin-react
```

### 3. Run Backend (Terminal 1)

```bash
cd backend
npm run dev
```

The backend will start at `http://localhost:3001`. You should see:
```
🎵  Harmonia backend running on http://localhost:3001
    GET  /api/health
    GET  /api/curriculum/regions
    ...
```

### 4. Run Frontend (Terminal 2)

```bash
cd frontend
npm run dev
```

The frontend will start at `http://localhost:5173`. Open your browser and navigate to `http://localhost:5173`.

### 5. Test the Flow

1. **Home** — View available regions and lessons
2. **Story Mode** — See region cards (first unlocked, rest locked)
3. **Practice** — Generate problems by topic and attempt to solve them
4. **Lesson** — Click on a lesson to view content with KaTeX math rendering
5. **Visualizer** — In Story Mode, interact with the graph (zoom, pan, tangent, Riemann sums)

## With Docker Compose

```bash
docker compose up
```

- Backend: http://localhost:3001
- Frontend: http://localhost:5173

## API Health Check

```bash
curl http://localhost:3001/api/health
```

Expected response:
```json
{
  "status": "ok",
  "game": "Harmonia: The Calculus of Creation",
  "version": "0.1.0-mvp"
}
```

## Test Endpoints

### Get Curriculum Regions
```bash
curl http://localhost:3001/api/curriculum/regions
```

### Get Lessons
```bash
curl http://localhost:3001/api/curriculum/lessons
```

### Generate a Problem
```bash
curl "http://localhost:3001/api/problems/generate?topic=intro-to-limits"
```

### Get Player State
```bash
curl http://localhost:3001/api/player/player-1
```

### Submit Problem Solution
```bash
curl -X POST http://localhost:3001/api/player/player-1/solve \
  -H "Content-Type: application/json" \
  -d '{
    "problemId": "prob-1-1-01",
    "topicId": "intro-to-limits",
    "correct": true,
    "attempts": 1,
    "timeTakenMs": 15000,
    "hintsUsed": 0,
    "difficulty": "moderato"
  }'
```

## File Structure

```
Harmonia/
├── backend/
│   ├── src/
│   │   ├── data/curriculum/  (lesson JSON files)
│   │   ├── models/           (types, player state)
│   │   ├── routes/           (API endpoints)
│   │   ├── utils/            (progression, problem gen)
│   │   └── server.ts         (Express app)
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── components/       (Visualizer, LessonViewer, ProblemSolver, BossBattle)
│   │   ├── pages/            (Home, StoryMode, Practice, ArcadeMode, CreativeMode)
│   │   ├── services/         (API client, player hook)
│   │   ├── styles/           (global CSS)
│   │   ├── utils/            (plot utils)
│   │   └── main.tsx          (React entry)
│   ├── package.json
│   ├── index.html
│   ├── vite.config.ts
│   └── tsconfig.json
└── ROADMAP.md
```
