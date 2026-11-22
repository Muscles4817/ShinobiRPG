import type { CombatEvent, StoryPools, ToldEvent } from './storyContract';

/**
 * Folding a fight's events in order into where everyone stands (`storyContract.ts`). The one
 * fold: the watch screen stages its beats with it, the engine brings its story level with the
 * fight by it, and the invariant test holds the two together. A line of the story changes
 * nothing; every value moves on the event that says so.
 */

export interface StoryStanding {
  /** Health and pools by fighter, as the events have said them. */
  readonly pools: Readonly<Record<string, StoryPools>>;
  /** Statuses by fighter, as the events have said them. */
  readonly statuses: Readonly<Record<string, readonly string[]>>;
  /** Who is on the field, in the order they came onto it. */
  readonly present: readonly string[];
}

export const NO_STANDING: StoryStanding = { pools: {}, statuses: {}, present: [] };

function onField(present: readonly string[], who: string): readonly string[] {
  return present.includes(who) ? present : [...present, who];
}

function withPools(standing: StoryStanding, who: string, moved: StoryPools): StoryStanding {
  return { ...standing, pools: { ...standing.pools, [who]: { ...standing.pools[who], ...moved } } };
}

/** Where everyone stands once this event has happened. */
export function foldEvent(standing: StoryStanding, event: CombatEvent): StoryStanding {
  switch (event.kind) {
    case 'told':
    case 'fall':
      return standing;
    case 'stand':
    case 'join':
      return {
        pools: { ...standing.pools, [event.who]: event.pools },
        statuses: { ...standing.statuses, [event.who]: event.statuses },
        present: onField(standing.present, event.who),
      };
    case 'health':
      return withPools(standing, event.who, { health: event.to });
    case 'pools':
      return withPools(standing, event.who, event.to);
    case 'status':
      return { ...standing, statuses: { ...standing.statuses, [event.who]: event.statuses } };
    case 'leave':
      return { ...standing, present: standing.present.filter((id) => id !== event.who) };
  }
}

/** Where everyone stands once these events have happened, from where they stood before. */
export function foldStory(
  events: readonly CombatEvent[],
  from: StoryStanding = NO_STANDING,
): StoryStanding {
  return events.reduce(foldEvent, from);
}

/** The told lines among a story's events. */
export function toldIn(story: readonly CombatEvent[]): ToldEvent[] {
  return story.filter((e): e is ToldEvent => e.kind === 'told');
}

/** The story's words, line by line, as a reader sees them. */
export function toldText(story: readonly CombatEvent[]): string[] {
  return toldIn(story).map((e) => e.text);
}

/** The last `count` told lines of a story, oldest first, read from its end. */
export function recentTold(story: readonly CombatEvent[], count: number): ToldEvent[] {
  const found: ToldEvent[] = [];
  for (let i = story.length - 1; i >= 0 && found.length < count; i -= 1) {
    const e = story[i];
    if (e?.kind === 'told') found.push(e);
  }
  return found.reverse();
}
