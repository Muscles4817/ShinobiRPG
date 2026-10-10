import type { Rng } from '@/core';

import type { CombatResult } from '../../contract';
import { alive, chakraCost, targetable } from '../../rules/body';
import { MISFIRE_CHANCE } from '../../rules/conditions';
import { revealOnAttack } from '../../rules/items';
import { canAttackFrom } from '../../rules/kit';
import { inReach, reachOf, stepBack, stepIn, STRIKE_REACH } from '../../rules/range';
import { cardPoints, isTargeted, playOn, shuffle } from './cards';
import { chooseIntent, effectiveIntent, enemyAct, type TurnResult } from './enemy';
import { startOfTurn } from './kit';
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
const MISFIRE_LINE = 'Your senses lie to you. The attack goes wide.';
const GUARD_CARD: Card = { uid: 'ally', kind: 'guard' };

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

/** Living foes that can be picked as targets (not hidden). */
export function visibleEnemies(fighters: readonly DeckFighter[]): DeckFighter[] {
  return livingEnemies(fighters).filter((f) => targetable(f));
}

/** Plays one card from the hand. While confused, anything but a Guard may misfire. */
export function playCard(
  state: DeckState,
  card: Card,
  targetId: string | undefined,
  rng: Rng,
): DeckState {
  const user = playerOf(state);
  const enemies = visibleEnemies(state.fighters);
  const target = enemies.find((e) => e.id === targetId) ?? enemies[0];
  const misfires = card.kind !== 'guard' && user.confused > 0 && rng.chance(MISFIRE_CHANCE);
  const played = misfires
    ? { fighters: [...state.fighters], lines: [MISFIRE_LINE] }
    : playOn([...state.fighters], { user, target, card }, rng);
  // Attacking (hit, miss or misfire) gives a smoke-hidden player away; a Guard or heal doesn't.
  const fighters = isTargeted(card)
    ? played.fighters.map((f) => (f.id === user.id ? revealOnAttack(f) : f))
    : played.fighters;
  return {
    ...state,
    fighters,
    hand: state.hand.filter((c) => c.uid !== card.uid),
    discard: [...state.discard, card],
    points: state.points - cardPoints(card),
    log: [...state.log, ...played.lines].slice(-LOG_LIMIT),
    result: decide(fighters),
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
  if (!canAttackFrom(ally, range)) return GUARD_CARD;
  const usable = ally.techniques.filter(
    (t) => t.effect !== 'heal' && inReach(reachOf(t), range) && chakraCost(ally, t) <= ally.chakra,
  );
  if (usable.length > 0 && rng.chance(ALLY_JUTSU_CHANCE)) {
    return { uid: 'ally', kind: 'jutsu', technique: rng.pick(usable) };
  }
  return { uid: 'ally', kind: inReach(STRIKE_REACH, range) ? 'strike' : 'kunai' };
}

/** Opens a fighter's turn (re-hiding, confusion wearing off) and returns them as they now are. */
function opened(turn: TurnResult, id: string, round: number, rng: Rng) {
  const start = startOfTurn(turn.fighters, id, round, rng);
  const next = { ...turn, fighters: start.fighters, lines: [...turn.lines, ...start.lines] };
  return { turn: next, self: start.fighters.find((f) => f.id === id) };
}

/** Allies strike the first foe they can see, from where their kit reaches, else brace. */
function alliesAct(turn: TurnResult, round: number, rng: Rng): TurnResult {
  const allies = turn.fighters.filter((f) => f.side === 'player' && !f.isPlayer && alive(f));
  return allies.reduce((acc, ally) => {
    if (decide(acc.fighters)) return acc;
    const { turn: open, self } = opened(acc, ally.id, round, rng);
    if (!self || !alive(self)) return open;
    const fresh = patch(open.fighters, self.id, { block: 0 });
    const target = visibleEnemies(fresh)[0];
    const card = target ? allyCard(self, open.range, rng) : GUARD_CARD;
    const played = playOn(fresh, { user: { ...self, block: 0 }, target, card }, rng);
    return { ...open, fighters: played.fighters, lines: [...open.lines, ...played.lines] };
  }, turn);
}

function enemiesAct(turn: TurnResult, state: DeckState, rng: Rng): TurnResult {
  return livingEnemies(turn.fighters).reduce((acc, enemy) => {
    const planned = state.intents[enemy.id];
    if (!planned || decide(acc.fighters)) return acc;
    const { turn: open, self } = opened(acc, enemy.id, state.round, rng);
    if (!self || !alive(self)) return open;
    const intent = effectiveIntent(planned, { self, target: playerOf(open) }, open.range);
    const next = enemyAct(open, self, intent, rng);
    const dazed =
      intent.kind === 'dazed'
        ? patch(next.fighters, enemy.id, { stunned: Math.max(0, self.stunned - 1) })
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
  const afterAllies = alliesAct(start, state.round, rng);
  const afterEnemies = decide(afterAllies.fighters)
    ? afterAllies
    : enemiesAct(afterAllies, state, rng);
  const result = decide(afterEnemies.fighters);
  if (result) {
    const log = [...state.log, ...afterEnemies.lines].slice(-LOG_LIMIT);
    const { fighters, range } = afterEnemies;
    return { ...state, fighters, range, log, result };
  }
  const yours = startOfTurn(
    upkeep(afterEnemies.fighters),
    playerOf(afterEnemies).id,
    state.round + 1,
    rng,
  );
  const fighters = yours.fighters;
  const log = [...state.log, ...afterEnemies.lines];
  const next: DeckState = {
    ...state,
    round: state.round + 1,
    fighters,
    range: afterEnemies.range,
    hand: [],
    discard: [...state.discard, ...state.hand],
    points: POINTS_PER_TURN,
    intents: newIntents(fighters, afterEnemies.range, rng),
    log: [...log, `— Turn ${state.round + 1} —`, ...yours.lines].slice(-LOG_LIMIT),
  };
  return draw(next, HAND_SIZE, rng);
}
