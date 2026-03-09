export interface Point { x: number; y: number }

export function sampleFunction(func: (x: number) => number, from: number, to: number, samples = 200): Point[] {
  const pts: Point[] = [];
  const step = (to - from) / (samples - 1);
  for (let i = 0; i < samples; i++) {
    const x = from + i * step;
    let y = NaN;
    try { y = func(x); } catch (e) { y = NaN; }
    if (!Number.isFinite(y)) y = NaN;
    pts.push({ x, y });
  }
  return pts;
}

export function pointsToSvgPath(points: Point[], width: number, height: number, padding = 12) {
  const xs = points.map(p => p.x).filter(x => !Number.isNaN(x));
  const ys = points.map(p => p.y).filter(y => !Number.isNaN(y));
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  const scaleX = (x: number) => padding + ((x - minX) / (maxX - minX || 1)) * (width - padding * 2);
  const scaleY = (y: number) => height - (padding + ((y - minY) / (maxY - minY || 1)) * (height - padding * 2));

  let d = '';
  let started = false;
  for (const p of points) {
    if (Number.isNaN(p.y)) { started = false; continue; }
    const sx = scaleX(p.x);
    const sy = scaleY(p.y);
    if (!started) {
      d += `M ${sx} ${sy} `;
      started = true;
    } else {
      d += `L ${sx} ${sy} `;
    }
  }
  return d;
}
