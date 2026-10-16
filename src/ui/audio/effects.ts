import type { Sound, SoundForce } from '@/game';

import { forceGain, playForce } from './force';
import { midiToFreq, YO } from './score';
import { bell, clack, flute, koto, shaker, taiko, whoosh, type Out } from './voices';

/**
 * What each sound is made of: a few notes on the same instruments as the music, in its keys,
 * so a tap or a coin sits inside the song rather than over it. Kept short and soft; the
 * loudest are the moments that deserve it (a victory, a blow).
 */

type Recipe = (out: Out, at: number) => void;

/** The fight's sounds, which grow with the turn behind them (`force.ts`). */
const FIGHT_SOUNDS: ReadonlySet<Sound> = new Set<Sound>(['strike', 'hurt', 'swish', 'mend']);

const C5 = 72;
const A4 = 69;
const D4 = 62;
const A3 = 57;
const A2 = 45;

/** The note `degree` steps up the yō scale from `root`. */
function yo(root: number, degree: number): number {
  const octaves = Math.floor(degree / YO.length);
  return midiToFreq(root + 12 * octaves + (YO[degree % YO.length] ?? 0));
}

/** Notes one after another, `gap` seconds apart. */
function run(
  out: Out,
  at: number,
  notes: { pitches: readonly number[]; gap: number; gain: number },
) {
  notes.pitches.forEach((freq, i) => {
    koto(out, { at: at + i * notes.gap, freq, gain: notes.gain });
  });
}

const RECIPES: Readonly<Record<Sound, Recipe>> = {
  tap: (out, at) => {
    clack(out, { at, freq: 1500, gain: 0.12 });
  },
  refused: (out, at) => {
    koto(out, { at, freq: midiToFreq(A3 + 1), gain: 0.28 });
    koto(out, { at: at + 0.09, freq: midiToFreq(A3), gain: 0.24 });
  },
  page: (out, at) => {
    shaker(out, { at, freq: 0, gain: 0.3, length: 0.18 });
  },
  eat: (out, at) => {
    bell(out, { at, freq: yo(C5, 2), gain: 0.18 });
    koto(out, { at: at + 0.12, freq: yo(C5, 4), gain: 0.2 });
  },
  cook: (out, at) => {
    [0, 0.09, 0.2].forEach((delay, i) => {
      bell(out, { at: at + delay, freq: 700 + 260 * i, gain: 0.07 });
    });
  },
  sleep: (out, at) => {
    [4, 2, 0].forEach((degree, i) => {
      bell(out, { at: at + i * 0.35, freq: yo(A3, degree), gain: 0.16 });
    });
  },
  rest: (out, at) => {
    flute(out, { at, freq: yo(A4, 0), gain: 0.12, length: 0.7 });
  },
  train: (out, at) => {
    whoosh(out, { at, freq: 0, gain: 0.6, length: 0.18 });
    taiko(out, { at: at + 0.17, freq: midiToFreq(A2), gain: 0.45 });
  },
  study: (out, at) => {
    shaker(out, { at, freq: 0, gain: 0.1, length: 0.25 });
    bell(out, { at: at + 0.2, freq: yo(C5, 4), gain: 0.1 });
  },
  heal: (out, at) => {
    [0, 2, 4].forEach((degree, i) => {
      bell(out, { at: at + i * 0.12, freq: yo(C5, degree), gain: 0.14 });
    });
  },
  coins: (out, at) => {
    bell(out, { at, freq: 2100, gain: 0.1 });
    bell(out, { at: at + 0.07, freq: 2650, gain: 0.08 });
  },
  gear: (out, at) => {
    bell(out, { at, freq: 420, gain: 0.14 });
    shaker(out, { at, freq: 0, gain: 0.08, length: 0.1 });
  },
  toast: (out, at) => {
    bell(out, { at, freq: 1800, gain: 0.1 });
    bell(out, { at: at + 0.06, freq: 1950, gain: 0.1 });
  },
  sight: (out, at) => {
    [0, 1, 2, 3, 4, 5].forEach((degree, i) => {
      bell(out, { at: at + i * 0.1, freq: yo(C5, degree), gain: 0.07 });
    });
  },
  bond: (out, at) => {
    run(out, at, { pitches: [0, 2, 4, 5].map((d) => yo(D4, d)), gap: 0.11, gain: 0.3 });
  },
  victory: (out, at) => {
    taiko(out, { at, freq: midiToFreq(A2), gain: 0.6 });
    run(out, at + 0.1, { pitches: [0, 1, 2, 3, 5].map((d) => yo(D4, d)), gap: 0.09, gain: 0.3 });
    bell(out, { at: at + 0.6, freq: yo(D4, 5), gain: 0.2 });
  },
  defeat: (out, at) => {
    taiko(out, { at, freq: midiToFreq(A2 - 5), gain: 0.5 });
    run(out, at + 0.15, {
      pitches: [A3 + 8, A3 + 7, A3 + 1, A3].map(midiToFreq),
      gap: 0.28,
      gain: 0.26,
    });
  },
  fanfare: (out, at) => {
    taiko(out, { at, freq: midiToFreq(A2), gain: 0.55 });
    taiko(out, { at: at + 0.16, freq: midiToFreq(A2), gain: 0.4 });
    run(out, at + 0.3, { pitches: [0, 2, 4].map((d) => yo(D4, d)), gap: 0.08, gain: 0.28 });
    bell(out, { at: at + 0.55, freq: yo(D4, 5), gain: 0.22 });
  },
  paper: (out, at) => {
    shaker(out, { at, freq: 0, gain: 0.08, length: 0.2 });
    koto(out, { at: at + 0.15, freq: yo(D4, 2), gain: 0.22 });
  },
  strike: (out, at) => {
    taiko(out, { at, freq: midiToFreq(A2 + 7), gain: 0.4 });
    shaker(out, { at, freq: 0, gain: 0.1, length: 0.06 });
  },
  hurt: (out, at) => {
    taiko(out, { at, freq: midiToFreq(A2 - 3), gain: 0.55 });
    whoosh(out, { at, freq: 0, gain: 0.35, length: 0.12 });
  },
  mend: (out, at) => {
    bell(out, { at, freq: yo(C5, 2), gain: 0.1 });
    bell(out, { at: at + 0.1, freq: yo(C5, 4), gain: 0.1 });
  },
  swish: (out, at) => {
    whoosh(out, { at, freq: 0, gain: 0.6, length: 0.22 });
  },
  exchange: (out, at) => {
    clack(out, { at, freq: 1300, gain: 0.16 });
    clack(out, { at: at + 0.12, freq: 1300, gain: 0.2 });
  },
};

/** A node that makes everything played into it louder by `gain`. */
function louder(out: Out, gain: number): Out {
  if (gain === 1) return out;
  const boost = out.ctx.createGain();
  boost.gain.value = gain;
  boost.connect(out.dest);
  return { ...out, dest: boost };
}

/**
 * Plays `sound` into `out` at `at` (context seconds); a fight's sound with the `force` of the
 * turn behind it comes out bigger, with the layers its grade, area and element bring.
 */
export function playSound(out: Out, sound: Sound, at: number, force?: SoundForce): void {
  if (!force || !FIGHT_SOUNDS.has(sound)) {
    RECIPES[sound](out, at);
    return;
  }
  RECIPES[sound](louder(out, forceGain(force)), at);
  playForce(out, at, force);
}
