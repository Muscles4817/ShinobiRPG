import type { AreaSize, EffectOf } from '@/systems/techniques';

import type { RangeBand } from '../../contract';

/**
 * Area techniques by how much ground they cover. A small burst is dodged and guarded like any
 * hit. A wide one is hard to slip, and a plain Guard does nothing against it: only a barrier or
 * a swap gets out of the way; it throws everyone apart to at least mid range. A vast one can't
 * be outrun, throws everyone to far range and leaves dust hanging that blinds both sides.
 */

export interface AreaRule {
  /** Share of the usual chance to slip it. */
  readonly dodge: number;
  /** Whether a plain Guard blunts it. */
  readonly guardHolds: boolean;
  /** The nearest the fight can be once it has gone off. */
  readonly pushesTo?: RangeBand;
  /** Whether it leaves dust over the field. */
  readonly dust?: true;
}

export const AREA_RULES: Readonly<Record<AreaSize, AreaRule>> = {
  small: { dodge: 1, guardHolds: true },
  wide: { dodge: 0.5, guardHolds: false, pushesTo: 'mid' },
  vast: { dodge: 0, guardHolds: false, pushesTo: 'far', dust: true },
};

/** Near to far, as in `rules/range.ts` (not imported: range reads verbs). */
const NEAR_TO_FAR: readonly RangeBand[] = ['close', 'mid', 'far'];

export function areaSize(effect: EffectOf<'area'>): AreaSize {
  return effect.size ?? 'small';
}

/** Where the fight stands after an area of this size goes off. */
export function afterBlast(range: RangeBand, size: AreaSize): RangeBand {
  const to = AREA_RULES[size].pushesTo;
  if (!to) return range;
  return NEAR_TO_FAR.indexOf(to) > NEAR_TO_FAR.indexOf(range) ? to : range;
}
