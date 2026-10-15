import { BLOW_DAMAGE, bestArt, blowPower, gapScale, toughness } from '../../rules/damage';
import type { PlanFighter } from './state';

/**
 * Whom a fighter with judgement goes for: the foe who hurts their side most for how soon they
 * would fall (how hard they hit, times how big a share of their health each of your hits takes).
 * A frail foe who hits hard goes first; a tough one who barely scratches anyone, last. The
 * estimate reads the same gap formula the fight uses (`rules/damage.ts`), from the better of a
 * plain blow and the fighter's best art.
 */

/** About how much one hit from the attacker takes from the defender. */
function hitOn(attacker: PlanFighter, defender: PlanFighter): number {
  const power = Math.max(blowPower(attacker), bestArt(attacker));
  return BLOW_DAMAGE * gapScale(power, toughness(defender));
}

/** How much a foe is worth going for: the harm they do, over the hits they'd take to fall. */
export function targetWorth(self: PlanFighter, foe: PlanFighter): number {
  const hitsToFall = Math.max(1, foe.health / hitOn(self, foe));
  return hitOn(foe, self) / hitsToFall;
}

/** The foe most worth going for, if any. */
export function bestTarget(
  self: PlanFighter,
  foes: readonly PlanFighter[],
): PlanFighter | undefined {
  return [...foes].sort((a, b) => targetWorth(self, b) - targetWorth(self, a))[0];
}
