import type { Rng } from '@/core';

import type { CombatResult } from '../../contract';
import { alive, chakraCost } from '../../rules/body';
import { inReach, reachOf, stepBack, stepIn, STRIKE_REACH } from '../../rules/range';
import { cardPoints, playOn, shuffle } from './cards';
import { chooseIntent, enemyAct, type TurnResult } from './enemy';
import {
  HAND_SIZE,
  LOG_LIMIT,
  patch,
  playerOf,
  POINTS_PER_TURN,
  type Card,
  type DeckFighter,
  type DeckState,
  type Intent,
} from './state';

/** Playing cards, ending the turn, and everything that happens between your turns. */

const CHAKRA_REGEN = 3;
const ALLY_JUTSU_CHANCE = 0.4;

function livingEnemies(fighters: readonly DeckFighter[]): DeckFighter[] {
  return fighters.filter((f) => f.side === 'enemy' && alive(f));
}

export function decide(fighters: readonly DeckFighter[]): CombatResult | null {
  if (!alive(playerOf({ fighters }))) return 'defeat';
  return livingEnemies(fighters).length > 0 ? null : 'victory';
}

/** Draws up to `count` cards, reshuffling the discard pile into the draw pile when it runs out. */
export function draw(state: DeckState, count: number, rng: Rng): DeckState {
  let { drawPile, discard } = state;
  const hand = [...state.hand];
  for (let i = 0; i < count; i++) {
    if (drawPile.length === 0) {
      drawPile = shuffle(discard, rng);
      discard = [];
    }
    const [next, ...rest] = drawPile;
    if (!next) break;
    hand.push(next);
    drawPile = rest;
  }
  return { ...state, drawPile, discard, hand };
}

export function newIntents(
  fighters: readonly DeckFighter[],
  range: DeckState['range'],
  rng: Rng,
): Record<string, Intent> {
  const player = playerOf({ fighters });
  return Object.fromEntries(
    livingEnemies(fighters).map((e): [string, Intent] => [
      e.id,
      chooseIntent(e, player, range, rng),
    ]),
  );
}

/** Plays one card from the hand. */
export function playCard(
  state: DeckState,
  card: Card,
  targetId: string | undefined,
  rng: Rng,
): DeckState {
  const user = playerOf(state);
  const enemies = livingEnemies(state.fighters);
  const target = enemies.find((e) => e.id === targetId) ?? enemies[0];
  const played = playOn([...state.fighters], { user, target, card }, rng);
  return {
    ...state,
    fighters: played.fighters,
    hand: state.hand.filter((c) => c.uid !== card.uid),
    discard: [...state.discard, card],
    points: state.points - cardPoints(card),
    log: [...state.log, ...played.lines].slice(-LOG_LIMIT),
    result: decide(played.fighters),
  };
}

/** Footwork is always available: one action to step in or back. */
export const STEP_POINTS = 1;

export function step(state: DeckState, direction: 'step-in' | 'step-back'): DeckState {
  const range = direction === 'step-in' ? stepIn(state.range) : stepBack(state.range);
  const verb = direction === 'step-in' ? 'close in' : 'back off';
  return {
    ...state,
    range,
    points: state.points - STEP_POINTS,
    log: [...state.log, `You ${verb}: ${range} range.`].slice(-LOG_LIMIT),
  };
}

function allyCard(ally: DeckFighter, range: DeckState['range'], rng: Rng): Card {
  const usable = ally.techniques.filter(
    (t) => t.effect !== 'heal' && inReach(reachOf(t), range) && chakraCost(ally, t) <= ally.chakra,
  );
  if (usable.length > 0 && rng.chance(ALLY_JUTSU_CHANCE)) {
    return { uid: 'ally', kind: 'jutsu', technique: rng.pick(usable) };
  }
  return { uid: 'ally', kind: inReach(STRIKE_REACH, range) ? 'strike' : 'kunai' };
}

function alliesAct(turn: TurnResult, rng: Rng): TurnResult {
  const allies = turn.fighters.filter((f) => f.side === 'player' && !f.isPlayer && alive(f));
  return allies.reduce((acc, ally) => {
    const target = livingEnemies(acc.fighters)[0];
    if (!target) return acc;
    const played = playOn(
      acc.fighters,
      { user: ally, target, card: allyCard(ally, acc.range, rng) },
      rng,
    );
    return { ...acc, fighters: played.fighters, lines: [...acc.lines, ...played.lines] };
  }, turn);
}

function enemiesAct(turn: TurnResult, intents: DeckState['intents'], rng: Rng): TurnResult {
  return livingEnemies(turn.fighters).reduce((acc, enemy) => {
    const intent = intents[enemy.id];
    const current = acc.fighters.find((f) => f.id === enemy.id) ?? enemy;
    if (!intent || decide(acc.fighters)) return acc;
    const next = enemyAct(acc, current, intent, rng);
    const dazed =
      intent.kind === 'dazed'
        ? patch(next.fighters, enemy.id, { stunned: Math.max(0, current.stunned - 1) })
        : next.fighters;
    return { ...next, fighters: dazed };
  }, turn);
}

function upkeep(fighters: readonly DeckFighter[]): DeckFighter[] {
  return fighters.map((f) => ({
    ...f,
    block: f.isPlayer ? 0 : f.block,
    sealed: Math.max(0, f.sealed - 1),
    chakra: alive(f) ? Math.min(f.maxChakra, f.chakra + CHAKRA_REGEN) : f.chakra,
  }));
}

/** Ends the player's turn: allies, then enemies act; then a fresh hand. */
export function endTurn(state: DeckState, rng: Rng, opening: readonly string[] = []): DeckState {
  const start: TurnResult = {
    fighters: [...state.fighters],
    range: state.range,
    lines: [...opening],
  };
  const afterAllies = alliesAct(start, rng);
  const afterEnemies = decide(afterAllies.fighters)
    ? afterAllies
    : enemiesAct(afterAllies, state.intents, rng);
  const result = decide(afterEnemies.fighters);
  const fighters = result ? afterEnemies.fighters : upkeep(afterEnemies.fighters);
  const log = [...state.log, ...afterEnemies.lines];
  if (result)
    return { ...state, fighters, range: afterEnemies.range, log: log.slice(-LOG_LIMIT), result };
  const next: DeckState = {
    ...state,
    round: state.round + 1,
    fighters,
    range: afterEnemies.range,
    hand: [],
    discard: [...state.discard, ...state.hand],
    points: POINTS_PER_TURN,
    intents: newIntents(fighters, afterEnemies.range, rng),
    log: [...log, `— Turn ${state.round + 1} —`].slice(-LOG_LIMIT),
  };
  return draw(next, HAND_SIZE, rng);
}
