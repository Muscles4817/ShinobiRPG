import { isLegacyStory, storyOfLines } from '../../rules/narrationLegacy';
import type { PlanState } from './state';

/**
 * A fight saved before its story was kept as events holds a `log` of lines that carried their
 * facts inside the words (`rules/narrationLegacy.ts`). It is read into events once, as the fight
 * is loaded, so it plays on and its watch screen folds like any other.
 */

interface SavedBefore {
  readonly log?: readonly string[];
  readonly logDropped?: number;
  readonly story?: readonly unknown[];
}

export function withStory(state: PlanState): PlanState {
  // Saved state may predate events; the old fields are checked before use.
  const raw = state as PlanState & SavedBefore;
  // `story` is checked too: a save can't promise its shape.
  const story = raw.story as SavedBefore['story'];
  const lines = story && isLegacyStory(story) ? story : raw.log;
  if (!lines) return state;
  const { log: _log, logDropped, ...rest } = raw;
  return {
    ...rest,
    story: storyOfLines(lines),
    ...(logDropped ? { storyDropped: logDropped } : {}),
  };
}
