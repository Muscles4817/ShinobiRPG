import type { Rng } from '@/core';
import type { Accuracy, Discipline } from '@/systems/techniques';

import { alive } from '../../rules/body';
import { cappedHit, strikeDamage } from '../../rules/damage';
import { counterChance, dodgeChance, guardScale, slipChance } from '../../rules/defence';
import { confuseChance, confusionTurns, HIDDEN_DAMAGE } from '../../rules/conditions';
import {
  canAttackFrom,
  hasTrait,
  kitDamageScale,
  packScale,
  SWIFT_DODGE,
  type AttackKind,
} from '../../rules/kit';
import { harmLine, reactionLine, type NarrationReaction } from '../../rules/narration';
import type { RangeBand } from '../../contract';
import { brokenScale, covered, dulled, isPinned, PIN_SLIP, substitutable } from '../../rules/verbs';
import type { Card } from './cards';
import { reactionAt } from './readiness';
import { defenceKind, noteDefence } from './reads';
import { throughClones } from './decoys';
import { substituted } from './footwork';
import { riposteFirst } from './lingering';
import { wound } from './wound';
import { canHit } from './rows';
import { isDazed } from './daze';
import { fighterIn, patch, say, type DefenceKind, type PlanFighter, type Round } from './state';

/**
 * The defence a fighter keeps ready at a distance (`readiness.ts`) reacts on its own when they
 * are hit there: Dodge may avoid the blow (evasion), Guard softens it (guard), Counter hits back up
 * close (taijutsu); see `rules/defence.ts`. A dazed fighter can only guard, and a break goes
 * straight through a guard. Kits shape every hit: armour and spirits shrug off some kinds of
 * attack (less of a break), packs hit harder together, hidden attackers harder still, swift
 * fighters slip blows even without a Dodge, illusionists' hits confuse, and cowards run. A
 * counter is a blow up close, so it can't reach an attacker standing behind their front row.
 * Before any of it, a clone may take the blow instead (`decoys.ts`).
 */

const COUNTER_SCALE = 0.6;
/** A swift fighter without a Dodge ready still slips this much of the swift bonus. */
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
  /** A break: goes through a guard, and through part of armour and a spirit's form. */
  readonly breaks?: boolean;
  /** The art behind a technique's hit (a substitution can't swap out of a genjutsu). */
  readonly discipline?: Discipline;
  /** An area hit: bursts every clone and still reaches its target (`decoys.ts`). */
  readonly area?: boolean;
  /** Share of a guard it goes through (knuckles, a sundering weapon: `rules/weapons.ts`). */
  readonly pierce?: number;
  /** How hard it is to slip (a technique's accuracy; steady when unset). */
  readonly accuracy?: Accuracy;
  /**
   * A later blow of a flurry: a Guard or a Counter has already met the first, so only a Dodge
   * (each blow on its own) stands in its way.
   */
  readonly followUp?: true;
}

export interface Hit {
  readonly attacker: PlanFighter;
  readonly target: PlanFighter;
  readonly blow: Blow;
  readonly rng: Rng;
}

function avoidChance(hit: Hit, target: PlanFighter, dodging: boolean): number {
  const swift = hasTrait(target, 'swift') ? SWIFT_DODGE : 0;
  const chance = dodging ? dodgeChance(hit.attacker, target) + swift : swift * SWIFT_INSTINCT;
  return slipChance(chance * (isPinned(target) ? PIN_SLIP : 1), hit.blow.accuracy);
}

/**
 * Damage after the defender's kit, the attacker's pack and whether they strike from hiding (or
 * from a field that covers them).
 */
function kitted(round: Round, attacker: PlanFighter, defender: PlanFighter, blow: Blow): number {
  const unseen = attacker.hidden || covered(round.field, attacker, defender);
  const hidden = unseen ? HIDDEN_DAMAGE : 1;
  const pack = packScale(attacker, round.fighters);
  const kit = kitDamageScale(defender, blow.kind);
  return blow.raw * (blow.breaks ? brokenScale(kit) : kit) * pack * hidden;
}

function kitNote(defender: PlanFighter, kind: AttackKind): string[] {
  const scale = kitDamageScale(defender, kind);
  if (scale < 1) return [`Much of it glances off ${defender.name}.`];
  return scale > 1 ? [`The seal bites deep into ${defender.name}.`] : [];
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
  const damage = cappedHit(
    Math.max(1, Math.round(kitted(round, struck, attacker, blow))),
    attacker.maxHealth,
  );
  return wound(
    say(round, harmLine(reactionLine(`${target.name} counters!`, 'countered'), damage)),
    attacker.id,
    damage,
  );
}

/** What a Guard lets through of this blow: a piercing weapon goes partly through it. */
function guardLets(attacker: PlanFighter, target: PlanFighter, blow: Blow): number {
  const kept = guardScale(attacker, target);
  return kept + (1 - kept) * (blow.pierce ?? 0);
}

function guardWords(guarded: boolean, smashed: boolean): string {
  if (smashed) return ', smashing through the guard';
  return guarded ? ' through a guard' : '';
}

interface Defended {
  /** A Dodge was ready and tried for this blow. */
  readonly dodgeTried: boolean;
  readonly guarded: boolean;
  readonly smashed: boolean;
}

/** Which ready defence reacted to a blow that landed anyway, for the fight screen. */
function reactionsTo({ dodgeTried, guarded, smashed }: Defended): NarrationReaction[] {
  return [
    ...(dodgeTried ? (['dodge-missed'] as const) : []),
    ...(guarded ? (['guarded'] as const) : []),
    ...(smashed ? (['guard-broken'] as const) : []),
  ];
}

type Ready = (kind: 'guard' | 'dodge' | 'counter') => boolean;

interface Evasion {
  /** The round with the blow slipped, or null when it still lands. */
  readonly slipped: Round | null;
  /** A ready Dodge tried for it. */
  readonly tried: boolean;
}

/** A Dodge (or a swift fighter's instinct) against one blow. */
function evade(round: Round, hit: Hit, has: Ready): Evasion {
  const { attacker, target, blow, rng } = hit;
  const able = blow.dodgeable && !isDazed(target);
  const tried = able && has('dodge');
  const avoid = able ? avoidChance(hit, dulled(round.field, target), has('dodge')) : 0;
  if (avoid <= 0 || !rng.chance(avoid)) return { slipped: null, tried };
  const line = `${target.name} slips past ${attacker.name}'s ${blow.what}.`;
  // A swift fighter slips some blows on instinct; only a ready Dodge is shown reacting.
  return { slipped: say(round, tried ? reactionLine(line, 'dodged') : line), tried };
}

/** A Counter answers a hand-to-hand blow up close, if the attacker is in reach. */
function canCounterBack(round: Round, { attacker, target, blow }: Hit, has: Ready): boolean {
  return (
    has('counter') &&
    blow.physical &&
    !blow.followUp &&
    round.range === 'close' &&
    canAttackFrom(target, round.range) &&
    canHit({ kind: 'counter' }, attacker, round.fighters)
  );
}

/** The defence a blow brings into play, as onlookers see it; none when it can't answer it. */
function shown(ready: readonly Card[], blow: Blow, band: RangeBand): DefenceKind | null {
  const [kept] = ready;
  const kind = kept ? defenceKind(kept) : null;
  switch (kind) {
    case 'guard':
      return blow.followUp ? null : kind;
    case 'dodge':
      return blow.dodgeable ? kind : null;
    case 'counter':
      return blow.physical && band === 'close' ? kind : null;
    case 'swap':
      return substitutable(blow.discipline) ? kind : null;
    case null:
      return null;
  }
}

/** Lands a blow on the target, letting their clones, ready defence and kit react. */
export function react(start: Round, hit: Hit): Round {
  const answered = riposteFirst(start, hit);
  if (answered.stopped) return answered.round;
  const before = answered.round;
  const { attacker, target, blow, rng } = hit;
  const area = blow.area === true;
  const decoyed = throughClones(before, { attacker, target, what: blow.what, area, rng });
  if (decoyed.absorbed) return decoyed.round;
  // Reeling from a daze, a fighter can still put a guard up, but not dodge, counter or swap out.
  const reeling = isDazed(target);
  const kept = reactionAt(target, decoyed.round.range);
  const ready = kept && (!reeling || kept.kind === 'guard') ? [kept] : [];
  // A defence that comes into play gives itself away to everyone facing its owner.
  const band = decoyed.round.range;
  const round = noteDefence(decoyed.round, target.id, band, shown(ready, blow, band));
  const has: Ready = (kind) => ready.some((c) => c.kind === kind);
  const evasion = evade(round, hit, has);
  if (evasion.slipped) return evasion.slipped;
  const swap = { target, attacker, what: blow.what, discipline: blow.discipline };
  const swapped = substituted(round, ready, swap);
  if (swapped) return swapped;
  const guarding = has('guard') && !blow.followUp;
  const guarded = guarding && !blow.breaks;
  const smashed = guarding && blow.breaks === true;
  const damage = cappedHit(
    Math.max(
      1,
      Math.round(
        kitted(round, attacker, target, blow) * (guarded ? guardLets(attacker, target, blow) : 1),
      ),
    ),
    target.maxHealth,
  );
  const told = say(
    round,
    harmLine(
      reactionLine(
        `${attacker.name}'s ${blow.what} hits ${target.name}${blow.followUp ? ' again' : ''}${guardWords(guarded, smashed)}.`,
        ...reactionsTo({ dodgeTried: evasion.tried, guarded, smashed }),
      ),
      damage,
    ),
    ...kitNote(target, blow.kind),
  );
  const landed = confuse(wound(told, target.id, damage), hit);
  return canCounterBack(round, hit, has) ? counter(landed, hit) : landed;
}
