import type { Element } from '@/systems/techniques';

/**
 * The swarm part of the combat contract (see `contract.ts`, `docs/design/retinue-plan.md`):
 * a hive carried in its host's body, a pool of insects rather than a body of its own. Swarm
 * techniques spend them, settled insects draw a foe's chakra into the host, and the host loses
 * them to areas and to the elements their strain fears. The game keeps the hive between fights
 * and reads back how many came home (`CombatOutcome.swarm`).
 */

/**
 * What every insect has, as a matter of degree (graded 1 to 5, E to A): speed (attacks land),
 * bite (attacks hit hard), toughness (fewer lost), brood (breeds back faster, read outside the
 * fight), size (smaller insects: more of them, each lighter) and senses (finds the hidden).
 */
export const SWARM_QUALITIES = ['speed', 'bite', 'toughness', 'brood', 'size', 'senses'] as const;
export type SwarmQuality = (typeof SWARM_QUALITIES)[number];

/**
 * What only some species carry, weak to great (1 to 3): chakra drain (settled insects draw a
 * foe's chakra into the host), camouflage (attacks hard to see coming), glow (a settled foe is
 * easier to hit), blinding (a settled foe aims worse) and venom (settled insects poison).
 */
export const SWARM_GIFTS = ['drain', 'camouflage', 'glow', 'blinding', 'venom'] as const;
export type SwarmGift = (typeof SWARM_GIFTS)[number];

/** A strain's rules, as data: what its insects are good at and what kills them. */
export interface SwarmStrain {
  readonly name: string;
  readonly qualities: Readonly<Record<SwarmQuality, number>>;
  readonly gifts: Readonly<Partial<Record<SwarmGift, number>>>;
  /** Elements that kill its insects far faster (fire, for most). */
  readonly fears: readonly Element[];
}

/** A host's hive as it goes into a fight. */
export interface CombatSwarm {
  readonly strain: SwarmStrain;
  /** Insects in the hive now. */
  readonly count: number;
  /** As many as the host's body can keep. */
  readonly cap: number;
}
