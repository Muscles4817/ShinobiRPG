import {
  APTITUDE_MAX,
  STAT_IDS,
  type Aptitude,
  type AptitudeKnown,
  type StatDelta,
  type StatId,
} from '@/systems/stats';

/**
 * Talent you know about from the start. A gift is a stat you were always good at: it grows fast
 * and can go far. A prodigy's gift goes further still, and only the genius of the year has one.
 * A flaw is the other way round (poor reserves, a frail body, slow wits): it starts a little
 * low, grows slowly and stops early, and gives development points back. Everything not gifted
 * or flawed is still the hidden roll, found out by training.
 *
 * A student may also bloom early (trade a gift for more early training) or late (the reverse).
 */

export const GIFTS = ['gifted', 'prodigy', 'flawed'] as const;
export type Gift = (typeof GIFTS)[number];
export type Gifts = Readonly<Partial<Record<StatId, Gift>>>;

export const BLOOMS = ['on-time', 'early', 'late'] as const;
export type Bloom = (typeof BLOOMS)[number];

/** Talent a gift guarantees at least, and a flaw at most. */
const GIFT_APTITUDE: Readonly<Record<Gift, number>> = {
  gifted: 1.3,
  prodigy: 1.6,
  flawed: 0.65,
};
/** Gifts each costs out of the allowance. */
const GIFT_COST: Readonly<Record<Gift, number>> = { gifted: 1, prodigy: 2, flawed: 0 };
/** A flaw gives back this many development points. */
export const FLAW_REFUND = 2;
/** A flawed stat starts this much lower. */
export const FLAW_START = -1;
/** Development points an early bloomer gains for a gift, and a late bloomer gives for one. */
export const BLOOM_POINTS = 3;

/** What a standing lets you choose. */
export interface GiftAllowance {
  readonly gifts: number;
  /** Whether a prodigy's gift may be taken. */
  readonly prodigy: boolean;
  readonly flaws: number;
}

export function giftsSpent(gifts: Gifts): number {
  return STAT_IDS.reduce((sum, id) => sum + (gifts[id] ? GIFT_COST[gifts[id]] : 0), 0);
}

export function flawsTaken(gifts: Gifts): number {
  return STAT_IDS.filter((id) => gifts[id] === 'flawed').length;
}

/** Gifts on offer once the bloom is counted. */
export function giftsAllowed(allowance: GiftAllowance, bloom: Bloom): number {
  if (bloom === 'early') return allowance.gifts - 1;
  return bloom === 'late' ? allowance.gifts + 1 : allowance.gifts;
}

/** Development points the gifts and bloom add (negative for a late bloomer). */
export function giftPoints(gifts: Gifts, bloom: Bloom): number {
  const bloomed = bloom === 'early' ? BLOOM_POINTS : bloom === 'late' ? -BLOOM_POINTS : 0;
  return flawsTaken(gifts) * FLAW_REFUND + bloomed;
}

/** The starting penalty flaws carry. */
export function giftStartBonuses(gifts: Gifts): StatDelta {
  return Object.fromEntries(
    STAT_IDS.filter((id) => gifts[id] === 'flawed').map((id) => [id, FLAW_START]),
  );
}

/** The rolled talent with the known gifts and flaws laid over it. */
export function withGifts(rolled: Aptitude, gifts: Gifts): Aptitude {
  const entries = STAT_IDS.map((id) => {
    const gift = gifts[id];
    if (!gift) return [id, rolled[id]] as const;
    const bound = GIFT_APTITUDE[gift];
    const value = gift === 'flawed' ? Math.min(rolled[id], bound) : Math.max(rolled[id], bound);
    return [id, Math.min(APTITUDE_MAX, value)] as const;
  });
  return Object.fromEntries(entries) as Record<StatId, number>;
}

/** Gifts and flaws are known from the first day: they are what the file says. */
export function giftsKnown(known: AptitudeKnown, gifts: Gifts): AptitudeKnown {
  const entries = STAT_IDS.map((id) => [id, gifts[id] ? 'sense' : known[id]] as const);
  return Object.fromEntries(entries) as AptitudeKnown;
}

/** Why a set of gifts is not allowed, or nothing. */
export function giftProblems(gifts: Gifts, allowance: GiftAllowance, bloom: Bloom): string[] {
  const allowed = giftsAllowed(allowance, bloom);
  const spent = giftsSpent(gifts);
  const prodigies = STAT_IDS.some((id) => gifts[id] === 'prodigy');
  return [
    allowed < 0 && 'An early bloomer gives up a gift, and you have none to give.',
    spent > Math.max(0, allowed) &&
      `Those gifts take ${spent}; your file has room for ${Math.max(0, allowed)}.`,
    prodigies && !allowance.prodigy && 'Only the genius of the year has a prodigy’s gift.',
    flawsTaken(gifts) > allowance.flaws &&
      `Your file can carry ${allowance.flaws} ${allowance.flaws === 1 ? 'flaw' : 'flaws'}.`,
  ].filter((p): p is string => typeof p === 'string');
}
