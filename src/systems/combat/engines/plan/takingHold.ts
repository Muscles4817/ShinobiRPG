import type {
  AfflictionKind,
  Delivery,
  EffectOf,
  TechniqueEffect,
  Verb,
} from '@/systems/techniques';

import { conditionResist } from '../../rules/avoidance';
import { bracedResist, isBracedAgainst } from '../../rules/commitment';
import { pointsSeenScale } from '../../rules/eyes';
import { HIDDEN_HOLD_RESIST } from '../../rules/lethal';
import { causeLine } from '../../rules/causes';
import { tagsOf } from '../../rules/tags';
import { tell } from '../../rules/telling';
import { holdCause } from './causes';
import type { EffectUse } from '../../rules/verbs';
import { committedTo } from './commitment';
import { say, type Round } from './state';
import type { Aimed } from './wounding';
import { watched } from './sharedMind';

/**
 * Whether what a technique brings takes hold of the foe it reached: the verbs that land on a foe,
 * and for a condition (a daze, a seal, a pin…) its resist, eased by eyes that see the chakra
 * points and a hold cast from hiding, and stiffened by a Brace.
 */

/** The verbs that land on a foe; every other verb happens to the user. */
const FOE_VERBS = [
  'damage',
  'area',
  'break',
  'daze',
  'seal',
  'confuse',
  'knock',
  'pin',
  'drain',
  'afflict',
] as const;
type FoeVerb = (typeof FOE_VERBS)[number];
const foeVerbs: readonly Verb[] = FOE_VERBS;

export function landsOnFoe(effect: TechniqueEffect): effect is EffectOf<FoeVerb> {
  return foeVerbs.includes(effect.verb);
}

/** What it looks like when a condition that reached its target fails to take hold. */
type ConditionVerb = Exclude<FoeVerb, 'damage' | 'area' | 'break'>;

const SHAKEN_OFF: Readonly<Record<ConditionVerb, string>> = {
  daze: '{t} shake{t.s} it off.',
  seal: '{t} push{t.es} the seals back before they close.',
  confuse: '{t} see{t.s} through the illusion.',
  knock: '{t} stand{t.s} firm.',
  pin: '{t} tear{t.s} free before it can hold.',
  drain: '{t} keep{t.s} a grip on {t.their} chakra.',
  afflict: '{t} shrug{t.s} it off.',
};

/**
 * Where how a technique reaches decides what was shaken off (`rules/tags`): a shadow pulled free
 * of, trunks got clear of, an illusion seen through, flames beaten out. Else the verb's line.
 */
function shakenLine(use: EffectUse, verb: ConditionVerb): string {
  const delivery = tagsOf(use.technique).delivery[0];
  const illusion = use.technique.discipline === 'genjutsu';
  if (verb === 'daze') {
    return illusion ? '{t} shake{t.s} the illusion off.' : '{t} keep{t.s} {t.their} head.';
  }
  if (verb === 'pin') return HOLD_SHAKEN[delivery ?? 'strike'] ?? SHAKEN_OFF.pin;
  if (verb === 'afflict' && use.effect.verb === 'afflict') return AFFLICT_SHAKEN[use.effect.harm];
  return SHAKEN_OFF[verb];
}

const HOLD_SHAKEN: Readonly<Partial<Record<Delivery, string>>> = {
  'along-ground': '{t} pull{t.s} free of the shadow before it holds.',
  'from-ground': '{t} get{t.s} clear before it closes.',
  threads: '{t} slip{t.s} the threads.',
  senses: "{t} won't be held by it.",
  'eye-contact': "{t} won't be held by it.",
  grapple: '{t} twist{t.s} out of the grip.',
};

const AFFLICT_SHAKEN: Readonly<Record<AfflictionKind, string>> = {
  burn: '{t} beat{t.s} the flames out.',
  bleed: '{t} press{t.es} the wound shut.',
  poison: '{t} fight{t.s} the poison off.',
};

/** The condition an effect brings, if it lands on a foe without wounding them. */
export function conditionOf(effect: TechniqueEffect): ConditionVerb | null {
  if (!landsOnFoe(effect)) return null;
  const { verb } = effect;
  return verb === 'damage' || verb === 'area' || verb === 'break' ? null : verb;
}

/** A condition reached its target; whether it takes hold is its verb's resist (`avoidance.ts`). */
export function shakenOff(
  round: Round,
  { actor, target, rng }: Aimed,
  use: EffectUse,
): Round | null {
  const verb = conditionOf(use.effect);
  if (!verb) return null;
  // Eyes that see the chakra points close them more surely (`rules/eyes.ts`); a hold cast from
  // hiding comes from where its target isn't looking (`rules/lethal.ts`).
  const unseen = actor.hidden && !watched(round.fighters, target);
  const hidden = unseen ? HIDDEN_HOLD_RESIST : 1;
  const resist = conditionResist(actor, target, use) * pointsSeenScale(actor, verb) * hidden;
  // A Brace makes a pin, daze or knock far less likely to take (`rules/commitment.ts`).
  const braced = committedTo(target, 'brace') && isBracedAgainst(verb);
  if (!rng.chance(braced ? bracedResist(resist) : resist)) return null;
  const shaken = tell(shakenLine(use, verb), { t: target });
  return say(round, causeLine(shaken, holdCause(braced), actor.id));
}
