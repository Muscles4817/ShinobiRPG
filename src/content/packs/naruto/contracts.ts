import type { MissionDef } from '@/systems/missions';

import type { ContractDef } from '../../contracts';
import { statLine } from '../../statLine';

/**
 * Summoning contracts in the Hidden Leaf: the toads of Mount Myōboku, signed after a job for a
 * lost toad messenger, and Kakashi's ninken, whose scroll he lets a close friend sign.
 */

const TOADS: ContractDef = {
  id: 'myoboku-toads',
  name: 'The Toads of Mount Myōboku',
  description:
    'A clan of toads, proud and loud, from a mountain no road reaches. They answer whoever signed their scroll, as far as they respect them.',
  summons: [
    {
      id: 'gamakichi',
      name: 'Gamakichi',
      description: 'A small, cheeky toad with an oil bullet and opinions about snacks.',
      techniqueId: 'summoning-gamakichi',
      standing: 0,
      stats: statLine(6, {
        speed: 12,
        stamina: 8,
        reserves: 10,
        perception: 10,
        willpower: 7,
        taijutsu: 4,
        ninjutsu: 10,
        genjutsu: 0,
        kenjutsu: 0,
        fuuinjutsu: 0,
      }),
      healthScale: 0.5,
      maxChakra: 70,
      traits: ['swift'],
      techniqueIds: ['gamakichi-oil-bullet'],
      upkeep: 3,
    },
    {
      id: 'gamaken',
      name: 'Gamaken',
      description: 'Huge and clumsy, a shield on one arm; he wants blood before he will come.',
      techniqueId: 'summoning-gamaken',
      standing: 2,
      stats: statLine(8, {
        strength: 40,
        speed: 6,
        stamina: 34,
        reserves: 22,
        intellect: 10,
        willpower: 14,
        taijutsu: 18,
        ninjutsu: 6,
        genjutsu: 0,
        kenjutsu: 0,
        fuuinjutsu: 0,
      }),
      healthScale: 3,
      maxChakra: 170,
      traits: ['armoured'],
      techniqueIds: ['toad-jitte-strike'],
      upkeep: 10,
      price: { blood: 8 },
    },
    {
      id: 'gamabunta',
      name: 'Gamabunta',
      description:
        'The Toad Boss. He comes for a proper meal of game, and leaves if there is none.',
      techniqueId: 'summoning-gamabunta',
      standing: 4,
      stats: statLine(18, {
        strength: 52,
        speed: 14,
        stamina: 48,
        reserves: 40,
        perception: 16,
        willpower: 26,
        taijutsu: 26,
        ninjutsu: 30,
        genjutsu: 0,
        kenjutsu: 24,
        fuuinjutsu: 0,
      }),
      healthScale: 5,
      maxChakra: 650,
      traits: ['armoured'],
      techniqueIds: ['toad-water-gun', 'toad-jitte-strike'],
      upkeep: 18,
      price: { offeringId: 'wild-game' },
    },
  ],
  tastes: ['wild-game', 'river-fish'],
  parting:
    'A last puff of smoke, and a toad’s voice from it says the mountain has crossed your name off. Don’t call again.',
};

const NINKEN: ContractDef = {
  id: 'kakashi-ninken',
  name: 'Kakashi’s Ninken',
  description:
    'Eight tracking dogs who answer the ninken scroll. They like a quiet summoner and a good scratch behind the ears.',
  summons: [
    {
      id: 'pakkun',
      name: 'Pakkun',
      description: 'A small pug with the best nose in the pack; he fights only when he must.',
      techniqueId: 'summoning-pakkun',
      standing: 0,
      stats: statLine(12, {
        strength: 3,
        stamina: 9,
        reserves: 6,
        chakraControl: 4,
        perception: 30,
        willpower: 9,
        taijutsu: 6,
        ninjutsu: 0,
        genjutsu: 0,
        kenjutsu: 0,
        fuuinjutsu: 0,
      }),
      healthScale: 0.4,
      maxChakra: 60,
      traits: ['swift'],
      techniqueIds: ['fang-rush'],
      upkeep: 2,
    },
    {
      id: 'bull',
      name: 'Bull',
      description: 'The biggest of the pack; once he bites, he holds on and waits.',
      techniqueId: 'summoning-bull',
      standing: 2,
      stats: statLine(18, {
        speed: 16,
        stamina: 16,
        reserves: 8,
        chakraControl: 3,
        intellect: 5,
        willpower: 14,
        taijutsu: 15,
        ninjutsu: 0,
        genjutsu: 0,
        kenjutsu: 0,
        fuuinjutsu: 0,
      }),
      healthScale: 1.6,
      maxChakra: 80,
      traits: ['brawler'],
      techniqueIds: ['ninken-hold', 'fang-rush'],
      upkeep: 6,
    },
  ],
  tastes: ['wild-game', 'eggs'],
  parting:
    'Pakkun sniffs the torn scroll and goes without a word. The dogs won’t come to your call again.',
};

/** Snakes lent out by the Sannin who left, to the missing-nin who still serve him. */
const SNAKES: ContractDef = {
  id: 'rogue-snakes',
  name: 'The Snakes of the Rogue Sannin',
  description: 'A snake contract inked for the rogues who still do his errands.',
  summons: [
    {
      id: 'great-snake',
      name: 'Great Snake',
      description: 'As thick as a tree, quick to strike and quicker to coil.',
      techniqueId: 'summoning-great-snake',
      standing: 0,
      stats: statLine(34, {
        speed: 16,
        stamina: 26,
        reserves: 12,
        chakraControl: 3,
        intellect: 4,
        perception: 14,
        willpower: 10,
        taijutsu: 15,
        ninjutsu: 0,
        genjutsu: 0,
        kenjutsu: 0,
        fuuinjutsu: 0,
      }),
      healthScale: 2.5,
      maxChakra: 230,
      techniqueIds: ['snake-coil', 'snake-strike'],
      upkeep: 8,
      price: { blood: 6 },
    },
  ],
};

export const CONTRACTS: readonly ContractDef[] = [TOADS, NINKEN, SNAKES];

/** A lost toad messenger: see it home safe, and the toads offer you their scroll. */
export const TOAD_MISSION: MissionDef = {
  id: 'toad-on-the-doorstep',
  title: 'A Toad on the Doorstep',
  rank: 'D',
  client: 'A Lost Toad',
  summary: 'A talking toad with a scroll on its back is asking the gate guards for directions.',
  slots: 2,
  energyCost: 15,
  reward: { ryo: 70, reputation: 3, contractId: 'myoboku-toads' },
  minMissionsCompleted: 4,
  stages: [
    {
      kind: 'narrative',
      text: '“Name’s Gamatatsu,” says the toad, through a mouthful of sweets. “I’m lost. Big brother’s going to kill me.”',
    },
    {
      kind: 'check',
      text: 'He has to be back at the old shrine in the forest before the moon is up, and he cannot remember the way.',
      approaches: [
        { label: 'Carry him at a run', stat: 'speed', difficulty: 8 },
        { label: 'Read the trail he came by', stat: 'perception', difficulty: 9 },
      ],
      success:
        'You reach the shrine as the moon clears the trees. Gamatatsu bows, and a scroll as long as you are tall unrolls at your feet.',
      failure:
        'You get there late and covered in mud, but you get there. The scroll unrolls at your feet anyway.',
      onFailure: 'penalty',
      failureDamage: 3,
    },
  ],
};
