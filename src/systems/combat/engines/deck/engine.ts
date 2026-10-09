import { clamp, err, ok, type Result, type Rng } from '@/core';

import type {
  CombatChoice,
  CombatEngine,
  CombatOption,
  CombatOutcome,
  CombatState,
  CombatView,
} from '../../contract';
import { alive, chakraCost, viewOf } from '../../rules/body';
import { RANGE_LABEL } from '../../rules/range';
import {
  buildDeck,
  CARD_LABEL,
  cardBlocker,
  cardPoints,
  cardReach,
  isTargeted,
  shuffle,
} from './cards';
import { describeIntent } from './enemy';
import { decide, draw, endTurn, newIntents, playCard, step, STEP_POINTS } from './turn';
import {
  DECK_ENGINE_ID,
  decode,
  encode,
  HAND_SIZE,
  initialFighters,
  playerOf,
  POINTS_PER_TURN,
  type Card,
  type DeckFighter,
  type DeckState,
} from './state';

/**
 * Deck fights: your techniques are cards. Draw five, spend three actions a turn, read what
 * each enemy intends to do next, and mind the range.
 */

const START_RANGE = 'mid';
const CARD_PREFIX = 'card:';

function statuses(f: DeckFighter): string[] {
  return [
    ...(f.block > 0 ? [`Block ${f.block}`] : []),
    ...(f.stunned > 0 ? ['Dazed'] : []),
    ...(f.sealed > 0 ? ['Sealed'] : []),
  ];
}

function cardOption(card: Card, state: DeckState): CombatOption {
  const player = playerOf(state);
  const blocker = cardBlocker(card, player, { points: state.points, range: state.range });
  const t = card.technique;
  const kindLabel = card.kind === 'jutsu' ? '' : CARD_LABEL[card.kind];
  const detail = t
    ? `${chakraCost(player, t)} chakra · ${cardReach(card).join('/')}`
    : card.kind === 'guard'
      ? 'Block damage'
      : cardReach(card).join('/');
  return {
    id: `${CARD_PREFIX}${card.uid}`,
    label: t ? t.name : kindLabel,
    detail,
    kind: t ? 'technique' : 'basic',
    cost: cardPoints(card),
    ...(t ? { discipline: t.discipline } : {}),
    ...(isTargeted(card) ? { targeted: true } : {}),
    ...(blocker ? { disabledReason: blocker } : {}),
  };
}

function stepOptions(state: DeckState): CombatOption[] {
  const tooTired = state.points < STEP_POINTS ? 'Not enough actions' : null;
  const make = (id: 'step-in' | 'step-back', label: string, edge: string | null): CombatOption => {
    const blocker = edge ?? tooTired;
    return {
      id,
      label,
      detail: '',
      kind: 'move',
      cost: STEP_POINTS,
      ...(blocker ? { disabledReason: blocker } : {}),
    };
  };
  return [
    make('step-in', 'Step in', state.range === 'close' ? 'Already close' : null),
    make('step-back', 'Step back', state.range === 'far' ? 'Already far' : null),
  ];
}

function options(state: DeckState): CombatOption[] {
  if (state.result) return [];
  const flee: CombatOption = {
    id: 'flee',
    label: 'Flee',
    detail: 'Uses your turn',
    kind: 'escape',
  };
  return [
    ...state.hand.map((c) => cardOption(c, state)),
    ...stepOptions(state),
    { id: 'end', label: 'End turn', detail: '', kind: 'end' },
    state.canFlee ? flee : { ...flee, disabledReason: 'You cannot flee this fight' },
  ];
}

function fleeChance(state: DeckState): number {
  const runner = playerOf(state);
  const chasers = state.fighters.filter((f) => f.side === 'enemy' && alive(f));
  const fastest = Math.max(...chasers.map((c) => c.attributes.speed));
  const distance = state.range === 'far' ? 0.2 : state.range === 'mid' ? 0.1 : 0;
  return clamp(0.4 + (runner.attributes.speed - fastest) * 0.05 + distance, 0.1, 0.9);
}

function act(deck: DeckState, choice: CombatChoice, rng: Rng) {
  const option = options(deck).find((o) => o.id === choice.optionId);
  if (!option) return err(`Unknown combat option "${choice.optionId}".`);
  if (option.disabledReason) return err(option.disabledReason);
  if (option.id === 'end') return ok(endTurn(deck, rng));
  if (option.id === 'step-in' || option.id === 'step-back') return ok(step(deck, option.id));
  if (option.id === 'flee') {
    if (rng.chance(fleeChance(deck))) {
      return ok({
        ...deck,
        log: [...deck.log, 'You vanish in a swirl of leaves and escape!'],
        result: 'escaped' as const,
      });
    }
    return ok(endTurn(deck, rng, ['You try to slip away, but you are cut off!']));
  }
  const card = deck.hand.find((c) => `${CARD_PREFIX}${c.uid}` === option.id);
  if (!card) return err('That card is not in your hand.');
  return ok(playCard(deck, card, choice.targetId, rng));
}

export function createDeckEngine(): CombatEngine {
  return {
    id: DECK_ENGINE_ID,
    label: 'Deck',
    summary: 'Your techniques are cards. Draw five, spend three actions, read enemy intents.',

    start(setup, rng) {
      const fighters = initialFighters(setup);
      const player = playerOf({ fighters });
      const names = setup.enemies.map((e) => e.name).join(', ');
      const state: DeckState = {
        round: 1,
        fighters,
        range: START_RANGE,
        drawPile: shuffle(buildDeck(player.techniques), rng),
        hand: [],
        discard: [],
        points: POINTS_PER_TURN,
        intents: newIntents(fighters, START_RANGE, rng),
        log: [setup.intro ?? `${names} square up.`, '— Turn 1 —'],
        result: null,
        canFlee: setup.canFlee,
      };
      return encode(draw(state, HAND_SIZE, rng));
    },

    act(state: CombatState, choice: CombatChoice, rng): Result<CombatState> {
      const deck = decode(state);
      if (deck.result) return err('The fight is already over.');
      const next = act(deck, choice, rng);
      return next.ok ? ok(encode(next.value)) : next;
    },

    view(state): CombatView {
      const deck = decode(state);
      const player = playerOf(deck);
      const intent = (f: DeckFighter) => {
        const planned = deck.intents[f.id];
        return f.side === 'enemy' && planned && alive(f)
          ? describeIntent(planned, player)
          : undefined;
      };
      return {
        round: deck.round,
        combatants: deck.fighters.map((f) => viewOf(f, statuses(f), intent(f))),
        log: deck.log,
        options: options(deck),
        range: deck.range,
        prompt: `${RANGE_LABEL[deck.range]} range · ${deck.drawPile.length} cards to draw`,
        meters: [{ id: 'actions', label: 'Actions', value: deck.points, max: POINTS_PER_TURN }],
      };
    },

    outcome(state): CombatOutcome | null {
      const deck = decode(state);
      const result = deck.result ?? decide(deck.fighters);
      if (!result) return null;
      const player = playerOf(deck);
      return {
        result,
        rounds: deck.round,
        player: { health: player.health, chakra: player.chakra },
      };
    },
  };
}
