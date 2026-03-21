import { useState, useEffect, useRef } from 'react';

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

// --- Trombone SVG Graphic ---
function TromboneGraphic({ highlightPos }: { highlightPos: number | null }) {
  // Simplified trombone side view with 7 slide positions marked
  const slideX = (pos: number) => 62 + (pos - 1) * 38; // x position for each slide stop

  return (
    <svg viewBox="0 0 340 120" style={{ width: '100%', maxWidth: 340 }}>
      {/* Bell */}
      <ellipse cx="38" cy="44" rx="28" ry="32" fill="none" stroke="#a1a1aa" strokeWidth="2" />
      <ellipse cx="38" cy="44" rx="18" ry="22" fill="#f4f4f5" stroke="#d4d4d8" strokeWidth="1" />

      {/* Main tube upper */}
      <line x1="56" y1="28" x2="320" y2="28" stroke="#a1a1aa" strokeWidth="2" />
      {/* Main tube lower */}
      <line x1="56" y1="60" x2="320" y2="60" stroke="#a1a1aa" strokeWidth="2" />
      {/* End cap */}
      <line x1="320" y1="28" x2="320" y2="60" stroke="#a1a1aa" strokeWidth="2" strokeLinecap="round" />

      {/* Slide rail (inner tubes) */}
      <line x1="56" y1="36" x2="300" y2="36" stroke="#d4d4d8" strokeWidth="1" strokeDasharray="4 3" />
      <line x1="56" y1="52" x2="300" y2="52" stroke="#d4d4d8" strokeWidth="1" strokeDasharray="4 3" />

      {/* Mouthpiece */}
      <rect x="52" y="36" width="14" height="16" rx="3" fill="#d4d4d8" stroke="#a1a1aa" strokeWidth="1.5" />
      <rect x="44" y="39" width="10" height="10" rx="2" fill="#e4e4e7" stroke="#a1a1aa" strokeWidth="1" />

      {/* Position markers */}
      {[1, 2, 3, 4, 5, 6, 7].map((pos) => {
        const x = slideX(pos);
        const isHighlight = highlightPos === pos;
        return (
          <g key={pos}>
            <line x1={x} y1={62} x2={x} y2={72} stroke={isHighlight ? '#3b82f6' : '#d4d4d8'} strokeWidth={isHighlight ? 2 : 1} />
            <circle cx={x} cy={82} r={isHighlight ? 13 : 11} fill={isHighlight ? '#3b82f6' : '#f4f4f5'} stroke={isHighlight ? '#3b82f6' : '#d4d4d8'} strokeWidth={1.5} />
            <text x={x} y={87} textAnchor="middle" fontSize={isHighlight ? 13 : 11} fontWeight={isHighlight ? 700 : 500} fill={isHighlight ? '#fff' : '#71717a'} fontFamily="system-ui">{pos}</text>
            {/* Distance label */}
            <text x={x} y={105} textAnchor="middle" fontSize={8} fill="#a1a1aa" fontFamily="system-ui">
              {pos === 1 ? 'cerrada' : pos === 7 ? 'max' : ''}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

// --- Embouchure / Partial Visual ---
function PartialDiagram() {
  const levels = [
    { p: 1, name: 'Pedal', desc: 'Labios muy relajados, aire lento' },
    { p: 2, name: 'Bajo', desc: 'Relajado, vibración amplia' },
    { p: 3, name: 'Medio-bajo', desc: 'Firmeza moderada' },
    { p: 4, name: 'Medio', desc: 'Tensión media, buen soporte' },
    { p: 5, name: 'Medio-alto', desc: 'Labios más firmes, aire rápido' },
    { p: 6, name: 'Alto', desc: 'Tensión alta, apertura pequeña' },
    { p: 7, name: 'Muy alto', desc: 'Máxima firmeza, aire concentrado' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      {[...levels].reverse().map(({ p, name, desc }) => (
        <div
          key={p}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '6px 10px',
            borderRadius: 8,
            background: `${PARTIAL_COLOR[p]}10`,
          }}
        >
          <div style={{ width: 28, height: 28, borderRadius: '50%', background: PARTIAL_COLOR[p], display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 13, fontWeight: 700, fontFamily: 'system-ui', flexShrink: 0 }}>
            {p}
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#18181b', fontFamily: 'system-ui' }}>{name}</div>
            <div style={{ fontSize: '0.72rem', color: '#71717a', fontFamily: 'system-ui' }}>{desc}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

// --- Help Modal ---
function HelpModal({ onClose }: { onClose: () => void }) {
  const [hoverPos, setHoverPos] = useState<number | null>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  return (
    <div
      ref={overlayRef}
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.4)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: 16,
      }}
    >
      <div
        style={{
          background: '#fff',
          borderRadius: 18,
          maxWidth: 520,
          width: '100%',
          maxHeight: '90vh',
          overflowY: 'auto',
          padding: '2rem 1.75rem',
          boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
          position: 'relative',
        }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: 16,
            right: 16,
            width: 32,
            height: 32,
            borderRadius: '50%',
            border: 'none',
            background: '#f4f4f5',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 18,
            color: '#71717a',
          }}
        >
          &times;
        </button>

        <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: '#18181b', margin: '0 0 4px', fontFamily: "'Georgia', serif" }}>
          Como leer el Trombone Tab
        </h2>
        <p style={{ fontSize: '0.82rem', color: '#71717a', marginBottom: '1.5rem', fontFamily: 'system-ui' }}>
          Cada nota tiene dos componentes: posicion de vara y parcial (embocadura).
        </p>

        {/* How to read */}
        <div style={{ marginBottom: '1.75rem', padding: '14px 16px', background: '#f9fafb', borderRadius: 12, fontFamily: 'system-ui' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
            <svg width="36" height="36" viewBox="0 0 36 36">
              <circle cx="18" cy="18" r="15" fill="#10b981" />
              <text x="18" y="23" textAnchor="middle" fontSize="16" fontWeight="700" fill="#fff" fontFamily="system-ui">3</text>
            </svg>
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#18181b' }}>El numero = posicion de la vara</div>
              <div style={{ fontSize: '0.75rem', color: '#71717a' }}>Del 1 (cerrada) al 7 (extendida)</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 36, display: 'flex', justifyContent: 'center' }}>
              <div style={{ width: 30, height: 4, display: 'flex', flexDirection: 'column', gap: 3 }}>
                {[0, 1, 2, 3, 4].map(i => <div key={i} style={{ height: 1, background: i === 2 ? '#10b981' : '#d4d4d8', borderRadius: 1 }} />)}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#18181b' }}>La linea = parcial (embocadura)</div>
              <div style={{ fontSize: '0.75rem', color: '#71717a' }}>Mas arriba = mas agudo, mas tension en los labios</div>
            </div>
          </div>
        </div>

        {/* Trombone graphic */}
        <div style={{ marginBottom: '1.5rem' }}>
          <p style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: 1.5, color: '#a1a1aa', marginBottom: 8, fontFamily: 'system-ui' }}>
            Posiciones de la vara
          </p>
          <div
            style={{ background: '#fafafa', borderRadius: 12, padding: '16px 12px 8px', border: '1px solid #f0f0f0' }}
          >
            <TromboneGraphic highlightPos={hoverPos} />
            <div style={{ display: 'flex', justifyContent: 'center', gap: 4, marginTop: 8 }}>
              {[1, 2, 3, 4, 5, 6, 7].map((pos) => (
                <button
                  key={pos}
                  onMouseEnter={() => setHoverPos(pos)}
                  onMouseLeave={() => setHoverPos(null)}
                  onTouchStart={() => setHoverPos(pos)}
                  onTouchEnd={() => setHoverPos(null)}
                  style={{
                    width: 32,
                    height: 28,
                    borderRadius: 6,
                    border: '1px solid #e4e4e7',
                    background: hoverPos === pos ? '#3b82f6' : '#fff',
                    color: hoverPos === pos ? '#fff' : '#71717a',
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontFamily: 'system-ui',
                  }}
                >
                  {pos}
                </button>
              ))}
            </div>
            <p style={{ textAlign: 'center', fontSize: '0.7rem', color: '#a1a1aa', marginTop: 6, fontFamily: 'system-ui' }}>
              Toca un numero para ver la posicion
            </p>
          </div>
        </div>

        {/* Partials / embouchure */}
        <div>
          <p style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: 1.5, color: '#a1a1aa', marginBottom: 8, fontFamily: 'system-ui' }}>
            Parciales (embocadura)
          </p>
          <PartialDiagram />
          <p style={{ fontSize: '0.72rem', color: '#a1a1aa', marginTop: 10, lineHeight: 1.6, fontFamily: 'system-ui' }}>
            Los parciales se producen cambiando la tension de los labios. Mismo principio que silbar mas agudo o mas grave.
            En el pentagrama, las 5 lineas representan los parciales 2-6 (los mas usados).
          </p>
        </div>
      </div>
    </div>
  );
}

// --- Main Page ---
export function TromboneTab() {
  const [song, setSong] = useState(SONGS[0]);
  const [showHelp, setShowHelp] = useState(false);

  return (
    <div
      style={{
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

        {/* Song selector dropdown */}
        <div style={{ marginBottom: '1.75rem', position: 'relative' }}>
          <select
            value={song.id}
            onChange={(e) => {
              const found = SONGS.find((s) => s.id === e.target.value);
              if (found) setSong(found);
            }}
            style={{
              width: '100%',
              maxWidth: 360,
              padding: '10px 16px',
              borderRadius: 10,
              border: '1px solid #e4e4e7',
              background: '#fff',
              color: '#18181b',
              fontSize: '0.9rem',
              fontFamily: 'system-ui, sans-serif',
              cursor: 'pointer',
              appearance: 'none',
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2371717a' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right 12px center',
              paddingRight: 40,
            }}
          >
            {SONGS.map((s) => (
              <option key={s.id} value={s.id}>
                {s.title}{s.artist ? ` — ${s.artist}` : ''}
              </option>
            ))}
          </select>
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

        {/* Help button */}
        <div style={{ marginTop: '1.25rem', textAlign: 'center' }}>
          <button
            onClick={() => setShowHelp(true)}
            style={{
              padding: '8px 20px',
              borderRadius: 999,
              border: '1px solid #e4e4e7',
              background: '#fff',
              color: '#52525b',
              fontSize: '0.82rem',
              cursor: 'pointer',
              fontFamily: 'system-ui, sans-serif',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
            Como leer esto
          </button>
        </div>

        {/* Help Modal */}
        {showHelp && <HelpModal onClose={() => setShowHelp(false)} />}
      </div>
    </div>
  );
}
