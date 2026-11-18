import { clamp } from '@/core';

import type { CombatTechnique } from '../../contract';
import { bracedResist } from '../../rules/commitment';
import { causeLine } from '../../rules/causes';
import { sizeGap } from '../../rules/size';
import { tell } from '../../rules/telling';
import { driveOf, effectsOf, resistOf } from '../../rules/verbs';
import { committedTo } from './commitment';
import type { Turn } from './senses';
import { say, type PlanFighter, type Round } from './state';

/**
 * Holding your ground against a blast (adopted for every fight; the owner's decision in `docs/design/combat-ai-plan.md` Part 13b): a wide area throws back only those
 * it caught who don't hold their feet. Holding is read as a knock is (the maker's art and
 * strength against the body's strength), as odds on the ratio between them, so it stays relative:
 * equals are usually thrown, a body twice as strong holds about half the time, and a maker far
 * stronger still throws a strong body. A Brace holds far more surely, and a bigger body more.
 */

/** The odds an equal keeps its feet (one in five). */
const EQUAL_ODDS = 0.25;
/** How sharply the odds move with the strength ratio. */
const HOLD_STEEPNESS = 2;
/** How much each size larger than the blast's maker adds to holding. */
const PER_SIZE = 0.15;
const HOLD_MAX = 0.95;

/** The chance a body caught in a blast keeps its feet. */
export function holdChance(maker: PlanFighter, caught: PlanFighter, t: CombatTechnique): number {
  const [area] = effectsOf(t, 'area');
  if (!area) return 0;
  const knock = { verb: 'knock' as const, power: area.power, to: 'mid' as const };
  const use = { technique: t, effect: knock };
  const ratio = (resistOf(caught, use) + 1) / (driveOf(maker, use) + 1);
  const odds = EQUAL_ODDS * ratio ** HOLD_STEEPNESS;
  const resist = odds / (1 + odds);
  const braced = committedTo(caught, 'brace') ? bracedResist(resist) : resist;
  return clamp(braced + Math.max(0, sizeGap(caught, maker)) * PER_SIZE, 0, HOLD_MAX);
}

/** Those a blast caught who are thrown back, and the round with a line for each who held. */
export function whoIsThrown(
  round: Round,
  turn: Turn,
  { t, caught }: { t: CombatTechnique; caught: readonly PlanFighter[] },
): { round: Round; thrown: PlanFighter[] } {
  let told = round;
  const thrown = caught.filter((f) => {
    if (!turn.rng.chance(holdChance(turn.actor, f, t))) return true;
    const cause = committedTo(f, 'brace') ? 'braced' : 'resisted';
    told = say(told, causeLine(tell('{t} keep{t.s} {t.their} feet.', { t: f }), cause));
    return false;
  });
  return { round: told, thrown };
}
