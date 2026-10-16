import { clamp, logistic } from '@/core';
import type { CombatAttributes } from '../contract';
import { gapRatio } from './damage';
import { resistOf, type EffectUse, type HoldGrip } from './verbs';

/**
 * Holds are fought, not waited out (`docs/design/hittability-plan.md`, 2.5). A pin keeps a
 * `HoldGrip`: how strongly it was cast and what breaks a hold of its kind (strength against
 * hands and wire, chakra control against chakra, willpower against an illusion; kept on the
 * fighter in `LingeringMemory`). At the end of
 * each exchange the held struggle against it (`escapeChance`), and a teammate may spend their
 * turn pulling them out (`rescueChance`), likelier than struggling alone. A channelled hold is
 * much harder to break while its caster keeps their hands on it.
 */

/** Struggling free of an equal's hold happens half this often each exchange, never more. */
const ESCAPE_TOP = 0.5;
const ESCAPE_FLOOR = 0.05;
/** A teammate pulls someone out of an equal's hold half this often, never more. */
const RESCUE_TOP = 0.9;
const RESCUE_FLOOR = 0.2;
/** How sharply both follow the gap between what breaks the hold and how strongly it was cast. */
const STEEPNESS = 2.5;
/** While its caster keeps hold of a channelled pin, breaking it is this much as likely. */
export const CHANNELLED_GRIP = 0.4;

interface Rated {
  readonly attributes: CombatAttributes;
}

/** What `f` brings to breaking this hold. */
function breaking(f: Rated, grip: HoldGrip): number {
  const effect = { verb: 'pin' as const, power: 0, scaling: { resist: grip.resist } };
  const use: EffectUse = {
    technique: {
      id: 'hold',
      name: 'hold',
      discipline: grip.discipline,
      chakraCost: 0,
      effects: [effect],
    },
    effect,
  };
  return resistOf(f, use);
}

function odds(f: Rated, grip: HoldGrip, bounds: { top: number; floor: number }): number {
  const gap = Math.log(gapRatio(breaking(f, grip), grip.drive));
  return clamp(bounds.top * logistic(gap * STEEPNESS), bounds.floor, bounds.top);
}

/** The chance the held break free on their own this exchange. */
export function escapeChance(held: Rated, grip: HoldGrip, channelled: boolean): number {
  const chance = odds(held, grip, { top: ESCAPE_TOP, floor: ESCAPE_FLOOR });
  return chance * (channelled ? CHANNELLED_GRIP : 1);
}

/** The chance a teammate who spends their turn on it pulls the held free. */
export function rescueChance(rescuer: Rated, grip: HoldGrip, channelled: boolean): number {
  const chance = odds(rescuer, grip, { top: RESCUE_TOP, floor: RESCUE_FLOOR });
  return chance * (channelled ? CHANNELLED_GRIP : 1);
}
