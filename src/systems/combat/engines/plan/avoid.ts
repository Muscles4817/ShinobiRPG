import { bracedAvoid } from './braced';
import type { Accuracy, AreaSize, Discipline } from '@/systems/techniques';

import type { CombatTechnique } from '../../contract';
import {
  avoidCeiling,
  avoidChance,
  avoidRating,
  readRating,
  readScale,
  tellRating,
  type AttackForm,
  type AvoidRoll,
} from '../../rules/avoidance';
import { FORESIGHT_SEES, FORESIGHT_SEES_THROUGH, FORESIGHT_SLIP, foreseen } from '../../rules/eyes';
import { familiarScale } from '../../rules/familiarity';
import { handsFull, HANDS_FULL_ARRIVAL, HANDS_FULL_READ } from '../../rules/blades';
import { footingOf } from '../../rules/ground';
import { weaponSkill } from '../../rules/weapons';
import { hasTrait, SWIFT_DODGE, type AttackKind } from '../../rules/kit';
import {
  areaSize,
  driveOf,
  dulled,
  effectsOf,
  isPinned,
  landingUse,
  PIN_SLIP,
} from '../../rules/verbs';
import { committedTo } from './commitment';
import { isGathering } from './gather';
import { carrierOf, leapingClear } from './riding';
import { GATHER_OPEN } from '../../rules/gather';
import { isDazed } from './daze';
import { readsInTheMoment } from './judgement';
import { readyDefences } from './readiness';
import { settledSlips, swarmSlips } from './swarm';
import { blindedSlips, dustArrival } from './dust';
import type { PlanFighter, Round } from './state';
import { sizeSlips } from '../../rules/size';
import { hasPerk } from '../../rules/body';
import { techniqueDamage } from '../../rules/damage';
import { killingSlipScale, type KillingMoment } from '../../rules/lethal';
import { isOpen } from './finishers';
import { seesThroughIllusions } from '../../rules/eyes';
import { watched } from './sharedMind';
import { distanceBetween } from './distance';
import { DODGE_BY_WEIGHT, weightOf } from './weight';

/**
 * The avoid roll in a planned fight (`rules/avoidance.ts`), from the fighters as they stand: a
 * ready Dodge, a committed Evade, a daze (no slipping anything), a pin, footing on this ground, a field dulling the
 * defender's eyes, a swift kit, a technique leaned on (read more easily by a mind that reads
 * the fight), insects (a swarm's speed and camouflage, glowing or blinding insects settled on
 * someone) and foresight.
 */

/** A swift fighter slips this much more with a Dodge ready, half of it without. */
export const SWIFT_INSTINCT = 0.5;

/** One attack on its way to one defender. */
export interface Incoming {
  readonly form: AttackForm;
  readonly attacker: PlanFighter;
  readonly target: PlanFighter;
  /** The attacker's skill behind it: their drive for a technique, their art for a blow. */
  readonly skill: number;
  readonly discipline?: Discipline;
  readonly accuracy?: Accuracy;
  readonly areaSize?: AreaSize;
  /** How much more easily it is read for having been leaned on (`familiarScale`). */
  readonly familiar?: number;
  /** A swarm attack's slip scale (`swarm.ts`: its insects' speed and camouflage). */
  readonly swarm?: number;
  /** Share of the target's health it would take, which a good read saves Evade for. */
  readonly threat?: number;
  /** The attacker's speed behind a body's attack, which may outpace the target (`pace.ts`). */
  readonly paceSpeed?: number;
  /**
   * A killing blow on a target who can't meet it (`rules/lethal.ts`): held, nothing slips it
   * (0); unseen, far less often.
   */
  readonly killing?: number;
}

/** A Dodge is the target's ready defence here. */
export function dodgesHere(round: Round, target: PlanFighter): boolean {
  return readyDefences(target, round).some((c) => c.kind === 'dodge');
}

/** How much foresight lifts the slip: a blow, a technique, an illusion most of all. */
function foresightScale({ form, discipline }: Incoming): number {
  if (form !== 'technique') return FORESIGHT_SLIP;
  return discipline === 'genjutsu' ? FORESIGHT_SEES_THROUGH : FORESIGHT_SEES;
}

/** The chance this attack doesn't reach its target. */
export function avoidOdds(round: Round, incoming: Incoming): number {
  // Eyes that see everything see an illusion for what it is (`rules/eyes.ts`), and a puppet
  // Caught waiting on a counter read wrong, they are as open as the dazed (`counter.ts`).
  if (incoming.target.exposed === true) return 0;
  const illusion = incoming.discipline === 'genjutsu';
  // has no mind to fool (`rules/puppets.ts`).
  const unfooled = seesThroughIllusions(incoming.target) || incoming.target.puppet === true;
  if (illusion && unfooled) return 1;
  const odds = avoidRoll(round, incoming);
  // A mind braced for an illusion fights it off with its own control (`braced.ts`).
  return illusion
    ? bracedAvoid(round, { target: incoming.target, caster: incoming.attacker, odds })
    : odds;
}

/**
 * Everything one avoid roll weighs, gathered once: the rules' roll, what scales it here (insects,
 * dust, footing, the body), and the defender as they meet it. `causes.ts` reads why a slip
 * happened from the same parts the odds came from.
 */
export interface AvoidParts {
  readonly roll: AvoidRoll;
  /** What scales the roll here, multiplied in this order: insects, dust, footing, the body. */
  readonly scales: readonly [number, number, number, number];
  readonly target: PlanFighter;
  /** Their eyes see it coming (`foresight`): the slip is lifted by this much. */
  readonly foresight: number | null;
  /** How much more easily it was read for having been leaned on (in the roll's `read`). */
  readonly familiar: number;
}

/** The parts of one avoid roll; null when nothing can slip it (dazed, held for a killing blow). */
export function avoidParts(round: Round, incoming: Incoming): AvoidParts | null {
  // A still rider is carried clear by their mount, or not at all (`riding.ts`).
  const mount = carrierOf(round, incoming.target);
  if (mount) return avoidParts(round, { ...incoming, target: leapingClear(mount) });
  const { attacker } = incoming;
  const target = dulled(round.field, incoming.target);
  if (isDazed(target) || incoming.killing === 0) return null;
  const roll = rollOf(round, incoming, target);
  const insects =
    (incoming.swarm ?? 1) *
    settledSlips(round, attacker, target) *
    (isGathering(target) ? GATHER_OPEN : 1);
  const dust = blindedSlips(attacker);
  // A big body is a big target (`size.ts`).
  const scales = [
    insects,
    dust,
    footingOf(round.ground, target),
    bodyScale(target, incoming),
  ] as const;
  const foresight = roll.seesAll === true ? foresightScale(incoming) : null;
  return { roll, scales, target, foresight, familiar: incoming.familiar ?? 1 };
}

/** The rules' roll for one attack on a defender as they meet it. */
function rollOf(round: Round, incoming: Incoming, target: PlanFighter): AvoidRoll {
  const { attacker, form } = incoming;
  const dodging = dodgesHere(round, target);
  const swift = hasTrait(target, 'swift') ? SWIFT_DODGE * (dodging ? 1 : SWIFT_INSTINCT) : 0;
  const read = readScale(readRating(target), tellRating(attacker, incoming.skill), form);
  return {
    seesAll: hasPerk(target, 'foresight'),
    form,
    rating: avoidRating(target, incoming.discipline),
    arrival: form === 'technique' ? incoming.skill : attacker.attributes.speed,
    read: read * (incoming.familiar ?? 1),
    dodging,
    ...(dodging ? { dodgeScale: DODGE_BY_WEIGHT[weightOf(incoming)] } : {}),
    evading: committedTo(target, 'evade'),
    ...(incoming.threat === undefined ? {} : { threat: incoming.threat }),
    ...(incoming.paceSpeed === undefined ? {} : { paceSpeed: incoming.paceSpeed }),
    bonus: swift,
    ...(incoming.accuracy ? { accuracy: incoming.accuracy } : {}),
    ...(incoming.areaSize ? { areaSize: incoming.areaSize } : {}),
  };
}

/** The chance an attack is slipped, from the roll's parts. */
export function partsOdds({ roll, scales, target, foresight }: AvoidParts): number {
  const [insects, dust, footing, body] = scales;
  const held = avoidChance(roll) * insects * dust * footing * body;
  const ceiling = avoidCeiling(roll.evading === true, roll.seesAll === true);
  return foreseen(held, target, { scale: foresight ?? 1, ceiling });
}

function avoidRoll(round: Round, incoming: Incoming): number {
  const parts = avoidParts(round, incoming);
  return parts ? partsOdds(parts) : 0;
}

/** How the target's own body bears on a slip: held, big, or unable to see a killing blow. */
function bodyScale(target: PlanFighter, incoming: Incoming): number {
  return (isPinned(target) ? PIN_SLIP : 1) * sizeSlips(target) * (incoming.killing ?? 1);
}

/** Share of the target's health a technique's wounding effects would take, mid-roll. */
export function threatOf(attacker: PlanFighter, target: PlanFighter, t: CombatTechnique): number {
  const wounding = t.effects.filter(
    (e) => e.verb === 'damage' || e.verb === 'area' || e.verb === 'break',
  );
  const total = wounding.reduce(
    (sum, effect) => sum + techniqueDamage(attacker, target, { technique: t, effect }, 0.5),
    0,
  );
  return total / Math.max(1, target.maxHealth);
}

/** A technique on its way to one foe; null when nothing in it is aimed at a foe. */
export function techniqueIncoming(
  attacker: PlanFighter,
  target: PlanFighter,
  t: CombatTechnique,
  round: Pick<Round, 'range' | 'distances' | 'fighters'>,
): Incoming | null {
  const band = distanceBetween(round, attacker.id, target.id);
  const use = landingUse(t);
  if (!use) return null;
  const [area] = effectsOf(t, 'area');
  const body = t.discipline === 'taijutsu' || t.discipline === 'kenjutsu';
  // Only a mind that reads the fight picks up on a technique leaned on.
  const familiar = readsInTheMoment(target) ? familiarScale(attacker.uses?.[t.id] ?? 0) : 1;
  // Signs made around a drawn blade come slower and give more away (`blades.ts`).
  const full = handsFull(attacker, t, band);
  return {
    form: 'technique',
    attacker,
    target,
    // Dust arrives at its own pace, however strong its master (`dust.ts`).
    skill: dustArrival(attacker, t) ?? driveOf(attacker, use) * (full ? HANDS_FULL_ARRIVAL : 1),
    discipline: t.discipline,
    familiar: familiar * (full ? HANDS_FULL_READ : 1),
    ...(t.accuracy ? { accuracy: t.accuracy } : {}),
    ...(area ? { areaSize: areaSize(area) } : {}),
    ...(t.swarmCost ? { swarm: swarmSlips(attacker, t) } : {}),
    threat: threatOf(attacker, target, t),
    ...(body ? { paceSpeed: attacker.attributes.speed } : {}),
    ...killingOf(t, killingMoment(attacker, target, round.fighters)),
  };
}

function killingOf(t: CombatTechnique, moment: KillingMoment): Pick<Incoming, 'killing'> {
  const killing = killingSlipScale(t, moment);
  return killing === 1 ? {} : { killing };
}

/**
 * Whether a target can meet a killing blow: they see its user (or another of their mind does,
 * `sharedMind.ts`), and can move.
 */
export function killingMoment(
  attacker: PlanFighter,
  target: PlanFighter,
  fighters: readonly PlanFighter[],
): KillingMoment {
  return { unseen: attacker.hidden && !watched(fighters, target), open: isOpen(target) };
}

/**
 * The art behind a plain blow: a weapon's (its mastery, its speed, a throw's aim:
 * `weaponSkill`), else taijutsu.
 */
export function blowSkill(attacker: PlanFighter, kind: AttackKind, thrown: boolean): number {
  return kind === 'weapon' ? weaponSkill(attacker, thrown) : attacker.attributes.taijutsu;
}
