import type { AptitudeDef } from '../../types';

/** Techniques every graduate knows, regardless of aptitude. */
export const ACADEMY_TECHNIQUES: readonly string[] = ['palm-strike', 'shadow-feint'];

export const APTITUDES: readonly AptitudeDef[] = [
  {
    id: 'taijutsu',
    name: 'Taijutsu Prodigy',
    description: 'Your body learns faster than your mind. Strong, fast, relentless.',
    statBonuses: { strength: 2, speed: 2, taijutsu: 3 },
    techniqueIds: ['gale-heel'],
  },
  {
    id: 'ninjutsu',
    name: 'Ninjutsu Prodigy',
    description: 'Chakra comes easily to you. The seals feel like a language you already knew.',
    statBonuses: { chakraControl: 2, intellect: 1, ninjutsu: 3 },
    techniqueIds: ['pebble-volley'],
  },
  {
    id: 'genjutsu',
    name: 'Genjutsu Prodigy',
    description: 'You see what others miss, and make them see what isn’t there.',
    statBonuses: { perception: 2, willpower: 2, genjutsu: 3 },
    techniqueIds: ['lantern-mirage'],
  },
];
