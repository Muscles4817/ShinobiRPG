import type { Told } from '../../rules/telling';
import type { HoldOffReason } from '../../rules/zoning';
import { told, within, type Bank, type Moment } from './fresh';

/**
 * The fight's voice for the field rather than the blows (`voice.ts` has those): someone thrown
 * across it or dragged in, illusions taking hold and lifting, a hidden fighter slipping away or
 * being traced, a swap out of harm. Picked fresh by the moment, never the dice; no numbers.
 */

const DRAGGED: Bank = {
  id: 'dragged',
  lines: [
    '{t} {t.is} dragged in close.',
    '{t} {t.is} hauled in, face to face.',
    '{t} {t.is} yanked off {t.their} feet and into reach.',
  ],
};

const THROWN: Bank = {
  id: 'thrown',
  lines: [
    '{t} {t.is} thrown back to {where} range.',
    '{t} {t.is} sent skidding back to {where} range.',
    '{t} tumble{t.s} away to {where} range.',
  ],
};

/** Someone thrown back to a distance, or dragged in close. */
export function knockLine(moment: Moment, target: Told, where: string, closer: boolean): string {
  return told(moment, closer ? DRAGGED : THROWN, { t: target, where });
}

const CONFUSED: Bank = {
  id: 'confused',
  lines: [
    '{t.poss} senses swim in {a.poss} illusion.',
    '{t} blink{t.s}, and the field is no longer where it was.',
    '{a.poss} illusion folds the world around {t}.',
  ],
};

/** An illusion confuses its target. */
export function confusedLine(moment: Moment, target: Told, caster: Told): string {
  return told(moment, CONFUSED, { t: target, a: caster });
}

const CLEAR_HEAD: Bank = {
  id: 'clear-head',
  lines: [
    '{a} shake{a.s} off the illusion.',
    '{a} bite{a.s} down and the world snaps back into place.',
    '{a} break{a.s} free of the illusion.',
  ],
};

/** Someone shakes an illusion off. */
export function clearHeadLine(moment: Moment, actor: Told): string {
  return told(moment, CLEAR_HEAD, { a: actor });
}

const REHIDE: Bank = {
  id: 'rehide',
  lines: [
    '{a} melt{a.s} back into the illusion.',
    '{a} fade{a.s} out of sight again.',
    '{a} {a.is} gone again, and the air where {a.they} stood is empty.',
  ],
};

/** An illusionist slips back out of sight. */
export function rehideLine(moment: Moment, actor: Told): string {
  return told(moment, REHIDE, { a: actor });
}

const TRACED: Bank = {
  id: 'traced',
  lines: [
    '{v} trace{v.s} the illusion back to {a}.',
    '{v} follow{v.s} the blow back to {a}.',
    '{v} catch{v.es} the thread of the illusion and find{v.s} {a}.',
  ],
};

/** A hidden attacker traced back by the one they struck. */
export function tracedLine(moment: Moment, victim: Told, actor: Told): string {
  return told(moment, TRACED, { v: victim, a: actor });
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

const SWAPPED: Bank = {
  id: 'swap',
  lines: [
    '{t} swap{t.s} out of {a.poss} {what} with {jutsu}.',
    '{a.poss} {what} splinters the log {t} left behind with {jutsu}.',
    '{t} {t.is} somewhere else by the time {a.poss} {what} lands.',
  ],
};

/** A substitution takes a hit in its owner's place. */
export function swapLine(moment: Moment, { target, attacker, what, jutsu }: SwapTold): string {
  return told(moment, SWAPPED, { t: target, a: attacker, what, jutsu });
}

const THROUGH: Bank = {
  id: 'through',
  lines: [
    '{c} slip{c.s} through {h.poss} fire.',
    '{c} weave{c.s} in under {h.poss} fire.',
    '{c} run{c.s} the gauntlet of {h.poss} fire and come{c.s} out the other side.',
  ],
};

/** Someone stepping in gets through a hold-off. */
export function throughLine(moment: Moment, closer: Told, holder: Told): string {
  return told(moment, THROUGH, { c: closer, h: holder });
}

const HELD_OFF: Bank = {
  id: 'held-off',
  lines: [
    '{h} keep{h.s} {c} off.',
    '{h} won’t let {c} close.',
    '{h} meet{h.s} {c.poss} rush head on.',
  ],
};

/** A hold-off stops someone stepping in. */
export function heldOffLine(moment: Moment, holder: Told, closer: Told): string {
  return told(moment, HELD_OFF, { h: holder, c: closer });
}

/** Why a hold-off stopped someone: what the holder fired, and what beat the one closing in. */
export interface HeldOffTold {
  readonly holder: Told;
  readonly closer: Told;
  readonly what: string;
  readonly why: HoldOffReason;
}

const WHY: Readonly<Record<HoldOffReason, Bank>> = {
  wide: {
    id: 'why-wide',
    lines: [
      '{h.poss} {what} is too wide to slip, however fast {c} move{c.s}.',
      'There is no gap in {h.poss} {what} for {c} to slip through.',
    ],
  },
  vast: {
    id: 'why-vast',
    lines: [
      'Nothing outruns {h.poss} {what}, {c} included.',
      '{h.poss} {what} fills the field, and {c} {c.has} nowhere to go.',
    ],
  },
  aim: {
    id: 'why-aim',
    lines: [
      '{h} read{h.s} {c.poss} rush and put{h.s} the {what} right in its path.',
      '{h} {h.has} {c.poss} line before {c.they} can take it.',
    ],
  },
  timing: {
    id: 'why-timing',
    lines: [
      '{c} {c.is} the quicker, but {h} time{h.s} the {what} perfectly.',
      '{h} wait{h.s} for {c} to commit, then fire{h.s}.',
    ],
  },
};

export function heldOffWhy(moment: Moment, held: HeldOffTold): string {
  const { holder, closer, what } = held;
  return told(within(moment, 'why'), WHY[held.why], { h: holder, c: closer, what });
}
