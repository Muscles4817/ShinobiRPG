import type {
  CombatEvent,
  HealthCause,
  NarrationReaction,
  StoryPools,
  ToldEvent,
} from '@/systems/combat';

/**
 * A fight's story built by hand for tests of its readers (the watch screen, the plan screen's
 * strip and advice): events as an engine records them, with only the fields a test cares about.
 */

/** A divider; the first exchange of a round opens it. */
export function divider(text = '— First exchange —', opensRound = true): ToldEvent {
  return {
    kind: 'told',
    text,
    divider: true,
    ...(opensRound ? { opensRound: true as const } : {}),
  };
}

/** A line of the story, told in `actor`'s turn. */
export function said(text: string, actor?: string, more: Partial<ToldEvent> = {}): ToldEvent {
  return { kind: 'told', text, ...(actor ? { actor } : {}), ...more };
}

/** A defence kept by `by` that met `on`'s attack. */
export function reacting(reaction: NarrationReaction, by: string, on: string) {
  return { reaction, by, on };
}

/** Where someone stands as a stretch opens. */
export function stand(
  who: string,
  pools: StoryPools,
  statuses: readonly string[] = [],
): CombatEvent {
  return { kind: 'stand', who, pools, statuses };
}

/** Someone's health set to `to`, by whoever did it. */
export function health(
  who: string,
  to: number,
  by?: string,
  cause: HealthCause = 'hit',
): CombatEvent {
  return { kind: 'health', who, to, cause, ...(by ? { by } : {}) };
}
