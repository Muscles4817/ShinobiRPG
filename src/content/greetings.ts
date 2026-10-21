/**
 * How a town greets you for what you are (`docs/design/sunagakure-plan.md`): a town may hold
 * something against where you come from or against what you carry (a summoning contract). Each
 * greeting names its cause and its temper, and the game reads the temper in two places only:
 * what the town charges you, and how slowly its people warm to you (`game/greetings.ts`). Its
 * line is what the village screen says of it.
 */

/** How hard a town holds it against you: wary, or cold. */
export const GREETING_TEMPERS = ['wary', 'cold'] as const;
export type GreetingTemper = (typeof GREETING_TEMPERS)[number];

/** What a town holds against you: the village you come from, or a summoning contract held. */
export type GreetingCause =
  { readonly kind: 'from'; readonly locationId: string } | { readonly kind: 'contract' };

export interface TownGreeting {
  readonly cause: GreetingCause;
  readonly temper: GreetingTemper;
  /** What the village screen says while it holds, no numbers. */
  readonly line: string;
}
