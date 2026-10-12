/**
 * The team part of the combat contract (see `contract.ts`): how a teammate fights (their
 * stance), what the player may change about it (their orders), and what each fighter used,
 * reported when the fight is over.
 */

/**
 * How a teammate fights: press (attack, close in, follow the team mark), cover (guard one
 * fighter on their side and step in front of single attacks aimed at them), support (dazes,
 * seals, heals and senses first, to set up the others) or hold (keep their place and range,
 * spare their chakra).
 */
export const STANCE_KINDS = ['press', 'cover', 'support', 'hold'] as const;
export type StanceKind = (typeof STANCE_KINDS)[number];

export type CombatStance =
  | { readonly kind: 'press' | 'support' | 'hold' }
  | { readonly kind: 'cover'; /** The fighter (by id) they protect. */ readonly covers: string };

/**
 * What the player may change about a teammate between rounds. Each is absent when allowed and
 * otherwise says why not ("Kiba won't take orders from you yet"). A teammate with no orders at
 * all follows their own judgement.
 */
export interface CombatOrders {
  readonly stanceLocked?: string;
  readonly cardsLocked?: string;
}

/** What one fighter used in a fight: techniques (by id, in first-use order) and chakra spent. */
export interface CombatUsage {
  readonly techniqueIds: readonly string[];
  readonly chakraSpent: number;
}
