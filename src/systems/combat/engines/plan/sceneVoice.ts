import { tell, type Told } from '../../rules/telling';
import type { HoldOffReason } from '../../rules/zoning';
import { pick } from './voice';

/**
 * The fight's voice for the field rather than the blows (`voice.ts` has those): someone thrown
 * across it or dragged in, illusions taking hold and lifting, a hidden fighter slipping away or
 * being traced, a swap out of harm. Picked by the moment, never the dice; no numbers.
 */

/** Someone thrown back to a distance, or dragged in close. */
export function knockLine(moment: string, target: Told, where: string, closer: boolean): string {
  const bank = closer
    ? [
        '{t} {t.is} dragged in close!',
        '{t} {t.is} hauled in, face to face!',
        '{t} {t.is} yanked off {t.their} feet and into reach!',
      ]
    : [
        '{t} {t.is} thrown back to {where} range!',
        '{t} {t.is} sent skidding back to {where} range!',
        '{t} tumble{t.s} away to {where} range!',
      ];
  return tell(pick(moment, bank), { t: target, where });
}

/** An illusion confuses its target. */
export function confusedLine(moment: string, target: Told, caster: Told): string {
  return tell(
    pick(moment, [
      '{t.poss} senses swim in {a.poss} illusion.',
      '{t} blink{t.s}, and the field is no longer where it was.',
      '{a.poss} illusion folds the world around {t}.',
    ]),
    { t: target, a: caster },
  );
}

/** Someone shakes an illusion off. */
export function clearHeadLine(moment: string, actor: Told): string {
  return tell(
    pick(moment, [
      '{a} shake{a.s} off the illusion.',
      '{a} bite{a.s} down and the world snaps back into place.',
      '{a} break{a.s} free of the illusion.',
    ]),
    { a: actor },
  );
}

/** An illusionist slips back out of sight. */
export function rehideLine(moment: string, actor: Told): string {
  return tell(
    pick(moment, [
      '{a} melt{a.s} back into the illusion.',
      '{a} fade{a.s} out of sight again.',
      '{a} {a.is} gone again, a shimmer where {a.they} stood.',
    ]),
    { a: actor },
  );
}

/** A hidden attacker traced back by the one they struck. */
export function tracedLine(moment: string, victim: Told, actor: Told): string {
  return tell(
    pick(moment, [
      '{v} trace{v.s} the illusion back to {a}.',
      '{v} follow{v.s} the blow back to its source: {a}.',
      '{v} catch{v.es} the thread of the illusion and find{v.s} {a}.',
    ]),
    { v: victim, a: actor },
  );
}

/** A substitution taking a hit in its owner's place. */
export interface SwapTold {
  readonly target: Told;
  readonly attacker: Told;
  /** The attack swapped out of. */
  readonly what: string;
  /** The substitution's name. */
  readonly jutsu: string;
}

/** A substitution takes a hit in its owner's place. */
export function swapLine(moment: string, { target, attacker, what, jutsu }: SwapTold): string {
  return tell(
    pick(moment, [
      '{t} swap{t.s} out of {a.poss} {what} with {jutsu}.',
      '{a.poss} {what} splinters a log where {t} stood: {jutsu}.',
      '{t} {t.is} somewhere else when {a.poss} {what} lands: {jutsu}.',
    ]),
    { t: target, a: attacker, what, jutsu },
  );
}

/** Someone stepping in gets through a hold-off. */
export function throughLine(moment: string, closer: Told, holder: Told): string {
  return tell(
    pick(moment, [
      '{c} slip{c.s} through {h.poss} fire.',
      '{c} weave{c.s} in under {h.poss} fire.',
      '{c} run{c.s} the gauntlet of {h.poss} fire and come{c.s} out the other side.',
    ]),
    { c: closer, h: holder },
  );
}

/** A hold-off stops someone stepping in. */
export function heldOffLine(moment: string, holder: Told, closer: Told): string {
  return tell(
    pick(moment, [
      '{h} keep{h.s} {c} off.',
      '{h} won’t let {c} close.',
      '{h} meet{h.s} {c.poss} rush head on.',
    ]),
    { h: holder, c: closer },
  );
}

/** Why a hold-off stopped someone: what the holder fired, and what beat the one closing in. */
export interface HeldOffTold {
  readonly holder: Told;
  readonly closer: Told;
  readonly what: string;
  readonly why: HoldOffReason;
}

const WHY: Readonly<Record<HoldOffReason, readonly string[]>> = {
  wide: [
    '{h.poss} {what} is too wide to slip, however fast {c} move{c.s}.',
    'There is no gap in {h.poss} {what} for {c} to slip through.',
  ],
  vast: [
    'Nothing outruns {h.poss} {what}, {c} included.',
    '{h.poss} {what} fills the field; {c} {c.has} nowhere to go.',
  ],
  aim: [
    '{h} read{h.s} {c.poss} rush and put{h.s} the {what} right in its path.',
    '{h} {h.has} {c.poss} line before {c.they} can take it.',
  ],
  timing: [
    '{c} {c.is} the quicker, but {h} time{h.s} the {what} perfectly.',
    '{h} wait{h.s} for {c} to commit, then fire{h.s}.',
  ],
};

export function heldOffWhy(moment: string, told: HeldOffTold): string {
  const { holder, closer, what } = told;
  return tell(pick(`${moment}:why`, WHY[told.why]), { h: holder, c: closer, what });
}
