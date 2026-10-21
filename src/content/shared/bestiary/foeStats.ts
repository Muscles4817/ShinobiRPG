import { STAT_IDS, type StatDelta, type StatId } from '@/systems/stats';

import type { EnemyDef } from '../../types';

/**
 * A foe's body against real people and animals (`docs/design/stat-model-plan.md`): strength,
 * speed, stamina and perception.
 */
export type FoeBody = readonly [
  strength: number,
  speed: number,
  stamina: number,
  perception: number,
];

/** A plain animal's arts and wits: no chakra arts, its natural fighting written as taijutsu. */
export const NO_ARTS: StatDelta = {
  chakraControl: 0,
  ninjutsu: 0,
  genjutsu: 0,
  kenjutsu: 0,
  fuuinjutsu: 0,
  intellect: 2,
};

/**
 * A foe's `baseStat` and `statBonuses` from the stats as they are: the body, the stats named at
 * their values, and every other stat at the base (which keeps the foe inside its danger).
 */
/*#__NO_SIDE_EFFECTS__*/
export function foeStats(
  base: number,
  body: FoeBody,
  stats: StatDelta = {},
): Pick<EnemyDef, 'baseStat' | 'statBonuses'> {
  const [strength, speed, stamina, perception] = body;
  const line: StatDelta = { strength, speed, stamina, perception, ...stats };
  const bonuses: Partial<Record<StatId, number>> = {};
  for (const id of STAT_IDS) {
    const value = line[id];
    if (value !== undefined && value !== base) bonuses[id] = value - base;
  }
  return { baseStat: base, statBonuses: bonuses };
}
