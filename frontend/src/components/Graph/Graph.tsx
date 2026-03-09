import React from 'react';

// ---- Data shapes ----

export interface Point {
  x: number;
  y: number;
}

export interface GraphSeries {
  points: Point[];
  color?: string;
  label?: string;
  dashed?: boolean;
  width?: number;
  showDots?: boolean;         // render dots at each point (good for discrete sequences)
  dotRadius?: number;
}

export interface SpecialPoint {
  x: number;
  y: number;
  type: 'hole' | 'filled' | 'target' | 'asymptote-intersection';
  label?: string;
  color?: string;
}

export interface ShadedRegion {
  /** points forming upper boundary (x sorted); area shaded down to the x-axis */
  points: Point[];
  color?: string;
  opacity?: number;
}

export interface AsymptoteLine {
  axis: 'vertical' | 'horizontal';
  value: number;
  color?: string;
  label?: string;
}

export interface GraphProps {
  /** backwards-compat: simple array of points */
  points?: Point[];

  /** enhanced: multiple series */
  series?: GraphSeries[];

  /** special points (holes, targets, etc.) */
  specialPoints?: SpecialPoint[];

  /** shaded area regions (e.g. definite integrals) */
  shadedRegions?: ShadedRegion[];

  /** asymptote / reference lines */
  asymptotes?: AsymptoteLine[];

  /** axis labels */
  xLabel?: string;
  yLabel?: string;

  /** title shown above graph */
  title?: string;

  width?: number;
  height?: number;

  /** show a light grid */
  showGrid?: boolean;
}

// ---- Component ----

export default function Graph({
  points,
  series,
  specialPoints,
  shadedRegions,
  asymptotes,
  xLabel,
  yLabel,
  title,
  width = 480,
  height = 200,
  showGrid = true,
}: GraphProps) {
  // Normalise: if only `points` given wrap in a single series
  const allSeries: GraphSeries[] = series && series.length
    ? series
    : points && points.length
      ? [{ points, color: '#6366f1', showDots: false }]
      : [];

  if (allSeries.length === 0 && !specialPoints?.length && !shadedRegions?.length) {
    return <div style={{ width, height, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted, #999)', fontSize: '0.85rem' }}>No graph data</div>;
  }

  // Collect all points for axis bounds
  const allPts: Point[] = [
    ...allSeries.flatMap((s) => s.points),
    ...(specialPoints || []).map((p) => ({ x: p.x, y: p.y })),
    ...(shadedRegions || []).flatMap((r) => r.points),
  ];

  const xs = allPts.map((p) => p.x);
  const ys = allPts.map((p) => p.y);

  // Filter out infinite / NaN for axis calc
  const finiteXs = xs.filter(Number.isFinite);
  const finiteYs = ys.filter(Number.isFinite);
  if (!finiteXs.length) finiteXs.push(0, 1);
  if (!finiteYs.length) finiteYs.push(0, 1);

  let minX = Math.min(...finiteXs);
  let maxX = Math.max(...finiteXs);
  let minY = Math.min(...finiteYs);
  let maxY = Math.max(...finiteYs);

  // Pad a bit
  const xPad = (maxX - minX) * 0.08 || 1;
  const yPad = (maxY - minY) * 0.08 || 1;
  minX -= xPad;
  maxX += xPad;
  minY -= yPad;
  maxY += yPad;

  const pad = { top: title ? 28 : 14, right: 14, bottom: xLabel ? 30 : 22, left: yLabel ? 38 : 32 };
  const plotW = width - pad.left - pad.right;
  const plotH = height - pad.top - pad.bottom;

  const sx = (x: number) => pad.left + ((x - minX) / (maxX - minX)) * plotW;
  const sy = (y: number) => pad.top + plotH - ((y - minY) / (maxY - minY)) * plotH;

  // Grid lines
  const gridLinesX: number[] = [];
  const gridLinesY: number[] = [];
  if (showGrid) {
    const niceStep = (range: number, ticks: number) => {
      const rough = range / ticks;
      const mag = Math.pow(10, Math.floor(Math.log10(rough)));
      const res = rough / mag;
      return (res <= 1.5 ? 1 : res <= 3.5 ? 2 : res <= 7.5 ? 5 : 10) * mag;
    };
    const stepX = niceStep(maxX - minX, 6);
    const stepY = niceStep(maxY - minY, 5);
    for (let v = Math.ceil(minX / stepX) * stepX; v <= maxX; v += stepX) gridLinesX.push(v);
    for (let v = Math.ceil(minY / stepY) * stepY; v <= maxY; v += stepY) gridLinesY.push(v);
  }

  const COLORS = ['#6366f1', '#22c55e', '#f59e0b', '#ef4444', '#06b6d4', '#a855f7'];

  return (
    <svg width={width} height={height} style={{ background: 'transparent', overflow: 'visible' }}>
      {/* Title */}
      {title && (
        <text x={width / 2} y={14} textAnchor="middle" fontSize={11} fontWeight={600} fill="var(--text, #333)">{title}</text>
      )}

      {/* Grid */}
      {showGrid && (
        <g opacity={0.18}>
          {gridLinesX.map((v, i) => (
            <line key={`gx-${i}`} x1={sx(v)} x2={sx(v)} y1={pad.top} y2={pad.top + plotH} stroke="#666" strokeWidth={0.5} />
          ))}
          {gridLinesY.map((v, i) => (
            <line key={`gy-${i}`} x1={pad.left} x2={pad.left + plotW} y1={sy(v)} y2={sy(v)} stroke="#666" strokeWidth={0.5} />
          ))}
        </g>
      )}

      {/* Grid labels */}
      {showGrid && (
        <g>
          {gridLinesX.map((v, i) => (
            <text key={`lx-${i}`} x={sx(v)} y={pad.top + plotH + 14} textAnchor="middle" fontSize={9} fill="#999">{Math.abs(v) < 1e-10 ? 0 : +v.toPrecision(3)}</text>
          ))}
          {gridLinesY.map((v, i) => (
            <text key={`ly-${i}`} x={pad.left - 6} y={sy(v) + 3} textAnchor="end" fontSize={9} fill="#999">{Math.abs(v) < 1e-10 ? 0 : +v.toPrecision(3)}</text>
          ))}
        </g>
      )}

      {/* Axes */}
      <line x1={pad.left} y1={pad.top + plotH} x2={pad.left + plotW} y2={pad.top + plotH} stroke="#334" strokeWidth={1} />
      <line x1={pad.left} y1={pad.top} x2={pad.left} y2={pad.top + plotH} stroke="#334" strokeWidth={1} />

      {/* Zero lines if in view */}
      {minY < 0 && maxY > 0 && (
        <line x1={pad.left} y1={sy(0)} x2={pad.left + plotW} y2={sy(0)} stroke="#334" strokeWidth={0.5} strokeDasharray="4 3" opacity={0.4} />
      )}
      {minX < 0 && maxX > 0 && (
        <line x1={sx(0)} y1={pad.top} x2={sx(0)} y2={pad.top + plotH} stroke="#334" strokeWidth={0.5} strokeDasharray="4 3" opacity={0.4} />
      )}

      {/* Asymptotes */}
      {asymptotes?.map((a, i) => {
        const color = a.color || '#ef4444';
        if (a.axis === 'vertical') {
          const px = sx(a.value);
          if (px < pad.left || px > pad.left + plotW) return null;
          return (
            <g key={`asym-${i}`}>
              <line x1={px} x2={px} y1={pad.top} y2={pad.top + plotH} stroke={color} strokeWidth={1.5} strokeDasharray="6 4" opacity={0.7} />
              {a.label && <text x={px + 4} y={pad.top + 12} fontSize={9} fill={color}>{a.label}</text>}
            </g>
          );
        } else {
          const py = sy(a.value);
          if (py < pad.top || py > pad.top + plotH) return null;
          return (
            <g key={`asym-${i}`}>
              <line x1={pad.left} x2={pad.left + plotW} y1={py} y2={py} stroke={color} strokeWidth={1.5} strokeDasharray="6 4" opacity={0.7} />
              {a.label && <text x={pad.left + plotW - 4} y={py - 4} textAnchor="end" fontSize={9} fill={color}>{a.label}</text>}
            </g>
          );
        }
      })}

      {/* Shaded regions */}
      {shadedRegions?.map((r, i) => {
        if (r.points.length < 2) return null;
        const sorted = [...r.points].sort((a, b) => a.x - b.x);
        const top = sorted.map((p) => `${sx(p.x)},${sy(p.y)}`).join(' ');
        const baseY = sy(Math.max(0, minY));
        const bottomRight = `${sx(sorted[sorted.length - 1].x)},${baseY}`;
        const bottomLeft = `${sx(sorted[0].x)},${baseY}`;
        return (
          <polygon
            key={`shade-${i}`}
            points={`${top} ${bottomRight} ${bottomLeft}`}
            fill={r.color || '#6366f1'}
            opacity={r.opacity ?? 0.2}
          />
        );
      })}

      {/* Series */}
      {allSeries.map((s, si) => {
        const color = s.color || COLORS[si % COLORS.length];
        const validPts = s.points.filter((p) => Number.isFinite(p.x) && Number.isFinite(p.y));
        if (!validPts.length) return null;

        // Break polyline at large gaps (asymptote jumps)
        const segments: Point[][] = [];
        let current: Point[] = [validPts[0]];
        for (let i = 1; i < validPts.length; i++) {
          const prev = validPts[i - 1];
          const cur = validPts[i];
          const dy = Math.abs(cur.y - prev.y);
          const yRange = maxY - minY;
          if (dy > yRange * 0.6 && Math.abs(cur.x - prev.x) < (maxX - minX) * 0.05) {
            // Likely an asymptote discontinuity — break the line
            segments.push(current);
            current = [cur];
          } else {
            current.push(cur);
          }
        }
        segments.push(current);

        return (
          <g key={`series-${si}`}>
            {segments.map((seg, segi) => (
              <polyline
                key={`seg-${segi}`}
                fill="none"
                stroke={color}
                strokeWidth={s.width ?? 2}
                strokeDasharray={s.dashed ? '6 4' : undefined}
                points={seg.map((p) => `${sx(p.x)},${sy(p.y)}`).join(' ')}
              />
            ))}
            {s.showDots && validPts.map((p, pi) => (
              <circle key={`dot-${pi}`} cx={sx(p.x)} cy={sy(p.y)} r={s.dotRadius ?? 3} fill={color} />
            ))}
            {s.label && (
              <text
                x={sx(validPts[validPts.length - 1].x) + 4}
                y={sy(validPts[validPts.length - 1].y) - 6}
                fontSize={10}
                fill={color}
                fontWeight={600}
              >
                {s.label}
              </text>
            )}
          </g>
        );
      })}

      {/* Special points */}
      {specialPoints?.map((sp, i) => {
        const color = sp.color || '#ef4444';
        const cx = sx(sp.x);
        const cy = sy(sp.y);
        if (!Number.isFinite(cx) || !Number.isFinite(cy)) return null;
        return (
          <g key={`sp-${i}`}>
            {sp.type === 'hole' && (
              <circle cx={cx} cy={cy} r={5} fill="white" stroke={color} strokeWidth={2} />
            )}
            {sp.type === 'filled' && (
              <circle cx={cx} cy={cy} r={5} fill={color} />
            )}
            {sp.type === 'target' && (
              <>
                <circle cx={cx} cy={cy} r={8} fill="none" stroke="#f59e0b" strokeWidth={1.5} />
                <circle cx={cx} cy={cy} r={4} fill="#f59e0b" opacity={0.6} />
              </>
            )}
            {sp.label && (
              <text x={cx + 8} y={cy - 4} fontSize={10} fill={color} fontWeight={500}>{sp.label}</text>
            )}
          </g>
        );
      })}

      {/* Axis labels */}
      {xLabel && (
        <text x={pad.left + plotW / 2} y={height - 2} textAnchor="middle" fontSize={11} fill="var(--muted, #999)" fontStyle="italic">{xLabel}</text>
      )}
      {yLabel && (
        <text x={10} y={pad.top + plotH / 2} textAnchor="middle" fontSize={11} fill="var(--muted, #999)" fontStyle="italic" transform={`rotate(-90, 10, ${pad.top + plotH / 2})`}>{yLabel}</text>
      )}

      {/* Legend */}
      {allSeries.length > 1 && allSeries.some((s) => s.label) && (
        <g>
          {allSeries.filter((s) => s.label).map((s, i) => {
            const color = s.color || COLORS[i % COLORS.length];
            const lx = pad.left + 8;
            const ly = pad.top + 6 + i * 14;
            return (
              <g key={`legend-${i}`}>
                <line x1={lx} x2={lx + 16} y1={ly} y2={ly} stroke={color} strokeWidth={2} strokeDasharray={s.dashed ? '4 3' : undefined} />
                <text x={lx + 20} y={ly + 3} fontSize={9} fill={color} fontWeight={500}>{s.label}</text>
              </g>
            );
          })}
        </g>
      )}
    </svg>
  );
}
