import { alive } from '../../rules/body';
import { lastDitch, outmatched } from '../../rules/trumps';
import { STEP_TRIAL, type ClimbReasons } from '../../rules/verbs';
import { readOf } from './reads';
import type { PlanFighter, Reads } from './state';

/**
 * When a ladder's next step is worth its price (`worthOpening`): what the fighter has seen of the
 * fight (`docs/design/defence-plan.md` 4.1). A taijutsu fighter fights with their style first. One
 * whose eyes are at least as sharp as every foe's can size the fight up at sight (a far stronger
 * foe is a fight going against them from the start); anyone else has to try first, a few attacks
 * of their own, and see how the trade goes: losing it (the foe has lost less of their health than
 * they have), or barely touching the foe at all.
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
