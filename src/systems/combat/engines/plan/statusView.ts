import { alive, conditionStatuses } from '../../rules/body';
import { screened } from '../../rules/rows';
import { isDazed } from './daze';
import { fieldStatuses } from './field';
import { lingeringStatuses } from './lingering';
import { prepStatuses } from './prep';
import { inSight } from './senses';
import type { PlanFighter, PlanState } from './state';
import { stanceStatus } from './team';

/**
 * What the screen says of a fighter's state: conditions, whether a back-row fighter is still
 * out of reach behind their front row, whether a field blinds them, what they have ready
 * (empowered, clones, a trap), their stance and the marks on them. A hidden foe the player sees
 * anyway (insight) is shown as the player sees them: hidden from others, not from them. Read from the fight as it
 * stands or from an exchange part-played, so the watch screen can follow them beat by beat.
 */

type Standing = Pick<PlanState, 'fighters' | 'field' | 'mark' | 'foeMark'>;

/** The engine's own statuses (the body's conditions are added by `viewOf`). */
export function statuses(state: Standing, f: PlanFighter): string[] {
  return [
    ...(isDazed(f) ? ['Dazed'] : []),
    ...(f.sealed > 0 ? ['Sealed'] : []),
    ...lingeringStatuses(f),
    ...(alive(f) && screened(f, state.fighters) ? ['Screened'] : []),
    ...fieldStatuses(state, f),
    ...prepStatuses(f),
    ...stanceStatus(f, state.fighters),
    ...(alive(f) && f.id === state.mark ? ['Marked'] : []),
    ...(alive(f) && f.id === state.foeMark ? ['Targeted'] : []),
  ];
}

/** What a hidden foe the player sees anyway is called on the screen. */
const SEEN_HIDING = 'Hidden, but you see them';

/** A hidden foe of the player's whom the player sees all the same (`inSight`). */
export function seenByPlayer(state: Pick<Standing, 'fighters'>, f: PlanFighter): boolean {
  const player = state.fighters.find((x) => x.isPlayer);
  return f.hidden && player !== undefined && f.side !== player.side && inSight(player, f);
}

function conditionsShown(state: Standing, f: PlanFighter): string[] {
  const seen = seenByPlayer(state, f);
  return conditionStatuses(f).map((s) => (s === 'Hidden' && seen ? SEEN_HIDING : s));
}

/** Every status the screen shows for a fighter, as the engine's view puts them together. */
export function statusesShown(state: Standing, f: PlanFighter): string[] {
  return alive(f) ? [...conditionsShown(state, f), ...statuses(state, f)] : ['Down'];
}
