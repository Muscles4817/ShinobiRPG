import type { RangeBand } from '../../contract';

/**
 * The shape of the slot trace (`slotTrace.ts`), kept apart so the fight's state can hold one
 * without importing how it is worked out.
 */

/**
 * Why a slot passes over its turn: no such card (a tool used up), it doesn't reach or can't be
 * played from here, it can't be used now (chakra, breath, a seal), chakra kept for a finisher,
 * nothing for it to do, its condition doesn't hold, or no foe it may aim at.
 */
export const PASS_REASONS = [
  'missing',
  'out-of-reach',
  'cannot-use',
  'saving',
  'not-needed',
  'condition',
  'no-target',
] as const;
export type PassReason = (typeof PASS_REASONS)[number];

/** A pass, or (`preempted`) something else came first: an emergency, a step, a rescue. */
export type TraceReason = PassReason | 'preempted';

/** One slot over the round so far: how often it played, and why it passed when it didn't. */
export interface SlotTally {
  readonly played?: number;
  readonly passed?: Readonly<Partial<Record<TraceReason, number>>>;
}

/** Each slot's tally by distance and card id. */
export type SlotTrace = Readonly<Partial<Record<RangeBand, Readonly<Record<string, SlotTally>>>>>;
