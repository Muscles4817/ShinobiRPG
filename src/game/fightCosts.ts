import type { CombatCost, CombatOutcome } from '@/systems/combat';
import type { JournalChip } from '@/systems/journal';
import { STAT_INFO } from '@/systems/stats';
import type { CostTemplate } from '@/systems/techniques';

import { chip, log } from './ops';
import type { GameState } from './state';

/**
 * The price of the trump cards you played in a fight (`CombatOutcome.costs`). For now each
 * cost is only recorded in your journal: hospital days, exhaustion and injuries become real
 * when injuries arrive (plan step 2.6), and this is where they will be applied.
 */

function days(n: number): string {
  return n === 1 ? '1 day' : `${n} days`;
}

function costChip(cost: CostTemplate): JournalChip {
  switch (cost.kind) {
    case 'hospital':
      return chip(`${days(cost.days)} in hospital`, 'cost');
    case 'exhaustion':
      return chip(`${days(cost.days)} of chakra exhaustion`, 'cost');
    case 'injury':
      return chip(`${STAT_INFO[cost.stat].label} −${cost.amount} for ${days(cost.days)}`, 'harm');
    case 'permanent':
      return chip(`${STAT_INFO[cost.stat].label} −${cost.amount} for good`, 'harm');
  }
}

function record(state: GameState, { techniqueName, cost }: CombatCost): GameState {
  return log(state, {
    heading: `${techniqueName} takes its toll`,
    text: 'A trump card is never free. Your body will make you pay for it.',
    tone: 'warning',
    chips: [costChip(cost)],
  });
}

/** Records what the trumps you used in a finished fight will cost you. */
export function applyFightCosts(state: GameState, outcome: CombatOutcome): GameState {
  return (outcome.costs ?? []).reduce(record, state);
}
