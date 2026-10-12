import type { Rng } from '@/core';

import { alive } from '../../rules/body';
import { strikeDamage } from '../../rules/damage';
import { counterChance, dodgeChance, guardScale } from '../../rules/defence';
import { confuseChance, confusionTurns, HIDDEN_DAMAGE } from '../../rules/conditions';
import {
  canAttackFrom,
  hasTrait,
  kitDamageScale,
  packScale,
  shouldFlee,
  SWIFT_DODGE,
  type AttackKind,
} from '../../rules/kit';
import { harmLine } from '../../rules/narration';
import { slotted } from './cards';
import { canHit } from './rows';
import { fighterIn, isDazed, patch, say, type PlanFighter, type Round } from './state';

/**
 * Defence cards react on their own when their owner is hit at the distance they're slotted
 * for: Dodge may avoid the blow (evasion), Guard softens it (guard), Counter hits back up
 * close (taijutsu); see `rules/defence.ts`. A dazed fighter can't react. Kits shape every hit: armour and spirits shrug off
 * some kinds of attack, packs hit harder together, hidden attackers harder still, swift
 * fighters slip blows even without a Dodge, illusionists' hits confuse, and cowards run. A
 * counter is a blow up close, so it can't reach an attacker standing behind their front row.
 */

const COUNTER_SCALE = 0.6;
/** A swift fighter without a Dodge slotted still slips this much of the swift bonus. */
const SWIFT_INSTINCT = 0.5;

export interface Blow {
  readonly raw: number;
  /** What hit, for the narration ("strike", "Fireball"). */
  readonly what: string;
  /** Genjutsu can't be dodged. */
  readonly dodgeable: boolean;
  /** Hand-to-hand and blades can be countered up close. */
  readonly physical: boolean;
  /** Blow, blade, jutsu or seal: what armour and spirits care about. */
  readonly kind: AttackKind;
}

export interface Hit {
  readonly attacker: PlanFighter;
  readonly target: PlanFighter;
  readonly blow: Blow;
  readonly rng: Rng;
}

function avoidChance(attacker: PlanFighter, target: PlanFighter, dodging: boolean): number {
  const swift = hasTrait(target, 'swift') ? SWIFT_DODGE : 0;
  return dodging ? dodgeChance(attacker, target) + swift : swift * SWIFT_INSTINCT;
}

/** Damage after the defender's kit, the attacker's pack and whether they strike from hiding. */
function kitted(round: Round, attacker: PlanFighter, defender: PlanFighter, blow: Blow): number {
  const hidden = attacker.hidden ? HIDDEN_DAMAGE : 1;
  const pack = packScale(attacker, round.fighters);
  return blow.raw * kitDamageScale(defender, blow.kind) * pack * hidden;
}

function kitNote(defender: PlanFighter, kind: AttackKind): string[] {
  const scale = kitDamageScale(defender, kind);
  if (scale < 1) return [`Much of it glances off ${defender.name}.`];
  return scale > 1 ? [`The seal bites deep into ${defender.name}.`] : [];
}

/** Takes damage off a fighter; a coward who is now badly hurt runs and counts as beaten. */
function wound(round: Round, id: string, damage: number): Round {
  const struck = fighterIn(round, id);
  if (!struck) return round;
  const hurt = { ...struck, health: Math.max(0, struck.health - damage) };
  const fighters = patch(round.fighters, id, { health: hurt.health });
  if (!shouldFlee(hurt)) return { ...round, fighters };
  return say({ ...round, fighters: patch(fighters, id, { health: 0 }) }, `${struck.name} flees!`);
}

function confuse(round: Round, { attacker, target, rng }: Hit): Round {
  const chance = confuseChance(attacker, target);
  const struck = fighterIn(round, target.id);
  if (chance <= 0 || !struck || !alive(struck) || !rng.chance(chance)) return round;
  return say(
    {
      ...round,
      fighters: patch(round.fighters, target.id, { confused: confusionTurns(attacker, target) }),
    },
    `${target.name}'s senses swim in ${attacker.name}'s illusion.`,
  );
}

function counter(round: Round, { attacker, target, rng }: Hit): Round {
  const struck = fighterIn(round, target.id);
  if (!struck || !alive(struck) || !rng.chance(counterChance(attacker, target))) return round;
  const blow: Blow = {
    raw: strikeDamage(target, attacker, rng.next()) * COUNTER_SCALE,
    what: 'counter',
    dodgeable: false,
    physical: true,
    kind: 'blow',
  };
  const damage = Math.max(1, Math.round(kitted(round, struck, attacker, blow)));
  return wound(say(round, harmLine(`${target.name} counters!`, damage)), attacker.id, damage);
}

/** Lands a blow on the target, letting their slotted defences and kit react. */
export function react(round: Round, hit: Hit): Round {
  const { attacker, target, blow, rng } = hit;
  const ready = isDazed(target) ? [] : slotted(target, round.range);
  const has = (kind: 'guard' | 'dodge' | 'counter') => ready.some((c) => c.kind === kind);
  const avoid = blow.dodgeable ? avoidChance(attacker, target, has('dodge')) : 0;
  if (avoid > 0 && rng.chance(avoid)) {
    return say(round, `${target.name} slips past ${attacker.name}'s ${blow.what}.`);
  }
  const guarded = has('guard');
  const damage = Math.max(
    1,
    Math.round(
      kitted(round, attacker, target, blow) * (guarded ? guardScale(attacker, target) : 1),
    ),
  );
  const told = say(
    round,
    harmLine(
      `${attacker.name}'s ${blow.what} hits ${target.name}${guarded ? ' through a guard' : ''}.`,
      damage,
    ),
    ...kitNote(target, blow.kind),
  );
  const landed = confuse(wound(told, target.id, damage), hit);
  const canCounter =
    has('counter') &&
    blow.physical &&
    round.range === 'close' &&
    canAttackFrom(target, round.range) &&
    canHit({ kind: 'counter' }, attacker, round.fighters);
  return canCounter ? counter(landed, hit) : landed;
}
