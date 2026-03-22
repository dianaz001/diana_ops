import { useState, useEffect, useRef, useCallback } from 'react';

// --- Types ---
// beats: 4=whole, 2=half, 1=quarter, 0.5=eighth, 0.25=sixteenth
interface TromboneNote {
  slide: number;   // 1-7 slide position (0 for rests)
  partial: number; // 1-8 partial (embouchure, 0 for rests)
  label?: string;  // note name
  beats?: number;  // duration in beats (default 1 = quarter note)
  rest?: boolean;  // true = silence (no sound, shown as rest mark)
  freq?: number;   // override frequency for edge-case notes (e.g. B4)
}

interface Song {
  id: string;
  title: string;
  artist?: string;
  notes: TromboneNote[];
}

// --- Song Data ---
// beats: 4=redonda, 2=blanca, 1=negra, 0.5=corchea
const SONGS: Song[] = [
  {
    id: 'bb-scale',
    title: 'Escala Bb Mayor',
    notes: [
      { slide: 1, partial: 2, label: 'Bb', beats: 1 },
      { slide: 6, partial: 3, label: 'C', beats: 1 },
      { slide: 4, partial: 3, label: 'D', beats: 1 },
      { slide: 3, partial: 3, label: 'Eb', beats: 1 },
      { slide: 1, partial: 3, label: 'F', beats: 1 },
      { slide: 4, partial: 4, label: 'G', beats: 1 },
      { slide: 2, partial: 4, label: 'A', beats: 1 },
      { slide: 1, partial: 4, label: 'Bb', beats: 4 },
    ],
  },
  {
    id: 'twinkle',
    title: 'Twinkle Twinkle Little Star',
    notes: [
      // Twin-kle twin-kle lit-tle star
      { slide: 1, partial: 2, label: 'Bb', beats: 1 },
      { slide: 1, partial: 2, label: 'Bb', beats: 1 },
      { slide: 1, partial: 3, label: 'F', beats: 1 },
      { slide: 1, partial: 3, label: 'F', beats: 1 },
      { slide: 4, partial: 4, label: 'G', beats: 1 },
      { slide: 4, partial: 4, label: 'G', beats: 1 },
      { slide: 1, partial: 3, label: 'F', beats: 2 },
      // How I won-der what you are
      { slide: 3, partial: 3, label: 'Eb', beats: 1 },
      { slide: 3, partial: 3, label: 'Eb', beats: 1 },
      { slide: 4, partial: 3, label: 'D', beats: 1 },
      { slide: 4, partial: 3, label: 'D', beats: 1 },
      { slide: 6, partial: 3, label: 'C', beats: 1 },
      { slide: 6, partial: 3, label: 'C', beats: 1 },
      { slide: 1, partial: 2, label: 'Bb', beats: 2 },
    ],
  },
  {
    id: 'ode-to-joy',
    title: 'Ode to Joy',
    artist: 'Beethoven',
    notes: [
      // Line 1: D D Eb F | F Eb D C
      { slide: 4, partial: 3, label: 'D', beats: 1 },
      { slide: 4, partial: 3, label: 'D', beats: 1 },
      { slide: 3, partial: 3, label: 'Eb', beats: 1 },
      { slide: 1, partial: 3, label: 'F', beats: 1 },
      { slide: 1, partial: 3, label: 'F', beats: 1 },
      { slide: 3, partial: 3, label: 'Eb', beats: 1 },
      { slide: 4, partial: 3, label: 'D', beats: 1 },
      { slide: 6, partial: 3, label: 'C', beats: 1 },
      // Line 2: Bb Bb C D | D. C C
      { slide: 1, partial: 2, label: 'Bb', beats: 1 },
      { slide: 1, partial: 2, label: 'Bb', beats: 1 },
      { slide: 6, partial: 3, label: 'C', beats: 1 },
      { slide: 4, partial: 3, label: 'D', beats: 1 },
      { slide: 4, partial: 3, label: 'D', beats: 1.5 },
      { slide: 6, partial: 3, label: 'C', beats: 0.5 },
      { slide: 6, partial: 3, label: 'C', beats: 2 },
    ],
  },
  {
    id: 'saints',
    title: 'When the Saints',
    notes: [
      // Oh when the saints (pickup)
      { slide: 1, partial: 2, label: 'Bb', beats: 1 },
      { slide: 4, partial: 3, label: 'D', beats: 1 },
      { slide: 3, partial: 3, label: 'Eb', beats: 1 },
      { slide: 1, partial: 3, label: 'F', beats: 4 },
      // Oh when the saints
      { slide: 1, partial: 2, label: 'Bb', beats: 1 },
      { slide: 4, partial: 3, label: 'D', beats: 1 },
      { slide: 3, partial: 3, label: 'Eb', beats: 1 },
      { slide: 1, partial: 3, label: 'F', beats: 4 },
      // Oh when the saints go marching in
      { slide: 1, partial: 2, label: 'Bb', beats: 1 },
      { slide: 4, partial: 3, label: 'D', beats: 1 },
      { slide: 3, partial: 3, label: 'Eb', beats: 1 },
      { slide: 1, partial: 3, label: 'F', beats: 2 },
      { slide: 4, partial: 3, label: 'D', beats: 2 },
      { slide: 1, partial: 2, label: 'Bb', beats: 2 },
      { slide: 4, partial: 3, label: 'D', beats: 2 },
      { slide: 6, partial: 3, label: 'C', beats: 4 },
    ],
  },
  {
    id: 'happy-birthday',
    title: 'Happy Birthday',
    notes: [
      // Hap-py birth-day to you (3/4 time, BPM applies per quarter)
      { slide: 6, partial: 3, label: 'C', beats: 0.5 },
      { slide: 6, partial: 3, label: 'C', beats: 0.5 },
      { slide: 4, partial: 3, label: 'D', beats: 1 },
      { slide: 6, partial: 3, label: 'C', beats: 1 },
      { slide: 1, partial: 3, label: 'F', beats: 1 },
      { slide: 2, partial: 3, label: 'E', beats: 2 },
      // Hap-py birth-day to you
      { slide: 6, partial: 3, label: 'C', beats: 0.5 },
      { slide: 6, partial: 3, label: 'C', beats: 0.5 },
      { slide: 4, partial: 3, label: 'D', beats: 1 },
      { slide: 6, partial: 3, label: 'C', beats: 1 },
      { slide: 4, partial: 4, label: 'G', beats: 1 },
      { slide: 1, partial: 3, label: 'F', beats: 2 },
      // Hap-py birth-day dear ...
      { slide: 6, partial: 3, label: 'C', beats: 0.5 },
      { slide: 6, partial: 3, label: 'C', beats: 0.5 },
      { slide: 3, partial: 5, label: "C'", beats: 1 },
      { slide: 2, partial: 4, label: 'A', beats: 1 },
      { slide: 1, partial: 3, label: 'F', beats: 1 },
      { slide: 2, partial: 3, label: 'E', beats: 1 },
      { slide: 4, partial: 3, label: 'D', beats: 1 },
      // Hap-py birth-day to you
      { slide: 1, partial: 4, label: 'Bb', beats: 0.5 },
      { slide: 1, partial: 4, label: 'Bb', beats: 0.5 },
      { slide: 2, partial: 4, label: 'A', beats: 1 },
      { slide: 1, partial: 3, label: 'F', beats: 1 },
      { slide: 4, partial: 4, label: 'G', beats: 1 },
      { slide: 1, partial: 3, label: 'F', beats: 2 },
    ],
  },
  {
    id: 'talento-tv',
    title: 'Talento de Televisión',
    artist: 'Willie Colón',
    // Key: A major (F#, C#, G#). 4/4 cut time. Transcription: Germán Ruiz.
    // Trombone 1. Slide positions verified against harmonic series.
    // D4=P5/1, E4=P6/2, F#4=P7/3, G4=P7/2, G#4=P7/1, A4=P8/2, A3=P4/2, Bb3=P4/1
    notes: [
      // === INTRO (m1-m2) — ascending D-E-F#-A figure ===
      { slide: 1, partial: 5, label: 'D', beats: 1 },
      { slide: 2, partial: 6, label: 'E', beats: 1 },
      { slide: 3, partial: 7, label: 'F#', beats: 1 },
      { slide: 2, partial: 8, label: 'A', beats: 2 },
      // Descending answer
      { slide: 3, partial: 7, label: 'F#', beats: 0.5 },
      { slide: 2, partial: 7, label: 'G', beats: 1 },
      { slide: 2, partial: 6, label: 'E', beats: 1 },
      { slide: 3, partial: 7, label: 'F#', beats: 1 },
      // Resolve to Bb3 (tied half + quarter = 3 beats)
      { slide: 1, partial: 4, label: 'Bb', beats: 3 },
      { slide: 0, partial: 0, beats: 0.5, rest: true },

      // === INTRO repeat (m4-m6) — second phrase ===
      { slide: 1, partial: 5, label: 'D', beats: 1 },
      { slide: 2, partial: 6, label: 'E', beats: 1 },
      { slide: 3, partial: 7, label: 'F#', beats: 1 },
      { slide: 2, partial: 8, label: 'A', beats: 2 },
      // Repeat ascending
      { slide: 1, partial: 5, label: 'D', beats: 1 },
      { slide: 2, partial: 6, label: 'E', beats: 1 },
      { slide: 3, partial: 7, label: 'F#', beats: 1 },
      { slide: 2, partial: 8, label: 'A', beats: 2 },
      // Descending answer → resolve to D4
      { slide: 3, partial: 7, label: 'F#', beats: 0.5 },
      { slide: 2, partial: 7, label: 'G', beats: 1 },
      { slide: 2, partial: 6, label: 'E', beats: 1 },
      { slide: 3, partial: 7, label: 'F#', beats: 1 },
      { slide: 1, partial: 5, label: 'D', beats: 3 },
      { slide: 0, partial: 0, beats: 0.5, rest: true },

      // === CORO (m9-m10) — play on 2nd time ===
      { slide: 0, partial: 0, beats: 2, rest: true },
      { slide: 2, partial: 4, label: 'A,', beats: 2 },
      { slide: 2, partial: 4, label: 'A,', beats: 2 },
      { slide: 0, partial: 0, beats: 2, rest: true },
      { slide: 2, partial: 6, label: 'E', beats: 1 },
      { slide: 0, partial: 0, beats: 1, rest: true },

      // === VOZ (m13) — solo 1st time ===
      { slide: 0, partial: 0, beats: 2, rest: true },
      { slide: 2, partial: 6, label: 'E', beats: 1 },
      { slide: 3, partial: 7, label: 'F#', beats: 1 },
      { slide: 2, partial: 7, label: 'G', beats: 1 },
      { slide: 1, partial: 8, label: 'B', beats: 1, freq: 493.88 },
      { slide: 1, partial: 7, label: 'G#', beats: 1 },
      { slide: 2, partial: 8, label: 'A', beats: 0.5 },

      // === VOZ 2 (m19) — eighth note variation ===
      { slide: 0, partial: 0, beats: 2, rest: true },
      { slide: 2, partial: 6, label: 'E', beats: 1 },
      { slide: 3, partial: 7, label: 'F#', beats: 1 },
      { slide: 2, partial: 7, label: 'G', beats: 0.5 },
      { slide: 1, partial: 8, label: 'B', beats: 0.5, freq: 493.88 },
      { slide: 1, partial: 7, label: 'G#', beats: 1 },
      { slide: 2, partial: 8, label: 'A', beats: 0.5 },

      // === SIGUE (m25-m27) — main riff returns ===
      { slide: 0, partial: 0, beats: 2, rest: true },
      { slide: 1, partial: 5, label: 'D', beats: 1 },
      { slide: 2, partial: 6, label: 'E', beats: 1 },
      { slide: 3, partial: 7, label: 'F#', beats: 1 },
      { slide: 2, partial: 8, label: 'A', beats: 2 },
      // Answer
      { slide: 3, partial: 7, label: 'F#', beats: 0.5 },
      { slide: 2, partial: 7, label: 'G', beats: 1 },
      { slide: 2, partial: 6, label: 'E', beats: 1 },
      { slide: 3, partial: 7, label: 'F#', beats: 1 },
      { slide: 2, partial: 8, label: 'A', beats: 2 },
      // One more ascending
      { slide: 1, partial: 5, label: 'D', beats: 1 },
      { slide: 2, partial: 6, label: 'E', beats: 1 },
      { slide: 3, partial: 7, label: 'F#', beats: 1 },
      { slide: 2, partial: 8, label: 'A', beats: 2 },

      // === MAMBO (m36-m37) — E-F#-E pattern ===
      { slide: 0, partial: 0, beats: 2, rest: true },
      { slide: 2, partial: 6, label: 'E', beats: 1 },
      // First pass
      { slide: 2, partial: 6, label: 'E', beats: 1 },
      { slide: 3, partial: 7, label: 'F#', beats: 1 },
      { slide: 2, partial: 6, label: 'E', beats: 1 },
      // Second pass
      { slide: 2, partial: 6, label: 'E', beats: 1 },
      { slide: 3, partial: 7, label: 'F#', beats: 1 },
      { slide: 2, partial: 6, label: 'E', beats: 1 },
      { slide: 0, partial: 0, beats: 0.5, rest: true },

      // === ENDING (m49-m51) ===
      { slide: 0, partial: 0, beats: 2, rest: true },
      { slide: 1, partial: 7, label: 'G#', beats: 1 },
      { slide: 2, partial: 8, label: 'A', beats: 1 },
      { slide: 2, partial: 6, label: 'E', beats: 1 },
      { slide: 3, partial: 7, label: 'F#', beats: 0.5 },
      { slide: 2, partial: 6, label: 'E', beats: 1 },
      { slide: 2, partial: 8, label: 'A', beats: 2 },
    ],
  },
];

// --- Staff Constants ---
const LINE_SPACING = 22;
const STAFF_TOP = 48;
const BEAT_WIDTH = 50;  // pixels per beat
const NOTE_R = 15;
const LEFT_MARGIN = 56;
const MIN_NOTE_W = 30;  // minimum spacing even for very short notes

// Get horizontal spacing for a note based on its beat duration
function noteWidth(beats: number) {
  return Math.max(MIN_NOTE_W, BEAT_WIDTH * beats);
}

// Duration label for display
function durationLabel(beats: number): string {
  if (beats >= 4) return 'redonda';
  if (beats >= 3) return 'blanca.';
  if (beats >= 2) return 'blanca';
  if (beats >= 1.5) return 'negra.';
  if (beats >= 1) return 'negra';
  if (beats >= 0.5) return 'corchea';
  return 'semicorchea';
}

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
  8: '#6d28d9', // very high register
};


// --- Audio Engine ---
// Base frequencies for each partial at position 1
const PARTIAL_BASE_FREQ: Record<number, number> = {
  1: 58.27,   // Bb1
  2: 116.54,  // Bb2
  3: 174.61,  // F3
  4: 233.08,  // Bb3
  5: 293.66,  // D4
  6: 349.23,  // F4
  7: 415.30,  // Ab4
  8: 466.16,  // Bb4
};

function getNoteFreq(note: TromboneNote): number {
  if (note.freq) return note.freq;
  const base = PARTIAL_BASE_FREQ[note.partial] ?? 174.61;
  // Each slide position lowers by ~1 semitone
  const semitones = note.slide - 1;
  return base * Math.pow(2, -semitones / 12);
}

let audioCtx: AudioContext | null = null;
function getAudioCtx() {
  if (!audioCtx) audioCtx = new AudioContext();
  return audioCtx;
}

function playTone(freq: number, duration: number) {
  const ctx = getAudioCtx();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(freq, ctx.currentTime);

  // Brass-like envelope
  gain.gain.setValueAtTime(0, ctx.currentTime);
  gain.gain.linearRampToValueAtTime(0.15, ctx.currentTime + 0.04);
  gain.gain.exponentialRampToValueAtTime(0.08, ctx.currentTime + duration * 0.3);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration * 0.95);

  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + duration);
}

// --- Playback Hook (duration-aware) ---
function usePlayback(notes: TromboneNote[], bpm: number, soundOn: boolean) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const indexRef = useRef(-1);
  const bpmRef = useRef(bpm);
  const soundRef = useRef(soundOn);
  bpmRef.current = bpm;
  soundRef.current = soundOn;

  const clearTimer = useCallback(() => {
    if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null; }
  }, []);

  const stop = useCallback(() => {
    clearTimer();
    setIsPlaying(false);
  }, [clearTimer]);

  const reset = useCallback(() => {
    stop();
    setCurrentIndex(-1);
    indexRef.current = -1;
  }, [stop]);

  const scheduleNext = useCallback((idx: number) => {
    if (idx >= notes.length) { stop(); return; }
    indexRef.current = idx;
    setCurrentIndex(idx);

    const beats = notes[idx].beats ?? 1;
    const beatMs = 60000 / bpmRef.current;
    const durationMs = beats * beatMs;

    if (soundRef.current && !notes[idx].rest) playTone(getNoteFreq(notes[idx]), durationMs / 1000 * 0.9);

    timerRef.current = setTimeout(() => scheduleNext(idx + 1), durationMs);
  }, [notes, stop]);

  const play = useCallback(() => {
    if (soundRef.current && audioCtx?.state === 'suspended') audioCtx.resume();
    const startIdx = indexRef.current >= notes.length - 1 ? 0 : indexRef.current + 1;
    setIsPlaying(true);
    scheduleNext(startIdx);
  }, [notes, scheduleNext]);

  const toggle = useCallback(() => {
    if (isPlaying) stop(); else play();
  }, [isPlaying, stop, play]);

  // Cleanup
  useEffect(() => () => clearTimer(), [clearTimer]);

  // Reset when song changes
  useEffect(() => { reset(); }, [notes, reset]);

  return { isPlaying, currentIndex, toggle, reset };
}

// --- Components ---
function Staff({ notes, activeIndex }: { notes: TromboneNote[]; activeIndex: number }) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Pre-compute x positions with variable spacing
  const noteXPositions: number[] = [];
  let runX = LEFT_MARGIN;
  for (const n of notes) {
    const w = noteWidth(n.beats ?? 1);
    noteXPositions.push(runX + w / 2);
    runX += w;
  }
  const svgW = runX + 30;
  const svgH = STAFF_TOP + 4 * LINE_SPACING + 60;
  const labelY = STAFF_TOP + 4 * LINE_SPACING + 34;

  // Auto-scroll to active note
  useEffect(() => {
    if (activeIndex < 0 || !scrollRef.current) return;
    const noteX = noteXPositions[activeIndex] ?? 0;
    const container = scrollRef.current;
    container.scrollTo({ left: noteX - container.clientWidth / 2, behavior: 'smooth' });
  }, [activeIndex, noteXPositions]);

  // Playhead rect
  let hlX = 0, hlW = 0;
  if (activeIndex >= 0 && activeIndex < notes.length) {
    const w = noteWidth(notes[activeIndex].beats ?? 1);
    hlX = noteXPositions[activeIndex] - w / 2 + 2;
    hlW = w - 4;
  }

  return (
    <div ref={scrollRef} style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
      <svg width={svgW} height={svgH} style={{ display: 'block' }}>
        {/* Playhead highlight */}
        {activeIndex >= 0 && (
          <rect x={hlX} y={0} width={hlW} height={svgH} rx={8} fill="#3b82f6" opacity={0.07} />
        )}

        {/* 5 staff lines */}
        {[0, 1, 2, 3, 4].map((i) => (
          <line key={i} x1={LEFT_MARGIN - 8} y1={lineY(i)} x2={svgW - 16} y2={lineY(i)} stroke="#d4d4d8" strokeWidth={1} />
        ))}

        {/* Partial labels */}
        {[6, 5, 4, 3, 2].map((p) => (
          <text key={p} x={LEFT_MARGIN - 16} y={noteY(p) + 4} textAnchor="end" fontSize={10} fill="#a1a1aa" fontFamily="system-ui, sans-serif">
            P{p}
          </text>
        ))}

        {/* Notes */}
        {notes.map((n, i) => {
          const cx = noteXPositions[i];
          const beats = n.beats ?? 1;
          const isActive = i === activeIndex;
          const isPast = activeIndex >= 0 && i < activeIndex;

          // --- REST ---
          if (n.rest) {
            const restCy = STAFF_TOP + 2 * LINE_SPACING; // center of staff
            return (
              <g key={i} style={{ opacity: isPast ? 0.25 : 0.5, transition: 'opacity 0.15s' }}>
                {isActive && <rect x={cx - 12} y={restCy - 12} width={24} height={24} rx={6} fill="#3b82f6" opacity={0.1} />}
                {/* Quarter rest symbol approximation */}
                {beats >= 2 ? (
                  // Half/whole rest: filled rectangle on line
                  <rect x={cx - 8} y={restCy - (beats >= 4 ? 2 : -2)} width={16} height={4} rx={1} fill="#a1a1aa" />
                ) : (
                  // Quarter/eighth rest: zigzag
                  <path d={`M ${cx - 3} ${restCy - 8} l 6 5 -6 6 6 5`} fill="none" stroke="#a1a1aa" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                )}
                <text x={cx} y={labelY + 11} textAnchor="middle" fontSize={7} fill="#c4c4cc" fontFamily="system-ui, sans-serif">
                  silencio
                </text>
              </g>
            );
          }

          // --- NORMAL NOTE ---
          const cy = noteY(n.partial);
          const col = PARTIAL_COLOR[n.partial] ?? '#71717a';
          const outside = n.partial < 2 || n.partial > 6;
          const isHollow = beats >= 2;
          const isDotted = beats === 1.5 || beats === 3;
          const hasFlag = beats <= 0.5;
          const r = isActive ? NOTE_R + 2 : NOTE_R;

          return (
            <g key={i} style={{ opacity: isPast ? 0.35 : 1, transition: 'opacity 0.15s' }}>
              {/* Ledger line */}
              {outside && (
                <line x1={cx - NOTE_R - 7} y1={cy} x2={cx + NOTE_R + 7} y2={cy} stroke="#d4d4d8" strokeWidth={1} />
              )}

              {/* Duration tail for long notes */}
              {beats >= 2 && (
                <line
                  x1={cx + NOTE_R + 2} y1={cy}
                  x2={cx + noteWidth(beats) / 2 - 6} y2={cy}
                  stroke={col} strokeWidth={2.5} opacity={0.3} strokeLinecap="round"
                />
              )}

              {/* Active glow */}
              {isActive && <circle cx={cx} cy={cy} r={r + 5} fill={col} opacity={0.2} />}

              {/* Note head */}
              {isHollow ? (
                <circle cx={cx} cy={cy} r={r} fill="#fff" stroke={col} strokeWidth={3} />
              ) : (
                <circle cx={cx} cy={cy} r={r} fill={col} />
              )}

              {/* Flag for eighth notes */}
              {hasFlag && (
                <g>
                  <line x1={cx + r - 2} y1={cy - r + 3} x2={cx + r - 2} y2={cy - r - 12} stroke={col} strokeWidth={2} />
                  <path d={`M ${cx + r - 2} ${cy - r - 12} q 8 5 2 12`} stroke={col} strokeWidth={2} fill="none" />
                </g>
              )}

              {/* Dotted note indicator */}
              {isDotted && <circle cx={cx + r + 5} cy={cy} r={2.5} fill={col} />}

              {/* Slide number */}
              <text x={cx} y={cy + 5} textAnchor="middle" fontSize={isActive ? 17 : 15} fontWeight="700" fill={isHollow ? col : '#fff'} fontFamily="system-ui, sans-serif">
                {n.slide}
              </text>

              {/* Note label + duration hint */}
              <text x={cx} y={labelY} textAnchor="middle" fontSize={isActive ? 11 : 9} fontWeight={isActive ? 700 : 400} fill={isActive ? '#18181b' : '#a1a1aa'} fontFamily="system-ui, sans-serif">
                {n.label ?? ''}
              </text>
              <text x={cx} y={labelY + 11} textAnchor="middle" fontSize={7} fill="#c4c4cc" fontFamily="system-ui, sans-serif">
                {durationLabel(beats)}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

// --- Trombone SVG Graphic ---
function TromboneGraphic({ highlightPos }: { highlightPos: number | null }) {
  // How far the slide extends for each position (0 = closed, 1 = fully out)
  const slidePct = [0, 0, 0.16, 0.33, 0.5, 0.66, 0.83, 1];
  const slideEnd = highlightPos ? 130 + slidePct[highlightPos] * 180 : 130;

  return (
    <svg viewBox="0 0 400 160" style={{ width: '100%', maxWidth: 420 }}>
      {/* === BELL SECTION (left) === */}
      {/* Bell flare */}
      <path d="M 10,20 Q 10,55 30,55 L 30,25 Q 10,25 10,20 Z" fill="#e8e8ec" stroke="#a1a1aa" strokeWidth="1.5" />
      <ellipse cx="10" cy="37" rx="4" ry="18" fill="none" stroke="#a1a1aa" strokeWidth="1.5" />

      {/* Upper fixed tube (bell to bend) */}
      <rect x="30" y="24" width="100" height="6" rx="3" fill="#d4d4d8" stroke="#a1a1aa" strokeWidth="1" />
      {/* Lower fixed tube (bell to bend) */}
      <rect x="30" y="50" width="100" height="6" rx="3" fill="#d4d4d8" stroke="#a1a1aa" strokeWidth="1" />

      {/* U-bend on the right of the fixed section */}
      <path d="M 130,24 Q 145,24 145,40 Q 145,56 130,56" fill="none" stroke="#a1a1aa" strokeWidth="6" strokeLinecap="round" />
      <path d="M 130,27 Q 142,27 142,40 Q 142,53 130,53" fill="none" stroke="#d4d4d8" strokeWidth="2" />

      {/* === SLIDE SECTION (extends right) === */}
      {/* Upper slide tube */}
      <rect x="30" y="30" width={slideEnd - 30} height="4" rx="2" fill="#b0b0b8" stroke="#8b8b95" strokeWidth="0.5" />
      {/* Lower slide tube */}
      <rect x="30" y="46" width={slideEnd - 30} height="4" rx="2" fill="#b0b0b8" stroke="#8b8b95" strokeWidth="0.5" />

      {/* Slide U-bend (moves) */}
      <path d={`M ${slideEnd},30 Q ${slideEnd + 14},30 ${slideEnd + 14},40 Q ${slideEnd + 14},50 ${slideEnd},50`} fill="none" stroke="#8b8b95" strokeWidth="5" strokeLinecap="round" />
      <path d={`M ${slideEnd},32 Q ${slideEnd + 11},32 ${slideEnd + 11},40 Q ${slideEnd + 11},48 ${slideEnd},48`} fill="none" stroke="#b0b0b8" strokeWidth="1.5" />

      {/* Water key */}
      <circle cx={slideEnd - 5} cy="54" r="2.5" fill="#a1a1aa" stroke="#8b8b95" strokeWidth="0.8" />

      {/* === MOUTHPIECE (far left) === */}
      <rect x="24" y="29" width="8" height="6" rx="2" fill="#c4c4cc" stroke="#a1a1aa" strokeWidth="1" />
      <path d="M 16,31 Q 14,32 14,34 Q 14,34 16,35 L 24,35 L 24,31 Z" fill="#d4d4d8" stroke="#a1a1aa" strokeWidth="1" />
      <ellipse cx="14" cy="33" rx="2" ry="2.5" fill="#e4e4e7" stroke="#a1a1aa" strokeWidth="0.8" />

      {/* === POSITION RULER === */}
      {/* Ruler line */}
      <line x1="50" y1="85" x2="350" y2="85" stroke="#e4e4e7" strokeWidth="1" />

      {/* Arrow showing direction */}
      <text x="52" y="80" fontSize="7" fill="#a1a1aa" fontFamily="system-ui">cerrada</text>
      <text x="320" y="80" fontSize="7" fill="#a1a1aa" fontFamily="system-ui">extendida</text>
      <path d="M 85,78 L 310,78" fill="none" stroke="#d4d4d8" strokeWidth="0.8" markerEnd="url(#arrowhead)" />
      <defs>
        <marker id="arrowhead" markerWidth="6" markerHeight="4" refX="6" refY="2" orient="auto">
          <polygon points="0 0, 6 2, 0 4" fill="#d4d4d8" />
        </marker>
      </defs>

      {/* Position markers on ruler */}
      {[1, 2, 3, 4, 5, 6, 7].map((pos) => {
        const x = 50 + (pos - 1) * 50;
        const active = highlightPos === pos;
        return (
          <g key={pos}>
            <line x1={x} y1={82} x2={x} y2={88} stroke={active ? '#3b82f6' : '#d4d4d8'} strokeWidth={active ? 2 : 1} />
            <circle cx={x} cy={100} r={active ? 14 : 12} fill={active ? '#3b82f6' : '#fff'} stroke={active ? '#3b82f6' : '#d4d4d8'} strokeWidth={1.5} />
            <text x={x} y={105} textAnchor="middle" fontSize={active ? 14 : 12} fontWeight={active ? 700 : 500} fill={active ? '#fff' : '#52525b'} fontFamily="system-ui">{pos}</text>
          </g>
        );
      })}

      {/* Highlight indicator line from slide to ruler */}
      {highlightPos && (
        <line
          x1={slideEnd + 7}
          y1={56}
          x2={50 + (highlightPos - 1) * 50}
          y2={86}
          stroke="#3b82f6"
          strokeWidth="1"
          strokeDasharray="4 3"
          opacity={0.5}
        />
      )}

      {/* Label */}
      <text x="200" y="140" textAnchor="middle" fontSize="10" fill="#a1a1aa" fontFamily="system-ui">
        {highlightPos
          ? `Posicion ${highlightPos} — vara ${highlightPos === 1 ? 'cerrada' : highlightPos === 7 ? 'completamente extendida' : `extendida ${Math.round(slidePct[highlightPos] * 100)}%`}`
          : 'Toca un numero para ver la posicion'}
      </text>
    </svg>
  );
}

// --- Embouchure / Partial Visual ---
function PartialDiagram() {
  const levels = [
    { p: 1, name: 'Pedal', desc: 'Muy relajados, aire lento', lip: 5 },
    { p: 2, name: 'Bajo', desc: 'Relajado, vibración amplia', lip: 4.2 },
    { p: 3, name: 'Medio-bajo', desc: 'Firmeza moderada', lip: 3.4 },
    { p: 4, name: 'Medio', desc: 'Buen soporte de aire', lip: 2.8 },
    { p: 5, name: 'Medio-alto', desc: 'Más firmes, aire rápido', lip: 2.2 },
    { p: 6, name: 'Alto', desc: 'Apertura pequeña', lip: 1.6 },
    { p: 7, name: 'Muy alto', desc: 'Máxima firmeza', lip: 1.0 },
    { p: 8, name: 'Extremo', desc: 'Profesional, máxima presión', lip: 0.6 },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {[...levels].reverse().map(({ p, name, desc, lip }) => (
        <div
          key={p}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '7px 10px',
            borderRadius: 8,
            background: `${PARTIAL_COLOR[p]}10`,
            borderLeft: `3px solid ${PARTIAL_COLOR[p]}`,
          }}
        >
          {/* Partial number badge */}
          <div style={{ width: 28, height: 28, borderRadius: '50%', background: PARTIAL_COLOR[p], display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 13, fontWeight: 700, fontFamily: 'system-ui', flexShrink: 0 }}>
            {p}
          </div>

          {/* Lip aperture icon */}
          <svg width="28" height="28" viewBox="0 0 28 28" style={{ flexShrink: 0 }}>
            {/* Face circle */}
            <circle cx="14" cy="14" r="12" fill="#fef3c7" stroke="#fbbf24" strokeWidth="0.8" />
            {/* Upper lip */}
            <ellipse cx="14" cy={14 - lip / 2} rx="5" ry="2.5" fill="#f9a8d4" />
            {/* Lower lip */}
            <ellipse cx="14" cy={14 + lip / 2} rx="5" ry="2.5" fill="#f9a8d4" />
            {/* Aperture gap */}
            <ellipse cx="14" cy="14" rx={Math.max(1.5, lip * 0.8)} ry={lip / 2} fill="#18181b" />
          </svg>

          {/* Text */}
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#18181b', fontFamily: 'system-ui' }}>{name}</div>
            <div style={{ fontSize: '0.72rem', color: '#71717a', fontFamily: 'system-ui' }}>{desc}</div>
          </div>

          {/* Pitch indicator */}
          <div style={{ fontSize: '0.65rem', color: '#a1a1aa', fontFamily: 'system-ui', textAlign: 'right', flexShrink: 0 }}>
            {p <= 2 ? 'grave' : p <= 4 ? 'medio' : 'agudo'}
          </div>
        </div>
      ))}

      {/* Visual explanation */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, marginTop: 8, padding: '8px 0' }}>
        <div style={{ textAlign: 'center' }}>
          <svg width="24" height="24" viewBox="0 0 28 28">
            <circle cx="14" cy="14" r="12" fill="#fef3c7" stroke="#fbbf24" strokeWidth="0.8" />
            <ellipse cx="14" cy="11.5" rx="5" ry="2.5" fill="#f9a8d4" />
            <ellipse cx="14" cy="16.5" rx="5" ry="2.5" fill="#f9a8d4" />
            <ellipse cx="14" cy="14" rx="4" ry="2.5" fill="#18181b" />
          </svg>
          <div style={{ fontSize: '0.65rem', color: '#71717a', fontFamily: 'system-ui', marginTop: 2 }}>abierto = grave</div>
        </div>
        <svg width="24" height="8" viewBox="0 0 24 8">
          <path d="M 2,4 L 22,4" stroke="#d4d4d8" strokeWidth="1.5" markerEnd="url(#arrowR)" />
          <defs><marker id="arrowR" markerWidth="6" markerHeight="4" refX="6" refY="2" orient="auto"><polygon points="0 0, 6 2, 0 4" fill="#d4d4d8" /></marker></defs>
        </svg>
        <div style={{ textAlign: 'center' }}>
          <svg width="24" height="24" viewBox="0 0 28 28">
            <circle cx="14" cy="14" r="12" fill="#fef3c7" stroke="#fbbf24" strokeWidth="0.8" />
            <ellipse cx="14" cy="13.5" rx="5" ry="2.5" fill="#f9a8d4" />
            <ellipse cx="14" cy="14.5" rx="5" ry="2.5" fill="#f9a8d4" />
            <ellipse cx="14" cy="14" rx="1.2" ry="0.5" fill="#18181b" />
          </svg>
          <div style={{ fontSize: '0.65rem', color: '#71717a', fontFamily: 'system-ui', marginTop: 2 }}>cerrado = agudo</div>
        </div>
      </div>
    </div>
  );
}

// --- Help Modal ---
function HelpModal({ onClose }: { onClose: () => void }) {
  const [lockedPos, setLockedPos] = useState<number | null>(null);
  const [hoverPos, setHoverPos] = useState<number | null>(null);
  const activePos = lockedPos ?? hoverPos;
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
            style={{ background: '#fafafa', borderRadius: 12, padding: '16px 8px 4px', border: '1px solid #f0f0f0' }}
          >
            <TromboneGraphic highlightPos={activePos} />
            <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginTop: 4, paddingBottom: 8 }}>
              {[1, 2, 3, 4, 5, 6, 7].map((pos) => (
                <button
                  key={pos}
                  onPointerEnter={() => { if (!lockedPos) setHoverPos(pos); }}
                  onPointerLeave={() => { if (!lockedPos) setHoverPos(null); }}
                  onClick={() => setLockedPos(lockedPos === pos ? null : pos)}
                  style={{
                    width: 34,
                    height: 30,
                    borderRadius: 8,
                    border: activePos === pos ? '2px solid #3b82f6' : '1px solid #e4e4e7',
                    background: activePos === pos ? '#3b82f6' : '#fff',
                    color: activePos === pos ? '#fff' : '#52525b',
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontFamily: 'system-ui',
                    transition: 'all 0.15s',
                  }}
                >
                  {pos}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Partials / embouchure */}
        <div>
          <p style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: 1.5, color: '#a1a1aa', marginBottom: 8, fontFamily: 'system-ui' }}>
            Parciales (embocadura)
          </p>
          <PartialDiagram />
          <p style={{ fontSize: '0.75rem', color: '#71717a', marginTop: 10, lineHeight: 1.6, fontFamily: 'system-ui' }}>
            Es el mismo principio que silbar: aprietas mas los labios para notas agudas, relajas para graves.
            En el pentagrama, las 5 lineas representan los parciales 2 al 6.
          </p>
        </div>
      </div>
    </div>
  );
}

// --- Icon SVGs ---
function PlayIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <polygon points="6,3 20,12 6,21" />
    </svg>
  );
}
function PauseIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <rect x="5" y="3" width="5" height="18" rx="1" />
      <rect x="14" y="3" width="5" height="18" rx="1" />
    </svg>
  );
}
function ResetIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="1,3 1,21 8,12" />
      <line x1="11" y1="3" x2="11" y2="21" />
    </svg>
  );
}
function SoundOnIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill="currentColor" />
      <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
    </svg>
  );
}
function SoundOffIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill="currentColor" />
      <line x1="23" y1="9" x2="17" y2="15" />
      <line x1="17" y1="9" x2="23" y2="15" />
    </svg>
  );
}

// --- Control Button ---
const btnBase: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  border: '1px solid #e4e4e7',
  borderRadius: 10,
  background: '#fff',
  cursor: 'pointer',
  fontFamily: 'system-ui, sans-serif',
  transition: 'all 0.15s',
};

// --- Main Page ---
export function TromboneTab() {
  const [song, setSong] = useState(SONGS[0]);
  const [showHelp, setShowHelp] = useState(false);
  const [bpm, setBpm] = useState(100);
  const [soundOn, setSoundOn] = useState(true);
  const { isPlaying, currentIndex, toggle, reset } = usePlayback(song.notes, bpm, soundOn);

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
        <div style={{ marginBottom: '1.25rem', position: 'relative' }}>
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

        {/* Playback controls */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            marginBottom: '1.25rem',
            flexWrap: 'wrap',
          }}
        >
          {/* Play / Pause */}
          <button
            onClick={toggle}
            style={{
              ...btnBase,
              width: 44,
              height: 44,
              background: isPlaying ? '#18181b' : '#3b82f6',
              border: 'none',
              color: '#fff',
              borderRadius: 12,
            }}
          >
            {isPlaying ? <PauseIcon /> : <PlayIcon />}
          </button>

          {/* Reset */}
          <button
            onClick={reset}
            style={{ ...btnBase, width: 40, height: 40, color: '#52525b' }}
          >
            <ResetIcon />
          </button>

          {/* Sound toggle */}
          <button
            onClick={() => setSoundOn(!soundOn)}
            style={{ ...btnBase, width: 40, height: 40, color: soundOn ? '#3b82f6' : '#a1a1aa' }}
          >
            {soundOn ? <SoundOnIcon /> : <SoundOffIcon />}
          </button>

          {/* Separator */}
          <div style={{ width: 1, height: 28, background: '#e4e4e7', margin: '0 4px' }} />

          {/* BPM control */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <input
              type="range"
              min={40}
              max={200}
              value={bpm}
              onChange={(e) => setBpm(Number(e.target.value))}
              style={{ width: 100, accentColor: '#3b82f6' }}
            />
            <span style={{ fontSize: '0.8rem', color: '#52525b', fontFamily: 'system-ui', minWidth: 60 }}>
              {bpm} BPM
            </span>
          </div>

          {/* Note counter */}
          <span style={{ fontSize: '0.75rem', color: '#a1a1aa', fontFamily: 'system-ui', marginLeft: 'auto' }}>
            {currentIndex >= 0 ? currentIndex + 1 : 0} / {song.notes.length}
          </span>
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
          <Staff notes={song.notes} activeIndex={currentIndex} />
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
