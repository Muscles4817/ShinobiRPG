import { canClimb, LADDER_TOP } from '@/systems/techniques';

import type { CombatTechnique } from '../../contract';
import { alive } from '../../rules/body';
import { lastDitch, outmatched } from '../../rules/trumps';
import { opensOf, openStep, STEP_TRIAL, stepBand, type ClimbReasons } from '../../rules/verbs';
import { readOf } from './reads';
import type { PlanFighter, Reads } from './state';

/**
 * When a ladder's next step is worth its price (`worthOpening`): what the fighter has seen of the
 * fight (`docs/design/defence-plan.md` 4.1). A taijutsu fighter fights with their style first. One
 * whose eyes are at least as sharp as every foe's can size the fight up at sight (a far stronger
 * foe is a fight going against them from the start); anyone else has to try first, a few attacks
 * of their own, and see how the trade goes: losing it (the foe has lost less of their health than
 * they have), or barely touching the foe at all. A ladder's openings take no slot in a plan: the
 * fighter climbs from their kit, a band at a time (`climbOrder`), as the fight calls for it.
 */

/** Attacks a fighter throws before they know how the fight is going. */
export const TRY_ATTACKS = 3;
/** Short of this share of a foe's health taken, after trying, their blows aren't touching them. */
export const CANT_HURT_SHARE = 0.1;

function lostShare(f: PlanFighter): number {
  return 1 - f.health / f.maxHealth;
}

/** Whether the fighter's eyes size up every foe at sight. */
function sizesUp(self: PlanFighter, foes: readonly PlanFighter[]): boolean {
  return foes.every((f) => self.attributes.perception >= f.attributes.perception);
}

/** Attacks the fighter has been seen to throw this fight. */
function attacksThrown(self: PlanFighter, reads: Reads | undefined): number {
  return Object.values(readOf(reads, self.id).attacks).reduce((sum, n) => sum + n, 0);
}

/** Whether the step open now has been fought with long enough to judge it. */
function settled(self: PlanFighter, exchange: number | undefined): boolean {
  const since = self.empowered?.opened ? self.empowered.since : undefined;
  return since === undefined || exchange === undefined || exchange - since >= STEP_TRIAL;
}

/** What the fight has shown a fighter of how it is going, in this exchange. */
export interface FightSoFar {
  readonly foes: readonly PlanFighter[];
  readonly reads?: Reads;
  readonly exchange?: number;
}

/** What the fight has shown a fighter of how it is going. */
export function climbReasons(
  self: PlanFighter,
  { foes, reads, exchange }: FightSoFar,
): ClimbReasons {
  const standing = foes.filter(alive);
  const atSight = standing.length > 0 && sizesUp(self, standing) && outmatched(self, standing);
  const tried = attacksThrown(self, reads) >= TRY_ATTACKS;
  const taken = Math.max(0, ...standing.map(lostShare));
  return {
    losing: atSight || (tried && taken < lostShare(self)),
    cantHurt: tried && taken < CANT_HURT_SHARE,
    hurt: self.health < self.maxHealth / 2,
    lastDitch: lastDitch(self),
    settled: settled(self, exchange),
  };
}

function stepOf(t: CombatTechnique): number {
  return opensOf(t)?.step ?? 0;
}

/**
 * A kit's ladder openings in the order they climb, a band at a time (`stepBand`): the deepest of
 * the next band within reach of the last (the third gate, then the sixth, then the seventh). The
 * last step kills its user: never climbed by judgement, only played from a plan by hand.
 */
export function climbOrder(techniques: readonly CombatTechnique[]): CombatTechnique[] {
  const openers = techniques.filter((t) => {
    const opens = opensOf(t);
    return opens !== undefined && opens.step < LADDER_TOP[opens.ladder];
  });
  const order: CombatTechnique[] = [];
  for (let at = 0; ;) {
    const from = at;
    const reachable = openers.filter(
      (t) => canClimb(from, stepOf(t)) && stepBand(stepOf(t)) > stepBand(from),
    );
    const band = Math.min(...reachable.map((t) => stepBand(stepOf(t))));
    const next = reachable
      .filter((t) => stepBand(stepOf(t)) === band)
      .sort((a, b) => stepOf(b) - stepOf(a))[0];
    if (!next) return order;
    order.push(next);
    at = stepOf(next);
  }
}

/** The opening a fighter would climb to next from the step open now, if their kit has one. */
export function nextOpening(f: PlanFighter): CombatTechnique | undefined {
  return climbOrder(f.techniques).find((t) => {
    const opens = opensOf(t);
    return opens !== undefined && opens.step > openStep(f, opens.ladder);
  });
}
