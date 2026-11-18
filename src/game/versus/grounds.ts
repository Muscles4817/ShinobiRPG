import { COMBAT_GROUNDS, GROUND_RULES, type CombatGround, type RangeBand } from '@/systems/combat';

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

/** Where a versus bout starts, as the setup screen lists them: mid range unless chosen. */
export interface VersusStart {
  readonly id: RangeBand;
  readonly name: string;
  /** What starting there means, in a line. */
  readonly line: string;
}

export const VERSUS_STARTS: readonly VersusStart[] = [
  { id: 'mid', name: 'Mid range', line: 'A few strides apart, where most fights start.' },
  {
    id: 'close',
    name: 'Up close',
    line: 'Close enough to touch: whoever fights up close starts at home.',
  },
  {
    id: 'far',
    name: 'Far apart',
    line: 'Across the field: whoever fights from far starts at home, and must be reached.',
  },
];
