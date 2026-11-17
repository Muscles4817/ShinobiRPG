import type { HitType } from '../../rules/hits';
import { kitDamageScale, type AttackKind } from '../../rules/kit';
import { tell } from '../../rules/telling';
import { brokenScale } from '../../rules/verbs';
import { told, within, type Bank, type Moment } from './fresh';
import type { PlanFighter } from './state';

/**
 * What their kit (armour, a shroud, a spirit's body) kept out of a hit, told only as far as it
 * did: most of the blow, some of it, or too little to remark on. The words never claim more than
 * the chip beside them shows.
 */
const GLANCES: Bank = {
  id: 'glances',
  lines: [
    'Much of it glances off {t}.',
    'Little of it bites on {t}.',
    '{t} barely seem{t.s} to feel it.',
  ],
};
const TAKES_SOME: Bank = {
  id: 'takes-some',
  lines: ['Some of it glances off {t}.', '{t.poss} cover takes the edge off it.'],
};
/** At or below this share let through, the kit kept out most of the blow. */
const KEPT_MOST = 0.5;
/** Above this share let through, too little was kept out to remark on. */
const KEPT_LITTLE = 0.85;

/** What the kit sees of a hit: what kind of attack it is, how it hits, and whether it breaks. */
export interface KitHit {
  readonly kind: AttackKind;
  readonly hit: HitType;
  readonly breaks: boolean;
}

/** The line, if any, for what the defender's kit made of a hit. */
export function kitNote(moment: Moment, defender: PlanFighter, blow: KitHit): string[] {
  const kit = kitDamageScale(defender, blow.kind, blow.hit);
  if (kit > 1) return [tell('The seal bites deep into {t}.', { t: defender })];
  const lets = blow.breaks ? brokenScale(kit) : kit;
  if (lets <= KEPT_MOST) return [told(within(moment, 'kit'), GLANCES, { t: defender })];
  return lets <= KEPT_LITTLE ? [told(within(moment, 'kit'), TAKES_SOME, { t: defender })] : [];
}
