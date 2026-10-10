import type { Rng } from '@/core';
import { clamp } from '@/core';

import type { RangeBand } from '../../contract';
import { hasPerk } from '../../rules/body';
import { canAttackFrom, homeBand } from '../../rules/kit';
import { RANGE_BANDS, stepBack, stepIn, stepTowards } from '../../rules/range';
import { moveBlocker, TELLS } from './moves';
import type { EnemyPlan, MindFighter, Move, MoveKind } from './state';

/**
 * Opponents commit to a move before the player chooses, and give away a tell. How often the
 * tell is honest depends on the player's perception and intellect against the opponent's
 * guile; insight (an awakened bloodline) always reads true. Kits decide where they fight from:
 * an archer never strikes up close, a brawler never from afar; out of reach they move.
 */

const BASE_HONESTY = 0.6;
const HONESTY_PER_POINT = 0.04;
const MOVE_TOWARDS_CHANCE = 0.5;
const JUTSU_CHANCE = 0.45;

/** Weights for basic moves by range. */
const HABITS: Readonly<Record<RangeBand, readonly [MoveKind, number][]>> = {
  close: [
    ['strike', 4],
    ['feint', 2],
    ['guard', 2],
    ['counter', 2],
  ],
  mid: [
    ['throw', 3],
    ['feint', 2],
    ['guard', 2],
    ['step-in', 2],
  ],
  far: [
    ['throw', 3],
    ['guard', 2],
    ['step-in', 2],
  ],
};

function weighted(options: readonly [MoveKind, number][], rng: Rng): MoveKind {
  const total = options.reduce((sum, [, w]) => sum + w, 0);
  let roll = rng.next() * total;
  for (const [kind, w] of options) {
    roll -= w;
    if (roll < 0) return kind;
  }
  return options[0]?.[0] ?? 'guard';
}

/** A step towards `goal`, or a guard when already there. */
export function footworkTowards(range: RangeBand, goal: RangeBand): Move {
  if (goal === range) return { kind: 'guard' };
  const closer = RANGE_BANDS.indexOf(stepTowards(range, goal)) < RANGE_BANDS.indexOf(range);
  return { kind: closer ? 'step-in' : 'step-back' };
}

/** Habits at this range, minus footwork that would take the fighter out of their reach. */
function habitsFor(self: MindFighter, range: RangeBand): [MoveKind, number][] {
  return HABITS[range].filter(([kind]) => {
    if (kind === 'step-in') return canAttackFrom(self, stepIn(range));
    if (kind === 'step-back') return canAttackFrom(self, stepBack(range));
    return true;
  });
}

export function chooseMove(self: MindFighter, range: RangeBand, rng: Rng): Move {
  if (self.stunned > 0) return { kind: 'idle' };
  const goal = homeBand(self);
  if (!canAttackFrom(self, range)) return footworkTowards(range, goal);
  if (goal !== range && rng.chance(MOVE_TOWARDS_CHANCE)) return footworkTowards(range, goal);
  const usable = self.techniques.filter(
    (t) =>
      t.effect !== 'heal' && moveBlocker(self, { kind: 'jutsu', technique: t }, range) === null,
  );
  const heal = self.techniques.find(
    (t) =>
      t.effect === 'heal' && moveBlocker(self, { kind: 'jutsu', technique: t }, range) === null,
  );
  if (heal && self.health < self.maxHealth * 0.35) return { kind: 'jutsu', technique: heal };
  if (usable.length > 0 && rng.chance(JUTSU_CHANCE)) {
    return { kind: 'jutsu', technique: rng.pick(usable) };
  }
  return { kind: weighted(habitsFor(self, range), rng) };
}

export function honestyChance(reader: MindFighter, opponent: MindFighter): number {
  const sight = reader.attributes.perception + reader.attributes.intellect / 2;
  const guile = opponent.attributes.genjutsu / 2 + opponent.attributes.intellect / 2;
  return clamp(BASE_HONESTY + (sight - guile) * HONESTY_PER_POINT, 0.4, 0.95);
}

const DECOYS: readonly MoveKind[] = ['strike', 'feint', 'guard', 'counter', 'jutsu'];

export function planFor(
  enemy: MindFighter,
  reader: MindFighter,
  range: RangeBand,
  rng: Rng,
): EnemyPlan {
  const move = chooseMove(enemy, range, rng);
  const certain = hasPerk(reader, 'insight');
  const honest = certain || move.kind === 'idle' || rng.chance(honestyChance(reader, enemy));
  const shown = honest ? move.kind : rng.pick(DECOYS.filter((k) => k !== move.kind));
  return { move, tell: TELLS[shown], honest, certain };
}
