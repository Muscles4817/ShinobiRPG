import type { CombatantSetup, CombatRow, CombatSide, RangeBand } from '../contract';
import { hasTrait } from './kit';
import { hasVerb, isHarmful } from './verbs';

/**
 * Formation, in every engine that has rows: each side stands in a front and a back row, with
 * the fight's one shared range band between the sides. A back-row fighter can't be struck up
 * close (an attack whose reach is close range only) while a living, unhidden ally of theirs
 * stands in the front row; thrown weapons, techniques that reach further and area effects
 * still hit them. When the front falls, the back is exposed.
 *
 * Rows ask only whether an attack reaches beyond close range, never where the fight stands, so
 * a later per-fighter range (one fighter hanging back while another closes in) can replace the
 * shared band without changing the row rule.
 */

/** An attack, as rows see it: the bands it reaches, and whether it washes over everyone. */
export interface RowAttack {
  readonly reach: readonly RangeBand[];
  /** Area effects hit both rows. */
  readonly area?: boolean;
}

/** What rows need to know about a fighter. */
export interface Ranked {
  readonly id: string;
  readonly side: CombatSide;
  readonly row: CombatRow;
  readonly health: number;
  readonly hidden: boolean;
}

type Placed = Pick<CombatantSetup, 'traits' | 'techniques' | 'row'>;

/** Healers who heal more than they hurt keep to the back. */
function supports(f: Placed): boolean {
  const heals = f.techniques.filter((t) => hasVerb(t, 'heal')).length;
  return heals > 0 && heals >= f.techniques.filter(isHarmful).length;
}

/**
 * Where a fighter stands by their kit: archers, illusionists and healers at the back; brawlers,
 * the armoured and everyone else in front. A setup's own `row` wins.
 */
export function preferredRow(f: Placed): CombatRow {
  if (f.row) return f.row;
  const kit = { traits: f.traits ?? [] };
  if (hasTrait(kit, 'brawler') || hasTrait(kit, 'armoured')) return 'front';
  if (hasTrait(kit, 'archer') || hasTrait(kit, 'illusionist') || supports(f)) return 'back';
  return 'front';
}

/**
 * Checks a side's formation: a side with no one in front (a side of one at the back, or all
 * archers) simply stands in front, since there is no one to stand behind.
 */
export function formed<F extends Pick<Ranked, 'side' | 'row'>>(fighters: readonly F[]): F[] {
  const frontless = (side: CombatSide) =>
    fighters.every((f) => f.side !== side || f.row === 'back');
  return fighters.map((f) => (frontless(f.side) ? { ...f, row: 'front' } : f));
}

/** Whether only close range reaches: a blow, a counter, a taijutsu technique. */
export function upCloseOnly(reach: readonly RangeBand[]): boolean {
  return reach.every((band) => band === 'close');
}

/** A back-row fighter with a living, unhidden ally standing in front of them. */
export function screened(target: Ranked, fighters: readonly Ranked[]): boolean {
  return (
    target.row === 'back' &&
    fighters.some(
      (f) =>
        f.side === target.side &&
        f.id !== target.id &&
        f.row === 'front' &&
        f.health > 0 &&
        !f.hidden,
    )
  );
}

/** Whether an attack can reach the target past the rows. */
export function canReach(attack: RowAttack, target: Ranked, fighters: readonly Ranked[]): boolean {
  return attack.area === true || !upCloseOnly(attack.reach) || !screened(target, fighters);
}

/** The fighters among `targets` an attack can reach past the rows. */
export function reachable<F extends Ranked>(
  attack: RowAttack,
  targets: readonly F[],
  fighters: readonly Ranked[],
): F[] {
  return targets.filter((t) => canReach(attack, t, fighters));
}
