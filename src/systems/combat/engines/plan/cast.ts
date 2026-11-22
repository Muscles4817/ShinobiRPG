import type { CombatCastMember } from '../../contract';
import { LOG_LIMIT, type PlanFighter, type PlanState } from './state';

/**
 * Who has been on the field this fight, and the story kept to its length between the player's
 * acts. The screen stages a stretch of the fight from its events; a fighter who joined and left
 * within it (a shadow clone that popped) is gone from the fighters by its end, so the cast keeps
 * their name and side. And a stretch is never cut short: the story is trimmed only as an act
 * begins, so everything one act played (a whole fight watched to its end) stays to be told;
 * every stretch that plays an exchange opens with where everyone stands, so it folds whole.
 */

/** The cast after these fighters have stood on the field, newest names kept. */
export function castAfter(
  cast: readonly CombatCastMember[] | undefined,
  fighters: readonly PlanFighter[],
): CombatCastMember[] {
  const known = new Map((cast ?? []).map((c) => [c.id, c]));
  for (const f of fighters) {
    const like = f.shadowOf ?? f.summoner;
    const member = { id: f.id, name: f.name, side: f.side, maxHealth: f.maxHealth };
    known.set(f.id, like ? { ...member, like } : member);
  }
  return [...known.values()];
}

/**
 * Where the story's last `LOG_LIMIT` lines begin (with the changes told with the first of
 * them), or 0 when it holds no more than that.
 */
function keptFrom(story: PlanState['story']): number {
  let lines = 0;
  for (let i = story.length - 1; i >= 0; i -= 1) {
    if (story[i]?.kind === 'told') lines += 1;
    if (lines > LOG_LIMIT) return i + 1;
  }
  return 0;
}

/** The story trimmed to its last `LOG_LIMIT` lines as an act begins, counting what it let go. */
export function trimmedStory(state: PlanState): PlanState {
  const over = keptFrom(state.story);
  if (over === 0) return state;
  return {
    ...state,
    story: state.story.slice(over),
    storyDropped: (state.storyDropped ?? 0) + over,
  };
}
