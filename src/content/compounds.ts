/**
 * Where the clans live (`docs/design/compounds-plan.md`): a clan's compound, the quarter the
 * compounds stand in, and how a clan treats outsiders at its gate.
 */

/**
 * How a clan treats outsiders: `welcoming` lets anyone in by day, `reserved` wants you to know
 * someone inside, `guarded` only lets in those close to a member. At night every gate is shut
 * to all but the very close (`game/compounds.ts`).
 */
export const OUTSIDER_STANCES = ['welcoming', 'reserved', 'guarded'] as const;
export type OutsiderStance = (typeof OUTSIDER_STANCES)[number];

/** A clan's compound: its people are home there part of the day. */
export interface CompoundFields {
  readonly kind: 'compound';
  readonly clanId: string;
  /** The clan's head, a person of the clan, when the pack has one. */
  readonly headId?: string;
  /** The archive keeps the clan's hive rite (`ClanHive.rite`), lent to an outsider it trusts. */
  readonly keepsRite?: boolean;
}

/** The clans' quarter: one card on the village screen for the compounds it lists. */
export interface QuarterFields {
  readonly kind: 'quarter';
  readonly compoundIds: readonly string[];
}
