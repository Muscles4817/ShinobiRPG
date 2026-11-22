import type { PlanState, Round } from './state';

/**
 * What an exchange carries in from the fight as it stands (`round.ts`): what everyone has read,
 * the field, the ground, the marks, how it is fought, and the round's slot trace so far.
 */
export function carriedIn(state: PlanState): Partial<Round> {
  return {
    ...(state.reads ? { reads: state.reads } : {}),
    ...(state.field ? { field: state.field } : {}),
    ...(state.ground ? { ground: state.ground } : {}),
    ...(state.occasion ? { occasion: state.occasion } : {}),
    ...(state.mark ? { mark: state.mark } : {}),
    ...(state.foeMark ? { foeMark: state.foeMark } : {}),
    ...(state.watching ? { watching: true as const } : {}),
    ...(state.toTheLast ? { toTheLast: true as const } : {}),
    ...(state.slotTrace ? { slotTrace: state.slotTrace } : {}),
    ...(state.decisions ? { decisions: [] } : {}),
  };
}
