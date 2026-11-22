import type { GameState } from '../state';
import type { Fact, FactKind, FactOf } from './types';

/**
 * Writing facts down and reading them back. `recordFact` is the only writer: the function that
 * makes a change calls it with the fact of that change. Facts only ever accumulate between one
 * day's opening and the next, so a reader can take "everything since" by position.
 */

export function recordFact(state: GameState, fact: Fact): GameState {
  return { ...state, facts: [...state.facts, fact] };
}

/** The facts of one kind, in the order they happened. */
export function factsOf<K extends FactKind>(facts: readonly Fact[], kind: K): FactOf<K>[] {
  return facts.filter((f): f is FactOf<K> => f.kind === kind);
}

/** The facts still worth keeping once `day` has opened: those of that day and after. */
export function factsFrom(facts: readonly Fact[], day: number): readonly Fact[] {
  return facts.every((f) => f.day >= day) ? facts : facts.filter((f) => f.day >= day);
}
