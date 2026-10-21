import { alive, conditionStatuses } from '../../rules/body';
import { screened } from '../../rules/rows';
import { isDazed } from './daze';
import { fieldStatuses } from './field';
import { lingeringStatuses } from './lingering';
import { prepStatuses } from './prep';
import type { PlanFighter, PlanState } from './state';
import { stanceStatus } from './team';

/**
 * What the screen says of a fighter's state: conditions, whether a back-row fighter is still
 * out of reach behind their front row, whether a field blinds them, what they have ready
 * (empowered, clones, a trap), their stance and the marks on them. Read from the fight as it
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

/** Every status the screen shows for a fighter, as `viewOf` puts them together. */
export function statusesShown(state: Standing, f: PlanFighter): string[] {
  return alive(f) ? [...conditionStatuses(f), ...statuses(state, f)] : ['Down'];
}
