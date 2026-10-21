import { BLOW_DAMAGE, bestArt, blowPower, gapScale, toughness } from '../../rules/damage';
import type { PlanFighter } from './state';
import { hiveToll } from './swarm';

/**
 * Whom a fighter with judgement goes for: the foe who hurts their side most for how soon they
 * would fall (how hard they hit, times how big a share of their health each of your hits takes).
 * A frail foe who hits hard goes first; a tough one who barely scratches anyone, last. The
 * estimate reads the same gap formula the fight uses (`rules/damage.ts`), from the better of a
 * plain blow and the fighter's best art. A hive host is worth more to someone who carries what
 * kills insects (an area, an element the strain fears): their hive is their arsenal.
 */

/** How much more a host is worth for each share of their hive the fighter's best technique would kill. */
const HIVE_TARGET_WEIGHT = 2;

/** About how much one hit from the attacker takes from the defender. */
function hitOn(attacker: PlanFighter, defender: PlanFighter): number {
  const power = Math.max(blowPower(attacker), bestArt(attacker));
  return BLOW_DAMAGE * gapScale(power, toughness(defender));
}

/** How much more a hive host is worth to this fighter: 1 for anyone else. */
function hiveLift(self: PlanFighter, foe: PlanFighter): number {
  if (!foe.swarm) return 1;
  const toll = Math.max(0, ...self.techniques.map((t) => hiveToll(foe, t, hitOn(self, foe))));
  return 1 + toll * HIVE_TARGET_WEIGHT;
}

/** How much a foe is worth going for: the harm they do, over the hits they'd take to fall. */
export function targetWorth(self: PlanFighter, foe: PlanFighter): number {
  const hitsToFall = Math.max(1, foe.health / hitOn(self, foe));
  return (hitOn(foe, self) / hitsToFall) * hiveLift(self, foe);
}

/** The foe most worth going for, if any. */
export function bestTarget(
  self: PlanFighter,
  foes: readonly PlanFighter[],
): PlanFighter | undefined {
  return [...foes].sort((a, b) => targetWorth(self, b) - targetWorth(self, a))[0];
}
