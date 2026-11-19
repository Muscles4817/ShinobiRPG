import type { CombatCastMember } from '../../contract';
import { LOG_LIMIT, type PlanFighter, type PlanState } from './state';

/**
 * Who has been on the field this fight, and the log kept to its length between the player's acts.
 * The screen stages a stretch of the fight from its lines; a fighter who joined and left within it
 * (a shadow clone that popped) is gone from the fighters by its end, so the cast keeps their name
 * and side. And a stretch is never cut short: the log is trimmed only as an act begins, so
 * everything one act played (a whole fight watched to its end) stays to be told.
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

/** The log trimmed to `LOG_LIMIT` as an act begins, counting what it let go. */
export function trimmedLog(state: PlanState): PlanState {
  const over = state.log.length - LOG_LIMIT;
  if (over <= 0) return state;
  return { ...state, log: state.log.slice(over), logDropped: (state.logDropped ?? 0) + over };
}
