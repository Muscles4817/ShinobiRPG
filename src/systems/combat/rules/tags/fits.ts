import type { TargetNeed } from '@/systems/techniques';

import type { BodySize, CombatAttributes, CombatTechnique, RangeBand } from '../../contract';
import { sizeOf } from '../size';
import { tagsOf } from './tags';

/**
 * Whether a target is what a technique needs it to be, as things stand at that moment
 * (`docs/design/technique-tags.md`): a body the user can lift (their strength now against how big
 * the target is now, so a body grown huge can't be thrown), a mind to fool, eyes met up close,
 * chakra points to strike, and, for a move that follows another, the target already held by the
 * user. A target that doesn't fit is never aimed at, and one that slips in is told why it failed.
 */

/** The strength it takes to lift a body one size bigger than you, and two or more. */
export const LIFT_ONE_UP = 30;
export const LIFT_TWO_UP = 45;

interface Body {
  readonly id: string;
  readonly attributes: Pick<CombatAttributes, 'strength'>;
  readonly size?: BodySize;
  readonly empowered?: { readonly grows?: number };
  readonly puppet?: boolean;
  readonly maxChakra: number;
  /** Whom this fighter holds in a channelled hold (`plan/holding.ts`). */
  readonly holding?: string;
}

const SIZES = ['small', 'human', 'large', 'huge'] as const;

function sizeStep(f: Body): number {
  return SIZES.indexOf(sizeOf(f));
}

/** Whether the user can lift the target now. */
export function canLift(user: Body, target: Body): boolean {
  const up = sizeStep(target) - sizeStep(user);
  if (up <= 0) return true;
  return user.attributes.strength >= (up === 1 ? LIFT_ONE_UP : LIFT_TWO_UP);
}

export type Unmet = TargetNeed | 'follows';

interface Moment {
  readonly user: Body;
  readonly target: Body;
  /** How far apart they stand. */
  readonly band: RangeBand;
}

function needMet(need: TargetNeed, { user, target, band }: Moment): boolean {
  switch (need) {
    case 'liftable':
      return canLift(user, target);
    case 'mind':
      return target.puppet !== true;
    case 'meets-eyes':
      return band === 'close' && target.puppet !== true;
    case 'chakra-points':
      return target.maxChakra > 0;
    case 'on-ground':
    case 'casts-shadow':
    case 'straight-line':
      return true;
  }
}

/** The first thing the target isn't that the technique needs, or null when it fits. */
export function unmetNeed(t: CombatTechnique, moment: Moment): Unmet | null {
  const tags = tagsOf(t);
  const unmet = tags.needs.find((need) => !needMet(need, moment));
  if (unmet) return unmet;
  const follows = tags.execution.follows;
  return follows !== undefined && moment.user.holding !== moment.target.id ? 'follows' : null;
}

/** What the story says when a technique meets a target it can't work on. */
export const UNMET_LINE: Readonly<Record<Unmet, string>> = {
  liftable: '{t} {t.is} far too big for {a} to lift.',
  mind: '{t} {t.has} no mind for {what} to take hold of.',
  'meets-eyes': '{t} never meet{t.s} {a.poss} eyes.',
  'chakra-points': '{t} {t.has} no chakra points to strike.',
  'on-ground': '{t} {t.is} off the ground, out of its reach.',
  'casts-shadow': "{a.poss} shadow can't find {t.poss}.",
  'straight-line': '{t} {t.is} not in line.',
  follows: '{what} has nothing to close on: {t} {t.is} not held.',
};
