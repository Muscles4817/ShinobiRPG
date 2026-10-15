import type { FieldId } from '@/systems/techniques';

import type { CombatAttributes, CombatPerk, CombatSide } from '../../contract';
import type { EffectUse } from './use';

/**
 * Fields: fight-wide conditions that last a few exchanges (mist, smoke, the dust a vast technique
 * leaves). A field belongs to the side that raised it. Everyone else inside it (everyone at all,
 * in dust) is blinded, unless they read foes anyway
 * (insight, or a sense this fight) or their perception rises above the field's potency:
 * a blinded fighter's attacks may go wide and their perception (dodging, spotting a technique,
 * searching) is dulled. In a field that gives cover, the owning side strikes the blinded as if
 * from hiding. Every rule about a field lives here.
 */

export interface FieldRule {
  /** What the field is called on the fight screen. */
  readonly name: string;
  /** Exchanges it lasts, counting the one it rises in. */
  readonly exchanges: number;
  /** Chance a blinded fighter's attack goes wide. */
  readonly miss: number;
  /** Share of their perception a blinded fighter keeps. */
  readonly perception: number;
  /** The owning side strikes the blinded as if from hiding. */
  readonly cover: boolean;
  /** It blinds its own side too (the dust a vast technique leaves). */
  readonly blindsAll?: true;
  readonly rises: string;
  readonly fades: string;
}

export const FIELD_RULES: Readonly<Record<FieldId, FieldRule>> = {
  // A slow, thick mist the caster's side moves through by sound: long, and it gives cover.
  mist: {
    name: 'Mist',
    exchanges: 4,
    miss: 0.3,
    perception: 0.5,
    cover: true,
    rises: 'A thick mist rolls across the field.',
    fades: 'The mist thins and lifts.',
  },
  // Choking smoke: everyone outside the cloud's makers strikes half blind, briefly.
  smoke: {
    name: 'Smoke',
    exchanges: 2,
    miss: 0.4,
    perception: 0.5,
    cover: false,
    rises: 'Smoke billows over the field.',
    fades: 'The smoke clears.',
  },
  // The dust and steam a vast technique leaves: nobody, its maker included, sees much.
  dust: {
    name: 'Dust',
    exchanges: 2,
    miss: 0.45,
    perception: 0.5,
    cover: false,
    blindsAll: true,
    rises: 'Dust and debris hang over the field. Nobody can see a thing.',
    fades: 'The dust settles.',
  },
};

/** Share of a field's power added to its user's drive. */
const FIELD_POWER_SHARE = 0.2;
/** A field of this power or more lasts an exchange longer. */
const STRONG_FIELD = 12;

/** A field over the fight: whose it is, how dense, and the last exchange it covers. */
export interface ActiveField {
  readonly id: FieldId;
  readonly side: CombatSide;
  /** Perception above this sees through it. */
  readonly potency: number;
  /** The last exchange it covers. */
  readonly until: number;
  /** Exchanges it covers in all, for showing how much is left. */
  readonly exchanges: number;
}

/** How a field is raised: by a technique, or already in place when the fight opens. */
export interface FieldSource {
  readonly id: FieldId;
  readonly side: CombatSide;
  readonly potency: number;
  /** A strong field lasts longer. */
  readonly power?: number;
}

interface Watcher {
  readonly side: CombatSide;
  readonly attributes: CombatAttributes;
  readonly perks: readonly CombatPerk[];
}

/** The potency a field technique gives, from its user's drive (their art). */
export function fieldPotency(drive: number, use: EffectUse<'field'>): number {
  return potencyOf(drive, use.effect.power);
}

/** A field's potency from its raiser's art and the effect's power (also for a field raised before a fight). */
export function potencyOf(art: number, power: number): number {
  return art + power * FIELD_POWER_SHARE;
}

/** A field rising in exchange `exchange`. */
export function raiseField(source: FieldSource, exchange: number): ActiveField {
  const strong = (source.power ?? 0) >= STRONG_FIELD ? 1 : 0;
  const exchanges = FIELD_RULES[source.id].exchanges + strong;
  return {
    id: source.id,
    side: source.side,
    potency: source.potency,
    until: exchange + exchanges - 1,
    exchanges,
  };
}

/** Exchanges a field still covers, counting this one. */
export function fieldLeft(field: ActiveField, exchange: number): number {
  return Math.max(0, field.until - exchange + 1);
}

/**
 * Whether a fighter is blinded by the field: not its owners (unless it blinds everyone), nor
 * anyone who sees through it.
 */
export function blinds(field: ActiveField | undefined, f: Watcher): boolean {
  if (!field || f.perks.includes('insight')) return false;
  if (f.side === field.side && FIELD_RULES[field.id].blindsAll !== true) return false;
  return f.attributes.perception <= field.potency;
}

/** The fighter as the field leaves them: a blinded one's perception is dulled. */
export function dulled<F extends Watcher>(field: ActiveField | undefined, f: F): F {
  if (!field || !blinds(field, f)) return f;
  const perception = f.attributes.perception * FIELD_RULES[field.id].perception;
  return { ...f, attributes: { ...f.attributes, perception } };
}

/** Chance the fighter's attack goes wide in the field. */
export function fieldMissChance(field: ActiveField | undefined, f: Watcher): number {
  return field && blinds(field, f) ? FIELD_RULES[field.id].miss : 0;
}

/** Whether the field covers this attacker's blow on this defender, as hiding would. */
export function covered(
  field: ActiveField | undefined,
  attacker: Watcher,
  defender: Watcher,
): boolean {
  return field !== undefined && FIELD_RULES[field.id].cover && attacker.side === field.side
    ? blinds(field, defender)
    : false;
}
