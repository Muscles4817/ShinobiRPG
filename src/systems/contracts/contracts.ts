import { addPoints, bondWith, stageOf } from '@/systems/bonds';
import type { SummonFate } from '@/systems/combat';

/**
 * A summoning contract held (`docs/design/retinue-plan.md`, step 3): one at a time, with a
 * standing with the whole clan, kept in bond points so its stages read like any bond. Summons
 * answer from the stage they ask; how they fare moves the standing: one called and kept to the
 * end is pleased, one sent home unpaid a little less so, one beaten holds it against you.
 */

export interface Contract {
  readonly contractId: string;
  /** Your standing with the clan, in bond points (`systems/bonds` stages). */
  readonly standing: number;
  readonly signedDay: number;
}

/** Where your standing starts the day you sign. */
export const SIGNED_STANDING = 0;

/** How each way a summon's part ended moves your standing with its clan. */
export const FATE_STANDING: Readonly<Record<SummonFate, number>> = {
  stayed: 3,
  'sent-home': 1,
  fell: -3,
};

export function signed(contractId: string, day: number): Contract {
  return { contractId, standing: SIGNED_STANDING, signedDay: day };
}

/** The standing after a fight in which these summons ended their parts. */
export function standingAfter(contract: Contract, fates: readonly SummonFate[]): Contract {
  const delta = fates.reduce((sum, fate) => sum + FATE_STANDING[fate], 0);
  return { ...contract, standing: addPoints(bondWith(contract.standing), delta).points };
}

/** The stage of your standing, as a bond stage. */
export function standingStage(contract: Pick<Contract, 'standing'>): number {
  return stageOf(contract.standing);
}

/** Whether a summon that answers from this stage answers you now. */
export function answers(contract: Pick<Contract, 'standing'>, stage: number): boolean {
  return standingStage(contract) >= stage;
}
