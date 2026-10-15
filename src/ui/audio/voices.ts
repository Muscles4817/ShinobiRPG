/**
 * The instruments, built from oscillators and noise on the Web Audio graph, so the game
 * carries no sound files and plays offline: a plucked koto, a breathy shakuhachi, a taiko, a
 * temple bell, wood clappers, a shaker and a soft pad. Each call schedules one note and lets
 * it end on its own.
 */

/** Where a note plays: the context, the node it feeds and a shared buffer of noise. */
export interface Out {
  readonly ctx: BaseAudioContext;
  readonly dest: AudioNode;
  readonly noise: AudioBuffer;
}

export interface Note {
  /** When it starts, in context seconds. */
  readonly at: number;
  readonly freq: number;
  /** Peak level, 0–1. */
  readonly gain: number;
  /** How long it is held, in seconds (sustained instruments only). */
  readonly length?: number;
}

/** Below this a level is silence; exponential ramps cannot reach zero. */
const SILENT = 0.0001;
const BELL_PARTIALS = [
  { ratio: 1, gain: 1, decay: 2.4 },
  { ratio: 2.76, gain: 0.45, decay: 1.5 },
  { ratio: 5.4, gain: 0.2, decay: 0.8 },
  { ratio: 8.93, gain: 0.1, decay: 0.4 },
] as const;
const VIBRATO_HZ = 5;
const VIBRATO_DEPTH = 0.012;

/** A gain that rises to `peak` and dies away over `decay` seconds; returns the node. */
function strike(out: Out, at: number, peak: number, decay: number): GainNode {
  const env = out.ctx.createGain();
  env.gain.setValueAtTime(SILENT, at);
  env.gain.exponentialRampToValueAtTime(Math.max(SILENT, peak), at + 0.006);
  env.gain.exponentialRampToValueAtTime(SILENT, at + decay);
  env.connect(out.dest);
  return env;
}

function tone(out: Out, kind: OscillatorType, freq: number, into: AudioNode): OscillatorNode {
  const osc = out.ctx.createOscillator();
  osc.type = kind;
  osc.frequency.value = freq;
  osc.connect(into);
  return osc;
}

function run(node: AudioScheduledSourceNode, at: number, until: number): void {
  node.start(at);
  node.stop(until + 0.05);
}

/** Noise through a band-pass sweeping from `from` to `to` Hz: wind, paper, a shaker. */
function noiseSweep(out: Out, note: Note, sweep: { from: number; to: number; q: number }): void {
  const length = note.length ?? 0.2;
  const src = out.ctx.createBufferSource();
  src.buffer = out.noise;
  const band = out.ctx.createBiquadFilter();
  band.type = 'bandpass';
  band.Q.value = sweep.q;
  band.frequency.setValueAtTime(sweep.from, note.at);
  band.frequency.exponentialRampToValueAtTime(sweep.to, note.at + length);
  const env = out.ctx.createGain();
  env.gain.setValueAtTime(SILENT, note.at);
  env.gain.exponentialRampToValueAtTime(Math.max(SILENT, note.gain), note.at + length * 0.3);
  env.gain.exponentialRampToValueAtTime(SILENT, note.at + length);
  src.connect(band).connect(env).connect(out.dest);
  run(src, note.at, note.at + length);
}

/** A plucked string: bright at the attack, mellowing as it rings. */
export function koto(out: Out, note: Note): void {
  const decay = 1.4;
  const env = strike(out, note.at, note.gain, decay);
  const lowpass = out.ctx.createBiquadFilter();
  lowpass.type = 'lowpass';
  lowpass.frequency.setValueAtTime(Math.min(9000, note.freq * 8), note.at);
  lowpass.frequency.exponentialRampToValueAtTime(note.freq * 1.5, note.at + decay * 0.6);
  lowpass.connect(env);
  const body = tone(out, 'triangle', note.freq, lowpass);
  const shimmer = out.ctx.createGain();
  shimmer.gain.value = 0.3;
  shimmer.connect(lowpass);
  const octave = tone(out, 'sawtooth', note.freq * 2, shimmer);
  run(body, note.at, note.at + decay);
  run(octave, note.at, note.at + decay);
}

/** A low plucked string for the bass line. */
export function bass(out: Out, note: Note): void {
  const env = strike(out, note.at, note.gain, 0.9);
  run(tone(out, 'sine', note.freq, env), note.at, note.at + 0.9);
  const overtone = out.ctx.createGain();
  overtone.gain.value = 0.25;
  overtone.connect(env);
  run(tone(out, 'triangle', note.freq * 2, overtone), note.at, note.at + 0.9);
}

/** A bamboo flute: a slow breath in, a wavering held note, a little air around it. */
export function flute(out: Out, note: Note): void {
  const length = Math.max(0.3, note.length ?? 0.6);
  const env = out.ctx.createGain();
  env.gain.setValueAtTime(SILENT, note.at);
  env.gain.exponentialRampToValueAtTime(Math.max(SILENT, note.gain), note.at + 0.15);
  env.gain.setValueAtTime(Math.max(SILENT, note.gain * 0.8), note.at + length);
  env.gain.exponentialRampToValueAtTime(SILENT, note.at + length + 0.35);
  env.connect(out.dest);
  const osc = tone(out, 'sine', note.freq, env);
  const lfo = out.ctx.createOscillator();
  lfo.frequency.value = VIBRATO_HZ;
  const depth = out.ctx.createGain();
  depth.gain.setValueAtTime(0, note.at);
  depth.gain.linearRampToValueAtTime(note.freq * VIBRATO_DEPTH, note.at + Math.min(0.6, length));
  lfo.connect(depth).connect(osc.frequency);
  run(osc, note.at, note.at + length + 0.4);
  run(lfo, note.at, note.at + length + 0.4);
  noiseSweep(
    out,
    { at: note.at, freq: 0, gain: note.gain * 0.12, length: 0.25 },
    {
      from: note.freq * 2,
      to: note.freq * 1.5,
      q: 3,
    },
  );
}

/** A held, soft chord tone under everything else. */
export function pad(out: Out, note: Note): void {
  const length = note.length ?? 2;
  const env = out.ctx.createGain();
  env.gain.setValueAtTime(SILENT, note.at);
  env.gain.exponentialRampToValueAtTime(Math.max(SILENT, note.gain), note.at + length * 0.3);
  env.gain.exponentialRampToValueAtTime(SILENT, note.at + length + 0.8);
  const lowpass = out.ctx.createBiquadFilter();
  lowpass.type = 'lowpass';
  lowpass.frequency.value = 1100;
  lowpass.connect(env).connect(out.dest);
  for (const detune of [-7, 7]) {
    const osc = tone(out, 'triangle', note.freq, lowpass);
    osc.detune.value = detune;
    run(osc, note.at, note.at + length + 0.8);
  }
}

/** A drum: a pitch that drops as the skin settles, and the slap of the stick. */
export function taiko(out: Out, note: Note): void {
  const env = strike(out, note.at, note.gain, 0.6);
  const osc = tone(out, 'sine', note.freq * 2.2, env);
  osc.frequency.exponentialRampToValueAtTime(note.freq, note.at + 0.09);
  run(osc, note.at, note.at + 0.6);
  noiseSweep(
    out,
    { at: note.at, freq: 0, gain: note.gain * 0.35, length: 0.07 },
    {
      from: 900,
      to: 300,
      q: 0.8,
    },
  );
}

/** A struck bell: inharmonic partials, the high ones fading first. */
export function bell(out: Out, note: Note): void {
  for (const p of BELL_PARTIALS) {
    const env = strike(out, note.at, note.gain * p.gain, p.decay);
    run(tone(out, 'sine', note.freq * p.ratio, env), note.at, note.at + p.decay);
  }
}

/** Wooden clappers (hyōshigi): a dry, bright knock. */
export function clack(out: Out, note: Note): void {
  const env = strike(out, note.at, note.gain, 0.07);
  const osc = tone(out, 'square', note.freq, env);
  osc.frequency.exponentialRampToValueAtTime(note.freq * 0.7, note.at + 0.05);
  run(osc, note.at, note.at + 0.08);
}

/** A seed shaker, or with a longer length a swish of cloth or paper. */
export function shaker(out: Out, note: Note): void {
  noiseSweep(out, note, { from: 6000, to: 4500, q: 1.5 });
}

/** A blade or a body cutting the air. */
export function whoosh(out: Out, note: Note): void {
  noiseSweep(out, { ...note, length: note.length ?? 0.25 }, { from: 400, to: 2400, q: 2 });
}
