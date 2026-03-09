import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Api from '../../services/api';

export default function LessonList() {
  const [lessons, setLessons] = useState<any[]>([]);
  useEffect(() => {
    Api.get('/curriculum/lessons').then(r => setLessons(r.data.lessons || []));
  }, []);

  return (
    <div className="lesson-list">
      <h3>Lessons</h3>
      <ul>
        {lessons.map(l => (
          <li key={l.id}>
            <Link to={`/lesson/${l.id}`}>{l.title}</Link> — {l.xpReward} XP
          </li>
        ))}
      </ul>
      <Link to="/practice">Practice Problems</Link>
    </div>
  );
}
