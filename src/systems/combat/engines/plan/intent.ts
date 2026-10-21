import type { Rng } from '@/core';

import type { RangeBand } from '../../contract';
import { alive, targetable } from '../../rules/body';
import { canAttackFrom } from '../../rules/kit';
import { RANGE_LABEL } from '../../rules/range';
import { isTrump } from '../../rules/trumps';
import { hasVerb } from '../../rules/verbs';
import {
  cardId,
  findCard,
  fitsBand,
  isDefenceCard,
  isOffence,
  playable,
  type Card,
  type DefenceCard,
} from './cards';
import { chooseCard, desperate } from './choose';
import { ownField } from './field';
import { planAdherence } from './judgement';
import { plannedPlay } from './priority';
import { opponentsOf } from './senses';
import { cardLabel } from './wording';
import { playerOf, type CardId, type PlanFighter, type PlanState, type Round } from './state';

/**
 * Telegraphs, as Deck fights had them: when an exchange ends, each foe settles on the card it
 * plays next and the fight screen shows it, so you slot your cards against what is coming. The
 * foe plays it unless the fight has moved on by its turn (the range changed, chakra or a tool
 * ran out), and then chooses afresh. Insight, or perception at least the foe's, names the
 * jutsu and tools; a hidden foe gives nothing away without insight.
 */

/** Each foe's next card, by fighter id. */
export type Intents = Readonly<Record<string, CardId>>;

type Table = Pick<
  PlanState,
  'fighters' | 'range' | 'exchange' | 'field' | 'round' | 'reads' | 'foeMark'
>;

/** The table as a round about to be played, for a foe weighing its plan. */
function asRound(table: Table): Round {
  return {
    number: table.round,
    opening: table.exchange === 0,
    fighters: [...table.fighters],
    range: table.range,
    lines: [],
    seen: {},
    intents: {},
    ...(table.reads ? { reads: table.reads } : {}),
    ...(table.foeMark ? { foeMark: table.foeMark } : {}),
    ...(table.field ? { field: table.field } : {}),
  };
}

function intentOf(table: Table, self: PlanFighter, rng: Rng): CardId {
  // A foe plays its plan in priority order as often as its judgement keeps it to it (its
  // default plan already holds its instincts as slot conditions); otherwise it follows instinct.
  if (rng.chance(planAdherence(self))) return cardId(plannedPlay(self, asRound(table)).card);
  const foes = opponentsOf(table.fighters, self);
  const inSight = foes.filter(targetable);
  const moment = {
    band: table.range,
    foe: inSight.length > 0 ? rng.pick(inSight) : undefined,
    hiddenFoe: foes.some((f) => f.hidden),
    opening: table.exchange === 0,
    fieldUp: ownField(table.field, self),
    exchange: table.round,
    ...(table.reads ? { reads: table.reads } : {}),
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
  if (desperate(actor, band) && !(card.kind === 'jutsu' && isTrump(card.technique))) {
    return undefined;
  }
  return isOffence(card) && !canAttackFrom(actor, band) ? undefined : card;
}

/**
 * Sharp eyes read a telegraph precisely: with perception at least the foe's, you see which
 * technique they are readying or which tool they reach for. Insight always does.
 */
function readsPrecisely(viewer: PlanFighter, foe: PlanFighter, insight: boolean): boolean {
  return insight || viewer.attributes.perception >= foe.attributes.perception;
}

/** What a defence looks like on its way: a ready one is just a stance, a commitment shows. */
const DEFENDING: Readonly<Record<DefenceCard['kind'], string>> = {
  guard: 'Bracing to defend',
  dodge: 'Bracing to defend',
  counter: 'Bracing to defend',
  evade: 'Getting light on their feet',
  brace: 'Digging in to take it',
};

function telegraph(card: Card, precise: boolean): string {
  if (isDefenceCard(card)) return DEFENDING[card.kind];
  switch (card.kind) {
    case 'strike':
      return 'Coming in to strike';
    case 'throw':
      return 'Reaching for kunai';
    case 'step':
      return card.direction === 'in' ? 'Closing in' : 'Backing off';
    case 'search':
      return 'Searching for you';
    case 'gather':
      return 'Gathering their strength';
    case 'reveal':
      return 'Reaching for the cover over one eye';
    case 'dispel':
      return 'Gathering chakra to break the illusion';
    case 'jutsu':
      if (precise) return `Readying ${card.technique.name}`;
      // A stance shows whatever your eyes: you can see they mean to answer.
      return hasVerb(card.technique, 'counter') ? 'Settling into a stance' : 'Readying a technique';
    case 'item':
      return precise ? `Reaching for a ${card.item.name.toLowerCase()}` : 'Reaching into a pouch';
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
  const ids = insight ? f.loadout[state.range].map((s) => s.card) : (state.seen[f.id] ?? []);
  const names = ids.flatMap((id) => {
    const card = findCard(f, id);
    return card ? [cardLabel(card, f)] : [];
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
