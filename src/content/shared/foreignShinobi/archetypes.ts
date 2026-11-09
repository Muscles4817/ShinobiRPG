import type { StatDelta, StatId } from '@/systems/stats';
import type { CombatTrait } from '@/systems/combat';

import type { FoeGearRole, FoeRole } from '../bestiary';

/**
 * The kinds of shinobi a village sends: what their body leans to, the arts they are best in,
 * how they fight (traits) and the techniques they carry at each grade, by role. A `nature`
 * role is the village's own element (`NatureArts`); every other role is the pack's `FoeKit`.
 */

export const FOREIGN_GRADES = ['genin', 'chunin', 'jonin'] as const;
export type ForeignGrade = (typeof FOREIGN_GRADES)[number];

export type NatureRole = 'natureShot' | 'natureHeavy' | 'natureMaster';
export type ShinobiRole = FoeRole | NatureRole;

export const FOREIGN_ARCHETYPE_IDS = [
  'scout',
  'frontliner',
  'sensor',
  'medic',
  'trapper',
  'captain',
] as const;
export type ForeignArchetypeId = (typeof FOREIGN_ARCHETYPE_IDS)[number];

export interface ForeignArchetype {
  /** "Scout", in a foe's name. */
  readonly label: string;
  /** How they fight, for the foe's description. No numbers. */
  readonly line: string;
  /** Offsets to the grade's body: strength, speed, stamina, perception. */
  readonly body: readonly [number, number, number, number];
  /** Their best art, at the grade's main value, and their second, a step below. */
  readonly main: StatId;
  readonly second: StatId;
  /** Offsets to the grade's mind (intellect, willpower) and anything else they lean on. */
  readonly lean?: StatDelta;
  /** More chakra than their grade's, for the arts that live on it. */
  readonly deepReserves?: true;
  readonly traits?: readonly CombatTrait[];
  readonly roles: Readonly<Record<ForeignGrade, readonly ShinobiRole[]>>;
  /** What they carry at every grade: gear by role (the pack's `FoeKit.gear`) and tools by id. */
  readonly carries?: {
    readonly gear?: readonly FoeGearRole[];
    readonly tools?: Readonly<Record<string, number>>;
  };
}

export const FOREIGN_ARCHETYPES: Readonly<Record<ForeignArchetypeId, ForeignArchetype>> = {
  scout: {
    label: 'Scout',
    line: 'Quick and quiet, and gone before the team behind them arrives.',
    body: [0, 2, 0, 2],
    main: 'ninjutsu',
    second: 'taijutsu',
    traits: ['swift'],
    carries: { gear: ['kunai'], tools: { 'smoke-bomb': 1 } },
    roles: {
      genin: ['throw', 'natureShot'],
      chunin: ['throw', 'natureShot', 'move'],
      jonin: ['throw', 'natureHeavy', 'move', 'conceal'],
    },
  },
  frontliner: {
    label: 'Vanguard',
    line: 'Goes in first and close, so the rest of the squad can work behind them.',
    body: [3, 0, 3, 0],
    main: 'taijutsu',
    second: 'ninjutsu',
    traits: ['brawler'],
    carries: { gear: ['knuckles', 'lightArmour'] },
    roles: {
      genin: ['palm', 'natureShot'],
      chunin: ['grapple', 'natureHeavy', 'substitute'],
      jonin: ['grapple', 'natureMaster', 'natureHeavy', 'substitute'],
    },
  },
  sensor: {
    label: 'Sensor',
    line: 'Feels you coming a valley away, and fills your head with things that are not there.',
    body: [-1, 0, 0, 4],
    main: 'genjutsu',
    second: 'chakraControl',
    lean: { intellect: 3 },
    carries: { tools: { 'clarity-charm': 1 } },
    roles: {
      genin: ['sense', 'feint'],
      chunin: ['sense', 'feint', 'natureShot'],
      jonin: ['sense', 'dread', 'natureHeavy', 'heavyLimbs'],
    },
  },
  medic: {
    label: 'Medic',
    line: 'Keeps the squad standing, and knows exactly where to hit to stop you doing the same.',
    body: [0, 0, 1, 1],
    main: 'chakraControl',
    second: 'ninjutsu',
    lean: { willpower: 2 },
    deepReserves: true,
    carries: { tools: { 'wound-salve': 1 } },
    roles: {
      genin: ['heal', 'palm'],
      chunin: ['heal', 'natureShot', 'substitute'],
      jonin: ['heal', 'natureHeavy', 'lock', 'substitute'],
    },
  },
  trapper: {
    label: 'Trapper',
    line: 'Every step towards them has a tag under it.',
    body: [0, 1, 0, 2],
    main: 'fuuinjutsu',
    second: 'ninjutsu',
    lean: { intellect: 2 },
    carries: { tools: { 'explosive-tag': 2 } },
    roles: {
      genin: ['snare', 'blastTag'],
      chunin: ['snare', 'blastTag', 'smoke'],
      jonin: ['snare', 'blastTag', 'natureHeavy', 'smoke'],
    },
  },
  captain: {
    label: 'Captain',
    line: 'Leads the squad, and has kept every one of them alive so far.',
    body: [1, 1, 1, 1],
    main: 'ninjutsu',
    second: 'taijutsu',
    lean: { intellect: 3, willpower: 3 },
    deepReserves: true,
    carries: { gear: ['lightArmour'], tools: { 'soldier-pill': 1 } },
    roles: {
      genin: ['natureShot', 'palm'],
      chunin: ['natureHeavy', 'natureShot', 'substitute'],
      jonin: ['natureMaster', 'natureHeavy', 'substitute', 'move'],
    },
  },
};
