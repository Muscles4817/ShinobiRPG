import { clamp, logistic } from '@/core';

import type { CombatTechnique } from '../../contract';
import type { Fighter } from './state';

/** Chance the defender sidesteps a physical attack, max 30%. */
export function dodgeChance(attacker: Fighter, defender: Fighter): number {
  return 0.3 * logistic((defender.attributes.speed - attacker.attributes.speed) / 5);
}

function mitigate(raw: number, defender: Fighter): number {
  const armoured = raw - defender.attributes.stamina * 0.3;
  const guarded = defender.guarding ? armoured / 2 : armoured;
  return Math.max(1, Math.round(guarded));
}

export function strikeDamage(attacker: Fighter, defender: Fighter, variance: number): number {
  const { strength, taijutsu } = attacker.attributes;
  return mitigate((4 + strength * 0.5 + taijutsu * 0.5) * variance, defender);
}

export function techniqueDamage(
  attacker: Fighter,
  defender: Fighter,
  technique: CombatTechnique,
  variance: number,
): number {
  const skill = attacker.attributes[technique.discipline];
  const bonus = PHYSICAL_BONUS[technique.discipline](attacker);
  return mitigate((technique.power * (1 + skill / 20) + bonus) * variance, defender);
}

/** Genjutsu is resisted by willpower; everything else by perception (seeing it coming). */
export function resistChance(
  attacker: Fighter,
  defender: Fighter,
  technique: CombatTechnique,
): number {
  const skill = attacker.attributes[technique.discipline];
  const defence =
    technique.discipline === 'genjutsu'
      ? defender.attributes.willpower
      : defender.attributes.perception;
  return clamp(0.6 * logistic((defence - skill) / 4), 0.05, 0.6);
}

/** Physical disciplines add body stats on top of skill: fists use strength, blades speed too. */
const PHYSICAL_BONUS: Readonly<Record<CombatTechnique['discipline'], (f: Fighter) => number>> = {
  taijutsu: (f) => f.attributes.strength * 0.3,
  kenjutsu: (f) => f.attributes.strength * 0.15 + f.attributes.speed * 0.15,
  ninjutsu: () => 0,
  genjutsu: () => 0,
  fuuinjutsu: () => 0,
};

/** Rounds a seal lasts: stronger seals hold longer. */
export function sealTurns(technique: CombatTechnique): number {
  return technique.power >= 12 ? 3 : 2;
}

export function stunTurns(technique: CombatTechnique): number {
  return technique.power >= 12 ? 2 : 1;
}

export function healAmount(user: Fighter, technique: CombatTechnique): number {
  return Math.round(technique.power * (1 + user.attributes.ninjutsu / 25));
}

export function fleeChance(runner: Fighter, chasers: readonly Fighter[]): number {
  const fastest = Math.max(...chasers.map((c) => c.attributes.speed));
  return clamp(0.4 + (runner.attributes.speed - fastest) * 0.05, 0.1, 0.9);
}

export const CHAKRA_REGEN_PER_ROUND = 2;
export const GUARD_CHAKRA_GAIN = 5;
