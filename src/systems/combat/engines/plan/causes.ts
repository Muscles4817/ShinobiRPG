import { causeLine, type NarrationCause } from '../../rules/causes';
import { seesThroughIllusions } from '../../rules/eyes';
import { avoidParts, partsOdds, SWIFT_INSTINCT, type AvoidParts, type Incoming } from './avoid';
import type { PlanFighter, Round } from './state';

/**
 * Why an attack was slipped (audit P1.1), read from the avoid roll itself (`avoid.ts`): the roll's
 * parts are gathered once, and the cause is the part that did most to make the slip likely, found
 * by taking each away in turn and seeing how far the odds fall: eyes that saw it coming, a
 * committed Evade, a ready Dodge, a move leaned on until it was read, a wild swing, a body quicker
 * than the attack, a read of the attacker. An illusion seen through is slipped whatever the roll.
 * When nothing added much, the slip just went their way.
 */

/**
 * A part whose taking away would leave less than this share of the slip's odds gone didn't
 * decide it: when no part did, it was luck.
 */
const DECIDED_SHARE = 0.1;

/** Each part a slip may come from, and the roll with that part taken away. */
const WITHOUT: readonly (readonly [NarrationCause, (p: AvoidParts) => AvoidParts])[] = [
  ['foresaw', (p) => ({ ...p, roll: { ...p.roll, seesAll: false }, foresight: null })],
  ['evading', (p) => ({ ...p, roll: { ...p.roll, evading: false } })],
  ['dodge-ready', (p) => ({ ...p, roll: withoutDodge(p.roll) })],
  ['familiar', (p) => ({ ...p, roll: { ...p.roll, read: p.roll.read / p.familiar } })],
  ['wild', (p) => ({ ...p, roll: withoutAccuracy(p.roll) })],
  ['quicker', (p) => ({ ...p, roll: { ...p.roll, rating: p.roll.arrival } })],
  ['read-it', (p) => ({ ...p, roll: { ...p.roll, read: p.familiar } })],
];

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
  const odds = partsOdds(parts);
  let best: { cause: NarrationCause; added: number } = {
    cause: 'slipped',
    added: odds * DECIDED_SHARE,
  };
  for (const [cause, without] of WITHOUT) {
    const added = odds - partsOdds(without(parts));
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
