import { STAT_TIERS, type StatId, type Stats } from '@/systems/stats';

/**
 * Kinds of fighter, read from a stat line: what each needs to hold its own at chūnin level.
 * A need can be met more than one way (getting in close takes the speed and eyes for it, or the
 * ninjutsu), and a way is met when every stat in it is at the grade asked. A specialist sensei
 * judges a genin against the kind they fit best (`readiness.ts`) and steers them towards what it
 * still lacks.
 */

/** Hybrids come first: on a tie, the more particular reading of a fighter wins. */
export const FIGHTER_TYPES = [
  'close-caster',
  'illusion-striker',
  'battle-medic',
  'brawler',
  'swordsman',
  'ninjutsu-caster',
  'illusionist',
  'sealer',
  'medic',
  'sensor',
] as const;
export type FighterType = (typeof FIGHTER_TYPES)[number];

export interface FighterNeed {
  /** Ways to meet it: any one whose stats all reach the grade asked. */
  readonly ways: readonly (readonly StatId[])[];
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

export const FIGHTER_TYPE_DEFS: Readonly<Record<FighterType, FighterTypeDef>> = {
  brawler: {
    id: 'brawler',
    name: 'a close fighter',
    needs: [{ ways: [['taijutsu']], what: 'taijutsu' }, GET_IN_CLOSE],
  },
  swordsman: {
    id: 'swordsman',
    name: 'a swordsman',
    needs: [{ ways: [['kenjutsu']], what: 'kenjutsu' }, GET_IN_CLOSE],
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

/** The value a way reaches: its weakest stat. */
function wayValue(stats: Stats, way: readonly StatId[]): number {
  return Math.min(...way.map((id) => stats[id]));
}

/** How far a need is met: its best way. */
export function needValue(stats: Stats, need: FighterNeed): number {
  return Math.max(...need.ways.map((way) => wayValue(stats, way)));
}

/** How well a stat line fits a kind: the average of its needs, held back by the weakest. */
function fit(stats: Stats, def: FighterTypeDef): number {
  const values = def.needs.map((need) => needValue(stats, need));
  const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
  return (mean + Math.min(...values)) / 2;
}

/** The kind of fighter a stat line fits best (the first listed on a tie: a hybrid). */
export function fighterTypeOf(stats: Stats): FighterTypeDef {
  return FIGHTER_TYPES.map((id) => FIGHTER_TYPE_DEFS[id]).reduce((best, def) =>
    fit(stats, def) > fit(stats, best) ? def : best,
  );
}

/** The value a grade begins at. */
export function gradeFloor(grade: (typeof STAT_TIERS)[number]['grade']): number {
  return STAT_TIERS.find((t) => t.grade === grade)?.min ?? 0;
}

/** The needs of a kind not yet at `floor`, weakest first. */
export function unmetNeeds(stats: Stats, def: FighterTypeDef, floor: number): FighterNeed[] {
  return def.needs
    .filter((need) => needValue(stats, need) < floor)
    .sort((a, b) => needValue(stats, a) - needValue(stats, b));
}

/** The stat that would do most for a need: the weakest stat of its nearest way. */
export function statForNeed(stats: Stats, need: FighterNeed): StatId {
  const nearest = need.ways.reduce((best, way) =>
    wayValue(stats, way) > wayValue(stats, best) ? way : best,
  );
  return nearest.reduce((low, id) => (stats[id] < stats[low] ? id : low));
}
