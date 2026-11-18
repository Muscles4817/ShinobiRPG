import type { CombatTechnique } from '../../contract';
import { tell } from '../../rules/telling';
import { isHarmful } from '../../rules/verbs';
import { say, type PlanFighter, type Round } from './state';

/**
 * One mind, one nightmare (the owner's decision after Itachi against Pain,
 * `docs/design/combat-ai-plan.md` Part 13b): a shadow clone thinks with its maker's mind, so an
 * illusion that mind has already sunk into a target this exchange holds once. Another of its
 * bodies casting the same kind of thing at the same target adds nothing: the target is already
 * lost in it. Clones still bring their bodies, their blows and their decoys; they just don't
 * triple the one decisive move.
 */

const LOST_IN_IT = '{t} {t.is} already lost in {a.poss} illusion; another adds nothing.';

type Minded = Pick<PlanFighter, 'id' | 'shadowOf'>;

/** Whose mind a fighter's illusions come from: a shadow clone's are its maker's. */
function mindOf(f: Minded): string {
  return f.shadowOf ?? f.id;
}

const keyOf = (actor: Minded, target: Minded) => `${mindOf(actor)}>${target.id}`;

/** Only harmful illusions are held once a mind; anything else plays as it always has. */
function heldOnce(t: CombatTechnique): boolean {
  return t.discipline === 'genjutsu' && isHarmful(t);
}

/** The targets an illusion can still take, and the round with the rest told as already lost. */
export function stillFree(
  round: Round,
  actor: PlanFighter,
  { t, targets }: { readonly t: CombatTechnique; readonly targets: readonly PlanFighter[] },
): { readonly round: Round; readonly targets: PlanFighter[] } {
  if (!heldOnce(t)) return { round, targets: [...targets] };
  const held = round.illusions ?? [];
  const lost = targets.filter((f) => held.includes(keyOf(actor, f)));
  const told = lost.reduce((r, f) => say(r, tell(LOST_IN_IT, { a: actor, t: f })), round);
  return { round: told, targets: targets.filter((f) => !lost.includes(f)) };
}

/** An illusion that reached its targets: this mind has them for the rest of the exchange. */
export function sunkIn(
  round: Round,
  actor: PlanFighter,
  { t, reached }: { readonly t: CombatTechnique; readonly reached: readonly PlanFighter[] },
): Round {
  if (!heldOnce(t) || reached.length === 0) return round;
  return {
    ...round,
    illusions: [...(round.illusions ?? []), ...reached.map((f) => keyOf(actor, f))],
  };
}
