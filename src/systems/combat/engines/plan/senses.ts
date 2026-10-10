import type { Rng } from '@/core';

import { alive } from '../../rules/body';
import {
  DISPEL_CHAKRA,
  dispelChance,
  MISFIRE_CHANCE,
  rehidesNow,
  searchChance,
  shakeOffChance,
} from '../../rules/conditions';
import { patch, say, type PlanFighter, type Round } from './state';

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
}

export function opponentsOf(fighters: readonly PlanFighter[], self: PlanFighter): PlanFighter[] {
  return fighters.filter((f) => f.side !== self.side && alive(f));
}

function rehide(round: Round, actor: PlanFighter): Round {
  if (actor.hidden || !rehidesNow(actor, round.number)) return round;
  return say(
    { ...round, fighters: patch(round.fighters, actor.id, { hidden: true }) },
    `${actor.name} melts back into the illusion.`,
  );
}

function clearHead(round: Round, actor: PlanFighter, rng: Rng): Round {
  if (actor.confused <= 0) return round;
  if (rng.chance(shakeOffChance(actor))) {
    return say(
      { ...round, fighters: patch(round.fighters, actor.id, { confused: 0 }) },
      `${actor.name} shakes off the illusion.`,
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

export function search(round: Round, { actor, rng }: Turn): Round {
  const hidden = opponentsOf(round.fighters, actor).filter((f) => f.hidden);
  const found = hidden.filter((foe) => rng.chance(searchChance(actor, foe)));
  if (found.length === 0) return say(round, `${actor.name} searches, but finds no one.`);
  const names = found.map((f) => f.name).join(' and ');
  return say(reveal(round, found), `${actor.name} spots ${names}!`);
}

export function dispel(round: Round, { actor, rng }: Turn): Round {
  const chakra = Math.max(0, actor.chakra - DISPEL_CHAKRA);
  const paid = say(
    { ...round, fighters: patch(round.fighters, actor.id, { chakra, confused: 0 }) },
    `${actor.name} forms the seal to break illusions.`,
  );
  const hidden = opponentsOf(round.fighters, actor).filter((f) => f.hidden);
  const strongest = [...hidden].sort((a, b) => b.attributes.genjutsu - a.attributes.genjutsu)[0];
  if (!strongest) return paid;
  if (!rng.chance(dispelChance(actor, strongest))) return say(paid, 'The illusion holds.');
  return say(reveal(paid, hidden), 'The illusion shatters!');
}
