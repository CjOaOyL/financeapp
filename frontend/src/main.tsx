import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home/Home';
import LessonPage from './pages/LessonPage/LessonPage';
import Practice from './pages/Practice/Practice';
import StoryMode from './pages/StoryMode/StoryMode';
import ArcadeMode from './pages/ArcadeMode/ArcadeMode';
import CreativeMode from './pages/CreativeMode/CreativeMode';
import 'katex/dist/katex.min.css';
import './styles/global.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/lesson/:id" element={<LessonPage />} />
        <Route path="/practice" element={<Practice />} />
        <Route path="/story" element={<StoryMode />} />
        <Route path="/arcade" element={<ArcadeMode />} />
        <Route path="/creative" element={<CreativeMode />} />
      </Routes>
    </BrowserRouter>
  );
}

createRoot(document.getElementById('root')!).render(<App />);
