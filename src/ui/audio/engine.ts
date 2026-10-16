import type { AudioSettings, MusicMood, Sound, SoundForce } from '@/game';

import { playSound } from './effects';
import { LOOPS } from './loops';
import { eventsAt, stepSeconds, type Instrument, type Loop } from './score';
import { bass, bell, clack, flute, koto, pad, shaker, taiko, type Note, type Out } from './voices';

/**
 * The sound system: one AudioContext with a bus each for effects and music under a master
 * level, a reverb on the music, and a scheduler that reads the current loop a little ahead of
 * the clock. Browsers only let sound start from a tap, so nothing is built until `unlock`;
 * where the Web Audio API is missing (old browsers, tests) every call does nothing.
 */

export interface AudioEngine {
  /** Call from a user gesture: builds or resumes the audio graph. */
  readonly unlock: () => void;
  /** Plays a sound now; a fight's sound with the force of the turn behind it. */
  readonly play: (sound: Sound, force?: SoundForce) => void;
  /** The music to play (null for none); a change fades one loop into the next. */
  readonly setMood: (mood: MusicMood | null) => void;
  readonly setLevels: (settings: AudioSettings) => void;
  /** Hold everything while the app is out of sight. */
  readonly pause: (paused: boolean) => void;
}

const LOOKAHEAD_S = 0.15;
const TICK_MS = 50;
const FADE_IN_S = 1.5;
const FADE_OUT_S = 1.2;
const MUSIC_HEADROOM = 0.6;
const REVERB_S = 2.4;
const REVERB_WET = 0.35;
const NOISE_S = 1;
/** A tap right after another sound (the action it set off) would only muddy it. */
const TAP_MASKED_S = 0.06;

const INSTRUMENT_VOICES: Readonly<Record<Instrument, (out: Out, note: Note) => void>> = {
  koto,
  bass,
  flute,
  pad,
  taiko,
  bell,
  clack,
  shaker,
};

/** A volume step (0–100) as a gain; squared, so the slider feels even to the ear. */
function gainOf(volume: number): number {
  return (volume / 100) ** 2;
}

/** Deterministic white noise (Math.random is kept out of the codebase), fading by `decay`. */
function noiseSamples(length: number, decay: number | null): Float32Array<ArrayBuffer> {
  const data = new Float32Array(length);
  let seed = 22695477;
  for (let i = 0; i < length; i++) {
    seed = (Math.imul(seed, 1103515245) + 12345) >>> 0;
    const white = seed / 2147483648 - 1;
    data[i] = decay === null ? white : white * (1 - i / length) ** decay;
  }
  return data;
}

function noiseBuffer(ctx: AudioContext, seconds: number, decay: number | null): AudioBuffer {
  const buffer = ctx.createBuffer(2, Math.floor(ctx.sampleRate * seconds), ctx.sampleRate);
  for (let ch = 0; ch < buffer.numberOfChannels; ch++) {
    buffer.copyToChannel(noiseSamples(buffer.length, decay), ch);
  }
  return buffer;
}

interface Graph {
  readonly ctx: AudioContext;
  readonly master: GainNode;
  readonly effectsBus: GainNode;
  readonly effects: Out;
  /** Where music tracks plug in: dry to the music bus and into the reverb. */
  readonly musicIn: AudioNode;
  readonly musicBus: GainNode;
}

function buildGraph(ctx: AudioContext): Graph {
  // A limiter last, so a loud moment over busy music never clips on a phone speaker.
  const limiter = ctx.createDynamicsCompressor();
  limiter.threshold.value = -6;
  limiter.ratio.value = 12;
  limiter.connect(ctx.destination);
  const master = ctx.createGain();
  master.connect(limiter);
  const effectsBus = ctx.createGain();
  effectsBus.connect(master);
  const musicBus = ctx.createGain();
  musicBus.connect(master);
  const musicIn = ctx.createGain();
  musicIn.connect(musicBus);
  const reverb = ctx.createConvolver();
  reverb.buffer = noiseBuffer(ctx, REVERB_S, 3);
  const wet = ctx.createGain();
  wet.gain.value = REVERB_WET;
  musicIn.connect(reverb).connect(wet).connect(musicBus);
  const noise = noiseBuffer(ctx, NOISE_S, null);
  return { ctx, master, effectsBus, effects: { ctx, dest: effectsBus, noise }, musicIn, musicBus };
}

/** One loop playing into its own fader. */
interface Track {
  readonly loop: Loop;
  readonly fader: GainNode;
}

/** How far a track has been read: the next step, and when it sounds. */
interface Cursor {
  readonly step: number;
  readonly nextAt: number;
}

function startTrack(graph: Graph, loop: Loop): Track {
  const { ctx } = graph;
  const fader = ctx.createGain();
  fader.gain.setValueAtTime(0.0001, ctx.currentTime);
  fader.gain.exponentialRampToValueAtTime(1, ctx.currentTime + FADE_IN_S);
  fader.connect(graph.musicIn);
  return { loop, fader };
}

function stopTrack(graph: Graph, track: Track): void {
  const now = graph.ctx.currentTime;
  track.fader.gain.cancelScheduledValues(now);
  track.fader.gain.setValueAtTime(track.fader.gain.value, now);
  track.fader.gain.linearRampToValueAtTime(0, now + FADE_OUT_S);
  setTimeout(
    () => {
      track.fader.disconnect();
    },
    (FADE_OUT_S + 3) * 1000,
  );
}

/** Schedules every note due before the lookahead runs out; returns where reading got to. */
function advance(graph: Graph, track: Track, from: Cursor): Cursor {
  const { ctx, noise } = graph.effects;
  const now = ctx.currentTime;
  const step = stepSeconds(track.loop);
  const out: Out = { ctx, dest: track.fader, noise };
  let { step: at } = from;
  // After the page was throttled, pick up from now rather than rushing the missed notes.
  let when = Math.max(from.nextAt, now + 0.05);
  while (when < now + LOOKAHEAD_S) {
    for (const e of eventsAt(track.loop, at)) {
      INSTRUMENT_VOICES[e.instrument](out, {
        at: when,
        freq: e.freq,
        gain: e.gain,
        length: e.steps * step,
      });
    }
    at += 1;
    when += step;
  }
  return { step: at, nextAt: when };
}

function audioContextClass(): typeof AudioContext | null {
  return typeof AudioContext === 'undefined' ? null : AudioContext;
}

export function createAudioEngine(initial: AudioSettings): AudioEngine {
  let settings = initial;
  let graph: Graph | null = null;
  let mood: MusicMood | null = null;
  let track: Track | null = null;
  let cursor: Cursor = { step: 0, nextAt: 0 };
  let timer: ReturnType<typeof setInterval> | null = null;
  let lastSoundAt = -1;

  const musicAudible = () => settings.sound && settings.musicVolume > 0;

  const syncMusic = () => {
    if (!graph) return;
    const wanted = mood && musicAudible() ? LOOPS[mood] : null;
    if (track?.loop === wanted) return;
    if (track) stopTrack(graph, track);
    track = wanted ? startTrack(graph, wanted) : null;
    cursor = { step: 0, nextAt: graph.ctx.currentTime + 0.1 };
    if (track && timer === null) {
      timer = setInterval(() => {
        if (graph && track) cursor = advance(graph, track, cursor);
      }, TICK_MS);
    } else if (!track && timer !== null) {
      clearInterval(timer);
      timer = null;
    }
  };

  const applyLevels = () => {
    if (!graph) return;
    const at = graph.ctx.currentTime;
    graph.master.gain.setTargetAtTime(settings.sound ? 1 : 0, at, 0.05);
    graph.effectsBus.gain.setTargetAtTime(gainOf(settings.effectsVolume), at, 0.05);
    const musicGain = gainOf(settings.musicVolume) * MUSIC_HEADROOM;
    graph.musicBus.gain.setTargetAtTime(musicGain, at, 0.05);
  };

  return {
    unlock: () => {
      const Ctx = audioContextClass();
      if (!Ctx) return;
      if (!graph) {
        graph = buildGraph(new Ctx());
        applyLevels();
        syncMusic();
      }
      if (graph.ctx.state === 'suspended') void graph.ctx.resume();
    },
    play: (sound, force) => {
      if (!graph || !settings.sound || settings.effectsVolume === 0) return;
      const now = graph.ctx.currentTime;
      if (graph.ctx.state !== 'running') return;
      if (sound === 'tap' && now - lastSoundAt < TAP_MASKED_S) return;
      lastSoundAt = now;
      playSound(graph.effects, sound, now + 0.005, force);
    },
    setMood: (next) => {
      mood = next;
      syncMusic();
    },
    setLevels: (next) => {
      settings = next;
      applyLevels();
      syncMusic();
    },
    pause: (paused) => {
      if (!graph) return;
      if (paused) void graph.ctx.suspend();
      else void graph.ctx.resume();
    },
  };
}
