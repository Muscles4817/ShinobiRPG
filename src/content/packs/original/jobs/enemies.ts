import type { EnemyDef } from '../../../types';

/**
 * Foes the template jobs bring in beyond the pack's first roster. Each copies the numbers of an
 * existing foe of the same grade and kind exactly, so it changes who you fight, never how hard
 * the fight is: only the name, the description and the banner tag are its own.
 */
export const JOB_ENEMIES: readonly EnemyDef[] = [
  {
    // Feral Tanuki's numbers.
    id: 'reikon-macaque',
    kind: 'Beast',
    danger: 'petty',
    name: 'Reikon Macaque',
    description: 'A grey mountain monkey with clever hands, a red face and no shame at all.',
    baseStat: 3,
    statBonuses: { speed: 3, strength: 1 },
    healthScale: 0.5,
    maxChakra: 0,
    techniqueIds: [],
    traits: ['swift', 'coward'],
  },
  {
    // Ash Wood Boar's numbers.
    id: 'ash-fell-bear',
    kind: 'Beast',
    danger: 'armed',
    name: 'Ash Fell Bear',
    description: 'A black bear grown huge on charcoal-burners’ scraps, grey with ash to the eyes.',
    baseStat: 6,
    statBonuses: { strength: 4, stamina: 3 },
    healthScale: 1.4,
    maxChakra: 0,
    techniqueIds: [],
    traits: ['brawler'],
  },
  {
    // Bandit Thug's numbers.
    id: 'river-pirate',
    kind: 'Bandit',
    danger: 'armed',
    name: 'River Pirate',
    description: 'A boat-hook, a stolen skiff and a habit of cutting other people’s nets.',
    baseStat: 5,
    statBonuses: { strength: 2, taijutsu: 1 },
    maxChakra: 10,
    techniqueIds: [],
    traits: ['brawler'],
  },
  {
    // Storehouse Wraith's numbers.
    id: 'canal-drowned',
    kind: 'Spirit',
    danger: 'petty',
    name: 'Canal Drowned',
    description: 'Someone the canal took, still reaching up for the lanterns floating overhead.',
    baseStat: 6,
    statBonuses: { genjutsu: 3, willpower: 3, stamina: -2 },
    healthScale: 0.7,
    maxChakra: 40,
    techniqueIds: ['shadow-feint', 'whispering-dread'],
    traits: ['spirit', 'illusionist'],
  },
  {
    // Ember Missing-nin's numbers.
    id: 'kurogane-renegade',
    kind: 'Rogue',
    danger: 'deadly',
    name: 'Kurogane Renegade',
    description: 'A clan swordsman who sold his blade and his name. He kept the clan’s footwork.',
    baseStat: 11,
    statBonuses: { ninjutsu: 4, speed: 2, kenjutsu: 2 },
    maxChakra: 70,
    techniqueIds: ['ember-breath', 'tide-lash', 'moonfall-slash'],
    traits: ['swift'],
    nature: 'fire',
  },
  {
    // Kiln Wraith's numbers.
    id: 'reikon-shade',
    kind: 'Spirit',
    danger: 'deadly',
    name: 'Reikon Shade',
    description: 'A pilgrim who died on the mountain path and forgot which way was home.',
    baseStat: 11,
    statBonuses: { genjutsu: 5, willpower: 4, stamina: -2 },
    healthScale: 1.2,
    maxChakra: 80,
    techniqueIds: ['whispering-dread', 'moth-dance', 'shadow-feint'],
    traits: ['spirit', 'illusionist'],
  },
];
