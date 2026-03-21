import { useState } from 'react';

// --- Types ---
interface TromboneNote {
  slide: number;   // 1-7 slide position
  partial: number; // 1-7 partial (embouchure)
  label?: string;  // note name
}

interface Song {
  id: string;
  title: string;
  artist?: string;
  notes: TromboneNote[];
}

// --- Song Data ---
const SONGS: Song[] = [
  {
    id: 'bb-scale',
    title: 'Escala Bb Mayor',
    notes: [
      { slide: 1, partial: 2, label: 'Bb' },
      { slide: 6, partial: 3, label: 'C' },
      { slide: 4, partial: 3, label: 'D' },
      { slide: 3, partial: 3, label: 'Eb' },
      { slide: 1, partial: 3, label: 'F' },
      { slide: 4, partial: 4, label: 'G' },
      { slide: 2, partial: 4, label: 'A' },
      { slide: 1, partial: 4, label: 'Bb' },
    ],
  },
  {
    id: 'twinkle',
    title: 'Twinkle Twinkle Little Star',
    notes: [
      { slide: 1, partial: 2, label: 'Bb' },
      { slide: 1, partial: 2, label: 'Bb' },
      { slide: 1, partial: 3, label: 'F' },
      { slide: 1, partial: 3, label: 'F' },
      { slide: 4, partial: 4, label: 'G' },
      { slide: 4, partial: 4, label: 'G' },
      { slide: 1, partial: 3, label: 'F' },
      { slide: 3, partial: 3, label: 'Eb' },
      { slide: 3, partial: 3, label: 'Eb' },
      { slide: 4, partial: 3, label: 'D' },
      { slide: 4, partial: 3, label: 'D' },
      { slide: 6, partial: 3, label: 'C' },
      { slide: 6, partial: 3, label: 'C' },
      { slide: 1, partial: 2, label: 'Bb' },
    ],
  },
  {
    id: 'ode-to-joy',
    title: 'Ode to Joy',
    artist: 'Beethoven',
    notes: [
      { slide: 4, partial: 3, label: 'D' },
      { slide: 4, partial: 3, label: 'D' },
      { slide: 3, partial: 3, label: 'Eb' },
      { slide: 1, partial: 3, label: 'F' },
      { slide: 1, partial: 3, label: 'F' },
      { slide: 3, partial: 3, label: 'Eb' },
      { slide: 4, partial: 3, label: 'D' },
      { slide: 6, partial: 3, label: 'C' },
      { slide: 1, partial: 2, label: 'Bb' },
      { slide: 1, partial: 2, label: 'Bb' },
      { slide: 6, partial: 3, label: 'C' },
      { slide: 4, partial: 3, label: 'D' },
      { slide: 4, partial: 3, label: 'D' },
      { slide: 6, partial: 3, label: 'C' },
      { slide: 6, partial: 3, label: 'C' },
    ],
  },
  {
    id: 'saints',
    title: 'When the Saints',
    notes: [
      { slide: 1, partial: 2, label: 'Bb' },
      { slide: 4, partial: 3, label: 'D' },
      { slide: 3, partial: 3, label: 'Eb' },
      { slide: 1, partial: 3, label: 'F' },
      { slide: 1, partial: 2, label: 'Bb' },
      { slide: 4, partial: 3, label: 'D' },
      { slide: 3, partial: 3, label: 'Eb' },
      { slide: 1, partial: 3, label: 'F' },
      { slide: 1, partial: 2, label: 'Bb' },
      { slide: 4, partial: 3, label: 'D' },
      { slide: 3, partial: 3, label: 'Eb' },
      { slide: 1, partial: 3, label: 'F' },
      { slide: 4, partial: 3, label: 'D' },
      { slide: 1, partial: 2, label: 'Bb' },
      { slide: 4, partial: 3, label: 'D' },
      { slide: 6, partial: 3, label: 'C' },
    ],
  },
  {
    id: 'happy-birthday',
    title: 'Happy Birthday',
    notes: [
      { slide: 6, partial: 3, label: 'C' },
      { slide: 6, partial: 3, label: 'C' },
      { slide: 4, partial: 3, label: 'D' },
      { slide: 6, partial: 3, label: 'C' },
      { slide: 1, partial: 3, label: 'F' },
      { slide: 2, partial: 3, label: 'E' },
      { slide: 6, partial: 3, label: 'C' },
      { slide: 6, partial: 3, label: 'C' },
      { slide: 4, partial: 3, label: 'D' },
      { slide: 6, partial: 3, label: 'C' },
      { slide: 4, partial: 4, label: 'G' },
      { slide: 1, partial: 3, label: 'F' },
      { slide: 6, partial: 3, label: 'C' },
      { slide: 6, partial: 3, label: 'C' },
      { slide: 3, partial: 5, label: "C'" },
      { slide: 2, partial: 4, label: 'A' },
      { slide: 1, partial: 3, label: 'F' },
      { slide: 2, partial: 3, label: 'E' },
      { slide: 4, partial: 3, label: 'D' },
      { slide: 1, partial: 4, label: 'Bb' },
      { slide: 1, partial: 4, label: 'Bb' },
      { slide: 2, partial: 4, label: 'A' },
      { slide: 1, partial: 3, label: 'F' },
      { slide: 4, partial: 4, label: 'G' },
      { slide: 1, partial: 3, label: 'F' },
    ],
  },
];

// --- Staff Constants ---
const LINE_SPACING = 22;
const STAFF_TOP = 48;
const NOTE_SPACING = 50;
const NOTE_R = 15;
const LEFT_MARGIN = 56;

// Partials 2-6 sit on the 5 staff lines (bottom → top)
function noteY(partial: number) {
  return STAFF_TOP + (6 - partial) * LINE_SPACING;
}
function lineY(i: number) {
  return STAFF_TOP + i * LINE_SPACING; // i=0 top line (P6), i=4 bottom line (P2)
}

const PARTIAL_COLOR: Record<number, string> = {
  1: '#8b5cf6',
  2: '#3b82f6',
  3: '#10b981',
  4: '#eab308',
  5: '#f97316',
  6: '#ef4444',
  7: '#ec4899',
};

const PARTIAL_NAME = ['', 'Pedal', 'Bajo', 'Medio-bajo', 'Medio', 'Medio-alto', 'Alto', 'Muy alto'];

// --- Components ---
function Staff({ notes }: { notes: TromboneNote[] }) {
  const svgW = LEFT_MARGIN + notes.length * NOTE_SPACING + 30;
  const svgH = STAFF_TOP + 4 * LINE_SPACING + 60;
  const labelY = STAFF_TOP + 4 * LINE_SPACING + 34;

  return (
    <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
      <svg width={svgW} height={svgH} style={{ display: 'block' }}>
        {/* 5 staff lines */}
        {[0, 1, 2, 3, 4].map((i) => (
          <line
            key={i}
            x1={LEFT_MARGIN - 8}
            y1={lineY(i)}
            x2={svgW - 16}
            y2={lineY(i)}
            stroke="#d4d4d8"
            strokeWidth={1}
          />
        ))}

        {/* Partial labels */}
        {[6, 5, 4, 3, 2].map((p) => (
          <text
            key={p}
            x={LEFT_MARGIN - 16}
            y={noteY(p) + 4}
            textAnchor="end"
            fontSize={10}
            fill="#a1a1aa"
            fontFamily="system-ui, sans-serif"
          >
            P{p}
          </text>
        ))}

        {/* Notes */}
        {notes.map((n, i) => {
          const cx = LEFT_MARGIN + i * NOTE_SPACING + NOTE_SPACING / 2;
          const cy = noteY(n.partial);
          const col = PARTIAL_COLOR[n.partial] ?? '#71717a';
          const outside = n.partial < 2 || n.partial > 6;

          return (
            <g key={i}>
              {/* Ledger line */}
              {outside && (
                <line
                  x1={cx - NOTE_R - 7}
                  y1={cy}
                  x2={cx + NOTE_R + 7}
                  y2={cy}
                  stroke="#d4d4d8"
                  strokeWidth={1}
                />
              )}

              {/* Note dot */}
              <circle cx={cx} cy={cy} r={NOTE_R} fill={col} />

              {/* Slide number */}
              <text
                x={cx}
                y={cy + 5}
                textAnchor="middle"
                fontSize={15}
                fontWeight="700"
                fill="#fff"
                fontFamily="system-ui, sans-serif"
              >
                {n.slide}
              </text>

              {/* Note label */}
              {n.label && (
                <text
                  x={cx}
                  y={labelY}
                  textAnchor="middle"
                  fontSize={10}
                  fill="#a1a1aa"
                  fontFamily="system-ui, sans-serif"
                >
                  {n.label}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

// --- Main Page ---
export function TromboneTab() {
  const [song, setSong] = useState(SONGS[0]);

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#faf9f6',
        fontFamily: "'Georgia', 'Times New Roman', serif",
      }}
    >
      <div style={{ maxWidth: 960, margin: '0 auto', padding: '2.5rem 1.5rem' }}>
        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <p style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: 2, color: '#a1a1aa', marginBottom: 4 }}>
            Trombone Tab
          </p>
          <h1 style={{ fontSize: '2rem', fontWeight: 700, color: '#18181b', margin: 0 }}>
            {song.title}
          </h1>
          {song.artist && (
            <p style={{ fontSize: '0.9rem', color: '#71717a', marginTop: 2 }}>{song.artist}</p>
          )}
        </div>

        {/* Song pills */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: '1.75rem' }}>
          {SONGS.map((s) => {
            const active = s.id === song.id;
            return (
              <button
                key={s.id}
                onClick={() => setSong(s)}
                style={{
                  padding: '7px 16px',
                  borderRadius: 999,
                  border: active ? '2px solid #18181b' : '1px solid #e4e4e7',
                  background: active ? '#18181b' : '#fff',
                  color: active ? '#fff' : '#52525b',
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                  fontFamily: 'system-ui, sans-serif',
                  transition: 'all 0.15s',
                }}
              >
                {s.title}
              </button>
            );
          })}
        </div>

        {/* Staff card */}
        <div
          style={{
            background: '#fff',
            borderRadius: 14,
            border: '1px solid #e4e4e7',
            padding: '1.25rem 1rem',
            boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
          }}
        >
          <Staff notes={song.notes} />
        </div>

        {/* Legend */}
        <div
          style={{
            marginTop: '1.25rem',
            background: '#fff',
            borderRadius: 14,
            border: '1px solid #e4e4e7',
            padding: '1rem 1.25rem',
          }}
        >
          <p
            style={{
              fontSize: '0.72rem',
              textTransform: 'uppercase',
              letterSpacing: 1.5,
              color: '#a1a1aa',
              marginBottom: 10,
              fontFamily: 'system-ui, sans-serif',
            }}
          >
            Parciales
          </p>
          <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
            {[1, 2, 3, 4, 5, 6, 7].map((p) => (
              <div key={p} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div
                  style={{
                    width: 14,
                    height: 14,
                    borderRadius: '50%',
                    background: PARTIAL_COLOR[p],
                  }}
                />
                <span style={{ fontSize: '0.8rem', color: '#52525b', fontFamily: 'system-ui, sans-serif' }}>
                  {p}. {PARTIAL_NAME[p]}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Instructions */}
        <p
          style={{
            marginTop: '1.25rem',
            fontSize: '0.78rem',
            color: '#a1a1aa',
            fontFamily: 'system-ui, sans-serif',
            lineHeight: 1.7,
            textAlign: 'center',
          }}
        >
          Cada circulo = una nota &middot; Numero = posicion de vara &middot; Linea = parcial (embocadura)
        </p>
      </div>
    </div>
  );
}
