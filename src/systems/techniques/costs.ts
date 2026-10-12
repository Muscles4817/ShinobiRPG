import type { StatId } from '@/systems/stats';

/**
 * What a trump card takes out of its user after the fight. Every cost comes from this fixed
 * template set, so the game can apply them all the same way: days in hospital, days of chakra
 * exhaustion, a stat hurt for some days, or (rarely) a stat lost for good.
 */
export type CostTemplate =
  | { readonly kind: 'hospital'; readonly days: number }
  | { readonly kind: 'exhaustion'; readonly days: number }
  | {
      readonly kind: 'injury';
      readonly stat: StatId;
      readonly amount: number;
      readonly days: number;
    }
  | { readonly kind: 'permanent'; readonly stat: StatId; readonly amount: number };

/** Whether a cost's numbers make sense: positive days and amounts. */
export function costIsSane(cost: CostTemplate): boolean {
  switch (cost.kind) {
    case 'hospital':
    case 'exhaustion':
      return cost.days > 0;
    case 'injury':
      return cost.days > 0 && cost.amount > 0;
    case 'permanent':
      return cost.amount > 0;
  }
}
