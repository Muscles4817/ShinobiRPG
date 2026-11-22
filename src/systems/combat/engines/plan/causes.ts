import { causeLine, type NarrationCause } from '../../rules/causes';
import { seesThroughIllusions } from '../../rules/eyes';
import { avoidParts, partsStrength, SWIFT_INSTINCT, type AvoidParts, type Incoming } from './avoid';
import type { PlanFighter, Round } from './state';

/**
 * Why an attack was slipped (audit P1.1), read from the avoid roll itself (`avoid.ts`): the roll's
 * parts are gathered once, and the cause is the part that did most to make the slip likely, found
 * by taking each away in turn and seeing how far the roll's pull towards a slip falls (before the
 * ceilings: at a cap, taking one part away would change nothing): eyes that saw it coming, a
 * committed Evade, a ready Dodge, a move leaned on until it was read, a wild swing, a body quicker
 * than the attack (a swift one's instinct with it), a read of the attacker, a mind braced for the
 * illusion, an attacker blinded (dust, insects), a small body. (Footing only ever hurts a slip.) An illusion
 * seen through is slipped whatever the roll. When nothing added much, it went their way.
 */

/**
 * A part whose taking away would leave less than this share of the roll's pull gone didn't
 * decide it: when no part did, it was luck.
 */
const DECIDED_SHARE = 0.08;

/** Each part a slip may come from, and the roll with that part taken away. */
const WITHOUT: readonly (readonly [NarrationCause, (p: AvoidParts) => AvoidParts])[] = [
  ['foresaw', (p) => ({ ...p, roll: { ...p.roll, seesAll: false }, foresight: null })],
  ['evading', (p) => ({ ...p, roll: { ...p.roll, evading: false } })],
  ['dodge-ready', (p) => ({ ...p, roll: withoutDodge(p.roll) })],
  ['familiar', (p) => ({ ...p, roll: { ...p.roll, read: p.roll.read / p.familiar } })],
  ['wild', (p) => ({ ...p, roll: withoutAccuracy(p.roll) })],
  ['quicker', (p) => ({ ...p, roll: withoutQuickness(p.roll) })],
  ['read-it', (p) => ({ ...p, roll: { ...p.roll, read: p.familiar } })],
  ['ready-for-it', (p) => ({ ...p, braced: 0 })],
  ['blinded', (p) => ({ ...p, scales: [1, 1, p.scales[2], p.scales[3]] })],
  ['small-target', (p) => ({ ...p, scales: [p.scales[0], p.scales[1], p.scales[2], 1] })],
];

/** The roll from a body no quicker than the attack, without a swift body's instinct. */
function withoutQuickness(roll: AvoidParts['roll']): AvoidParts['roll'] {
  const bonus = roll.dodging ? (roll.bonus ?? 0) * (1 - SWIFT_INSTINCT) : 0;
  return { ...roll, rating: roll.arrival, bonus };
}

/** The roll with no Dodge ready: a swift body still slips some on instinct. */
function withoutDodge(roll: AvoidParts['roll']): AvoidParts['roll'] {
  if (!roll.dodging) return roll;
  return { ...roll, dodging: false, bonus: (roll.bonus ?? 0) * SWIFT_INSTINCT };
}

function withoutAccuracy(roll: AvoidParts['roll']): AvoidParts['roll'] {
  const { accuracy, ...rest } = roll;
  return accuracy === 'wild' ? rest : roll;
}

export function slipCause(round: Round, incoming: Incoming): NarrationCause {
  const { target } = incoming;
  const illusion = incoming.discipline === 'genjutsu';
  if (illusion && (seesThroughIllusions(target) || target.puppet === true)) return 'saw-through';
  const parts = avoidParts(round, incoming);
  if (!parts) return 'slipped';
  const pull = partsStrength(parts);
  let best: { cause: NarrationCause; added: number } = {
    cause: 'slipped',
    added: pull * DECIDED_SHARE,
  };
  for (const [cause, without] of WITHOUT) {
    const added = pull - partsStrength(without(parts));
    if (added > best.added) best = { cause, added };
  }
  return best.cause;
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

/** A line with its cause, and whom it is about, when there is one to give. */
export function withCause(text: string, cause: NarrationCause | null, subject: string): string {
  return cause ? causeLine(text, cause, subject) : text;
}
