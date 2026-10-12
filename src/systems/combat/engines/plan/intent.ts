import type { Rng } from '@/core';

import type { RangeBand } from '../../contract';
import { alive, targetable } from '../../rules/body';
import { canAttackFrom } from '../../rules/kit';
import { RANGE_LABEL } from '../../rules/range';
import { cardId, cardLabel, findCard, fitsBand, isOffence, playable, type Card } from './cards';
import { chooseCard } from './choose';
import { opponentsOf } from './senses';
import { playerOf, type CardId, type PlanFighter, type PlanState } from './state';

/**
 * Telegraphs, as Deck fights had them: when an exchange ends, each foe settles on the card it
 * plays next and the fight screen shows it, so you slot your cards against what is coming. The
 * foe plays it unless the fight has moved on by its turn (the range changed, chakra or a tool
 * ran out), and then chooses afresh. Insight, or perception at least the foe's, names the
 * jutsu and tools; a hidden foe gives nothing away without insight.
 */

/** Each foe's next card, by fighter id. */
export type Intents = Readonly<Record<string, CardId>>;

type Table = Pick<PlanState, 'fighters' | 'range' | 'exchange'>;

function intentOf(table: Table, self: PlanFighter, rng: Rng): CardId {
  const foes = opponentsOf(table.fighters, self);
  const inSight = foes.filter(targetable);
  const moment = {
    band: table.range,
    foe: inSight.length > 0 ? rng.pick(inSight) : undefined,
    hiddenFoe: foes.some((f) => f.hidden),
    opening: table.exchange === 0,
  };
  return cardId(chooseCard(self, moment, rng));
}

/** What every standing foe means to do next exchange. A dazed foe loses it, so plans nothing. */
export function rollIntents(table: Table, rng: Rng): Intents {
  const planners = table.fighters.filter((f) => f.side === 'enemy' && alive(f) && f.stunned === 0);
  return Object.fromEntries(planners.map((f) => [f.id, intentOf(table, f, rng)]));
}

/** The card a fighter announced, if it still makes sense to play it here. */
export function intendedCard(
  actor: PlanFighter,
  intents: Intents,
  band: RangeBand,
): Card | undefined {
  const id = intents[actor.id];
  const card = id === undefined ? null : findCard(actor, id);
  if (!card || !fitsBand(card, band) || !playable(actor, card)) return undefined;
  return isOffence(card) && !canAttackFrom(actor, band) ? undefined : card;
}

/**
 * Sharp eyes read a telegraph precisely: with perception at least the foe's, you see which
 * technique they are readying or which tool they reach for. Insight always does.
 */
function readsPrecisely(viewer: PlanFighter, foe: PlanFighter, insight: boolean): boolean {
  return insight || viewer.attributes.perception >= foe.attributes.perception;
}

function telegraph(card: Card, precise: boolean): string {
  switch (card.kind) {
    case 'strike':
      return 'Coming in to strike';
    case 'throw':
      return 'Reaching for kunai';
    case 'step':
      return card.direction === 'in' ? 'Closing in' : 'Backing off';
    case 'search':
      return 'Searching for you';
    case 'dispel':
      return 'Gathering chakra to break the illusion';
    case 'jutsu':
      return precise ? `Readying ${card.technique.name}` : 'Readying a technique';
    case 'item':
      return precise ? `Reaching for a ${card.item.name.toLowerCase()}` : 'Reaching into a pouch';
    case 'guard':
    case 'dodge':
    case 'counter':
      return 'Bracing to defend';
  }
}

function nextMove(state: PlanState, f: PlanFighter, insight: boolean): string | undefined {
  if (f.hidden && !insight) return undefined;
  const id = state.intents[f.id];
  const card = id === undefined ? null : findCard(f, id);
  return card ? telegraph(card, readsPrecisely(playerOf(state), f, insight)) : undefined;
}

/** The cards you know of: all of them at this distance with insight, else what you've seen. */
function knownCards(state: PlanState, f: PlanFighter, insight: boolean): string | undefined {
  const ids = insight ? f.loadout[state.range] : (state.seen[f.id] ?? []);
  const names = ids.flatMap((id) => {
    const card = findCard(f, id);
    return card ? [cardLabel(card)] : [];
  });
  if (names.length === 0) return undefined;
  return `${insight ? `${RANGE_LABEL[state.range]} cards` : 'Seen'}: ${names.join(', ')}`;
}

/** What the fight screen says about a foe: its next move, then the cards you know it has. */
export function intentLine(state: PlanState, f: PlanFighter, insight: boolean): string | undefined {
  if (f.side !== 'enemy' || !alive(f) || state.result) return undefined;
  const parts = [nextMove(state, f, insight), knownCards(state, f, insight)].filter(Boolean);
  return parts.length > 0 ? parts.join('. ') : undefined;
}
