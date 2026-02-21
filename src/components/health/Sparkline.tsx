import { format, parseISO } from 'date-fns';

interface SparklineProps {
  points: { date: string; value: number }[];
  width?: number;
  height?: number;
  color?: string;
}

export function Sparkline({
  points,
  width = 80,
  height = 28,
  color = '#3b82f6',
}: SparklineProps) {
  if (points.length < 2) return null;

  const values = points.map((p) => p.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  const padding = 4;
  const plotW = width - padding * 2;
  const plotH = height - padding * 2;

  const coords = points.map((p, i) => ({
    x: padding + (i / (points.length - 1)) * plotW,
    y: padding + plotH - ((p.value - min) / range) * plotH,
    date: p.date,
    value: p.value,
  }));

  const polyline = coords.map((c) => `${c.x},${c.y}`).join(' ');
  const last = coords[coords.length - 1];

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className="inline-block"
    >
      {/* Line */}
      <polyline
        points={polyline}
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Data points */}
      {coords.map((c, i) => (
        <circle key={i} cx={c.x} cy={c.y} r={i === coords.length - 1 ? 2.5 : 1.5} fill={color}>
          <title>
            {format(parseISO(c.date), 'MMM d, yyyy')}: {c.value}
          </title>
        </circle>
      ))}
      {/* Highlight latest point */}
      <circle cx={last.x} cy={last.y} r={4} fill={color} opacity={0.2} />
    </svg>
  );
}
