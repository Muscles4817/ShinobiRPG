import type { RangeBand } from '../../contract';

/**
 * Who plans the player's round (`docs/design/combat-ai-plan.md` Part 9, three levels of one
 * interface), as a shape only so the fight state can hold it (`whoPlans.ts`, `drafting.ts`).
 */

/** Your list (the plan is wholly yours), plan then edit (the mind drafts what you don't set), orders. */
export const PLANNING_LEVELS = ['list', 'draft', 'orders'] as const;
export type PlanningLevel = (typeof PLANNING_LEVELS)[number];

/** What an order asks of the mind's draft, round by round. */
export const PLAYER_ORDERS = ['free', 'press', 'distance', 'safe', 'setup'] as const;
export type PlayerOrder = (typeof PLAYER_ORDERS)[number];

export interface PlayerPlanning {
  /** Who plans: absent, your list. */
  readonly planning?: Exclude<PlanningLevel, 'list'>;
  /** At orders, what you asked for: absent, fight as the mind sees fit. */
  readonly order?: Exclude<PlayerOrder, 'free'>;
  /** Slots you set yourself (pins), by distance: the mind drafts around them, never over them. */
  readonly owned?: Readonly<Partial<Record<RangeBand, readonly string[]>>>;
  /** Cards you forbade: never drafted, never reached for. */
  readonly forbidden?: readonly string[];
  /** Why the mind drafted each slot it drafted, by `band:card`. */
  readonly draftedWhy?: Readonly<Record<string, string>>;
}
