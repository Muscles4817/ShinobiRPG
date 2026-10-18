import type { CombatTrait } from '@/systems/combat';
import type { Stats } from '@/systems/stats';

/**
 * Summoning contracts (`docs/design/retinue-plan.md`, step 3): a clan of summons, signed through a
 * job or a teacher, one at a time. Each summon answers its own summoning technique once your
 * standing with the clan is high enough, and asks its price: chakra to call it and to keep it,
 * and for some, blood or an offering carried into the fight. Nothing is locked by rank; the
 * price is the lock.
 */

/** What calling a summon asks besides the technique's chakra and its upkeep. */
export interface SummonPrice {
  /** Health the caller gives when it answers. */
  readonly blood?: number;
  /** An ingredient carried into the fight and given up when it is called. */
  readonly offeringId?: string;
}

/** One summon of a clan: its body, the technique that calls it, and what it costs. */
export interface SummonDef {
  /** The call id its technique names. */
  readonly id: string;
  readonly name: string;
  readonly description: string;
  /** The summoning technique (a `summon` effect naming this id). */
  readonly techniqueId: string;
  /** The bond stage of your standing with the clan it answers from (0 at signing). */
  readonly standing: number;
  readonly stats: Stats;
  /** Health as a multiple of a human's 100 (a war-summon is huge). */
  readonly healthScale: number;
  readonly maxChakra: number;
  readonly traits?: readonly CombatTrait[];
  /** What it fights with: techniques of the pack, held by summons alone. */
  readonly techniqueIds: readonly string[];
  /** Chakra its caller pays every exchange it stays. */
  readonly upkeep: number;
  readonly price?: SummonPrice;
}

export interface ContractDef {
  readonly id: string;
  /** "The Salamanders of the Old Kilns". */
  readonly name: string;
  readonly description: string;
  /** Its summons, smallest first. */
  readonly summons: readonly SummonDef[];
}

/** A teacher who may let you sign their contract, once you are close enough to them. */
export interface ContractOffer {
  readonly contractId: string;
  readonly minStage: number;
}
