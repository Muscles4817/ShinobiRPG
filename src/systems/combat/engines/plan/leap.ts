import { clamp, type Rng } from '@/core';

import { causeLine } from '../../rules/causes';
import { maxBreath } from '../../rules/breath';
import { withinGround } from '../../rules/ground';
import { stepBack } from '../../rules/range';
import { tell } from '../../rules/telling';
import { distanceBetween } from './distance';
import { pairsMoved } from './groundPlay';
import { readyDefences } from './readiness';
import { patch, say, type PlanFighter, type Round } from './state';
import { FOLLOW_BY_WEIGHT, type AttackWeight } from './weight';

/**
 * A Dodge is a choice (the owner's decision, `docs/design/combat-ai-plan.md` Part 13b): a plain
 * Dodge slips what comes and stays in range; **Dodge clear** slips it and springs back a
 * distance (close to mid, mid to far), paid in breath. What it slipped matters: a heavy attack's
 * thrower is too committed to follow, a light one's can likely keep pace, faster than the
 * dodger the more surely. Without the breath for it, the dodger stays where they are.
 */

/** Breath a spring clear costs. */
export const LEAP_BREATH = 8;
/** The chance an even, light-handed attacker keeps pace with someone springing clear. */
const FOLLOW_BASE = 0.55;
const FOLLOW_PER_SPEED = 0.03;
const FOLLOW_MIN = 0.1;
const FOLLOW_MAX = 0.9;

const LEAPS_CLEAR = '{a} spring{a.s} clear of {t}.';
const FOLLOWED = '{a} spring{a.s} back, but {t} {t.is} right with {a.them}.';

/** What a slip was of: who threw it, how heavy it was, and the roll for following. */
export interface Slipped {
  readonly attacker: PlanFighter;
  readonly weight: AttackWeight;
  readonly rng: Rng;
}

function clears(round: Round, dodger: PlanFighter): boolean {
  return readyDefences(dodger, round).some((c) => c.kind === 'dodge' && c.clear === true);
}

function followChance(dodger: PlanFighter, { attacker, weight }: Slipped): number {
  const gap = attacker.attributes.speed - dodger.attributes.speed;
  const even = clamp(FOLLOW_BASE + gap * FOLLOW_PER_SPEED, FOLLOW_MIN, FOLLOW_MAX);
  return even * FOLLOW_BY_WEIGHT[weight];
}

/** After a ready Dodge slipped an attack: a dodger who keeps Dodge clear springs back. */
export function leapClear(round: Round, dodger: PlanFighter, slipped: Slipped): Round {
  if (!clears(round, dodger)) return round;
  const { attacker } = slipped;
  const at = distanceBetween(round, dodger.id, attacker.id);
  const to = withinGround(round.ground, stepBack(at));
  const breath = dodger.breath ?? maxBreath(dodger.attributes);
  if (to === at || breath < LEAP_BREATH) return round;
  const paid = {
    ...round,
    fighters: patch(round.fighters, dodger.id, { breath: breath - LEAP_BREATH }),
  };
  // Asked even when it can't be followed, so the fight's rolls stay as they were.
  const kept = slipped.rng.chance(followChance(dodger, slipped));
  // The leap is the dodger's step back, and it failed: the attacker kept pace with it.
  const followed = causeLine(tell(FOLLOWED, { a: dodger, t: attacker }), 'kept-pace', dodger.id);
  if (kept) return say(paid, followed);
  return pairsMoved(
    paid,
    [{ a: dodger.id, b: attacker.id, to }],
    tell(LEAPS_CLEAR, { a: dodger, t: attacker }),
  );
}
