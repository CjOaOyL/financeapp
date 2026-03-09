# Harmonia: The Calculus of Creation
## Complete Game Design Document

---

## 1. Executive Summary

**Harmonia** is a fully gamified educational game that teaches Calculus through an immersive world themed around arts, music, creativity, and expressive characters. Players explore four magical regions — each corresponding to a core calculus domain — solving puzzles, composing music, painting with integrals, and mastering the mathematics that fuels creativity.

**Tech Stack:** React + TypeScript (frontend), Node.js + Express (backend), Canvas/SVG (visualizations), KaTeX (math rendering), Web Audio API (music/sound)

**Target Audience:** High school juniors/seniors, college freshmen, adult learners, anyone studying Calculus I–II

---

## 2. Game Architecture

### 2.1 System Overview

```
┌─────────────────────────────────────────────────────────┐
│                    FRONTEND (React + TS)                  │
│                                                           │
│  ┌──────────┐ ┌───────────┐ ┌────────────┐ ┌──────────┐ │
│  │  World   │ │  Lesson   │ │   Problem  │ │ Dashboard│ │
│  │  Map &   │ │  Viewer & │ │   Solver & │ │ & Skill  │ │
│  │  Story   │ │  Dialogue │ │   Graphing │ │   Tree   │ │
│  └──────────┘ └───────────┘ └────────────┘ └──────────┘ │
│  ┌──────────┐ ┌───────────┐ ┌────────────┐ ┌──────────┐ │
│  │  Music   │ │  Creative │ │   Boss     │ │  Arcade  │ │
│  │  Engine  │ │   Canvas  │ │   Battle   │ │   Mode   │ │
│  └──────────┘ └───────────┘ └────────────┘ └──────────┘ │
│                                                           │
│  ┌─────────────────────────────────────────────────────┐ │
│  │           Visualization Engine (Canvas/SVG)          │ │
│  │   • Function Graphing    • Integral Shading          │ │
│  │   • Tangent Line Anim.   • Series Convergence Viz    │ │
│  │   • Limit Approach Anim. • Taylor Polynomial Overlay │ │
│  └─────────────────────────────────────────────────────┘ │
│                                                           │
│  ┌─────────────────────────────────────────────────────┐ │
│  │              Math Rendering (KaTeX)                   │ │
│  └─────────────────────────────────────────────────────┘ │
└──────────────────────────┬──────────────────────────────┘
                           │ REST API
┌──────────────────────────┴──────────────────────────────┐
│                   BACKEND (Express + TS)                  │
│                                                           │
│  ┌──────────┐ ┌───────────┐ ┌────────────┐ ┌──────────┐ │
│  │ Curriculum│ │  Problem  │ │ Progression│ │  Player  │ │
│  │  Engine  │ │ Generator │ │   System   │ │  State   │ │
│  └──────────┘ └───────────┘ └────────────┘ └──────────┘ │
│                                                           │
│  ┌──────────────────────────────────────────────────────┐│
│  │            Content Data (JSON Curriculum)              ││
│  └──────────────────────────────────────────────────────┘│
└──────────────────────────────────────────────────────────┘
```

### 2.2 Module Breakdown

| Module | Responsibility | Location |
|--------|---------------|----------|
| **World Map** | Region navigation, story progression | `frontend/src/components/WorldMap/` |
| **Lesson Viewer** | Concept teaching with visuals & dialogue | `frontend/src/components/LessonViewer/` |
| **Problem Solver** | Interactive problem-solving with feedback | `frontend/src/components/ProblemSolver/` |
| **Graph Engine** | Function plotting, tangent lines, shading | `frontend/src/components/Graph/` |
| **Dashboard** | XP, levels, badges, skill tree, mastery | `frontend/src/components/Dashboard/` |
| **Dialogue System** | Character interactions, story dialogue | `frontend/src/components/DialogueSystem/` |
| **Creative Canvas** | Art/music creation tied to math | `frontend/src/components/CreativeCanvas/` |
| **Boss Battle** | End-of-topic challenge encounters | `frontend/src/components/BossBattle/` |
| **Curriculum Engine** | Content management, topic sequencing | `backend/src/data/curriculum/` |
| **Problem Generator** | Procedural problem creation | `backend/src/utils/problemGenerator.ts` |
| **Progression System** | XP, leveling, rewards, adaptive difficulty | `backend/src/utils/progression.ts` |
| **Player State** | Save/load, achievements, stats | `backend/src/models/` |

### 2.3 Data Flow

1. **Player launches game** → Frontend loads player state from backend
2. **Player enters region** → Curriculum engine serves lesson content
3. **Lesson phase** → LessonViewer renders concepts + character dialogue
4. **Practice phase** → Problem Generator creates problems at adaptive difficulty
5. **Player submits answer** → Backend validates, awards XP, updates state
6. **Boss battle** → Multi-stage challenge tests comprehensive understanding
7. **Completion** → Rewards, badges, skill tree unlocks, next region available

---

## 3. World Design

### 3.1 The World of Harmonia

Harmonia is a realm where mathematical principles are the source of all creative energy. Long ago, the four Creative Fonts — springs of pure mathematical power — flowed freely, fueling art, music, dance, and poetry. But a force called **The Static** has begun disrupting the Fonts, causing creativity to stagnate. The player, a young **Resonant** (a person sensitive to mathematical harmonics), must journey through four regions, restore the Fonts, and defeat The Static.

### 3.2 Regions

| Region | Calculus Domain | Theme | Visual Style |
|--------|----------------|-------|-------------|
| **The Valley of Limits** | Limits & Continuity | Dance & Movement | Flowing watercolors, graceful motion trails |
| **The Derivative Conservatory** | Derivatives | Music & Composition | Grand concert hall, staff lines, musical notation |
| **The Integral Atelier** | Integrals | Painting & Visual Art | Artist's studio, canvas, paint splashes, color fills |
| **The Infinite Series Amphitheater** | Sequences & Series | Poetry & Rhythm | Open amphitheater, scrolling verses, rhythmic patterns |

### 3.3 Characters

| Character | Role | Region | Personality |
|-----------|------|--------|------------|
| **Lyra the Dancer** | Guide for Limits | Valley of Limits | Graceful, patient, philosophical |
| **Maestro Forte** | Guide for Derivatives | Derivative Conservatory | Passionate, dramatic, precise |
| **Iris the Painter** | Guide for Integrals | Integral Atelier | Warm, imaginative, detail-oriented |
| **Verse the Poet** | Guide for Series | Infinite Series Amphitheater | Rhythmic, mysterious, contemplative |
| **The Static** | Antagonist | All regions | Cold, chaotic, fragmented |
| **The Resonant (Player)** | Protagonist | All regions | Curious, determined, creative |

---

## 4. Game Mechanics

### 4.1 Core Loop

```
EXPLORE → LEARN → PRACTICE → CREATE → BATTLE → PROGRESS
  │         │        │          │        │         │
  │    Read concept  Solve    Apply    Boss    Unlock
  │    + dialogue   problems  skill   fight   new area
  │                           creatively
  └────────────────────────────────────────────────┘
```

### 4.2 XP & Leveling

- **Concept XP**: Earned by completing lessons (10-25 XP each)
- **Problem XP**: Earned by solving problems (5-50 XP based on difficulty)
- **Creative XP**: Earned in creative mode (15-30 XP)
- **Boss XP**: Earned by defeating bosses (100-250 XP)
- **Streak Bonus**: 1.5x multiplier for 3+ day streaks

**Level Thresholds**: Level N requires N × 100 XP (Level 1 = 100 XP, Level 10 = 1000 XP, etc.)

### 4.3 Badges

| Badge | Condition | Icon Theme |
|-------|-----------|-----------|
| First Steps | Complete first lesson | Musical note |
| Limit Breaker | Master all limit topics | Dancing figure |
| Derivative Virtuoso | Master all derivative topics | Conductor's baton |
| Integral Artist | Master all integral topics | Paintbrush |
| Series Sage | Master all series topics | Quill pen |
| Speed Demon | Complete 10 arcade rounds < 30s each | Lightning bolt |
| Creative Genius | Complete 5 creative challenges | Palette |
| Perfectionist | Get 100% on any boss battle | Gold star |
| Harmonist | Complete all four regions | Harmonia crest |

### 4.4 Skill Tree

```
                    ┌─────────────┐
                    │  RESONANT   │
                    │   (START)   │
                    └──────┬──────┘
           ┌───────────────┼───────────────┐
     ┌─────┴─────┐   ┌────┴────┐   ┌──────┴──────┐
     │  LIMITS   │   │INTUITION│   │  CREATIVE   │
     │  BRANCH   │   │ (CORE)  │   │   BRANCH    │
     └─────┬─────┘   └────┬────┘   └──────┬──────┘
           │              │                │
    ┌──────┴──────┐  ┌────┴────┐   ┌──────┴──────┐
    │ DERIVATIVES │  │ANALYSIS │   │   VISUAL    │
    │   BRANCH    │  │ (CORE)  │   │   BRANCH    │
    └──────┬──────┘  └────┬────┘   └──────┬──────┘
           │              │                │
    ┌──────┴──────┐  ┌────┴────┐   ┌──────┴──────┐
    │  INTEGRALS  │  │MASTERY  │   │   MUSICAL   │
    │   BRANCH    │  │ (CORE)  │   │   BRANCH    │
    └──────┬──────┘  └────┬────┘   └──────┴──────┘
           │              │
    ┌──────┴──────┐  ┌────┴────┐
    │   SERIES    │  │HARMONIA │
    │   BRANCH    │  │ MASTER  │
    └─────────────┘  └─────────┘
```

### 4.5 Adaptive Difficulty

The system tracks:
- **Accuracy rate** per topic (rolling window of last 10 attempts)
- **Response time** trends
- **Hint usage** frequency

**Difficulty levels**: Andante (Easy) → Moderato (Medium) → Allegro (Hard) → Virtuoso (Expert)

Rules:
- Accuracy > 85% for 5+ problems → increase difficulty
- Accuracy < 50% for 3+ problems → decrease difficulty
- Hint usage > 60% → provide more scaffolding at current level

### 4.6 Gameplay Modes

| Mode | Description | Unlocked |
|------|-------------|----------|
| **Story Mode** | Narrative-driven progression through Harmonia | Always |
| **Arcade Mode** | Rapid-fire problems, timed, increasing difficulty | After completing 1 region |
| **Creative Mode** | Manipulate graphs, create music/art with functions | After Level 5 |
| **Challenge Mode** | Weekly challenges, boss rush, puzzle rooms | After completing 2 regions |

---

## 5. UI/UX Design

### 5.1 Main Menu
- Animated background: swirling colors and musical notes
- Options: Continue, New Game, Arcade, Creative, Challenge, Settings
- Player avatar and level displayed prominently

### 5.2 World Map Screen
- Illustrated map of Harmonia with four distinct regions
- Glowing nodes for available lessons, dimmed for locked ones
- Character portraits at region entrances
- Progress bar per region

### 5.3 Lesson Viewer
- Split view: Character dialogue on left, concept visualization on right
- KaTeX-rendered math in speech bubbles and explanation panels
- Interactive elements inline (draggable points, sliders)
- "Try It" buttons that open mini-exercises

### 5.4 Problem Solver
- Problem statement with LaTeX rendering at top
- Interactive workspace in center (graphing, equation input)
- Hint button (with scaffold levels: hint → bigger hint → step-by-step)
- Submit button with animated feedback (correct: musical flourish + color burst; incorrect: gentle guidance)

### 5.5 Dashboard
- XP bar and level
- Badge collection (earned + locked)
- Skill tree (interactive, zoomable)
- Per-topic mastery meters
- Streak counter and daily challenge

### 5.6 Boss Battle Screen
- Full-screen encounter with animated boss character
- Health bars for both player and boss
- Multi-phase problems
- Dramatic music and visual effects

---

## 6. Technical Specifications

### 6.1 Frontend
- **Framework**: React 18 + TypeScript
- **State Management**: React Context + useReducer
- **Math Rendering**: KaTeX
- **Graphing**: Custom Canvas/SVG engine
- **Audio**: Web Audio API
- **Styling**: CSS Modules
- **Routing**: React Router v6

### 6.2 Backend
- **Runtime**: Node.js
- **Framework**: Express
- **Language**: TypeScript
- **Data Storage**: JSON files (MVP), upgradeable to database
- **Problem Generation**: Procedural algorithms with templates
- **Content**: Modular JSON curriculum files

### 6.3 Math Engine
- Expression parsing and evaluation
- Symbolic differentiation (basic rules)
- Numerical integration (Simpson's rule, trapezoidal)
- Series convergence testing
- LaTeX string generation

---

## 7. Content Scope

### Per-Topic Content Volume
- **4 Regions** × **4-6 Topics each** = ~20 topics
- **Per topic**: 1 lesson, 3 worked examples, 10+ practice problems, 1 creative task
- **4 Boss battles** (one per region)
- **20+ Arcade problem templates**
- **10+ Creative mode activities**

---

## 8. Accessibility
- High-contrast mode
- Screen reader support for math (MathML fallback)
- Keyboard navigation
- Adjustable text size
- Audio descriptions for visual concepts
- Colorblind-friendly palettes

---

*Document Version 1.0 — Harmonia: The Calculus of Creation*
