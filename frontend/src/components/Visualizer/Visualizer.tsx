import React, { useEffect, useRef, useState } from 'react';
import { sampleFunction, pointsToSvgPath, Point } from '../../utils/plotUtils';

interface Props {
  func?: (x: number) => number;
  points?: Point[];
  domain?: [number, number];
  width?: number;
  height?: number;
  tangentX?: number | null;
  shade?: [number, number] | null;
}

export default function Visualizer({ func, points, domain = [-6, 6], width = 640, height = 240, tangentX = null, shade = null }: Props) {
  const padding = 12;
  const [viewDomain, setViewDomain] = useState<[number, number]>([domain[0], domain[1]]);
  const [internalTangent, setInternalTangent] = useState<number | null>(tangentX ?? null);
  const dragging = useRef(false);
  const dragStart = useRef<{ clientX: number; domain: [number, number] } | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const handleDragging = useRef(false);

  // Riemann state
  const [riemannEnabled, setRiemannEnabled] = useState(false);
  const [riemannInterval, setRiemannInterval] = useState<[number, number]>([Math.max(viewDomain[0], -2), Math.min(viewDomain[1], 2)]);
  const [riemannN, setRiemannN] = useState(8);
  const [riemannAnimating, setRiemannAnimating] = useState(false);

  useEffect(() => {
    setViewDomain([domain[0], domain[1]]);
  }, [domain[0], domain[1]]);

  // Sample using the current viewDomain for interactivity
  const pts: Point[] = points ?? (func ? sampleFunction(func, viewDomain[0], viewDomain[1], 400) : []);
  const path = pointsToSvgPath(pts, width, height);

  const shadePath = shade && func ? (() => {
    const [a, b] = shade;
    const s = sampleFunction(func, a, b, 120);
    const d = pointsToSvgPath(s, width, height);
    return d + ` L ${width - padding} ${height - padding} L ${padding} ${height - padding} Z`;
  })() : null;

  const tangent = internalTangent !== null && func ? (() => {
    const h = 1e-6;
    const x0 = internalTangent as number;
    const y0 = func(x0);
    const y1 = func(x0 + h);
    const slope = (y1 - y0) / h;
    const x1 = viewDomain[0];
    const x2 = viewDomain[1];
    const y1v = y0 + slope * (x1 - x0);
    const y2v = y0 + slope * (x2 - x0);
    return [{ x: x1, y: y1v }, { x: x2, y: y2v }];
  })() : null;

  function clientXToX(clientX: number) {
    const svg = svgRef.current;
    if (!svg) return (viewDomain[0] + viewDomain[1]) / 2;
    const rect = svg.getBoundingClientRect();
    const px = clientX - rect.left - padding;
    const usable = rect.width - padding * 2;
    const t = Math.max(0, Math.min(1, px / usable));
    return viewDomain[0] + t * (viewDomain[1] - viewDomain[0]);
  }

  function worldToSvg(x: number, y: number) {
    // compute scale using pts
    const xs = pts.map(p => p.x).filter(xv => !Number.isNaN(xv));
    const ys = pts.map(p => p.y).filter(yv => !Number.isNaN(yv));
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);
    const scaleX = (xv: number) => padding + ((xv - minX) / (maxX - minX || 1)) * (width - padding * 2);
    const scaleY = (yv: number) => height - (padding + ((yv - minY) / (maxY - minY || 1)) * (height - padding * 2));
    return { sx: scaleX(x), sy: scaleY(y), scaleX, scaleY, minY, maxY };
  }

  function onWheel(e: React.WheelEvent) {
    e.preventDefault();
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const mouseX = e.clientX;
    const worldX = clientXToX(mouseX);
    const zoomFactor = e.deltaY < 0 ? 0.85 : 1.15;
    const [a, b] = viewDomain;
    const leftDist = worldX - a;
    const rightDist = b - worldX;
    const newLeft = worldX - leftDist * zoomFactor;
    const newRight = worldX + rightDist * zoomFactor;
    setViewDomain([newLeft, newRight]);
  }

  function onMouseDown(e: React.MouseEvent) {
    // if handle is being dragged, ignore pan start
    if (handleDragging.current) return;
    dragging.current = true;
    dragStart.current = { clientX: e.clientX, domain: [viewDomain[0], viewDomain[1]] };
  }

  function onMouseMove(e: React.MouseEvent) {
    if (!dragging.current || !dragStart.current) return;
    const dx = e.clientX - dragStart.current.clientX;
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const domainWidth = dragStart.current.domain[1] - dragStart.current.domain[0];
    const pxToX = domainWidth / (rect.width - padding * 2);
    const shift = -dx * pxToX;
    setViewDomain([dragStart.current.domain[0] + shift, dragStart.current.domain[1] + shift]);
  }

  function onMouseUp(_e: React.MouseEvent) {
    dragging.current = false;
    dragStart.current = null;
  }

  function onDoubleClick() {
    setViewDomain([domain[0], domain[1]]);
    setInternalTangent(null);
  }

  function onClick(e: React.MouseEvent) {
    // Set tangent at clicked x
    const x = clientXToX(e.clientX);
    setInternalTangent(x);
  }

  // Handle pointer events for draggable tangent handle
  function onHandlePointerDown(e: React.PointerEvent) {
    e.stopPropagation();
    (e.target as Element).setPointerCapture(e.pointerId);
    handleDragging.current = true;
  }

  function onHandlePointerMove(e: React.PointerEvent) {
    if (!handleDragging.current) return;
    const x = clientXToX(e.clientX);
    setInternalTangent(x);
  }

  function onHandlePointerUp(e: React.PointerEvent) {
    try { (e.target as Element).releasePointerCapture(e.pointerId); } catch {}
    handleDragging.current = false;
  }

  // Riemann helpers
  function renderRiemannRects() {
    if (!riemannEnabled || !func) return null;
    const [a, b] = riemannInterval;
    const n = Math.max(1, Math.min(200, riemannN));
    const rects: JSX.Element[] = [];
    // compute scale helpers
    const xs = pts.map(p => p.x).filter(xv => !Number.isNaN(xv));
    const ys = pts.map(p => p.y).filter(yv => !Number.isNaN(yv));
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys.concat([0]));
    const maxY = Math.max(...ys.concat([0]));
    const scaleX = (xv: number) => padding + ((xv - minX) / (maxX - minX || 1)) * (width - padding * 2);
    const scaleY = (yv: number) => height - (padding + ((yv - minY) / (maxY - minY || 1)) * (height - padding * 2));

    const dx = (b - a) / n;
    for (let i = 0; i < n; i++) {
      const xLeft = a + i * dx;
      const xRight = xLeft + dx;
      const mid = (xLeft + xRight) / 2;
      let fmid = NaN;
      try { fmid = func(mid); } catch { fmid = NaN; }
      if (!Number.isFinite(fmid)) fmid = 0;
      const xSvg = scaleX(xLeft);
      const wSvg = Math.max(1, scaleX(xRight) - scaleX(xLeft));
      const y0 = scaleY(0);
      const yVal = scaleY(fmid);
      const rectY = Math.min(y0, yVal);
      const rectH = Math.abs(yVal - y0);
      rects.push(
        <rect key={i} x={xSvg} y={rectY} width={wSvg} height={rectH} fill="rgba(255,213,127,0.12)" stroke="rgba(255,213,127,0.08)" />
      );
    }
    return rects;
  }

  // Riemann animation control
  useEffect(() => {
    let t: any = null;
    if (riemannAnimating) {
      let step = 2;
      setRiemannN(step);
      t = setInterval(() => {
        step = Math.min(200, step + 2);
        setRiemannN(step);
        if (step >= 100) {
          clearInterval(t);
          setRiemannAnimating(false);
        }
      }, 120);
    }
    return () => { if (t) clearInterval(t); };
  }, [riemannAnimating]);

  return (
    <div style={{ width, height, background: 'transparent', userSelect: 'none' }}>
      <svg
        ref={svgRef}
        width={width}
        height={height}
        onWheel={onWheel}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
        onDoubleClick={onDoubleClick}
        onClick={onClick}
        style={{ cursor: dragging.current ? 'grabbing' : 'grab' }}
      >
        {/* axes */}
        <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#1b2430" strokeWidth={1} />
        <line x1={padding} y1={padding} x2={padding} y2={height - padding} stroke="#1b2430" strokeWidth={1} />

        {/* shaded area */}
        {shadePath ? <path d={shadePath} fill="rgba(139,213,197,0.12)" stroke="none" /> : null}

        {/* function curve */}
        <path d={path} fill="none" stroke="#8bd5c5" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />

        {/* Riemann rectangles */}
        {renderRiemannRects()}

        {/* tangent */}
        {tangent ? (
          (() => {
            const tPts = tangent.map(p => p);
            const tPath = pointsToSvgPath(tPts, width, height);
            return <path d={tPath} stroke="#ffd37f" strokeWidth={2} fill="none" strokeDasharray="6 4" />;
          })()
        ) : null}

        {/* draggable tangent handle */}
        {internalTangent !== null && func ? (() => {
          const y = (() => { try { return func(internalTangent as number); } catch { return 0; } })();
          const { sx, sy } = worldToSvg(internalTangent as number, y);
          return (
            <g>
              <circle
                cx={sx}
                cy={sy}
                r={6}
                fill="#ffd37f"
                stroke="#663e00"
                strokeWidth={1}
                onPointerDown={onHandlePointerDown}
                onPointerMove={onHandlePointerMove}
                onPointerUp={onHandlePointerUp}
                style={{ cursor: 'ew-resize' }}
              />
            </g>
          );
        })() : null}
      </svg>

      <div style={{ marginTop: 8, color: 'var(--muted)', fontSize: 13 }}>
        <button onClick={() => setViewDomain([domain[0], domain[1]])}>Reset View</button>
        <span style={{ marginLeft: 12 }}>Double-click resets view. Wheel to zoom. Drag to pan. Click to set tangent.</span>
      </div>

      <div style={{ marginTop: 10, display: 'flex', gap: 12, alignItems: 'center' }}>
        <label><input type="checkbox" checked={riemannEnabled} onChange={e => setRiemannEnabled(e.target.checked)} /> Show Riemann Sums</label>
        <label>Interval: <input type="number" value={riemannInterval[0]} step="0.1" onChange={e => setRiemannInterval([parseFloat(e.target.value), riemannInterval[1]])} style={{ width: 80 }} /></label>
        <label>to <input type="number" value={riemannInterval[1]} step="0.1" onChange={e => setRiemannInterval([riemannInterval[0], parseFloat(e.target.value)])} style={{ width: 80 }} /></label>
        <label>n: <input type="range" min={1} max={200} value={riemannN} onChange={e => setRiemannN(parseInt(e.target.value))} /></label>
        <button onClick={() => setRiemannAnimating(true)} disabled={riemannAnimating}>Animate</button>
      </div>
    </div>
  );
}
