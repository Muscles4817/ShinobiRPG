/**
 * How the music is written down and read back. A loop is layers of one-bar patterns in
 * sixteenth notes over a Japanese pentatonic scale; each layer cycles its own bars, so short
 * phrases fall against each other in changing ways. A layer may `vary`: after its first time
 * round, a note now and then moves a step or rests, chosen by hashing where it falls, so the
 * music never quite repeats and is still the same every time you hear that bar.
 */

export const INSTRUMENTS = [
  'koto',
  'bass',
  'flute',
  'pad',
  'taiko',
  'bell',
  'clack',
  'shaker',
] as const;
export type Instrument = (typeof INSTRUMENTS)[number];

export const STEPS_PER_BAR = 16;

export interface Layer {
  readonly instrument: Instrument;
  /** Octaves above (or below) the loop's root. */
  readonly octave: number;
  readonly gain: number;
  /**
   * One string per bar, a character per sixteenth: `.` rest, `0`–`9` and `a`–`e` a scale
   * degree (10–14), `x` an accented hit and `o` a soft one on the root, `-` holds the note
   * before it.
   */
  readonly bars: readonly string[];
  /** The chance a note varies once the layer has played through once (0–1). */
  readonly vary?: number;
}

export interface Loop {
  readonly bpm: number;
  /** MIDI note number of the scale's root. */
  readonly root: number;
  /** Semitones above the root, one octave of the scale. */
  readonly scale: readonly number[];
  readonly layers: readonly Layer[];
}

/** One note to play, with its length in steps. */
export interface ScoreEvent {
  readonly instrument: Instrument;
  readonly freq: number;
  readonly gain: number;
  readonly steps: number;
}

const SOFT_HIT = 0.55;
const HOLD = '-';
const REST = '.';

/** Yō: the bright folk scale of daytime and festivals. */
export const YO = [0, 2, 5, 7, 9] as const;
/** In (miyako-bushi): the dark scale of night and danger. */
export const IN = [0, 1, 5, 7, 8] as const;
/** Hirajōshi: the koto's own tuning, wistful. */
export const HIRAJOSHI = [0, 2, 3, 7, 8] as const;

/** A number in [0, 1) from integers, the same every time (no global randomness). */
export function hashUnit(...parts: readonly number[]): number {
  let h = 2166136261;
  for (const part of parts) {
    h = Math.imul(h ^ (part | 0), 16777619);
    h ^= h >>> 13;
  }
  return ((h >>> 0) % 100000) / 100000;
}

export function midiToFreq(midi: number): number {
  return 440 * 2 ** ((midi - 69) / 12);
}

/** The pitch of a scale degree (which may run past the octave, or below it). */
export function degreeFreq(loop: Loop, octave: number, degree: number): number {
  const size = loop.scale.length;
  const octaves = Math.floor(degree / size);
  const within = loop.scale[degree - octaves * size] ?? 0;
  return midiToFreq(loop.root + 12 * (octave + octaves) + within);
}

/** The degree a pattern character names, or null for a rest or a hold. */
function degreeOf(char: string): number | null {
  if (char === 'x' || char === 'o') return 0;
  const value = parseInt(char, 16);
  return Number.isNaN(value) ? null : value;
}

/** How many steps a note at `at` is held for (itself and the holds after it). */
function heldFor(bar: string, at: number): number {
  let steps = 1;
  while (bar[at + steps] === HOLD) steps += 1;
  return steps;
}

/** A varied note: usually the written one, sometimes a step away, now and then a rest. */
function varied(degree: number, chance: number, roll: readonly number[]): number | null {
  const [i, cycle, step] = roll;
  const r = hashUnit(i ?? 0, cycle ?? 0, step ?? 0);
  if (r >= chance) return degree;
  if (r < chance * 0.25) return null;
  return Math.max(0, degree + (r < chance * 0.6 ? -1 : 1));
}

/** Everything that sounds at `step` (counted from the loop's start). */
export function eventsAt(loop: Loop, step: number): ScoreEvent[] {
  const inBar = step % STEPS_PER_BAR;
  const barIndex = Math.floor(step / STEPS_PER_BAR);
  return loop.layers.flatMap((layer, i) => {
    const bar = layer.bars[barIndex % layer.bars.length] ?? '';
    const char = bar[inBar] ?? REST;
    const written = degreeOf(char);
    if (written === null) return [];
    const cycle = Math.floor(barIndex / layer.bars.length);
    const degree =
      layer.vary && cycle > 0 ? varied(written, layer.vary, [i, cycle, step]) : written;
    if (degree === null) return [];
    return [
      {
        instrument: layer.instrument,
        freq: degreeFreq(loop, layer.octave, degree),
        gain: layer.gain * (char === 'o' ? SOFT_HIT : 1),
        steps: heldFor(bar, inBar),
      },
    ];
  });
}

/** Seconds per sixteenth note. */
export function stepSeconds(loop: Loop): number {
  return 60 / loop.bpm / 4;
}
