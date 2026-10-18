import type { Element } from '@/systems/techniques';

/**
 * The swarm part of the combat contract (see `contract.ts`, `docs/design/retinue-plan.md`):
 * a hive carried in its host's body, a pool of insects rather than a body of its own. Swarm
 * techniques spend them, settled insects draw a foe's chakra into the host, and the host loses
 * them to areas and to the elements their strain fears. The game keeps the hive between fights
 * and reads back how many came home (`CombatOutcome.swarm`).
 */

/** A strain's rules, as data: what its insects are good at and what kills them. */
export interface SwarmStrain {
  readonly name: string;
  /** How hard settled insects draw a foe's chakra: 1 is a strong draining strain. */
  readonly drain: number;
  /** Share of losses it shrugs off: 0 none, 0.5 half. */
  readonly hardiness: number;
  /** Elements that kill its insects far faster (fire, for most). */
  readonly fears: readonly Element[];
  /** How well its insects find hidden foes at a full hive: 0 not at all, 1 keenly. */
  readonly senses: number;
}

/** A host's hive as it goes into a fight. */
export interface CombatSwarm {
  readonly strain: SwarmStrain;
  /** Insects in the hive now. */
  readonly count: number;
  /** As many as the host's body can keep. */
  readonly cap: number;
}
