import React from 'react';
import { Link, useParams } from 'react-router-dom';
import LessonViewer from '../../components/LessonViewer/LessonViewer';

export default function LessonPage() {
  const params = useParams();
  const lessonId = params.id || '';

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      <div className="top-bar">
        <h1>📚 Lesson</h1>
        <div className="version">v0.1.0-mvp</div>
      </div>
      <div className="page-shell">
        <LessonViewer lessonId={lessonId} />
        <div className="page-footer">
          <Link to="/story">← Back to Story</Link>
        </div>
      </div>
    </div>
  );
}
