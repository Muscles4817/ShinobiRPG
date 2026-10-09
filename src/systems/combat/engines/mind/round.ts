import { clamp, type Rng } from '@/core';

import type { CombatResult, RangeBand } from '../../contract';
import { alive } from '../../rules/body';
import { RANGE_LABEL, stepBack, stepIn } from '../../rules/range';
import { chooseMove, planFor } from './ai';
import { clash, interrupted, netStep } from './exchange';
import { moveBlocker } from './moves';
import { applyLanding, castJutsu } from './strike';
import {
  LOG_LIMIT,
  playerOf,
  type EnemyPlan,
  type MindFighter,
  type MindState,
  type Move,
} from './state';

/** Plays out one round of the mind game: movement, every exchange, allies, then upkeep. */

const CHAKRA_REGEN = 2;
const GUARD_CHAKRA = 5;
const ALLY_JUTSU_CHANCE = 0.4;
const IDLE: Move = { kind: 'idle' };

export type PlayerChoice =
  | { readonly kind: 'move'; readonly move: Move; readonly targetId?: string }
  | { readonly kind: 'flee' }
  | { readonly kind: 'recover' };

interface Round {
  readonly fighters: MindFighter[];
  readonly lines: readonly string[];
  readonly range: RangeBand;
  readonly rng: Rng;
}

interface Moves {
  readonly player: Move;
  readonly enemy: Readonly<Record<string, Move>>;
  readonly playerCutOff: boolean;
}

interface Attempt {
  readonly moverId: string;
  readonly targetId: string;
  readonly move: Move;
  readonly defence: Move;
}

function livingEnemies(fighters: readonly MindFighter[]): MindFighter[] {
  return fighters.filter((f) => f.side === 'enemy' && alive(f));
}

function fleeChance(state: MindState): number {
  const runner = playerOf(state);
  const fastest = Math.max(...livingEnemies(state.fighters).map((c) => c.attributes.speed));
  const distance = state.range === 'far' ? 0.2 : state.range === 'mid' ? 0.1 : 0;
  return clamp(0.4 + (runner.attributes.speed - fastest) * 0.05 + distance, 0.1, 0.9);
}

function moved(range: RangeBand, moves: readonly Move[]): RangeBand {
  const step = netStep(moves);
  return step < 0 ? stepIn(range) : step > 0 ? stepBack(range) : range;
}

function decide(fighters: readonly MindFighter[]): CombatResult | null {
  if (!alive(playerOf({ fighters }))) return 'defeat';
  return livingEnemies(fighters).length > 0 ? null : 'victory';
}

function land(round: Round, attempt: Attempt): Round {
  const landing = clash(attempt.move, attempt.defence, round.range);
  const hit = applyLanding(round.fighters, { ...attempt, landing }, round.rng);
  return { ...round, fighters: hit.fighters, lines: [...round.lines, ...hit.lines] };
}

/** The player's exchange with one enemy: the enemy's move on you, and yours on them. */
function exchangeWith(round: Round, enemy: MindFighter, moves: Moves, isTarget: boolean): Round {
  const playerId = playerOf(round).id;
  const eMove = moves.enemy[enemy.id] ?? IDLE;
  const struck = land(round, {
    moverId: enemy.id,
    targetId: playerId,
    move: eMove,
    defence: moves.player,
  });
  const engages = isTarget || moves.player.kind === 'counter';
  if (!engages || moves.playerCutOff) return struck;
  return land(struck, {
    moverId: playerId,
    targetId: enemy.id,
    move: moves.player,
    defence: eMove,
  });
}

function allyMove(ally: MindFighter, range: RangeBand, rng: Rng): Move {
  const usable = ally.techniques.filter(
    (t) =>
      t.effect !== 'heal' && moveBlocker(ally, { kind: 'jutsu', technique: t }, range) === null,
  );
  if (usable.length > 0 && rng.chance(ALLY_JUTSU_CHANCE)) {
    return { kind: 'jutsu', technique: rng.pick(usable) };
  }
  return { kind: range === 'close' ? 'strike' : 'throw' };
}

function alliesAct(start: Round, enemyMoves: Moves['enemy']): Round {
  const allies = start.fighters.filter(
    (f) => f.side === 'player' && !f.isPlayer && alive(f) && f.stunned === 0,
  );
  return allies.reduce((round, ally) => {
    const target = livingEnemies(round.fighters)[0];
    if (!target) return round;
    const move = allyMove(ally, round.range, round.rng);
    const cast = { ...round, fighters: castJutsu(round.fighters, ally.id, move).fighters };
    const defence = enemyMoves[target.id] ?? IDLE;
    return land(cast, { moverId: ally.id, targetId: target.id, move, defence });
  }, start);
}

function upkeep(before: MindState, round: Round, moves: Moves): MindFighter[] {
  const startedStunned = new Set(before.fighters.filter((f) => f.stunned > 0).map((f) => f.id));
  const guarding = (f: MindFighter) =>
    (f.isPlayer ? moves.player : (moves.enemy[f.id] ?? IDLE)).kind === 'guard';
  return round.fighters.map((f) => ({
    ...f,
    stunned: startedStunned.has(f.id) ? Math.max(0, f.stunned - 1) : f.stunned,
    sealed: Math.max(0, f.sealed - 1),
    chakra: alive(f)
      ? Math.min(f.maxChakra, f.chakra + CHAKRA_REGEN + (guarding(f) ? GUARD_CHAKRA : 0))
      : f.chakra,
  }));
}

function playerMoveFor(state: MindState, choice: PlayerChoice, rng: Rng) {
  if (choice.kind === 'move') return { move: choice.move, line: null };
  if (choice.kind === 'recover') return { move: IDLE, line: 'You shake off the daze.' };
  if (rng.chance(fleeChance(state))) return { move: 'escaped' as const, line: null };
  return { move: IDLE, line: 'You try to slip away, but you are cut off!' };
}

/** Pays for every jutsu committed this round (and applies heals). */
function castAll(state: MindState, moves: Moves): { fighters: MindFighter[]; lines: string[] } {
  const all: [string, Move][] = [
    [playerOf(state).id, moves.player],
    ...Object.entries(moves.enemy),
  ];
  return all.reduce(
    (acc, [id, move]) => {
      const cast = castJutsu(acc.fighters, id, move);
      return { fighters: cast.fighters, lines: [...acc.lines, ...cast.lines] };
    },
    { fighters: [...state.fighters], lines: [] as string[] },
  );
}

export function nextPlans(
  fighters: readonly MindFighter[],
  range: RangeBand,
  rng: Rng,
): Record<string, EnemyPlan> {
  const reader = playerOf({ fighters });
  return Object.fromEntries(
    livingEnemies(fighters).map((e) => [e.id, planFor(e, reader, range, rng)]),
  );
}

function rangeLine(before: RangeBand, after: RangeBand): string[] {
  if (before === after) return [];
  const verb = after === stepIn(before) ? 'closes' : 'opens';
  return [`The distance ${verb}: ${RANGE_LABEL[after].toLowerCase()} range.`];
}

export function resolveRound(state: MindState, choice: PlayerChoice, rng: Rng): MindState {
  const opening = playerMoveFor(state, choice, rng);
  const header = [`— Round ${state.round} —`, ...(opening.line ? [opening.line] : [])];
  if (opening.move === 'escaped') {
    const log = [...state.log, ...header, 'You vanish in a swirl of leaves and escape!'];
    return { ...state, log: log.slice(-LOG_LIMIT), result: 'escaped' };
  }
  const enemies = livingEnemies(state.fighters);
  const enemy = Object.fromEntries(
    enemies.map((e) => [e.id, state.plans[e.id]?.move ?? chooseMove(e, state.range, rng)]),
  );
  const range = moved(state.range, [opening.move, ...Object.values(enemy)]);
  const playerCutOff = enemies.some((e) => interrupted(opening.move, enemy[e.id] ?? IDLE, range));
  const moves: Moves = { player: opening.move, enemy, playerCutOff };
  const cast = castAll(state, moves);
  const cutOff =
    playerCutOff && opening.move.technique
      ? [`Your ${opening.move.technique.name} is cut off mid-seal!`]
      : [];
  const targetId = choice.kind === 'move' ? choice.targetId : undefined;
  const target = enemies.find((e) => e.id === targetId) ?? enemies[0];
  const start: Round = {
    fighters: cast.fighters,
    lines: [...header, ...rangeLine(state.range, range), ...cast.lines, ...cutOff],
    range,
    rng,
  };
  const exchanged = enemies.reduce((r, e) => exchangeWith(r, e, moves, e.id === target?.id), start);
  const round = alliesAct(exchanged, enemy);
  const after = upkeep(state, round, moves);
  const result = decide(after);
  return {
    ...state,
    round: result ? state.round : state.round + 1,
    fighters: after,
    range,
    plans: result ? {} : nextPlans(after, range, rng),
    log: [...state.log, ...round.lines].slice(-LOG_LIMIT),
    result,
  };
}
