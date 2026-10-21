import type { Accuracy, AreaSize, Discipline } from '@/systems/techniques';

import type { CombatTechnique, RangeBand } from '../../contract';
import {
  avoidCeiling,
  avoidChance,
  avoidRating,
  readRating,
  readScale,
  tellRating,
  type AttackForm,
} from '../../rules/avoidance';
import { FORESIGHT_SEES, FORESIGHT_SLIP, foreseen } from '../../rules/eyes';
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
import { GATHER_OPEN } from '../../rules/gather';
import { isDazed } from './daze';
import { readsInTheMoment } from './judgement';
import { readyDefences } from './readiness';
import { settledSlips, swarmSlips } from './swarm';
import { blindedSlips, dustArrival } from './dust';
import type { PlanFighter, Round } from './state';
import { sizeSlips } from '../../rules/size';
import { techniqueDamage } from '../../rules/damage';

/**
 * The avoid roll in a planned fight (`rules/avoidance.ts`), from the fighters as they stand: a
 * ready Dodge, a committed Evade, a daze (no slipping anything), a pin, footing on this ground, a field dulling the
 * defender's eyes, a swift kit, a technique leaned on (read more easily by a mind that reads
 * the fight), insects (a swarm's speed and camouflage, glowing or blinding insects settled on
 * someone) and foresight.
 */

/** A swift fighter slips this much more with a Dodge ready, half of it without. */
const SWIFT_INSTINCT = 0.5;

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
}

/** A Dodge is the target's ready defence here. */
export function dodgesHere(round: Round, target: PlanFighter): boolean {
  return readyDefences(target, round).some((c) => c.kind === 'dodge');
}

/** The chance this attack doesn't reach its target. */
export function avoidOdds(round: Round, incoming: Incoming): number {
  const { attacker, form } = incoming;
  const target = dulled(round.field, incoming.target);
  if (isDazed(target)) return 0;
  const dodging = dodgesHere(round, target);
  const evading = committedTo(target, 'evade');
  const swift = hasTrait(target, 'swift') ? SWIFT_DODGE * (dodging ? 1 : SWIFT_INSTINCT) : 0;
  const read = readScale(readRating(target), tellRating(attacker, incoming.skill), form);
  const chance = avoidChance({
    form,
    rating: avoidRating(target, incoming.discipline),
    arrival: form === 'technique' ? incoming.skill : attacker.attributes.speed,
    read: read * (incoming.familiar ?? 1),
    dodging,
    evading,
    ...(incoming.threat === undefined ? {} : { threat: incoming.threat }),
    ...(incoming.paceSpeed === undefined ? {} : { paceSpeed: incoming.paceSpeed }),
    bonus: swift,
    ...(incoming.accuracy ? { accuracy: incoming.accuracy } : {}),
    ...(incoming.areaSize ? { areaSize: incoming.areaSize } : {}),
  });
  const insects =
    (incoming.swarm ?? 1) *
    settledSlips(round, attacker, target) *
    (isGathering(target) ? GATHER_OPEN : 1);
  const dust = blindedSlips(attacker);
  // A big body is a big target (`size.ts`).
  const held =
    chance *
    insects *
    dust *
    (isPinned(target) ? PIN_SLIP : 1) *
    footingOf(round.ground, target) *
    sizeSlips(target);
  const scale = form === 'technique' ? FORESIGHT_SEES : FORESIGHT_SLIP;
  return foreseen(held, target, { scale, ceiling: avoidCeiling(evading) });
}

/** Share of the target's health a technique's wounding effects would take, mid-roll. */
function threatOf(attacker: PlanFighter, target: PlanFighter, t: CombatTechnique): number {
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
  band: RangeBand,
): Incoming | null {
  const use = landingUse(t);
  if (!use) return null;
  const [area] = effectsOf(t, 'area');
  const body = t.discipline === 'taijutsu' || t.discipline === 'kenjutsu';
  // Only a mind that reads the fight picks up on a technique leaned on.
  const familiar = readsInTheMoment(target) ? familiarScale(attacker.uses?.[t.id] ?? 0) : 1;
  // Signs made around a drawn blade come slower and give more away (`blades.ts`).
  const full = handsFull(attacker, t.discipline, band);
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
  };
}

/**
 * The art behind a plain blow: a weapon's (its mastery, its speed, a throw's aim:
 * `weaponSkill`), else taijutsu.
 */
export function blowSkill(attacker: PlanFighter, kind: AttackKind, thrown: boolean): number {
  return kind === 'weapon' ? weaponSkill(attacker, thrown) : attacker.attributes.taijutsu;
}
