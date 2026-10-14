import type { SoloFloor } from '@/systems/stats';

import type { UpbringingDef } from '../upbringing';

/**
 * How a child was raised. Early training is development points on the academy file; a clan
 * child's must have gone into the clan's arts first, which is why no clan child graduates with
 * nothing to show in them.
 */

const SELF_TAUGHT: SoloFloor = { floor: 0.25, throughGrade: 'D' };

export const UPBRINGINGS: readonly UpbringingDef[] = [
  {
    id: 'civilian',
    name: 'Civilian family',
    description: 'Shopkeepers, farmers, carpenters. Nobody at home knew a hand seal.',
    family: 'clanless',
    earlyTraining: 0,
    modifiers: {
      soloEfficiencyFloor: {
        taijutsu: SELF_TAUGHT,
        ninjutsu: SELF_TAUGHT,
        genjutsu: SELF_TAUGHT,
        kenjutsu: SELF_TAUGHT,
        fuuinjutsu: SELF_TAUGHT,
      },
    },
  },
  {
    id: 'shinobi-family',
    name: 'Shinobi family',
    description: 'A parent with a headband, and the scrolls and drills that come with one.',
    family: 'clanless',
    earlyTraining: 2,
    modifiers: {},
  },
  {
    id: 'orphan',
    name: 'Orphan',
    description:
      'Raised by the streets and the orphanage. Tough, quick, and used to fending alone.',
    family: 'clanless',
    earlyTraining: 2,
    focus: { stats: ['strength', 'speed', 'stamina'], points: 2 },
    modifiers: {
      soloEfficiencyFloor: { strength: SELF_TAUGHT, speed: SELF_TAUGHT, stamina: SELF_TAUGHT },
    },
  },
  {
    id: 'clan-branch',
    name: 'Branch family',
    description: 'Raised in the clan compound, drilled in its arts alongside your cousins.',
    family: 'clan',
    earlyTraining: 3,
    focus: { stats: 'clan-arts', points: 2 },
    modifiers: {},
  },
  {
    id: 'clan-main',
    name: 'Main house',
    description: 'The clan head’s line. Taught by the best before you could read, and watched.',
    family: 'clan',
    earlyTraining: 4,
    focus: { stats: 'clan-arts', points: 3 },
    modifiers: {},
  },
];
