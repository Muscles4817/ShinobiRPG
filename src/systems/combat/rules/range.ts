import type { Discipline } from '@/systems/techniques';

import type { CombatTechnique, CombatantSetup, RangeBand } from '../contract';
import { isHarmful } from './verbs';

/**
 * Distance between the two sides of a fight. Each discipline has a reach: fists need you
 * close, ninjutsu wants room, genjutsu works anywhere. Shared by every engine that tracks range.
 */

export const RANGE_BANDS: readonly RangeBand[] = ['close', 'mid', 'far'];

const REACH: Readonly<Record<Discipline, readonly RangeBand[]>> = {
  taijutsu: ['close'],
  kenjutsu: ['close', 'mid'],
  fuuinjutsu: ['close', 'mid'],
  ninjutsu: ['mid', 'far'],
  genjutsu: ['close', 'mid', 'far'],
};

/** Basic blows land only up close; thrown kunai only work with some distance. */
export const STRIKE_REACH: readonly RangeBand[] = ['close'];
export const THROW_REACH: readonly RangeBand[] = ['mid', 'far'];

export const RANGE_LABEL: Readonly<Record<RangeBand, string>> = {
  close: 'Close',
  mid: 'Mid',
  far: 'Far',
};

/** Where a technique works: its own reach if it has one, else its art's (anywhere, if harmless). */
export function reachOf(technique: CombatTechnique): readonly RangeBand[] {
  if (technique.reach) return technique.reach;
  return isHarmful(technique) ? REACH[technique.discipline] : RANGE_BANDS;
}

export function inReach(reach: readonly RangeBand[], band: RangeBand): boolean {
  return reach.includes(band);
}

export function stepIn(band: RangeBand): RangeBand {
  return band === 'far' ? 'mid' : 'close';
}

export function stepBack(band: RangeBand): RangeBand {
  return band === 'close' ? 'mid' : 'far';
}

/** One step towards `goal`, or the same band when already there. */
export function stepTowards(band: RangeBand, goal: RangeBand): RangeBand {
  const from = RANGE_BANDS.indexOf(band);
  const to = RANGE_BANDS.indexOf(goal);
  if (from === to) return band;
  return from < to ? stepBack(band) : stepIn(band);
}

/**
 * Where a fighter would rather be: wherever most of their offence reaches. Brawlers with no
 * techniques want to be close.
 */
export function preferredRange(setup: Pick<CombatantSetup, 'techniques'>): RangeBand {
  const offensive = setup.techniques.filter(isHarmful);
  const votes = RANGE_BANDS.map(
    (band) => offensive.filter((t) => inReach(reachOf(t), band)).length,
  );
  const best = Math.max(...votes, 0);
  return best === 0 ? 'close' : (RANGE_BANDS[votes.indexOf(best)] ?? 'close');
}
