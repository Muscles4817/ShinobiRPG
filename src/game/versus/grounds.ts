import { COMBAT_GROUNDS, GROUND_RULES, type CombatGround } from '@/systems/combat';

/** The grounds a versus bout may be fought on, as the setup screen lists them. */

export interface VersusGround {
  readonly id: CombatGround;
  readonly name: string;
  /** What fighting there changes, in a line. */
  readonly line: string;
}

export const VERSUS_GROUNDS: readonly VersusGround[] = COMBAT_GROUNDS.map((id) => ({
  id,
  name: GROUND_RULES[id].name,
  line: GROUND_RULES[id].line,
}));
