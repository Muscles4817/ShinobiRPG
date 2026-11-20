import { RANGE_BANDS } from '../../rules/range';
import type { AreaSize } from '@/systems/techniques';

import type { RangeBand } from '../../contract';
import { alive } from '../../rules/body';
import { stopsCloser } from '../../rules/size';
import { isPinned } from '../../rules/verbs';
import { throwPower } from '../../rules/weapons';
import { holdOffChance, thrownHoldOffChance, type ThrownShot } from '../../rules/zoning';
import { areaSize, driveOf, effectsOf, primaryEffect } from '../../rules/verbs';
import type { Card } from './cards';
import { isDazed } from './daze';
import { distanceBetween } from './distance';
import { fighterIn, type PlanFighter, type Round } from './state';

/**
 * One shot at someone closing in (`zoning.ts`): how likely it meets them, and whether, having
 * met them, it stops them. A hit isn't a stop: a closer takes a light one and keeps coming
 * (`stopsCloser`: a sixth of a human body's health, more for a bigger one); only a heavy hit, or
 * one that holds or dazes them, keeps them off. Thrown steel is aimed by the weapon art
 * (`throwPower`), a single blade barely at all across the far gap, a volley of shuriken more
 * surely.
 */

/** A volley of shuriken from the pouch. */
export function isVolley(card: Card): card is Extract<Card, { kind: 'item' }> {
  return card.kind === 'item' && card.item.effect === 'volley';
}

/** Thrown steel, and how: one blade (the kunai card) or a volley. */
function thrownAs(card: Card): ThrownShot | null {
  if (isVolley(card)) return 'volley';
  return card.kind === 'throw' ? 'blade' : null;
}

/** The holder's aim with a card: the weapon art for thrown steel, else their skill with the technique. */
export function aimWith(holder: PlanFighter, card: Card): number {
  if (card.kind !== 'jutsu') return throwPower(holder, 'throwing');
  return driveOf(holder, { technique: card.technique, effect: primaryEffect(card.technique) });
}

/** How wide a technique's area is, if it has one. */
export function areaOf(card: Card): AreaSize | undefined {
  const [area] = card.kind === 'jutsu' ? effectsOf(card.technique, 'area') : [];
  return area ? areaSize(area) : undefined;
}

/** The chance a shot meets someone closing in from `between`. */
export function shotChance(
  holder: PlanFighter,
  closer: PlanFighter,
  { card, between }: { readonly card: Card; readonly between: RangeBand },
): number {
  const aim = aimWith(holder, card);
  const shot = thrownAs(card);
  if (shot)
    return thrownHoldOffChance(aim, closer.attributes.speed, { shot, far: between === 'far' });
  return holdOffChance(aim, closer.attributes.speed, areaOf(card));
}

const further = (a: RangeBand, b: RangeBand) => RANGE_BANDS.indexOf(a) > RANGE_BANDS.indexOf(b);

/**
 * Whether the shot that met them stopped them: it hurt enough, held, dazed or felled them, or
 * threw them further off.
 */
export function stopped(
  before: Round,
  after: Round,
  shot: { holderId: string; closerId: string },
): boolean {
  const was = fighterIn(before, shot.closerId);
  const now = fighterIn(after, shot.closerId);
  if (!was || !now || !alive(now) || isPinned(now) || isDazed(now)) return true;
  const gap = (r: Round) => distanceBetween(r, shot.holderId, shot.closerId);
  if (further(gap(after), gap(before))) return true;
  return stopsCloser(now, was.health - now.health, now.maxHealth);
}
