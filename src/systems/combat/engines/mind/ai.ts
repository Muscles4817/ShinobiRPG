import type { Rng } from '@/core';
import { clamp } from '@/core';

import type { RangeBand } from '../../contract';
import { hasPerk } from '../../rules/body';
import { preferredRange, RANGE_BANDS, stepTowards } from '../../rules/range';
import { moveBlocker, TELLS } from './moves';
import type { EnemyPlan, MindFighter, Move, MoveKind } from './state';

/**
 * Opponents commit to a move before the player chooses, and give away a tell. How often the
 * tell is honest depends on the player's perception and intellect against the opponent's
 * guile; insight (an awakened bloodline) always reads true.
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

export function chooseMove(self: MindFighter, range: RangeBand, rng: Rng): Move {
  if (self.stunned > 0) return { kind: 'idle' };
  const goal = preferredRange(self);
  if (goal !== range && rng.chance(MOVE_TOWARDS_CHANCE)) {
    const closer = RANGE_BANDS.indexOf(stepTowards(range, goal)) < RANGE_BANDS.indexOf(range);
    return { kind: closer ? 'step-in' : 'step-back' };
  }
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
  return { kind: weighted(HABITS[range], rng) };
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
