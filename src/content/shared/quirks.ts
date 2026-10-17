import type { QuirkDef } from '../types';

/**
 * Small habits people notice. Free to take, as many as fit: they change nothing in a fight, only
 * how fast people with the named traits warm to you (setting-neutral, so every pack can use them).
 */
export const QUIRKS: readonly QuirkDef[] = [
  {
    id: 'hums',
    name: 'Hums while training',
    description: 'The same three notes, over and over.',
    warms: ['calm', 'lazy'],
    cools: ['focused'],
  },
  {
    id: 'snacks',
    name: 'Always has snacks',
    description: 'Pockets full of rice crackers, shared with anyone.',
    warms: ['kind', 'lazy'],
    cools: ['diligent'],
  },
  {
    id: 'bad-jokes',
    name: 'Terrible jokes',
    description: 'Puns, mostly. Some of them aren’t even in words.',
    warms: ['brash', 'curious'],
    cools: ['focused', 'diligent'],
  },
  {
    id: 'back-to-the-wall',
    name: 'Back to the wall',
    description: 'Never sits facing away from a door.',
    warms: ['cunning'],
    cools: ['kind'],
  },
  {
    id: 'talks-to-animals',
    name: 'Talks to animals',
    description: 'And, apparently, listens to them too.',
    warms: ['curious', 'kind'],
    cools: ['proud'],
  },
  {
    id: 'notebook',
    name: 'Keeps a notebook',
    description: 'Writes down everything anyone says. Everything.',
    warms: ['diligent', 'humble'],
    cools: ['cunning'],
  },
  {
    id: 'early-riser',
    name: 'Up before the sun',
    description: 'Already stretching when the bell tower rings dawn.',
    warms: ['diligent', 'tireless'],
    cools: ['lazy'],
  },
  {
    id: 'compliments',
    name: 'Hands out compliments',
    description: 'Means every one of them, which somehow makes it worse.',
    warms: ['proud'],
    cools: ['humble'],
  },
  {
    id: 'sketches',
    name: 'Sketches everyone',
    description: 'A charcoal stub and the back of any paper going.',
    warms: ['curious', 'calm'],
    cools: ['brash'],
  },
  {
    id: 'loud-laugh',
    name: 'Laughs too loud',
    description: 'Heard three streets away. Infectious, mostly.',
    warms: ['brash', 'kind'],
    cools: ['calm'],
  },
  {
    id: 'never-loses-at-cards',
    name: 'Never loses at cards',
    description: 'Nobody has worked out how. Nobody has stopped asking.',
    warms: ['cunning', 'curious'],
    cools: ['proud'],
  },
  {
    id: 'carries-everything',
    name: 'Carries everyone’s bags',
    description: 'Offers before anyone asks, and won’t take no.',
    warms: ['humble', 'kind'],
    cools: ['proud'],
  },
];
