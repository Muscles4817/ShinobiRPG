import type { SoundForce } from '@/game';

import { midiToFreq, YO } from './score';
import { bass, bell, clack, koto, shaker, taiko, whoosh, type Out } from './voices';

/**
 * A fight's sounds grow with the turn behind them (`SoundForce`): a genin's blow is the plain
 * drum of `effects.ts`; a chūnin's lands with an echo, a jōnin's with a boom under it and a
 * roll after, and a kage's shakes the floor. An area technique swells with the ground it
 * covers, and an element brings its own colour: fire crackles, water washes, wind howls,
 * lightning snaps, earth rumbles. Every layer is a fixed pattern, never random, and the
 * loudest stay well under the limiter.
 */

type Element = NonNullable<SoundForce['element']>;
type Layer = (out: Out, at: number, weight: number) => void;

/** The grade (0 E … 5 S) from which each layer comes in. */
const ECHO_FROM = 2;
const BOOM_FROM = 3;
const ROLL_FROM = 4;
const TOP_GRADE = 5;

const A1 = 33;
const A2 = 45;
const D5 = 74;

/** How much a sound is made bigger by its maker's grade: 1 for a genin, up to 1.6 for a kage. */
export function forceGain(force: SoundForce | undefined): number {
  return force ? 1 + 0.12 * Math.min(TOP_GRADE, force.grade) : 1;
}

function echo(out: Out, at: number, weight: number) {
  taiko(out, { at: at + 0.07, freq: midiToFreq(A2 - 2), gain: 0.25 + 0.15 * weight });
}

function boom(out: Out, at: number, weight: number) {
  bass(out, { at, freq: midiToFreq(A1), gain: 0.3 + 0.2 * weight });
  whoosh(out, { at, freq: 0, gain: 0.25 + 0.2 * weight, length: 0.45 });
}

function roll(out: Out, at: number, weight: number) {
  [0.16, 0.27, 0.36, 0.43].forEach((delay, i) => {
    taiko(out, { at: at + delay, freq: midiToFreq(A2 - i), gain: (0.3 - 0.05 * i) * weight });
  });
  bell(out, { at: at + 0.05, freq: midiToFreq(D5 + 12), gain: 0.05 * weight });
}

const ELEMENTS: Readonly<Record<Element, Layer>> = {
  fire: (out, at, weight) => {
    whoosh(out, { at, freq: 0, gain: 0.3 + 0.2 * weight, length: 0.5 });
    [0.03, 0.11, 0.16, 0.27, 0.33, 0.42].forEach((delay, i) => {
      shaker(out, {
        at: at + delay,
        freq: 0,
        gain: (0.12 + 0.04 * (i % 2)) * weight,
        length: 0.05,
      });
    });
  },
  water: (out, at, weight) => {
    [5, 4, 3, 2, 1, 0].forEach((degree, i) => {
      const note = midiToFreq(D5 + (YO[degree % YO.length] ?? 0));
      koto(out, { at: at + i * 0.045, freq: note, gain: 0.08 + 0.05 * weight });
    });
    shaker(out, { at, freq: 0, gain: 0.12 * weight, length: 0.5 });
  },
  wind: (out, at, weight) => {
    whoosh(out, { at, freq: 0, gain: 0.35 + 0.25 * weight, length: 0.7 });
    whoosh(out, { at: at + 0.2, freq: 0, gain: 0.2 + 0.2 * weight, length: 0.5 });
  },
  lightning: (out, at, weight) => {
    [0, 0.03, 0.05, 0.09, 0.12].forEach((delay, i) => {
      clack(out, { at: at + delay, freq: 2600 - 300 * i, gain: 0.08 + 0.06 * weight });
    });
    bell(out, { at: at + 0.02, freq: 3100, gain: 0.04 + 0.04 * weight });
  },
  earth: (out, at, weight) => {
    taiko(out, { at, freq: midiToFreq(A2 - 7), gain: 0.35 + 0.2 * weight });
    taiko(out, { at: at + 0.12, freq: midiToFreq(A2 - 9), gain: 0.25 + 0.2 * weight });
    shaker(out, { at: at + 0.05, freq: 0, gain: 0.1 * weight, length: 0.4 });
  },
};

const AREAS: Readonly<Record<NonNullable<SoundForce['size']>, Layer>> = {
  small: (out, at, weight) => {
    whoosh(out, { at, freq: 0, gain: 0.2 + 0.15 * weight, length: 0.3 });
  },
  wide: (out, at, weight) => {
    whoosh(out, { at, freq: 0, gain: 0.35 + 0.2 * weight, length: 0.8 });
    taiko(out, { at: at + 0.1, freq: midiToFreq(A2 - 5), gain: 0.3 + 0.2 * weight });
  },
  vast: (out, at, weight) => {
    whoosh(out, { at, freq: 0, gain: 0.45 + 0.2 * weight, length: 1.4 });
    bass(out, { at, freq: midiToFreq(A1 - 2), gain: 0.35 + 0.2 * weight });
    [0.15, 0.4, 0.7].forEach((delay, i) => {
      taiko(out, { at: at + delay, freq: midiToFreq(A2 - 7 - i), gain: 0.35 - 0.06 * i });
    });
  },
};

/** The layers a fight's sound gains from the turn behind it, played over its plain recipe. */
export function playForce(out: Out, at: number, force: SoundForce): void {
  const grade = Math.min(TOP_GRADE, Math.max(0, force.grade));
  // Even a genin's fireball crackles; a master's crackles louder.
  const weight = 0.5 + (0.5 * grade) / TOP_GRADE;
  if (grade >= ECHO_FROM) echo(out, at, weight);
  if (grade >= BOOM_FROM) boom(out, at, weight);
  if (grade >= ROLL_FROM) roll(out, at, weight);
  if (force.size) AREAS[force.size](out, at, weight);
  if (force.element) ELEMENTS[force.element](out, at, weight);
}
