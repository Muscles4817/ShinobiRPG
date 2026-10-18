import type { TechniqueDef } from '@/systems/techniques';

import type { ContractDef } from '../../contracts';
import { statLine } from '../../statLine';

/**
 * The original pack's summoning contract: the salamanders who sleep in the coals of the old
 * kilns above the falls, signed at the end of the Cold Kilns job.
 */

/** What the salamanders fight with, and the techniques that call them. */
export const CONTRACT_TECHNIQUES: readonly TechniqueDef[] = [
  {
    id: 'summon-kiln-newt',
    name: 'Summoning: Kiln Newt',
    description:
      'A palm to the ground and a puff of hot smoke, and out comes a newt no bigger than a dog.',
    discipline: 'ninjutsu',
    effects: [{ verb: 'summon', power: 1, call: 'kiln-newt' }],
    chakraCost: 8,
    rank: 'D',
    difficulty: 40,
  },
  {
    id: 'summon-ember-salamander',
    name: 'Summoning: Ember Salamander',
    description: 'Blood on the seal, and a salamander the size of an ox crawls out of the smoke.',
    discipline: 'ninjutsu',
    effects: [{ verb: 'summon', power: 1, call: 'ember-salamander' }],
    chakraCost: 16,
    rank: 'C',
    difficulty: 70,
  },
  {
    id: 'summon-kiln-mother',
    name: 'Summoning: The Kiln Mother',
    description:
      'An offering in the coals, and the oldest of them heaves up, red-hot to the gills.',
    discipline: 'ninjutsu',
    effects: [{ verb: 'summon', power: 1, call: 'kiln-mother' }],
    chakraCost: 30,
    rank: 'B',
    difficulty: 110,
  },
  {
    id: 'summon-undercroft-rat',
    name: 'Summoning: Undercroft Rat',
    description: 'A smear of blood on a cellar stone, and a thing with yellow teeth comes up.',
    discipline: 'ninjutsu',
    effects: [{ verb: 'summon', power: 1, call: 'undercroft-rat' }],
    chakraCost: 8,
    rank: 'D',
    difficulty: 40,
  },
  {
    id: 'rat-bite',
    name: 'Gnawing Bite',
    description: 'A rat as big as a dog, going for the ankles.',
    discipline: 'taijutsu',
    effects: [{ verb: 'damage', power: 9 }],
    chakraCost: 2,
    rank: 'E',
    difficulty: 20,
  },
  {
    id: 'ember-spit',
    name: 'Ember Spit',
    description: 'A gob of burning slag, spat from across the yard.',
    discipline: 'ninjutsu',
    element: 'fire',
    reach: ['close', 'mid'],
    effects: [{ verb: 'damage', power: 10 }],
    chakraCost: 3,
    rank: 'E',
    difficulty: 20,
  },
  {
    id: 'coal-crush',
    name: 'Coal Crush',
    description: 'A heavy, hot body brought down on whoever is underneath.',
    discipline: 'taijutsu',
    effects: [{ verb: 'damage', power: 16 }],
    chakraCost: 4,
    rank: 'D',
    difficulty: 40,
  },
  {
    id: 'kiln-breath',
    name: 'Kiln Breath',
    description: 'The heat of a whole kiln opened at once, across everyone in front of her.',
    discipline: 'ninjutsu',
    element: 'fire',
    effects: [{ verb: 'area', power: 18, size: 'wide' }],
    chakraCost: 12,
    rank: 'B',
    difficulty: 100,
  },
];

export const CONTRACTS: readonly ContractDef[] = [
  {
    id: 'kiln-salamanders',
    name: 'The Salamanders of the Old Kilns',
    description:
      'Salamanders who have slept in the kiln coals since the kilns were built, and answer whoever the Kiln Mother allows.',
    summons: [
      {
        id: 'kiln-newt',
        name: 'Kiln Newt',
        description: 'Small, quick and hot underfoot; it spits slag and scampers off.',
        techniqueId: 'summon-kiln-newt',
        standing: 0,
        stats: statLine('E', { speed: 'D', ninjutsu: 'D', taijutsu: 'D' }),
        healthScale: 0.5,
        maxChakra: 20,
        traits: ['swift'],
        techniqueIds: ['ember-spit'],
        upkeep: 3,
      },
      {
        id: 'ember-salamander',
        name: 'Ember Salamander',
        description: 'As big as an ox and as stubborn; it wants blood before it will come.',
        techniqueId: 'summon-ember-salamander',
        standing: 2,
        stats: statLine('D', { strength: 'C', stamina: 'C', taijutsu: 'C', ninjutsu: 'C' }),
        healthScale: 1.6,
        maxChakra: 30,
        traits: ['brawler'],
        techniqueIds: ['ember-spit', 'coal-crush'],
        upkeep: 7,
        price: { blood: 8 },
      },
      {
        id: 'kiln-mother',
        name: 'The Kiln Mother',
        description:
          'The oldest of them, as long as a kiln and as hot. She comes for an offering of roasted chestnuts, and leaves if there is none.',
        techniqueId: 'summon-kiln-mother',
        standing: 4,
        stats: statLine('C', { strength: 'B', stamina: 'B', ninjutsu: 'B', willpower: 'B' }),
        healthScale: 4,
        maxChakra: 60,
        traits: ['armoured'],
        techniqueIds: ['kiln-breath', 'coal-crush'],
        upkeep: 14,
        price: { offeringId: 'chestnuts' },
      },
    ],
    tastes: ['chestnuts', 'spices'],
    parting:
      'The coals go dark in every kiln at once. Somewhere under the falls the Kiln Mother turns over, and forgets your name.',
  },
  {
    id: 'undercroft-rats',
    name: 'The Rats of the Undercroft',
    description:
      'A cellar contract passed from hand to hand among bandits, worth what a rat is worth.',
    summons: [
      {
        id: 'undercroft-rat',
        name: 'Undercroft Rat',
        description: 'A mangy rat the size of a dog; it fights for whoever paid it last.',
        techniqueId: 'summon-undercroft-rat',
        standing: 0,
        stats: statLine('E', { speed: 'D', taijutsu: 'D' }),
        healthScale: 0.5,
        maxChakra: 10,
        traits: ['swift'],
        techniqueIds: ['rat-bite'],
        upkeep: 3,
      },
    ],
  },
];
