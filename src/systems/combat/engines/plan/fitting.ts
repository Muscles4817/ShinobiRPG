import type { Rng } from '@/core';

import type { CombatTechnique } from '../../contract';
import { tell } from '../../rules/telling';
import { UNMET_LINE, unmetNeed } from '../../rules/tags';
import { isOffence, type Card } from './cards';
import { canHit, hittable } from './rows';
import { distanceBetween } from './distance';
import { say, type PlanFighter, type Round } from './state';

/**
 * Techniques meet only targets they can work on (`rules/tags/fits.ts`): a grapple a body the user
 * can lift, an illusion a mind, eye contact someone up close. A fighter choosing a target passes
 * over one a card doesn't fit (`fitsTarget`), and a technique that reaches one anyway (an area,
 * a target changed since it was chosen) does nothing to them, and the story says why.
 */

/** Whether a card can work on this target as things stand. Cards that aren't techniques can. */
export function fitsTarget(
  round: Round,
  user: PlanFighter,
  card: Card,
  target: PlanFighter,
): boolean {
  if (card.kind !== 'jutsu') return true;
  const band = distanceBetween(round, user.id, target.id);
  return unmetNeed(card.technique, { user, target, band }) === null;
}

/** The targets a technique can work on, the rest told why it did nothing to them. */
export function fittingTargets(
  round: Round,
  {
    actor,
    t,
    targets,
  }: { actor: PlanFighter; t: CombatTechnique; targets: readonly PlanFighter[] },
): { round: Round; targets: PlanFighter[] } {
  let told = round;
  const fit = targets.filter((target) => {
    const band = distanceBetween(round, actor.id, target.id);
    const unmet = unmetNeed(t, { user: actor, target, band });
    if (unmet === null) return true;
    told = say(told, tell(UNMET_LINE[unmet], { a: actor, t: target, what: t.name }));
    return false;
  });
  return { round: told, targets: fit };
}

/**
 * Where a card is aimed: the foe chosen, if the card reaches past their front row and works on
 * them; else one of the open foes it can reach and work on, at random; else no one.
 */
export function aimFitting(
  round: Round,
  aiming: {
    actor: PlanFighter;
    card: Card;
    aim: PlanFighter | undefined;
    open: readonly PlanFighter[];
    rng: Rng;
  },
): PlanFighter | undefined {
  const { actor, card, aim, open, rng } = aiming;
  const fits = (f: PlanFighter) => fitsTarget(round, actor, card, f);
  if (!aim || !isOffence(card) || (canHit(card, aim, round.fighters) && fits(aim))) return aim;
  const reachable = hittable(card, open, round.fighters).filter(fits);
  return reachable.length === 0 ? undefined : rng.pick(reachable);
}
