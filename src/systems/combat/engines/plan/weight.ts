import type { AttackForm } from '../../rules/avoidance';

/**
 * How heavy an attack is (the owner's decision, `docs/design/combat-ai-plan.md` Part 13b): a
 * heavy one (a big share of the target's health, a wide or vast area, a wild swing) is easier to
 * see coming and slip with a ready Dodge, and its thrower is too committed to follow anyone who
 * springs clear of it; a light one (a quick blow, a jab of a technique) is harder to slip, and
 * its thrower can likely follow a dodger who springs back.
 */

export type AttackWeight = 'light' | 'medium' | 'heavy';

/** From this share of the target's health an attack is heavy. */
const HEAVY_SHARE = 0.22;
/** Up to this share it is light. */
const LIGHT_SHARE = 0.1;

/** How much a ready Dodge's stance counts against an attack of this weight. */
export const DODGE_BY_WEIGHT: Readonly<Record<AttackWeight, number>> = {
  light: 0.8,
  medium: 1,
  heavy: 1.25,
};

/** How readily an attack's thrower can follow someone springing clear of it. */
export const FOLLOW_BY_WEIGHT: Readonly<Record<AttackWeight, number>> = {
  light: 1,
  medium: 0.5,
  heavy: 0,
};

/** An attack's weight, read from what it is and what it would take. */
/** What weight is read from: an attack on its way (`avoid.ts`'s `Incoming`). */
interface Weighed {
  readonly form: AttackForm;
  readonly threat?: number;
  readonly areaSize?: string;
  readonly accuracy?: string;
}

export function weightOf(incoming: Weighed): AttackWeight {
  const { threat, areaSize, accuracy, form } = incoming;
  if (areaSize === 'wide' || areaSize === 'vast' || accuracy === 'wild') return 'heavy';
  if (threat === undefined) return form === 'blow' ? 'light' : 'medium';
  if (threat >= HEAVY_SHARE) return 'heavy';
  return threat <= LIGHT_SHARE ? 'light' : 'medium';
}
