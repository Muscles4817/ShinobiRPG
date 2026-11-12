/**
 * The shape of mid-round calls (`roundCalls.ts`), kept apart so the fight's state can hold them
 * without importing how they are judged.
 */

export const CALL_TRIGGERS = [
  'summoned',
  'revealed',
  'held',
  'hurt',
  'killer',
  'ally-down',
] as const;
export type CallTrigger = (typeof CALL_TRIGGERS)[number];

/** What has been called this fight: the triggers that stopped a round, and your own calls used. */
export interface Calls {
  readonly fired?: readonly CallTrigger[];
  readonly own?: number;
}
