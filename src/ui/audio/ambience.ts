import type { Ambience } from '@/game';

/**
 * The world behind the title music, built on the audio graph like everything else: birds at
 * dawn and through the day (short sine chirps sweeping up and back, in calls of a few), crickets
 * from dusk, and at night a wind of filtered noise that rises and falls. Calls are placed by a
 * small seeded generator (Math.random is kept out of the codebase), so no two minutes match
 * but nothing is left to chance the code can't name.
 */

export interface AmbienceBed {
  /** The bed to play, or null for quiet; a change fades the old one out. */
  readonly set: (ambience: Ambience | null) => void;
}

interface Where {
  readonly ctx: BaseAudioContext;
  readonly dest: AudioNode;
  readonly noise: AudioBuffer;
}

/** How a bed sounds: how often something calls, and what. */
interface Bed {
  /** Seconds between calls, at least and at most. */
  readonly every: readonly [number, number];
  readonly call: (where: Where, at: number, draw: () => number) => void;
  /** A wind under it all, at this level (0 for none). */
  readonly wind: number;
}

const SILENT = 0.0001;
const LOOKAHEAD_S = 0.4;
const TICK_MS = 120;
const FADE_S = 2.5;
const BED_LEVEL = 0.55;

/** One chirp: a sine flicking up and back down, gone in a tenth of a second. */
function chirp(where: Where, at: number, freq: number, gain: number): void {
  const { ctx } = where;
  const env = ctx.createGain();
  env.gain.setValueAtTime(SILENT, at);
  env.gain.exponentialRampToValueAtTime(gain, at + 0.012);
  env.gain.exponentialRampToValueAtTime(SILENT, at + 0.1);
  env.connect(where.dest);
  const osc = ctx.createOscillator();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(freq, at);
  osc.frequency.exponentialRampToValueAtTime(freq * 1.35, at + 0.04);
  osc.frequency.exponentialRampToValueAtTime(freq * 0.9, at + 0.09);
  osc.connect(env);
  osc.start(at);
  osc.stop(at + 0.12);
}

/** A bird's call: a few chirps close together, each a touch apart in pitch. */
function birdCall(where: Where, at: number, draw: () => number, loud: number): void {
  const base = 2400 + draw() * 1800;
  const chirps = 2 + Math.floor(draw() * 4);
  const gap = 0.1 + draw() * 0.07;
  for (let i = 0; i < chirps; i++) {
    const lift = 1 + (draw() - 0.4) * 0.18;
    chirp(where, at + i * gap, base * lift, loud * (0.6 + draw() * 0.4));
  }
}

/** A cricket: three quick pulses of a high note. */
function cricket(where: Where, at: number, gain: number): void {
  const { ctx } = where;
  for (let i = 0; i < 3; i++) {
    const start = at + i * 0.05;
    const env = ctx.createGain();
    env.gain.setValueAtTime(SILENT, start);
    env.gain.exponentialRampToValueAtTime(gain, start + 0.006);
    env.gain.exponentialRampToValueAtTime(SILENT, start + 0.03);
    env.connect(where.dest);
    const osc = ctx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.value = 4400;
    osc.connect(env);
    osc.start(start);
    osc.stop(start + 0.04);
  }
}

const BEDS: Readonly<Record<Ambience, Bed>> = {
  'dawn-chorus': {
    every: [0.5, 1.8],
    call: (where, at, draw) => {
      birdCall(where, at, draw, 0.05);
    },
    wind: 0,
  },
  birdsong: {
    every: [2.5, 7],
    call: (where, at, draw) => {
      birdCall(where, at, draw, 0.035);
    },
    wind: 0.15,
  },
  evening: {
    every: [0.7, 1.6],
    call: (where, at, draw) => {
      if (draw() < 0.08) birdCall(where, at, draw, 0.02);
      else cricket(where, at, 0.018);
    },
    wind: 0.25,
  },
  'night-wind': {
    every: [1.2, 3.5],
    call: (where, at, draw) => {
      if (draw() < 0.7) cricket(where, at, 0.012);
    },
    wind: 0.6,
  },
};

/** A seeded draw in [0, 1): a plain linear congruential generator. */
function drawer(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

/** Wind: noise looped through a band-pass whose centre and level drift on slow waves. */
function startWind(where: Where, level: number): () => void {
  const { ctx } = where;
  const source = ctx.createBufferSource();
  source.buffer = where.noise;
  source.loop = true;
  const band = ctx.createBiquadFilter();
  band.type = 'bandpass';
  band.frequency.value = 420;
  band.Q.value = 0.8;
  const gust = ctx.createGain();
  gust.gain.value = level * 0.05;
  const drift = ctx.createOscillator();
  drift.frequency.value = 0.07;
  const driftDepth = ctx.createGain();
  driftDepth.gain.value = 260;
  drift.connect(driftDepth).connect(band.frequency);
  const swell = ctx.createOscillator();
  swell.frequency.value = 0.045;
  const swellDepth = ctx.createGain();
  swellDepth.gain.value = level * 0.035;
  swell.connect(swellDepth).connect(gust.gain);
  source.connect(band).connect(gust).connect(where.dest);
  for (const node of [source, drift, swell]) node.start();
  return () => {
    for (const node of [source, drift, swell]) node.stop();
    gust.disconnect();
  };
}

interface Playing {
  readonly bed: Bed;
  readonly fader: GainNode;
  readonly stopWind: (() => void) | null;
  nextAt: number;
}

function fadeOut(ctx: BaseAudioContext, playing: Playing): void {
  const now = ctx.currentTime;
  playing.fader.gain.cancelScheduledValues(now);
  playing.fader.gain.setValueAtTime(playing.fader.gain.value, now);
  playing.fader.gain.linearRampToValueAtTime(0, now + FADE_S);
  setTimeout(
    () => {
      playing.stopWind?.();
      playing.fader.disconnect();
    },
    (FADE_S + 1) * 1000,
  );
}

function fadeIn(where: Where, bed: Bed): Playing {
  const { ctx } = where;
  const fader = ctx.createGain();
  fader.gain.setValueAtTime(SILENT, ctx.currentTime);
  fader.gain.exponentialRampToValueAtTime(BED_LEVEL, ctx.currentTime + FADE_S);
  fader.connect(where.dest);
  const into = { ...where, dest: fader };
  const stopWind = bed.wind > 0 ? startWind(into, bed.wind) : null;
  return { bed, fader, stopWind, nextAt: ctx.currentTime + 0.5 };
}

/** The ambience for one audio graph, playing into `where.dest`. */
export function createAmbience(where: Where): AmbienceBed {
  const draw = drawer(0x5eed);
  let playing: Playing | null = null;
  let current: Ambience | null = null;
  let timer: ReturnType<typeof setInterval> | null = null;

  const tick = () => {
    if (!playing) return;
    const { ctx } = where;
    const into = { ...where, dest: playing.fader };
    const [least, most] = playing.bed.every;
    // After the page was throttled, start again from now rather than catching up.
    playing.nextAt = Math.max(playing.nextAt, ctx.currentTime + 0.05);
    while (playing.nextAt < ctx.currentTime + LOOKAHEAD_S) {
      playing.bed.call(into, playing.nextAt, draw);
      playing.nextAt += least + draw() * (most - least);
    }
  };

  return {
    set: (ambience) => {
      if (ambience === current) return;
      current = ambience;
      if (playing) fadeOut(where.ctx, playing);
      playing = ambience ? fadeIn(where, BEDS[ambience]) : null;
      if (playing && timer === null) timer = setInterval(tick, TICK_MS);
      if (!playing && timer !== null) {
        clearInterval(timer);
        timer = null;
      }
    },
  };
}
