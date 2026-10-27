/**
 * What the village must remember, or must not, before something is offered: a follow-up job
 * waits on the mark an earlier one left, and a story that has moved on closes what it leaves
 * behind. Jobs and road events read their gates the same way.
 */
export interface WorldGate {
  /** Only once the village remembers this (a world mark). */
  readonly needsWorldMark?: string;
  /** No longer once the village remembers this: the story has moved on. */
  readonly closedBy?: string;
}

/** Whether what the village remembers lets this through. */
export function worldAllows(gate: WorldGate, marks: readonly string[]): boolean {
  return (
    (gate.needsWorldMark === undefined || marks.includes(gate.needsWorldMark)) &&
    (gate.closedBy === undefined || !marks.includes(gate.closedBy))
  );
}
