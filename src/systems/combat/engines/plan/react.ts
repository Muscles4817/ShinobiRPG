import { clamp, type Rng } from '@/core';

import { alive, strikeDamage } from '../../rules/body';
import { slotted } from './cards';
import { patch, type PlanFighter, type Round } from './state';

/**
 * Defence cards react on their own when their owner is hit at the distance they're slotted
 * for: Dodge may avoid the blow (speed), Guard softens it, Counter hits back up close
 * (taijutsu). A dazed fighter can't react.
 */

const GUARD_SCALE = 0.6;
const COUNTER_SCALE = 0.6;

export interface Blow {
  readonly raw: number;
  /** What hit, for the narration ("strike", "Fireball"). */
  readonly what: string;
  /** Genjutsu can't be dodged. */
  readonly dodgeable: boolean;
  /** Hand-to-hand and blades can be countered up close. */
  readonly physical: boolean;
}

export interface Hit {
  readonly attacker: PlanFighter;
  readonly target: PlanFighter;
  readonly blow: Blow;
  readonly rng: Rng;
}

function dodgeChance(attacker: PlanFighter, target: PlanFighter): number {
  return clamp(0.2 + (target.attributes.speed - attacker.attributes.speed) * 0.03, 0.05, 0.5);
}

function counterChance(attacker: PlanFighter, target: PlanFighter): number {
  const gap = target.attributes.taijutsu - attacker.attributes.taijutsu;
  return clamp(0.4 + gap * 0.03, 0.15, 0.65);
}

function counter(round: Round, { attacker, target, rng }: Hit): Round {
  const struck = round.fighters.find((f) => f.id === target.id);
  if (!struck || !alive(struck) || !rng.chance(counterChance(attacker, target))) return round;
  const damage = Math.max(
    1,
    Math.round(strikeDamage(target, attacker, rng.next()) * COUNTER_SCALE),
  );
  return {
    ...round,
    fighters: patch(round.fighters, attacker.id, {
      health: Math.max(0, attacker.health - damage),
    }),
    lines: [...round.lines, `${target.name} counters for ${damage}!`],
  };
}

/** Lands a blow on the target, letting their slotted defences react. */
export function react(round: Round, hit: Hit): Round {
  const { attacker, target, blow, rng } = hit;
  const ready = target.stunned > 0 ? [] : slotted(target, round.range);
  const has = (kind: 'guard' | 'dodge' | 'counter') => ready.some((c) => c.kind === kind);
  if (has('dodge') && blow.dodgeable && rng.chance(dodgeChance(attacker, target))) {
    return {
      ...round,
      lines: [...round.lines, `${target.name} slips past ${attacker.name}'s ${blow.what}.`],
    };
  }
  const guarded = has('guard');
  const damage = Math.max(1, Math.round(blow.raw * (guarded ? GUARD_SCALE : 1)));
  const landed: Round = {
    ...round,
    fighters: patch(round.fighters, target.id, { health: Math.max(0, target.health - damage) }),
    lines: [
      ...round.lines,
      `${attacker.name}'s ${blow.what} hits ${target.name} for ${damage}${guarded ? ' through a guard' : ''}.`,
    ],
  };
  const canCounter = has('counter') && blow.physical && round.range === 'close';
  return canCounter ? counter(landed, hit) : landed;
}
