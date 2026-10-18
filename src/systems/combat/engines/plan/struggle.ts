import type { Rng } from '@/core';

import { alive } from '../../rules/body';
import { escapeChance, rescueChance } from '../../rules/escape';
import { isOffence, type Card } from './cards';
import { breakHold } from './holding';
import { readsInTheMoment } from './judgement';
import { canHit } from './rows';
import { say, type PlanFighter, type Round } from './state';
import { tell } from '../../rules/telling';

/**
 * Breaking holds in a planned fight (`rules/escape.ts`): at the end of each exchange the pinned
 * struggle against the hold, and on their turn a teammate may come to their aid. Against a
 * channelled hold the aid is a blow at its caster, which breaks it (`holding.ts`) when it lands;
 * against any other hold, or a caster out of reach, they spend the turn pulling them free. The
 * player's teammates look after the player; otherwise only a mind that reads the fight thinks
 * of it. A pin about to lapse at the end of this exchange isn't worth the effort.
 */

/** The pin still holds past this exchange, and remembers how it was cast. */
function caught(f: PlanFighter): boolean {
  return alive(f) && (f.pinned ?? 0) > 1 && f.grip !== undefined;
}

/** Whoever is keeping a channelled hold on this fighter. */
function holderOf(round: Round, heldId: string): PlanFighter | undefined {
  return round.fighters.find((f) => f.holding === heldId && alive(f));
}

/** Out of the hold: a channelled one breaks (its seal lifting with it), any other just ends. */
function loosed(round: Round, held: PlanFighter, line: string): Round {
  const holder = holderOf(round, held.id);
  if (holder) return breakHold(say(round, line), holder.id);
  const fighters = round.fighters.map((f) => {
    if (f.id !== held.id) return f;
    const { pinned: _pin, grip: _grip, ...rest } = f;
    return rest;
  });
  return say({ ...round, fighters }, line);
}

/** At the end of an exchange: each fighter still caught struggles against the hold. */
export function struggleFree(round: Round, rng: Rng): Round {
  return round.fighters.reduce((now, before) => {
    const held = now.fighters.find((f) => f.id === before.id);
    if (!held?.grip || !caught(held) || held.stunned > 0) return now;
    const channelled = holderOf(now, held.id) !== undefined;
    if (!rng.chance(escapeChance(held, held.grip, channelled))) return now;
    return loosed(now, held, tell('{a} struggle{a.s} free of the hold!', { a: held }));
  }, round);
}

/** A teammate caught in a hold this fighter would come to the aid of. */
function inNeed(round: Round, actor: PlanFighter): PlanFighter | undefined {
  if (actor.isPlayer || actor.holding || (actor.pinned ?? 0) > 0) return undefined;
  const mates = round.fighters.filter((f) => f.side === actor.side && f.id !== actor.id);
  return mates.find((f) => caught(f) && (f.isPlayer || readsInTheMoment(actor)));
}

/** What a teammate's aid comes to this turn. */
export type Aid =
  | { readonly kind: 'none' }
  | { readonly kind: 'strike'; readonly at: PlanFighter }
  | { readonly kind: 'spent'; readonly round: Round };

/**
 * A fighter's aid to a teammate caught in a hold, given the card they'd otherwise play: aim it
 * at a channelled hold's caster if it can reach them, or spend the turn pulling them free.
 */
export function aid(
  round: Round,
  { actor, rng }: { actor: PlanFighter; rng: Rng },
  card: Card,
): Aid {
  const held = inNeed(round, actor);
  if (!held?.grip) return { kind: 'none' };
  const holder = holderOf(round, held.id);
  if (holder && isOffence(card) && canHit(card, holder, round.fighters)) {
    return { kind: 'strike', at: holder };
  }
  const chance = rescueChance(actor, held.grip, holder !== undefined);
  if (!rng.chance(chance)) {
    const line = tell('{a} pull{a.s} at {t}, but the hold stands.', { a: actor, t: held });
    return { kind: 'spent', round: say(round, line) };
  }
  const freed = tell('{a} pull{a.s} {t} free!', { a: actor, t: held });
  return { kind: 'spent', round: loosed(round, held, freed) };
}
