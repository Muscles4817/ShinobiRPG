import type { Element } from '@/systems/techniques';

/**
 * Hives (`docs/design/retinue-plan.md`, step 4): the strains of insect a host can keep in their
 * body, and the clans that install a hive in their children. A strain's numbers are its rules in
 * a fight (`SwarmStrain` in the combat contract): how hard it drains, how hardy it is, what kills
 * it fastest and how keenly it senses.
 */
export interface StrainDef {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  /** How hard settled insects draw a foe's chakra: 1 is a strong draining strain. */
  readonly drain: number;
  /** Share of losses it shrugs off. */
  readonly hardiness: number;
  /** Elements that kill it far faster. */
  readonly fears: readonly Element[];
  /** How keenly it finds the hidden at a full hive, 0 to 1. */
  readonly senses: number;
}

/** A clan whose children are born with a hive. */
export interface ClanHive {
  readonly strainId: string;
}
