import type { CombatTechnique } from '../../contract';
import type { Told } from '../../rules/telling';
import { told, type Bank, type Moment } from './fresh';

/**
 * How a chain tells itself (`chaining.ts`): a link is the last move carried on into the next,
 * never a fresh start, so it reads as following through on the one it lands on; and a chain
 * that stops says why it stopped (the last move didn't land, the thrower was hurt for it, the
 * fight moved out of the next move's reach, or the breath ran out). Picked fresh like every line (`fresh.ts`).
 */

/** Why a chain stopped before its last link. */
export type ChainBreak = 'missed' | 'countered' | 'out-of-reach' | 'winded';

const LINKS_BY_ART: Readonly<Record<'taijutsu' | 'kenjutsu', readonly string[]>> = {
  taijutsu: [
    '{a} roll{a.s} straight on into {what} before {t} can set {t.their} feet.',
    'Without a breath between, {a} follow{a.s} up with {what}.',
    '{a} turn{a.s} the same motion into {what}.',
    '{a} keep{a.s} on top of {t}, and {what} comes next.',
  ],
  kenjutsu: [
    '{a.poss} blade never stops: it flows on into {what}.',
    '{a} take{a.s} the cut on through into {what}.',
    'The steel comes round again, into {what}.',
    '{a} turn{a.s} the stroke into {what} before {t} can recover.',
  ],
};

/** Any other art a chain might hold: plain follow-through. */
const LINKS_OTHER = ['{a} follow{a.s} through with {what}.', '{a} press{a.es} on with {what}.'];

const BREAKS: Readonly<Record<ChainBreak, readonly string[]>> = {
  missed: [
    "{a.poss} chain breaks off there: the opening isn't there.",
    'With nothing landed to build on, {a} let{a.s} the chain go.',
    "{a} pull{a.s} up short of the next move: it didn't land.",
  ],
  countered: [
    '{a.poss} chain breaks off there, knocked out of its rhythm.',
    'Hurt for it, {a} lose{a.s} the thread of the chain.',
  ],
  'out-of-reach': [
    '{a.poss} chain breaks off there: the next move would only find air.',
    '{t} {t.is} knocked out of reach, and {a.poss} chain ends there.',
  ],
  winded: [
    '{a} {a.has} no breath left for the next move, and {a.their} chain breaks off there.',
    'Out of breath, {a} let{a.s} the chain go.',
  ],
};

function linkBank(t: CombatTechnique): Bank {
  const art = t.discipline === 'taijutsu' || t.discipline === 'kenjutsu' ? t.discipline : null;
  return { id: `link-${art ?? 'other'}`, lines: art ? LINKS_BY_ART[art] : LINKS_OTHER };
}

/** A chain's next link, thrown on from the last onto the one it landed on. */
export function linkLine(
  moment: Moment,
  cast: { readonly actor: Told; readonly target: Told },
  t: CombatTechnique,
): string {
  return told(moment, linkBank(t), { a: cast.actor, t: cast.target, what: t.name });
}

/** A chain stopping before its last link, and why. */
export function breakLine(
  moment: Moment,
  cast: { readonly actor: Told; readonly target: Told },
  why: ChainBreak,
): string {
  const bank = { id: `chain-break-${why}`, lines: BREAKS[why] };
  return told(moment, bank, { a: cast.actor, t: cast.target });
}
