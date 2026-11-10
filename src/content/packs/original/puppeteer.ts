import { look } from '../../look';
import type { PuppetDef } from '../../puppets';
import { statLine } from '../../statLine';
import type { PersonDef } from '../../types';
import type { TechniqueDef } from '@/systems/techniques';

/**
 * Tōrōgakure's puppetry, for now one lantern-maker's (`docs/design/retinue-plan.md`, step 5b):
 * Kazuo builds lantern dolls of paper and bamboo with a hook in each hand, and teaches the
 * unsealing of one to anyone patient enough to sit through his lantern talk. The village's own
 * puppetry is still to be designed; this keeps its threads in the game until it is.
 */

const SCHOOL = 'Lantern Puppetry';

export const LANTERN_PUPPET_ARTS: readonly TechniqueDef[] = [
  {
    id: 'unseal-lantern-doll',
    name: 'Unsealing: Lantern Doll',
    description: 'A paper lantern unfolds out of a scroll into a doll as tall as you, lit inside.',
    discipline: 'ninjutsu',
    school: SCHOOL,
    effects: [{ verb: 'summon', power: 1, call: 'lantern-doll' }],
    chakraCost: 8,
    rank: 'D',
    difficulty: 60,
  },
  {
    id: 'lantern-hook',
    name: 'Lantern Hook',
    description: 'The doll swings the lamp-hook in its hand, and its oil catches where it bites.',
    discipline: 'kenjutsu',
    school: SCHOOL,
    needs: { weapon: 'blade' },
    reach: ['close'],
    effects: [
      { verb: 'damage', power: 12 },
      { verb: 'afflict', power: 4, harm: 'burn' },
    ],
    chakraCost: 4,
    rank: 'D',
    difficulty: 60,
  },
];

export const LANTERN_DOLL: PuppetDef = {
  id: 'lantern-doll',
  name: 'Lantern Doll',
  description:
    'Bamboo bones, waxed paper skin and a lamp burning in its chest. It is lighter than it looks, and so is everything it hits.',
  techniqueId: 'unseal-lantern-doll',
  stats: statLine('E', { kenjutsu: 'D', speed: 'D', strength: 'D', stamina: 'D' }),
  healthScale: 0.9,
  maxChakra: 20,
  techniqueIds: ['lantern-hook'],
  upkeep: 2,
};

export const LANTERN_MAKER: PersonDef = {
  id: 'kazuo-lanternmaker',
  name: 'Kazuo',
  familyName: 'Toyama',
  pronouns: 'he',
  role: 'shinobi',
  title: 'Lantern-maker',
  rank: 'chunin',
  stats: statLine(8, {
    strength: 6,
    speed: 8,
    chakraControl: 18,
    ninjutsu: 16,
    intellect: 14,
    perception: 13,
    kenjutsu: 10,
  }),
  traitIds: ['diligent', 'curious'],
  appearance: look(
    'topknot',
    { hair: '#8a8a8a', eyes: '#2a1d14', skin: '#e2b48c', outfit: '#6b4a2a' },
    'belt',
    { age: 'old', expression: 'smile' },
  ),
  specialty: 'ninjutsu',
  bio: 'Makes the lanterns that hang over the gate, and one doll a year that walks. Calls them all by name, and won’t say which of them he talks to at night.',
  schedule: {
    morning: 'training-grounds',
    afternoon: 'market-street',
    evening: 'market-street',
    night: 'izakaya',
  },
  teacher: {
    quirk: 'patient',
    teaches: ['unseal-lantern-doll'],
    price: {
      kind: 'bond',
      minStage: 1,
      line: '“Sit with me while the glue dries, and I’ll show you how she stands up.”',
    },
  },
  arsenal: { techniqueIds: ['pebble-volley'], puppets: ['lantern-doll'] },
};
