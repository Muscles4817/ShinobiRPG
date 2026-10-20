import { STAT_TIERS, type StatId, type Stats } from '@/systems/stats';

/**
 * Kinds of fighter, read from a stat line and what the fighter brings besides (a companion, a
 * hive, summons: `kitReadiness.ts`, on the same scale): what each needs to hold its own at
 * chūnin level. A need can be met more than one way (getting in close takes the speed and eyes
 * for it, or the ninjutsu), and a way is met when every part of it is at the grade asked. A
 * specialist sensei judges a genin against the kind they fit best (`readiness.ts`) and steers
 * them towards what it still lacks, where training can reach it.
 */

/** What a fighter brings besides their stats, read for readiness. */
export const KIT_PARTS = ['companion', 'hive', 'summons'] as const;
export type KitPart = (typeof KIT_PARTS)[number];

/** A stat line with what the fighter brings: a part they don't have reads as nothing. */
export type ReadinessLine = Stats & Readonly<Partial<Record<KitPart, number>>>;

/** Part of a way to meet a need: a stat, or something the fighter brings. */
export type NeedPart = StatId | KitPart;

/**
 * Hybrids and all-rounders come first: on a tie, the more particular reading of a fighter wins.
 */
export const FIGHTER_TYPES = [
  'beast-partner',
  'hive-user',
  'summoner',
  'tactician',
  'all-rounder',
  'precision-striker',
  'binder',
  'swarmer',
  'close-caster',
  'illusion-striker',
  'battle-medic',
  'brawler',
  'weapons-fighter',
  'marksman',
  'ninjutsu-caster',
  'illusionist',
  'sealer',
  'medic',
  'sensor',
] as const;
export type FighterType = (typeof FIGHTER_TYPES)[number];

export interface FighterNeed {
  /** Ways to meet it: any one whose parts all reach the grade asked. */
  readonly ways: readonly (readonly NeedPart[])[];
  /** What it is, as a sensei says what's missing: "the speed and eyes to get in close". */
  readonly what: string;
}

export interface FighterTypeDef {
  readonly id: FighterType;
  /** Their name, as a sensei calls it: "a close fighter". */
  readonly name: string;
  readonly needs: readonly FighterNeed[];
}

const ANY_ART: readonly (readonly StatId[])[] = [
  ['taijutsu'],
  ['ninjutsu'],
  ['genjutsu'],
  ['kenjutsu'],
  ['fuuinjutsu'],
];
const GET_IN_CLOSE: FighterNeed = {
  ways: [['speed', 'perception'], ['ninjutsu']],
  what: 'the speed and eyes, or the ninjutsu, to get in close safely',
};
const KEEP_DISTANCE: FighterNeed = {
  ways: [['speed'], ['perception']],
  what: 'the speed or the eyes to keep a fight at arm’s length',
};
const CONTROL: FighterNeed = { ways: [['chakraControl']], what: 'chakra control' };
const ARTS: readonly StatId[] = ['taijutsu', 'ninjutsu', 'genjutsu', 'kenjutsu', 'fuuinjutsu'];
/** Two arts of any kind, both at the grade asked: what an all-rounder is. */
const TWO_ARTS: FighterNeed = {
  ways: ARTS.flatMap((a, i) => ARTS.slice(i + 1).map((b) => [a, b])),
  what: 'two arts',
};

const RESERVES: FighterNeed = { ways: [['reserves']], what: 'the reserves to keep it fed' };

export const FIGHTER_TYPE_DEFS: Readonly<Record<FighterType, FighterTypeDef>> = {
  'beast-partner': {
    id: 'beast-partner',
    name: 'a fighter beside a beast partner',
    needs: [
      { ways: [['companion']], what: 'a partner who can fight' },
      { ways: [['taijutsu'], ['kenjutsu']], what: 'a close art' },
      { ways: [['speed']], what: 'the speed to fight alongside it' },
    ],
  },
  'hive-user': {
    id: 'hive-user',
    name: 'a fighter through the hive',
    needs: [
      { ways: [['hive']], what: 'a hive that can fight' },
      { ways: [['chakraControl']], what: 'the chakra control to direct it' },
      RESERVES,
    ],
  },
  summoner: {
    id: 'summoner',
    name: 'a summoner',
    needs: [
      { ways: [['summons']], what: 'a summons that answers and can fight' },
      { ways: [['ninjutsu']], what: 'ninjutsu' },
      { ways: [['reserves']], what: 'the reserves to keep a summons in the fight' },
    ],
  },
  tactician: {
    id: 'tactician',
    name: 'a tactician',
    needs: [TWO_ARTS, { ways: [['intellect']], what: 'the wits to read a fight' }, CONTROL],
  },
  'all-rounder': {
    id: 'all-rounder',
    name: 'an all-rounder',
    needs: [
      TWO_ARTS,
      CONTROL,
      { ways: [['speed'], ['perception']], what: 'the speed or eyes to choose the distance' },
    ],
  },
  'precision-striker': {
    id: 'precision-striker',
    name: 'a fighter who strikes the chakra itself',
    needs: [
      { ways: [['taijutsu']], what: 'taijutsu' },
      { ways: [['chakraControl']], what: 'the chakra control to strike the network' },
      { ways: [['perception']], what: 'the eyes to find the points' },
    ],
  },
  binder: {
    id: 'binder',
    name: 'a fighter who binds and outthinks',
    needs: [
      { ways: [['ninjutsu']], what: 'the ninjutsu to hold a foe' },
      { ways: [['intellect']], what: 'the wits to set the trap' },
      CONTROL,
    ],
  },
  swarmer: {
    id: 'swarmer',
    name: 'a fighter who wins by numbers',
    needs: [
      { ways: [['ninjutsu']], what: 'ninjutsu' },
      { ways: [['reserves']], what: 'the reserves to keep the numbers up' },
      { ways: [['stamina']], what: 'the stamina to outlast' },
    ],
  },
  brawler: {
    id: 'brawler',
    name: 'a close fighter',
    needs: [{ ways: [['taijutsu']], what: 'taijutsu' }, GET_IN_CLOSE],
  },
  'weapons-fighter': {
    id: 'weapons-fighter',
    name: 'a weapons fighter',
    needs: [{ ways: [['kenjutsu']], what: 'the weapon art' }, GET_IN_CLOSE],
  },
  marksman: {
    id: 'marksman',
    name: 'a marksman',
    needs: [
      { ways: [['kenjutsu']], what: 'the weapon art' },
      { ways: [['perception']], what: 'the eyes to aim' },
      { ways: [['speed']], what: 'the speed to keep a fight at range' },
    ],
  },
  'ninjutsu-caster': {
    id: 'ninjutsu-caster',
    name: 'a ninjutsu fighter',
    needs: [{ ways: [['ninjutsu']], what: 'ninjutsu' }, CONTROL, KEEP_DISTANCE],
  },
  illusionist: {
    id: 'illusionist',
    name: 'an illusionist',
    needs: [
      { ways: [['genjutsu']], what: 'genjutsu' },
      CONTROL,
      { ways: [['intellect']], what: 'the wits to set an illusion' },
    ],
  },
  sealer: {
    id: 'sealer',
    name: 'a sealer',
    needs: [
      { ways: [['fuuinjutsu']], what: 'fūinjutsu' },
      CONTROL,
      { ways: [['intellect']], what: 'the wits to write a seal under pressure' },
    ],
  },
  medic: {
    id: 'medic',
    name: 'a medic',
    needs: [
      { ways: [['chakraControl']], what: 'the chakra control to heal' },
      { ways: [['ninjutsu']], what: 'ninjutsu' },
      KEEP_DISTANCE,
    ],
  },
  sensor: {
    id: 'sensor',
    name: 'a sensor',
    needs: [
      { ways: [['perception']], what: 'the senses to find what is hidden' },
      CONTROL,
      { ways: ANY_ART, what: 'an art to fight with' },
    ],
  },
  'close-caster': {
    id: 'close-caster',
    name: 'a fighter who closes with jutsu',
    needs: [
      { ways: [['taijutsu'], ['kenjutsu']], what: 'a close art' },
      { ways: [['ninjutsu']], what: 'ninjutsu' },
      { ways: [['speed']], what: 'the speed to change distance' },
    ],
  },
  'illusion-striker': {
    id: 'illusion-striker',
    name: 'a fighter who strikes through illusions',
    needs: [
      { ways: [['genjutsu']], what: 'genjutsu' },
      { ways: [['taijutsu'], ['kenjutsu']], what: 'a close art' },
      CONTROL,
    ],
  },
  'battle-medic': {
    id: 'battle-medic',
    name: 'a battle medic',
    needs: [
      { ways: [['chakraControl']], what: 'the chakra control to heal' },
      { ways: [['ninjutsu']], what: 'ninjutsu' },
      { ways: [['taijutsu'], ['strength']], what: 'the strength or taijutsu to hit back' },
    ],
  },
};

function partValue(line: ReadinessLine, part: NeedPart): number {
  return line[part] ?? 0;
}

/** The value a way reaches: its weakest part. */
function wayValue(line: ReadinessLine, way: readonly NeedPart[]): number {
  return Math.min(...way.map((part) => partValue(line, part)));
}

/** How far a need is met: its best way. */
export function needValue(stats: ReadinessLine, need: FighterNeed): number {
  return Math.max(...need.ways.map((way) => wayValue(stats, way)));
}

/** How well a stat line fits a kind: the average of its needs, held back by the weakest. */
function fit(stats: ReadinessLine, def: FighterTypeDef): number {
  const values = def.needs.map((need) => needValue(stats, need));
  const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
  return (mean + Math.min(...values)) / 2;
}

/** The kind of fighter a stat line fits best (the first listed on a tie: a hybrid). */
export function fighterTypeOf(stats: ReadinessLine): FighterTypeDef {
  return FIGHTER_TYPES.map((id) => FIGHTER_TYPE_DEFS[id]).reduce((best, def) =>
    fit(stats, def) > fit(stats, best) ? def : best,
  );
}

/** The value a grade begins at. */
export function gradeFloor(grade: (typeof STAT_TIERS)[number]['grade']): number {
  return STAT_TIERS.find((t) => t.grade === grade)?.min ?? 0;
}

/** The needs of a kind not yet at `floor`, weakest first. */
export function unmetNeeds(
  stats: ReadinessLine,
  def: FighterTypeDef,
  floor: number,
): FighterNeed[] {
  return def.needs
    .filter((need) => needValue(stats, need) < floor)
    .sort((a, b) => needValue(stats, a) - needValue(stats, b));
}

function isStat(part: NeedPart): part is StatId {
  return !(KIT_PARTS as readonly string[]).includes(part);
}

/**
 * The stat that would do most for a need: the weakest stat of its nearest way that training
 * can reach. Null when every way rests on what the fighter brings (a partner, a hive, a summons):
 * that grows by its own care, not by work set for the fighter.
 */
export function statForNeed(stats: ReadinessLine, need: FighterNeed): StatId | null {
  const trainable = need.ways.flatMap((way) => (way.every(isStat) ? [way.filter(isStat)] : []));
  if (trainable.length === 0) return null;
  const nearest = trainable.reduce((best, way) =>
    wayValue(stats, way) > wayValue(stats, best) ? way : best,
  );
  return nearest.reduce((low, id) => (stats[id] < stats[low] ? id : low));
}
