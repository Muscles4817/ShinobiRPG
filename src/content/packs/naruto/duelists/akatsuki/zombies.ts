import type { TechniqueDef } from '@/systems/techniques';

import type { ContractDef, SummonDef } from '../../../../contracts';
import { look } from '../../../../look';
import { statLine } from '../../../../statLine';
import type { GearDef, PersonDef } from '../../../../types';

import { akatsukiFighter } from './fighter';

/**
 * The Zombie Pair. Kakuzu's Earth Grudge Fear keeps hearts taken from strong shinobi in
 * masked bodies of thread, each with its own element; they come out of his back as bodies of
 * his own mind (`shared`), a contract no one signs. Hidan can't die, and his Jashin ritual turns
 * his own wounds onto whoever's blood he has tasted: here a curse no guard is raised against,
 * since the engine has no blood link to hold.
 */

const FIRE_MASK = 'fire-mask';
const WIND_MASK = 'wind-mask';
const LIGHTNING_MASK = 'lightning-mask';

export const ZOMBIE_ARTS: readonly TechniqueDef[] = [
  {
    id: 'earth-grudge-tendrils',
    name: 'Earth Grudge Fear: Tendrils',
    description:
      'Black threads pour out of the stitches in his arms and wind round whatever they reach.',
    discipline: 'ninjutsu',
    reach: ['close', 'mid'],
    effects: [
      { verb: 'damage', power: 14, hits: 2 },
      { verb: 'pin', power: 14 },
    ],
    chakraCost: 14,
    rank: 'A',
    difficulty: 135,
  },
  {
    id: 'earth-grudge-masks',
    name: 'Earth Grudge Fear: The Masks',
    description:
      'His back splits and three masked bodies of thread step out, each with a stolen heart and its own element.',
    discipline: 'ninjutsu',
    effects: [
      { verb: 'summon', power: 1, call: FIRE_MASK },
      { verb: 'summon', power: 1, call: WIND_MASK },
      { verb: 'summon', power: 1, call: LIGHTNING_MASK },
    ],
    chakraCost: 30,
    rank: 'S',
    difficulty: 180,
    oncePerFight: true,
  },
  {
    id: 'searing-migraine',
    name: 'Fire Style: Searing Migraine',
    description: 'The fire mask’s mouth opens and pours out a blast of flame.',
    discipline: 'ninjutsu',
    element: 'fire',
    effects: [
      { verb: 'area', power: 22, size: 'wide' },
      { verb: 'afflict', power: 8, harm: 'burn' },
    ],
    chakraCost: 22,
    rank: 'A',
    difficulty: 135,
  },
  {
    id: 'triple-scythe-reel',
    name: 'Triple Scythe: Reel',
    description:
      'The scythe flies out on its cable and comes back round. He only needs one cut to draw blood.',
    discipline: 'kenjutsu',
    needs: { weapon: 'blade' },
    reach: ['close', 'mid'],
    accuracy: 'wild',
    effects: [
      { verb: 'damage', power: 18, hits: 2 },
      { verb: 'afflict', power: 8, harm: 'bleed' },
    ],
    chakraCost: 12,
    rank: 'A',
    difficulty: 130,
  },
  {
    id: 'death-controlling-blood',
    name: 'Curse: Death Controlling Possessed Blood',
    description:
      'He licks the blood off the blade, draws Jashin’s circle with his foot and runs himself through. The wound opens on his foe.',
    discipline: 'ninjutsu',
    reach: ['close', 'mid', 'far'],
    accuracy: 'sure',
    effects: [{ verb: 'damage', power: 26, scaling: { resist: ['willpower'] } }],
    chakraCost: 18,
    rank: 'S',
    difficulty: 170,
  },
];

const MASK_UPKEEP = 4;

/** A mask: a stolen heart in a body of thread, with one element of its own. */
/*#__NO_SIDE_EFFECTS__*/
function mask(id: string, name: string, art: { tech: string; desc: string }): SummonDef {
  return {
    id,
    name,
    description: art.desc,
    techniqueId: 'earth-grudge-masks',
    standing: 0,
    stats: statLine(18, { ninjutsu: 34, reserves: 30, stamina: 24, perception: 20 }),
    healthScale: 0.8,
    maxChakra: 220,
    techniqueIds: [art.tech],
    upkeep: MASK_UPKEEP,
    shared: true,
  };
}

export const EARTH_GRUDGE: ContractDef = {
  id: 'earth-grudge',
  name: 'Earth Grudge Fear',
  description:
    'Not a clan but a forbidden art of the Waterfall, which tears hearts out and keeps them alive.',
  summons: [
    mask(FIRE_MASK, 'Fire mask', { tech: 'searing-migraine', desc: 'A heart that breathes fire.' }),
    mask(WIND_MASK, 'Wind mask', { tech: 'pressure-damage', desc: 'A heart that breathes wind.' }),
    mask(LIGHTNING_MASK, 'Lightning mask', {
      tech: 'false-darkness',
      desc: 'A heart that throws lightning.',
    }),
  ],
};

export const HIDAN_SCYTHE: GearDef = {
  id: 'triple-bladed-scythe',
  name: 'Triple-Bladed Scythe',
  description: 'Three red blades on a long haft, with a cable to throw it and haul it back.',
  kind: 'weapon',
  weaponClass: 'polearm',
  rank: 'A',
  unique: true,
  cost: 0,
  icon: 'sword',
};

export const ZOMBIE_FIGHTERS: readonly PersonDef[] = [
  akatsukiFighter({
    id: 'kakuzu',
    name: 'Kakuzu',
    familyName: '',
    pronouns: 'he',
    title: 'Rogue of the Waterfall',
    // Jōnin by rank, an elite of the Waterfall; the masks make up the rest.
    rank: 'jonin',
    stats: statLine(24, {
      strength: 32,
      stamina: 40,
      reserves: 46,
      chakraControl: 30,
      intellect: 32,
      perception: 28,
      willpower: 30,
      taijutsu: 34,
      ninjutsu: 42,
      genjutsu: 10,
      kenjutsu: 12,
      fuuinjutsu: 16,
    }),
    traitIds: ['cunning', 'calm'],
    appearance: look(
      'long',
      { hair: '#4a2f1d', eyes: '#3f8a4a', skin: '#a8754f', outfit: '#2a2a32' },
      'forehead',
      { shape: 'square', figure: 'broad', expression: 'stern', mark: 'scar', age: 'old' },
    ),
    specialty: 'ninjutsu',
    bio: 'Old enough to have fought the First Hokage, and kept alive by other people’s hearts. Money is the only thing he trusts.',
    arsenal: {
      techniqueIds: ['earth-grudge-tendrils', 'earth-spear', 'earth-grudge-masks'],
      summons: [FIRE_MASK, WIND_MASK, LIGHTNING_MASK],
    },
  }),
  akatsukiFighter({
    id: 'hidan',
    name: 'Hidan',
    familyName: '',
    pronouns: 'he',
    title: 'Rogue of the Hot Water',
    // Jōnin-grade with a blade; it is that he can't be killed that makes him dangerous.
    rank: 'jonin',
    stats: statLine(22, {
      strength: 30,
      speed: 26,
      stamina: 50,
      reserves: 30,
      chakraControl: 18,
      intellect: 14,
      willpower: 46,
      taijutsu: 30,
      genjutsu: 8,
      kenjutsu: 38,
      fuuinjutsu: 20,
    }),
    traitIds: ['brash', 'proud'],
    appearance: look(
      'short',
      { hair: '#e8e0d0', eyes: '#9a3a5a', skin: '#efd6c0', outfit: '#2a2a32' },
      'neck',
      { shape: 'angular', expression: 'grin', age: 'young' },
    ),
    specialty: 'kenjutsu',
    bio: 'A priest of Jashin who left a village gone soft. He prays before a kill and after it, and he can’t die, which he finds very funny.',
    arsenal: {
      techniqueIds: ['triple-scythe-reel', 'death-controlling-blood'],
      gearIds: ['triple-bladed-scythe'],
    },
  }),
];
