import { avoidRating, readRating, tellRating } from '../../rules/avoidance';
import { hasPerk } from '../../rules/body';
import { causeLine, type NarrationCause } from '../../rules/causes';
import { seesThroughIllusions } from '../../rules/eyes';
import { dodgesHere, type Incoming } from './avoid';
import { committedTo } from './commitment';
import type { PlanFighter, Round } from './state';

/**
 * Why an attack was slipped (audit P1.1), worked out from the same things the avoid roll weighs
 * (`avoid.ts`), the plainest first: an illusion seen through, eyes that saw it coming, a
 * committed Evade, a ready Dodge, a move leaned on until it was read, a wild swing, a body
 * quicker than the attack, a read of the attacker, and otherwise a slip that just went their way.
 */
export function slipCause(round: Round, incoming: Incoming): NarrationCause {
  const { target, attacker } = incoming;
  const illusion = incoming.discipline === 'genjutsu';
  if (illusion && (seesThroughIllusions(target) || target.puppet === true)) return 'saw-through';
  if (hasPerk(target, 'foresight')) return 'foresaw';
  if (committedTo(target, 'evade')) return 'evading';
  if (dodgesHere(round, target)) return 'dodge-ready';
  if ((incoming.familiar ?? 1) > 1) return 'familiar';
  if (incoming.accuracy === 'wild') return 'wild';
  const arrival = incoming.form === 'technique' ? incoming.skill : attacker.attributes.speed;
  if (avoidRating(target, incoming.discipline) > arrival) return 'quicker';
  return readRating(target) >= tellRating(attacker, incoming.skill) ? 'read-it' : 'slipped';
}

/** A cause the reaction stamp doesn't already say: a ready Dodge is the Dodged stamp's to tell. */
export function slipCauseBeside(
  cause: NarrationCause | null,
  dodged: boolean,
): NarrationCause | null {
  return dodged && cause === 'dodge-ready' ? null : cause;
}

/** Why a hold, daze, seal or drain that reached didn't take: a Brace, or the target's own resist. */
export function holdCause(braced: boolean): NarrationCause {
  return braced ? 'braced' : 'resisted';
}

/** Why a step past `foe` failed: a quicker foe outpaced it, else they cut it off. */
export function stepCause(actor: PlanFighter, foe: PlanFighter): NarrationCause {
  return foe.attributes.speed > actor.attributes.speed ? 'outpaced' : 'cut-off';
}

/** A line with its cause, when there is one to give. */
export function withCause(text: string, cause: NarrationCause | null): string {
  return cause ? causeLine(text, cause) : text;
}
