Harmonia — Roadmap (MVP → Full Game)

Overview
--------
This document outlines a practical roadmap to take Harmonia from the current MVP scaffold to a full-featured gamified calculus experience.

MVP (current target, 2-4 weeks)
- Backend
  - Curriculum data files (limits, derivatives, integrals, series) — done
  - Problem generator engine (basic templates) — done
  - Player state, XP, mastery, progression utils — done
  - Simple Express API routes for curriculum, problems, and player — done
- Frontend
  - Vite + React + TypeScript scaffold — done
  - Lesson viewer with KaTeX rendering — done
  - Problem solver frontend with API integration — done
  - Basic Graph & Visualizer components — done

Short-Term (next 1-2 months)
- Math visualization engine
  - Interactive plot: pan/zoom, function input, tangent and secant tools
  - Integral shading with Riemann-sum animation
  - Series partial-sum visualizer and convergence animations
- UI & UX polish
  - Dialogue system for lesson narration
  - Worked-example stepper with annotations
  - Creative task editors (poetry/sequence generator placeholder)
- Game systems
  - Arcade mode implementation (timed rounds, combos)
  - Story mode progression (region unlocks, boss eligibility checks)
- Testing & DevOps
  - Add unit/smoke tests for core utils and routes
  - Docker + local dev compose for full stack

Medium-Term (2-6 months)
- Rich audio design
  - WebAudio-based sonification: slope → pitch, convergence → rhythm
  - Procedural background music tied to player progress
- Persistent storage
  - Replace in-memory store with a Postgres or document DB
  - Add migrations and backups
- Accessibility & Internationalization
  - Full keyboard navigation, screen-reader labels, color contrast
  - Translate strings for target locales

Long-Term (6+ months)
- Social features
  - Share creative tasks (poems, compositions)
  - Leaderboards, friends, co-op boss battles
- Mobile-friendly UI & PWA
  - Responsive redesign and offline sync
- Analytics & adaptive learning
  - Telemetry for problem difficulty tuning, personalized pathways

Milestones
- M1 (MVP): Usable lessons + practice flow + basic visualizer (current)
- M2: Interactive visualization + Arcade mode playable
- M3: Audio sonification + Creative editor
- M4: Social features, persistent backend, mobile PWA

Next immediate tasks (this sprint)
1. Implement full interactive visualization (pan/zoom, tangent tool, integration shading).  
2. Wire Story mode progression to backend unlock logic and boss checks.  
3. Add persistence (lightweight DB) for player data before public tests.  

If you'd like, I can now implement pan/zoom and interactive tangent/area controls inside the Visualizer and add unit tests for plot utilities. Which should I do next?