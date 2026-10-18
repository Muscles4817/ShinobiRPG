import type { TechniqueDef } from '@/systems/techniques';

import { look } from '../../../look';
import { statLine } from '../../../statLine';
import type { GearDef, PersonArsenal, PersonDef } from '../../../types';

/**
 * Tengen Uzui, a guest from another story, as a Leaf jōnin of the Sound Breathing: twin
 * cleavers on a chain, packed with powder that goes off as they strike. He opens loud and fast
 * to end it in the first exchange; when that fails he reads the rhythm of a foe's attacks (his
 * Musical Score, the `foresight` perk: he slips and counters more as the fight goes on and,
 * between rounds, keeps the defence that best meets what he's been thrown) and answers it.
 * Versus only for now (`ContentPack.duelists`).
 */

const SCHOOL = 'Sound Breathing';

export const TENGEN_TECHNIQUES: readonly TechniqueDef[] = [
  {
    id: 'sound-breathing-roar',
    name: 'Sound Breathing, First Form: Roar',
    description:
      'He crosses the ground in one bound and brings both cleavers down; the powder goes off with them.',
    discipline: 'kenjutsu',
    school: SCHOOL,
    needs: { weapon: 'blade' },
    effects: [
      { verb: 'move', power: 8, to: 'close' },
      { verb: 'damage', power: 18 },
      { verb: 'daze', power: 8 },
    ],
    chakraCost: 16,
    rank: 'B',
    difficulty: 115,
  },
  {
    id: 'constant-resounding-slashes',
    name: 'Sound Breathing, Fourth Form: Constant Resounding Slashes',
    description:
      'The cleavers spin on their chain and every cut sets off a blast. Hard to read, harder to stand in.',
    discipline: 'kenjutsu',
    school: SCHOOL,
    needs: { weapon: 'blade' },
    reach: ['close'],
    accuracy: 'wild',
    effects: [
      { verb: 'damage', power: 24, hits: 4 },
      { verb: 'daze', power: 6 },
    ],
    chakraCost: 20,
    rank: 'A',
    difficulty: 140,
  },
  {
    id: 'string-performance',
    name: 'Sound Breathing, Fifth Form: String Performance',
    description:
      'He spins the chained cleavers into a wall of blades and blasts; whatever comes in is met on the beat.',
    discipline: 'kenjutsu',
    school: SCHOOL,
    needs: { weapon: 'blade' },
    reach: ['close'],
    effects: [{ verb: 'counter', power: 20 }],
    chakraCost: 10,
    rank: 'B',
    difficulty: 110,
  },
];

export const TENGEN_GEAR: readonly GearDef[] = [
  {
    id: 'chained-cleavers',
    name: 'Chained Cleavers',
    description:
      'Two great cleavers joined by a chain, their spines packed with powder. They go through a guard.',
    kind: 'weapon',
    shape: 'blade',
    rank: 'A',
    unique: true,
    effects: ['sunder'],
    cost: 0,
    icon: 'sword',
  },
];

/** The forms, a sound-shaker up close, tags and kunai at range, and a flicker to close in. */
const TENGEN_ARSENAL: PersonArsenal = {
  techniqueIds: [
    'sound-breathing-roar',
    'constant-resounding-slashes',
    'string-performance',
    'resonating-echo-drill',
    'explosive-tag',
    'body-flicker',
  ],
  perks: ['foresight'],
  gearIds: ['chained-cleavers', 'weighted-kunai'],
  tools: { 'smoke-bomb': 2, 'explosive-tag': 4 },
};

export const TENGEN: PersonDef = {
  id: 'tengen',
  name: 'Tengen',
  familyName: 'Uzui',
  role: 'shinobi',
  title: 'Jōnin',
  rank: 'jonin',
  stats: statLine('C', {
    kenjutsu: 34,
    speed: 34,
    perception: 34,
    strength: 'A',
    stamina: 'A',
    taijutsu: 'B',
    intellect: 26,
    willpower: 'B',
    ninjutsu: 18,
  }),
  traitIds: ['proud', 'cunning'],
  appearance: look(
    'ponytail',
    { hair: '#e8e0d0', eyes: '#b8322c', skin: '#f3d2b3', outfit: '#2a2a32' },
    'forehead',
    { shape: 'angular', figure: 'broad', expression: 'grin', mark: 'earrings', age: 'grown' },
  ),
  specialty: 'kenjutsu',
  bio: 'A former shinobi who wants everything flashy, his fights most of all. He hears a fight before he sees it.',
  schedule: { morning: null, afternoon: null, evening: null, night: null },
  arsenal: TENGEN_ARSENAL,
};
