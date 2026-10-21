/**
 * How a town greets you for what you are (`docs/design/sunagakure-plan.md`): a town may hold
 * something against where you come from, against what you carry (a summoning contract) or
 * against what is in your blood (an awakened bloodline). Each
 * greeting names its cause and its temper, and the game reads the temper in two places only:
 * what the town charges you, and how slowly its people warm to you (`game/greetings.ts`). Its
 * line is what the village screen says of it. A greeting may also shut the town's gates to you
 * until the village remembers something (a world mark a job leaves); a job may still take you
 * there, since it is the job that gets you in. Or it may hunt you: on its roads you are asked how
 * you travel and how you sleep, each answer bringing its hunters closer or not, and close enough
 * they find you (`game/hunt.ts`).
 */
import type { CombatGround } from '@/systems/combat';

import type { Tone } from './people';

/** How hard a town holds it against you: wary, or cold. */
export const GREETING_TEMPERS = ['wary', 'cold'] as const;
export type GreetingTemper = (typeof GREETING_TEMPERS)[number];

/**
 * What a town holds against you: the village you come from, a summoning contract held, or a
 * bloodline that has awakened in you (a dormant one shows nothing yet).
 */
export type GreetingCause =
  | { readonly kind: 'from'; readonly locationId: string }
  | { readonly kind: 'contract' }
  | { readonly kind: 'bloodline' };

/** The town turns you away at the gate until the village remembers `until`. */
export interface ShutGates {
  /** The world mark that opens them. */
  readonly until: string;
  /** What you are told when you try to travel there: why, and what might change it. */
  readonly refusal: string;
}

/** One answer at a hunt's stop: how much closer it brings the hunters (0 to 2), and its cost. */
export interface HuntAnswer {
  readonly label: string;
  readonly tone: Tone;
  /** What happens, in the story. No numbers. */
  readonly reply: string;
  /** How much closer it brings the hunters. */
  readonly heat: number;
  /** Energy it costs you, if it is the hard way. */
  readonly energy?: number;
}

/** A stop on a hunted road: a question and its answers. */
export interface HuntStop {
  readonly text: string;
  readonly answers: readonly HuntAnswer[];
}

/**
 * Being hunted on a town's roads: the road-event regions where its hunters look for you, who
 * comes when they find you, the stop before each hunted stretch (how you travel) and the one
 * after it (how you sleep), and what is said when they find you.
 */
export interface HuntDef {
  readonly regions: readonly string[];
  readonly hunterIds: readonly string[];
  readonly travel: HuntStop;
  readonly sleep: HuntStop;
  readonly found: string;
  /** Where they catch up with you; open ground when absent. */
  readonly ground?: CombatGround;
}

export interface TownGreeting {
  readonly cause: GreetingCause;
  readonly temper: GreetingTemper;
  /** What the village screen says while it holds, no numbers. */
  readonly line: string;
  readonly shut?: ShutGates;
  readonly hunt?: HuntDef;
}
