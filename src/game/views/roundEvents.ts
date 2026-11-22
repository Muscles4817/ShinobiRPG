import {
  foldEvent,
  foldStory,
  type CombatEvent,
  type HealthCause,
  type StoryStanding,
  type ToldEvent,
} from '@/systems/combat';

/**
 * The round just played, read from the fight's events for the plan screen (`roundWhy.ts`,
 * `roundAdvice.ts`, `noticed.ts`): its lines, every health lost in it with whose it was, and
 * where everyone stood as it opened. Nothing is read from the words: each fact is a field the
 * engine recorded where it happened.
 */

/** Health someone lost in the round: how much, why, and to whom (when someone dealt it). */
export interface Harm {
  readonly who: string;
  readonly amount: number;
  readonly cause: HealthCause;
  readonly by?: string;
}

export interface RoundRead {
  readonly told: readonly ToldEvent[];
  readonly harms: readonly Harm[];
  /** Where everyone stood as the round opened (its first divider). */
  readonly opened: StoryStanding;
}

/** Where the last round's opening divider is in a story; -1 before any round. */
function roundStart(story: readonly CombatEvent[]): number {
  for (let i = story.length - 1; i >= 0; i -= 1) {
    const e = story[i];
    if (e?.kind === 'told' && e.opensRound) return i;
  }
  return -1;
}

/** Health lost on each health event, by the health folded up to it. */
function harmsIn(events: readonly CombatEvent[], from: StoryStanding): Harm[] {
  let standing = from;
  const harms: Harm[] = [];
  for (const e of events) {
    if (e.kind === 'health') {
      const amount = (standing.pools[e.who]?.health ?? e.to) - e.to;
      const by = e.by ? { by: e.by } : {};
      if (amount > 0) harms.push({ who: e.who, amount, cause: e.cause, ...by });
    }
    standing = foldEvent(standing, e);
  }
  return harms;
}

/** The round just played; null before any round has been. */
export function lastRound(story: readonly CombatEvent[]): RoundRead | null {
  const start = roundStart(story);
  if (start < 0) return null;
  const opened = foldStory(story.slice(0, start + 1));
  const rest = story.slice(start);
  return {
    told: rest.filter((e): e is ToldEvent => e.kind === 'told'),
    harms: harmsIn(rest, opened),
    opened,
  };
}

/** Whom a cause is about: its subject, else (a fight saved before causes said) whose turn it was. */
export function causeSubject(told: ToldEvent): string | undefined {
  return told.cause?.subject ?? told.actor;
}
