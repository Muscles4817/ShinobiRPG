import { clamp, type Rng } from '@/core';

import type { CombatResult, RangeBand } from '../../contract';
import { alive, targetable } from '../../rules/body';
import { revealOnAttack } from '../../rules/items';
import { canAttackFrom } from '../../rules/kit';
import { RANGE_LABEL, stepBack, stepIn } from '../../rules/range';
import { chooseMove, planFor } from './ai';
import { allyMoves, allyTarget, fightingAllies } from './allies';
import { clash, interrupted, netStep } from './exchange';
import { isAttack } from './moves';
import { rehide, sense } from './senses';
import { applyLanding, castJutsu } from './strike';
import { useTool } from './tools';
import {
  LOG_LIMIT,
  playerOf,
  type EnemyPlan,
  type MindFighter,
  type MindState,
  type Move,
} from './state';

/** Plays out one round of the mind game: senses, movement, every exchange, allies, upkeep. */

const CHAKRA_REGEN = 2;
const GUARD_CHAKRA = 5;
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
  /** The player is out of sight this exchange (smoke): enemies can't go at them. */
  readonly playerHidden: boolean;
}

interface Moves {
  readonly player: Move;
  readonly enemy: Readonly<Record<string, Move>>;
  readonly allies: Readonly<Record<string, Move>>;
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

/**
 * An enemy's move on you, or, while you're hidden, on a teammate they can see; with no one in
 * sight the attack is lost.
 */
function enemyGoesAt(round: Round, enemy: MindFighter, eMove: Move, moves: Moves): Round {
  const attempt = { moverId: enemy.id, move: eMove };
  if (!round.playerHidden || !isAttack(eMove)) {
    return land(round, { ...attempt, targetId: playerOf(round).id, defence: moves.player });
  }
  const ally = round.fighters.find((f) => f.side === 'player' && !f.isPlayer && targetable(f));
  if (!ally) return { ...round, lines: [...round.lines, `${enemy.name} loses sight of you.`] };
  return land(round, { ...attempt, targetId: ally.id, defence: moves.allies[ally.id] ?? IDLE });
}

/**
 * The player's exchange with one enemy: the enemy's move on you, and yours on them. A hidden
 * enemy can't be struck back, not even by a counter.
 */
function exchangeWith(round: Round, enemy: MindFighter, moves: Moves, isTarget: boolean): Round {
  const playerId = playerOf(round).id;
  const eMove = moves.enemy[enemy.id] ?? IDLE;
  const struck = enemyGoesAt(round, enemy, eMove, moves);
  const engages = isTarget || moves.player.kind === 'counter';
  if (!engages || moves.playerCutOff || enemy.hidden) return struck;
  return land(struck, {
    moverId: playerId,
    targetId: enemy.id,
    move: moves.player,
    defence: eMove,
  });
}

function alliesAct(start: Round, moves: Moves): Round {
  return fightingAllies(start.fighters).reduce((round, ally) => {
    const target = allyTarget(round.fighters);
    const move = moves.allies[ally.id] ?? IDLE;
    if (!target || !isAttack(move) || !canAttackFrom(ally, round.range)) return round;
    const cast = { ...round, fighters: castJutsu(round.fighters, ally.id, move).fighters };
    const defence = moves.enemy[target.id] ?? IDLE;
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
function castAll(
  fighters: MindFighter[],
  moves: Moves,
): { fighters: MindFighter[]; lines: string[] } {
  const all: [string, Move][] = [
    [playerOf({ fighters }).id, moves.player],
    ...Object.entries(moves.enemy),
  ];
  return all.reduce(
    (acc, [id, move]) => {
      const cast = castJutsu(acc.fighters, id, move);
      return { fighters: cast.fighters, lines: [...acc.lines, ...cast.lines] };
    },
    { fighters, lines: [] as string[] },
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

/** The foe the player meant, or the first one they can see. */
function targetOf(enemies: readonly MindFighter[], choice: PlayerChoice): MindFighter | undefined {
  const targetId = choice.kind === 'move' ? choice.targetId : undefined;
  const chosen = enemies.find((e) => e.id === targetId);
  return chosen && targetable(chosen) ? chosen : enemies.find(targetable);
}

/** Everyone's committed moves, and where they leave the range. */
function commit(state: MindState, fighters: MindFighter[], player: Move, rng: Rng) {
  const enemies = livingEnemies(fighters);
  const enemy = Object.fromEntries(
    enemies.map((e) => [e.id, state.plans[e.id]?.move ?? chooseMove(e, state.range, rng)]),
  );
  const allies = allyMoves(fighters, state.range, rng);
  const steps = [player, ...Object.values(enemy), ...Object.values(allies)];
  const range = moved(state.range, steps);
  const playerCutOff = enemies.some((e) => interrupted(player, enemy[e.id] ?? IDLE, range));
  const moves: Moves = { player, enemy, allies, playerCutOff };
  return { enemies, moves, range };
}

/** Attacking (hit or miss) gives a smoke-hidden player away, once every exchange is done. */
function revealed(round: Round, attempted: Move): Round {
  if (!isAttack(attempted)) return round;
  const fighters = round.fighters.map((f) => (f.isPlayer ? revealOnAttack(f) : f));
  return { ...round, fighters };
}

export function resolveRound(state: MindState, choice: PlayerChoice, rng: Rng): MindState {
  const opening = playerMoveFor(state, choice, rng);
  const header = [`— Round ${state.round} —`, ...(opening.line ? [opening.line] : [])];
  if (opening.move === 'escaped') {
    const log = [...state.log, ...header, 'You vanish in a swirl of leaves and escape!'];
    return { ...state, log: log.slice(-LOG_LIMIT), result: 'escaped' };
  }
  const sensed = sense([...state.fighters], opening.move, rng);
  const { enemies, moves, range } = commit(state, sensed.fighters, sensed.move, rng);
  const cast = castAll(sensed.fighters, moves);
  const technique = moves.playerCutOff ? moves.player.technique : undefined;
  const cutOff = technique ? [`Your ${technique.name} is cut off mid-seal!`] : [];
  const target = targetOf(enemies, choice);
  const tool = useTool(cast.fighters, moves.player, target?.id, rng);
  const start: Round = {
    fighters: tool.fighters,
    lines: [
      ...header,
      ...sensed.lines,
      ...rangeLine(state.range, range),
      ...cast.lines,
      ...tool.lines,
      ...cutOff,
    ],
    range,
    rng,
    playerHidden: playerOf({ fighters: tool.fighters }).hidden,
  };
  const exchanged = enemies.reduce((r, e) => exchangeWith(r, e, moves, e.id === target?.id), start);
  const round = alliesAct(exchanged, moves);
  const kept = upkeep(state, revealed(round, opening.move), moves);
  const result = decide(kept);
  const after = result ? { fighters: kept, lines: [] } : rehide(kept, state.round + 1);
  return {
    ...state,
    round: result ? state.round : state.round + 1,
    fighters: after.fighters,
    range,
    plans: result ? {} : nextPlans(after.fighters, range, rng),
    log: [...state.log, ...round.lines, ...after.lines].slice(-LOG_LIMIT),
    result,
  };
}
