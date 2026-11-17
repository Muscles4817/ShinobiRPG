import type { TechniqueDef } from '@/systems/techniques';

import type { ContractDef } from '../../../../contracts';
import { statLine } from '../../../../statLine';

/**
 * Tsunade's and Shizune's arts beyond the pack's medical shelf (`techniques/canon/medical.ts`):
 * the heel that splits the ground, the seal on her brow, Shizune's poison, and Katsuyu, the
 * slug she alone calls here (a contract no one signs: `validateContracts.ts`).
 */

const KATSUYU = 'katsuyu';

export const MEDIC_ARTS: readonly TechniqueDef[] = [
  {
    id: 'heavenly-foot-of-pain',
    name: 'Heavenly Foot of Pain',
    description:
      'Tsūtenkyaku. A heel brought down from a leap with chakra let go on contact; the ground opens under it.',
    discipline: 'taijutsu',
    moulded: true,
    accuracy: 'wild',
    effects: [
      { verb: 'break', power: 30, scaling: { drive: ['strength', 'chakraControl'] } },
      { verb: 'area', power: 10 },
      { verb: 'daze', power: 8 },
    ],
    chakraCost: 16,
    rank: 'A',
    needs: { control: 'A' },
    difficulty: 140,
  },
  {
    id: 'strength-of-a-hundred',
    name: 'Strength of a Hundred Seal',
    description:
      'The diamond on her brow opens. Chakra stored a little every day for years floods out, and her body mends as fast as it is cut.',
    discipline: 'ninjutsu',
    needs: { control: 'S', minReserves: 30 },
    effects: [
      { verb: 'heal', power: 30 },
      {
        verb: 'empower',
        power: 10,
        boosts: ['strength', 'stamina', 'taijutsu'],
        afterCost: { kind: 'exhaustion', days: 3 },
      },
    ],
    chakraCost: 10,
    rank: 'S',
    difficulty: 190,
    oncePerFight: true,
  },
  {
    id: 'summoning-katsuyu',
    name: 'Summoning: Katsuyu',
    description: 'A palm on the ground, and the great slug of Shikkotsu Forest rises in the smoke.',
    discipline: 'ninjutsu',
    effects: [{ verb: 'summon', power: 1, call: KATSUYU }],
    chakraCost: 30,
    rank: 'A',
    difficulty: 140,
  },
  {
    id: 'tongue-acid-slime',
    name: 'Tongue Acid Slime',
    description: 'Zesshi Nensan. The slug spits a flood of acid that eats through rock.',
    discipline: 'ninjutsu',
    reach: ['close', 'mid'],
    effects: [
      { verb: 'area', power: 18, size: 'wide' },
      { verb: 'afflict', power: 8, harm: 'burn' },
    ],
    chakraCost: 18,
    rank: 'B',
    difficulty: 110,
  },
  {
    id: 'poison-mist',
    name: 'Poison Mist',
    description: 'Shizune breathes out a cloud of poison that spreads before anyone can step back.',
    discipline: 'ninjutsu',
    reach: ['close', 'mid'],
    effects: [
      { verb: 'area', power: 8 },
      { verb: 'afflict', power: 10, harm: 'poison' },
    ],
    chakraCost: 12,
    rank: 'B',
    difficulty: 105,
  },
  {
    id: 'hidden-needle-launcher',
    name: 'Hidden Weapon: Needle Launcher',
    description:
      'A spring launcher strapped under her sleeve. A flick of the wrist, and poisoned needles are already in the air.',
    discipline: 'taijutsu',
    reach: ['close', 'mid'],
    accuracy: 'sure',
    effects: [
      { verb: 'damage', power: 10, hits: 3 },
      { verb: 'afflict', power: 7, harm: 'poison' },
    ],
    chakraCost: 8,
    rank: 'C',
    difficulty: 80,
  },
];

/** Katsuyu as Tsunade calls her: a body far bigger than a toad's, slow, and hard to kill. */
export const SLUGS: ContractDef = {
  id: 'shikkotsu-slugs',
  name: 'The Slugs of Shikkotsu Forest',
  description:
    'Katsuyu and her kin, gentle and polite, who answer only Tsunade of the Sannin and those she trusts.',
  summons: [
    {
      id: KATSUYU,
      name: 'Katsuyu',
      description: 'A great white slug, courteous to a fault, who spits acid and splits to escape.',
      techniqueId: 'summoning-katsuyu',
      standing: 0,
      stats: statLine(14, {
        strength: 30,
        speed: 4,
        stamina: 40,
        reserves: 36,
        intellect: 18,
        perception: 20,
        willpower: 24,
        ninjutsu: 24,
        taijutsu: 10,
        genjutsu: 0,
        kenjutsu: 0,
        fuuinjutsu: 0,
      }),
      healthScale: 4,
      maxChakra: 300,
      techniqueIds: ['tongue-acid-slime'],
      upkeep: 12,
    },
  ],
};
