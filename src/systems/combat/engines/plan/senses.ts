import type { Rng } from '@/core';

import { alive, targetable } from '../../rules/body';
import { seesTheHidden } from '../../rules/eyes';
import {
  DISPEL_CHAKRA,
  dispelChance,
  MISFIRE_CHANCE,
  rehidesNow,
  searchChance,
  shakeOffChance,
} from '../../rules/conditions';
import { swarmSearch } from '../../rules/swarms';
import { dulled } from '../../rules/verbs';
import { patch, paying, say, type PlanFighter, type Round } from './state';
import { inCover } from './groundPlay';
import { emptySearchLine, foundLine, momentOf } from './voice';
import { clearHeadLine, dispelLine, dispelledLine, rehideLine } from './sceneVoice';

/**
 * Hidden and Confused in a planned fight. Illusionists slip back into hiding every few
 * exchanges; a confused fighter may shake it off as their turn starts, and until then their
 * attacks may go wide. Search and Dispel are cards like any other, played on your turn.
 */

/** What stays fixed for one fighter's turn. */
export interface Turn {
  readonly actor: PlanFighter;
  readonly target: PlanFighter | undefined;
  readonly rng: Rng;
  /** How much harder their damage lands: set while a combination technique resolves. */
  readonly boost?: number;
  /** Thrown as a chain's next link, carried on from the last (`chaining.ts`). */
  readonly linked?: boolean;
}

/** Hidden foes can't be aimed at until found, unless your eyes see everything (`seesTheHidden`). */
export function inSight(self: PlanFighter, foe: PlanFighter): boolean {
  return targetable(foe) || (alive(foe) && seesTheHidden(self));
}

export function opponentsOf(fighters: readonly PlanFighter[], self: PlanFighter): PlanFighter[] {
  return fighters.filter((f) => f.side !== self.side && alive(f));
}

function rehide(round: Round, actor: PlanFighter): Round {
  if (actor.hidden || !rehidesNow(actor, round.number)) return round;
  return say(
    { ...round, fighters: patch(round.fighters, actor.id, { hidden: true, exposure: 0 }) },
    rehideLine(momentOf(round, actor.id), actor),
  );
}

function clearHead(round: Round, actor: PlanFighter, rng: Rng): Round {
  if (actor.confused <= 0) return round;
  if (rng.chance(shakeOffChance(actor))) {
    return say(
      { ...round, fighters: patch(round.fighters, actor.id, { confused: 0 }) },
      clearHeadLine(momentOf(round, actor.id), actor),
    );
  }
  return { ...round, fighters: patch(round.fighters, actor.id, { confused: actor.confused - 1 }) };
}

/** What happens as a fighter's turn begins, before they play a card. */
export function startOfTurn(round: Round, actor: PlanFighter, rng: Rng): Round {
  return clearHead(rehide(round, actor), actor, rng);
}

/** Whether a confused fighter's attack goes wide. */
export function misfires(actor: PlanFighter, rng: Rng): boolean {
  return actor.confused > 0 && rng.chance(MISFIRE_CHANCE);
}

function reveal(round: Round, foes: readonly PlanFighter[]): Round {
  const fighters = foes.reduce((all, f) => patch(all, f.id, { hidden: false }), round.fighters);
  return { ...round, fighters };
}

/** Hiders a look missed, narrowed down for the next one (`EXPOSURE_STEP`). */
function narrowed(round: Round, missed: readonly PlanFighter[]): Round {
  const fighters = missed.reduce(
    (all, foe) => patch(all, foe.id, { exposure: (foe.exposure ?? 0) + 1 }),
    round.fighters,
  );
  return { ...round, fighters };
}

export function search(round: Round, { actor, rng }: Turn): Round {
  const hidden = opponentsOf(round.fighters, actor).filter((f) => f.hidden);
  // A field that blinds the seeker dulls their eyes.
  const seeker = dulled(round.field, actor);
  const found = hidden.filter((foe) =>
    rng.chance(searchChance(seeker, inCover(round.ground, foe)) + swarmSearch(actor.swarm)),
  );
  const moment = momentOf(round, actor.id);
  const looked = narrowed(
    round,
    hidden.filter((foe) => !found.includes(foe)),
  );
  if (found.length === 0) return say(looked, emptySearchLine(moment, actor));
  return say(reveal(looked, found), foundLine(moment, actor, found));
}

export function dispel(round: Round, { actor, rng }: Turn): Round {
  const change = { ...paying(actor, DISPEL_CHAKRA), confused: 0 };
  const paid = { ...round, fighters: patch(round.fighters, actor.id, change) };
  const hidden = opponentsOf(round.fighters, actor).filter((f) => f.hidden);
  const strongest = [...hidden].sort((a, b) => b.attributes.genjutsu - a.attributes.genjutsu)[0];
  const moment = momentOf(round, actor.id);
  const cast = dispelLine(moment, actor);
  if (!strongest) return say(paid, cast);
  const broke = rng.chance(dispelChance(actor, strongest));
  const after = dispelledLine(moment, broke);
  return broke ? say(reveal(paid, hidden), cast, after) : say(narrowed(paid, hidden), cast, after);
}
