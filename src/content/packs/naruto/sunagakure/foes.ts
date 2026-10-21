import type { EnemyDef } from '../../../types';

/**
 * Who fights in the sand: raiders of the outer sands and the spice runners of the tainted belt,
 * beasts changed by the bijū chakra Shukaku left soaking into the desert (`docs/design/
 * sunagakure-plan.md`), the restless dead of the belt, and the Sand's own patrols, who have
 * not forgotten the Leaf.
 */
export const DESERT_FOES: readonly EnemyDef[] = [
  {
    id: 'dune-raider',
    kind: 'Desert raider',
    danger: 'armed',
    name: 'Dune Raider',
    description:
      'Face wrapped against the sand, a curved blade and a camel tethered behind the next dune.',
    baseStat: 6,
    statBonuses: { speed: 2, stamina: 2, kenjutsu: 1 },
    maxChakra: 26,
    techniqueIds: ['iaido-draw', 'shuriken-jutsu', 'smoke-tag'],
  },
  {
    id: 'spice-runner',
    kind: 'Spice smuggler',
    danger: 'armed',
    name: 'Spice Runner',
    description:
      'Rings round the eyes from the deep sand and a sack of it on the back. Fights like someone with nothing left to lose but the sack.',
    baseStat: 7,
    statBonuses: { speed: 2, perception: 2, ninjutsu: 1 },
    maxChakra: 44,
    techniqueIds: ['mud-bullet', 'camouflage-concealment', 'iaido-draw'],
    traits: ['swift'],
  },
  {
    id: 'tainted-jackal',
    kind: 'Tainted beast',
    danger: 'armed',
    name: 'Tainted Jackal',
    description:
      'A jackal grown too big, with sand-coloured eyes and no fear of fire. The belt’s chakra is in its blood.',
    baseStat: 6,
    statBonuses: { speed: 3, perception: 2, strength: 1 },
    healthScale: 0.8,
    maxChakra: 19,
    techniqueIds: ['fang-rush', 'hamstring'],
    traits: ['pack', 'swift'],
  },
  {
    id: 'tainted-scorpion',
    kind: 'Tainted beast',
    danger: 'deadly',
    name: 'Tainted Scorpion',
    description:
      'A scorpion the size of a cart, with plates like baked clay. Its sting glows faintly, the colour of the deep sand.',
    baseStat: 9,
    statBonuses: { strength: 3, stamina: 3, kenjutsu: 2 },
    size: 'large',
    healthScale: 1.6,
    maxChakra: 38,
    techniqueIds: ['hiruko-tail', 'poison-needle-volley'],
    traits: ['armoured'],
  },
  {
    id: 'sand-wraith',
    kind: 'Spirit of the tainted sand',
    danger: 'deadly',
    name: 'Sand Wraith',
    description:
      'A shape of blown sand that walks like a person and speaks in the voice of someone you lost.',
    baseStat: 9,
    statBonuses: { genjutsu: 3, willpower: 2, speed: 1 },
    maxChakra: 70,
    techniqueIds: ['hell-viewing', 'sly-mind-affect', 'binding-illusion'],
    traits: ['spirit', 'illusionist'],
  },
  {
    id: 'sand-patrol',
    kind: 'Chūnin of the Sand',
    danger: 'deadly',
    name: 'Sand Patrol',
    description:
      'A chūnin of the wall patrol with a short war fan, who asks every Leaf face where it was in the war.',
    baseStat: 9,
    statBonuses: { ninjutsu: 2, speed: 2, perception: 1 },
    maxChakra: 60,
    techniqueIds: ['fan-gust', 'wind-scythe', 'air-bullet'],
    nature: 'wind',
  },
];
