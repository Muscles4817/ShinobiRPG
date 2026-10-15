import type { MusicMood } from '@/game';

import { HIRAJOSHI, IN, YO, type Loop } from './score';

/**
 * The music, one loop per mood: koto and flute over drums, in the scales of old Japanese folk
 * and court music. Bars are written as sixteen steps (see `Layer.bars`).
 */

const E3 = 52;
const A3 = 57;
const C4 = 60;
const D4 = 62;

const title: Loop = {
  bpm: 64,
  root: D4,
  scale: HIRAJOSHI,
  layers: [
    {
      instrument: 'bell',
      octave: -1,
      gain: 0.22,
      bars: ['0...............', '................', '3...............', '................'],
    },
    {
      instrument: 'koto',
      octave: 0,
      gain: 0.42,
      vary: 0.15,
      bars: ['0...2...3...4-..', '5...4...3.2.0...', '0...2...3...7-..', '6...5.4.3.......'],
    },
    {
      instrument: 'flute',
      octave: 1,
      gain: 0.16,
      bars: ['........4-------', '................', '........3---2---', '0-------........'],
    },
    { instrument: 'pad', octave: -1, gain: 0.1, bars: ['0---------------', '3---------------'] },
  ],
};

const day: Loop = {
  bpm: 88,
  root: C4,
  scale: YO,
  layers: [
    {
      instrument: 'koto',
      octave: 0,
      gain: 0.36,
      vary: 0.2,
      bars: ['0.2.4.5.7...5.4.', '2.4.2.0.....2...', '4.5.7.9.7.5.4.2.', '5.4.2.4.0.......'],
    },
    { instrument: 'bass', octave: -2, gain: 0.34, bars: ['0.......3.......', '2.......4.......'] },
    { instrument: 'shaker', octave: 0, gain: 0.06, bars: ['..o...o...o...o.', '..o...o...o.o.o.'] },
    {
      instrument: 'bell',
      octave: 1,
      gain: 0.08,
      bars: ['................', '................', '............7...', '................'],
    },
  ],
};

const night: Loop = {
  bpm: 56,
  root: A3,
  scale: IN,
  layers: [
    {
      instrument: 'flute',
      octave: 1,
      gain: 0.16,
      vary: 0.1,
      bars: ['0-------2---1---', '0---------------', '3-------2-1-0---', '................'],
    },
    {
      instrument: 'koto',
      octave: 0,
      gain: 0.3,
      bars: ['0.......3.......', '..2.......1.....', '0.......4.......', '3...2...1...0...'],
    },
    { instrument: 'pad', octave: -1, gain: 0.1, bars: ['0---------------', '3---------------'] },
    {
      instrument: 'bell',
      octave: 1,
      gain: 0.07,
      bars: [
        '................',
        '............7...',
        '................',
        '................',
        '................',
      ],
    },
  ],
};

const festival: Loop = {
  bpm: 116,
  root: D4,
  scale: YO,
  layers: [
    { instrument: 'taiko', octave: -2, gain: 0.5, bars: ['x...o.o.x...o...', 'x...o.o.x.o.x.o.'] },
    { instrument: 'clack', octave: 1, gain: 0.08, bars: ['....x.......x...', '....x.......x.x.'] },
    {
      instrument: 'koto',
      octave: 0,
      gain: 0.32,
      vary: 0.15,
      bars: ['0.2.4.2.5.4.2.0.', '2.4.5.7.5.4.2...', '7.5.4.5.7.9.7.5.', '4.2.0.2.0.......'],
    },
    {
      instrument: 'flute',
      octave: 1,
      gain: 0.12,
      bars: ['7-------5---4---', '2-------0-------', '........9---7---', '5---4---2-------'],
    },
    {
      instrument: 'bass',
      octave: -2,
      gain: 0.3,
      bars: ['0.......0.......', '3.......4.......', '0.......3.......', '4.......0.......'],
    },
  ],
};

const road: Loop = {
  bpm: 96,
  root: A3,
  scale: YO,
  layers: [
    { instrument: 'bass', octave: -2, gain: 0.32, bars: ['0...0...3...4...', '2...2...4...0...'] },
    {
      instrument: 'koto',
      octave: 0,
      gain: 0.32,
      vary: 0.2,
      bars: ['0.2.4...5.4.2...', '4.5.7...5...4...', '2.4.2.0.....2.4.', '0...............'],
    },
    { instrument: 'shaker', octave: 0, gain: 0.05, bars: ['..o...o...o...o.'] },
    { instrument: 'taiko', octave: -2, gain: 0.22, bars: ['o...............', 'o.......o.......'] },
  ],
};

const tension: Loop = {
  bpm: 72,
  root: A3,
  scale: IN,
  layers: [
    { instrument: 'taiko', octave: -2, gain: 0.42, bars: ['x..o............'] },
    {
      instrument: 'koto',
      octave: -1,
      gain: 0.26,
      vary: 0.1,
      bars: ['0..1..0..1..0...', '0..1..0..2..1...'],
    },
    {
      instrument: 'flute',
      octave: 1,
      gain: 0.1,
      bars: ['................', '4---------3-----', '................', '1---------0-----'],
    },
  ],
};

const fight: Loop = {
  bpm: 138,
  root: A3,
  scale: IN,
  layers: [
    { instrument: 'taiko', octave: -2, gain: 0.5, bars: ['x..ox..ox.o.x...', 'x..ox..ox.o.x.xo'] },
    { instrument: 'clack', octave: 1, gain: 0.08, bars: ['....x.......x...'] },
    {
      instrument: 'koto',
      octave: 0,
      gain: 0.3,
      vary: 0.1,
      bars: ['0.0.1.0.3.2.1.0.', '0.0.1.0.5.4.3.1.', '0.0.1.0.3.2.1.0.', '5.4.3.4.5.6.7...'],
    },
    { instrument: 'bass', octave: -2, gain: 0.32, bars: ['0...0...0...1...', '0...0...3...1...'] },
  ],
};

const ceremony: Loop = {
  bpm: 66,
  root: C4,
  scale: YO,
  layers: [
    { instrument: 'taiko', octave: -2, gain: 0.45, bars: ['x...............', 'x.......o.o.....'] },
    { instrument: 'bell', octave: 0, gain: 0.2, bars: ['0.......4.......', '2.......5.......'] },
    {
      instrument: 'koto',
      octave: 0,
      gain: 0.3,
      bars: ['0.2.4.7.9.7.4.2.', '2.4.7.9.a.9.7.4.', '0.2.4.7.9.a.c.a.', '9.7.5.4.2...0...'],
    },
    {
      instrument: 'flute',
      octave: 1,
      gain: 0.11,
      bars: ['7-------9-------', 'a-------9---7---', 'c-------a-------', '9-------7-------'],
    },
  ],
};

const calm: Loop = {
  bpm: 70,
  root: E3 + 12,
  scale: YO,
  layers: [
    {
      instrument: 'pad',
      octave: -1,
      gain: 0.1,
      bars: ['0---------------', '3---------------', '2---------------', '0---------------'],
    },
    {
      instrument: 'koto',
      octave: 0,
      gain: 0.3,
      vary: 0.2,
      bars: ['0...2...4.......', '5...4...2.......', '4...5...7...5...', '4.2.0...........'],
    },
    {
      instrument: 'bell',
      octave: 1,
      gain: 0.07,
      bars: ['................', '................', '........4.......', '................'],
    },
  ],
};

export const LOOPS: Readonly<Record<MusicMood, Loop>> = {
  title,
  day,
  night,
  festival,
  road,
  tension,
  fight,
  ceremony,
  calm,
};
