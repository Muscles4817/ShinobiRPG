import type { Danger } from '@/systems/missions';
import type { StatDelta } from '@/systems/stats';
import type { Element } from '@/systems/techniques';

import type { EnemyDef } from '../../types';
import type { FoeKit } from '../bestiary';
import { foeStats } from '../bestiary/foeStats';
import {
  FOREIGN_ARCHETYPE_IDS,
  FOREIGN_GRADES,
  FOREIGN_ARCHETYPES,
  type ForeignArchetype,
  type ForeignArchetypeId,
  type ForeignGrade,
  type NatureRole,
  type ShinobiRole,
} from './archetypes';
import type { NatureArts, NatureKit, ShinobiVillage } from './village';

/**
 * Foreign shinobi from templates: every village × archetype × grade becomes an ordinary foe
 * (`foe-<village>-<archetype>-<grade>`), and every village's chūnin and jōnin archetypes a
 * named missing-nin (`rogue-<village>-<archetype>-<grade>`). Numbers follow the stat model: a
 * grade's skills sit in its band (genin E–D, chūnin C, jōnin B), bodies stay human.
 */

interface GradeSpec {
  readonly word: string;
  readonly danger: Danger;
  readonly base: number;
  readonly body: number;
  readonly main: number;
  readonly second: number;
  readonly mind: number;
  readonly chakra: number;
}

const GRADES: Readonly<Record<ForeignGrade, GradeSpec>> = {
  genin: {
    word: 'Genin',
    danger: 'armed',
    base: 6,
    body: 8,
    main: 11,
    second: 8,
    mind: 8,
    chakra: 40,
  },
  chunin: {
    word: 'Chūnin',
    danger: 'deadly',
    base: 10,
    body: 11,
    main: 17,
    second: 13,
    mind: 11,
    chakra: 70,
  },
  jonin: {
    word: 'Jōnin',
    danger: 'elite',
    base: 14,
    body: 14,
    main: 24,
    second: 18,
    mind: 14,
    chakra: 110,
  },
};

/** Chakra an archetype that lives on it carries over its grade's. */
const DEEP_RESERVES = 20;
/**
 * A missing-nin is a step past the village's own of their grade in their best art (and, a
 * jōnin, all round), and has a trick of their own (`ROGUE_TRICKS`).
 */
const ROGUE_EDGE: Readonly<Record<ForeignGrade, { readonly base: number; readonly main: number }>> =
  {
    genin: { base: 0, main: 0 },
    chunin: { base: 0, main: 1 },
    jonin: { base: 1, main: 1 },
  };
const ROGUE_GRADES = ['chunin', 'jonin'] as const satisfies readonly ForeignGrade[];
/** The trick a missing-nin learnt on their own, by grade: the first they don't already carry. */
const ROGUE_TRICKS: Readonly<Record<ForeignGrade, readonly ShinobiRole[]>> = {
  genin: [],
  chunin: ['conceal', 'smoke'],
  jonin: ['natureMaster', 'conceal'],
};

/** What a rogue left with, by the kind of shinobi they were. */
const ROGUE_PASTS: Readonly<Record<ForeignArchetypeId, string>> = {
  scout: 'Ran messages for their village for ten years, then sold the last one to its enemies.',
  frontliner:
    'First through every door for their squad, until the night they went through one alone and kept going.',
  sensor:
    'Felt a chakra inside their own village that should not have been there, and left before it felt them.',
  medic: 'Kept a squad alive through a war, then charged the survivors for every stitch.',
  trapper: 'Mined a border pass for their village, and left with the only map of where.',
  captain:
    'Lost a whole squad on an order they argued against, and has been finding the people who gave it.',
};

export interface ForeignKits {
  readonly kit: FoeKit;
  readonly natures: NatureKit;
}

/** Which of a nature's techniques each nature role takes. */
const NATURE_ROLES: Readonly<Record<NatureRole, keyof NatureArts>> = {
  natureShot: 'shot',
  natureHeavy: 'heavy',
  natureMaster: 'master',
};

function isNatureRole(role: ShinobiRole): role is NatureRole {
  return role in NATURE_ROLES;
}

function techniqueFor(role: ShinobiRole, nature: Element, kits: ForeignKits): string {
  return isNatureRole(role) ? kits.natures[nature][NATURE_ROLES[role]] : kits.kit[role];
}

interface Shape {
  readonly village: ShinobiVillage;
  readonly archetypeId: ForeignArchetypeId;
  readonly grade: ForeignGrade;
  readonly rogue: boolean;
}

/** The village's nature for this archetype and grade: its natures in turn, the commonest first. */
function natureOf({ village, archetypeId, grade }: Shape): Element {
  const turn = FOREIGN_ARCHETYPE_IDS.indexOf(archetypeId) + FOREIGN_GRADES.indexOf(grade);
  return village.natures[turn % village.natures.length] ?? village.natures[0];
}

function statsOf(shape: Shape): Pick<EnemyDef, 'baseStat' | 'statBonuses'> {
  const a = FOREIGN_ARCHETYPES[shape.archetypeId];
  const g = GRADES[shape.grade];
  const edge = shape.rogue ? ROGUE_EDGE[shape.grade] : { base: 0, main: 0 };
  const [str, spd, sta, per] = a.body;
  const skills: StatDelta = {
    intellect: g.mind + (a.lean?.intellect ?? 0),
    willpower: g.mind + (a.lean?.willpower ?? 0),
    [a.second]: g.second,
    [a.main]: g.main + edge.main,
  };
  return foeStats(
    g.base + edge.base,
    [g.body + str, g.body + spd, g.body + sta, g.body + per],
    skills,
  );
}

function techniquesOf(shape: Shape, kits: ForeignKits): string[] {
  const roles = FOREIGN_ARCHETYPES[shape.archetypeId].roles[shape.grade];
  const extra: readonly ShinobiRole[] = shape.rogue ? ROGUE_TRICKS[shape.grade] : [];
  const ids = [...roles, ...extra].map((role) => techniqueFor(role, natureOf(shape), kits));
  const kept = [...new Set(ids)];
  return shape.rogue ? kept.slice(0, roles.length + 1) : kept;
}

function rogueName(shape: Shape): string {
  const index =
    FOREIGN_ARCHETYPE_IDS.indexOf(shape.archetypeId) * ROGUE_GRADES.length +
    (shape.grade === 'jonin' ? 1 : 0);
  return shape.village.rogueNames[index % shape.village.rogueNames.length] ?? shape.village.short;
}

/** What an archetype carries, its gear roles read as the pack's own pieces. */
function carriesOf(a: ForeignArchetype, kits: ForeignKits): Pick<EnemyDef, 'carries'> {
  if (!a.carries) return {};
  const gearIds = (a.carries.gear ?? []).map((role) => kits.kit.gear[role]);
  return {
    carries: {
      ...(gearIds.length > 0 ? { gearIds } : {}),
      ...(a.carries.tools ? { tools: a.carries.tools } : {}),
    },
  };
}

function foeOf(shape: Shape, kits: ForeignKits): EnemyDef {
  const { village, archetypeId, grade, rogue } = shape;
  const a = FOREIGN_ARCHETYPES[archetypeId];
  const g = GRADES[grade];
  const reserves = a.deepReserves ? DEEP_RESERVES : 0;
  const who = rogue
    ? {
        id: `rogue-${village.id}-${archetypeId}-${grade}`,
        name: rogueName(shape),
        proper: true as const,
        kind: 'Missing-nin',
        description: `${ROGUE_PASTS[archetypeId]} ${a.line}`,
      }
    : {
        id: `foe-${village.id}-${archetypeId}-${grade}`,
        name: `${village.short} ${g.word} ${a.label}`,
        kind: `${village.short} ${g.word}`,
        description: `${a.line} ${village.headband}`,
      };
  return {
    ...who,
    danger: g.danger,
    ...statsOf(shape),
    maxChakra: g.chakra + reserves,
    techniqueIds: techniquesOf(shape, kits),
    nature: natureOf(shape),
    ...(a.traits ? { traits: a.traits } : {}),
    ...carriesOf(a, kits),
  };
}

/** Every village's shinobi of every archetype and grade, and its named missing-nin. */
/*#__NO_SIDE_EFFECTS__*/
export function foreignShinobi(villages: readonly ShinobiVillage[], kits: ForeignKits): EnemyDef[] {
  return villages.flatMap((village) =>
    FOREIGN_ARCHETYPE_IDS.flatMap((archetypeId) => [
      ...FOREIGN_GRADES.map((grade) => foeOf({ village, archetypeId, grade, rogue: false }, kits)),
      ...ROGUE_GRADES.map((grade) => foeOf({ village, archetypeId, grade, rogue: true }, kits)),
    ]),
  );
}
