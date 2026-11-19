import type { CombatCall } from '../../contract';
import { tell } from '../../rules/telling';
import { say, type PlanFighter, type Round } from './state';
import { plannedSummons } from './summonPlans';
import { placed } from './summons';

/**
 * Bodies already on the field as a fight begins (`CombatCall.present`): Pain's Paths stand
 * around the Deva Path before anyone moves, rather than being called on his first turn. They are
 * placed as a summoning places them (`placed` in `summons.ts`), beside their caller and paid for
 * every exchange like any summons, with no blood price and no turn spent; each gets its plan
 * before the first exchange, as a body called mid-fight does at the end of the one it came in.
 */

const PRESENT = '{b} stand{b.s} with {a}.';

function presentCalls(f: PlanFighter): CombatCall[] {
  return (f.calls ?? []).filter((c) => c.present === true && c.perch !== true);
}

function standing(round: Round, callerId: string, call: CombatCall): Round {
  const caller = round.fighters.find((f) => f.id === callerId);
  if (!caller || caller.summonsOut?.includes(call.id)) return round;
  const next = placed(round, caller, call);
  const body = next.fighters[next.fighters.length - 1];
  return body ? say(next, tell(PRESENT, { a: caller, b: body })) : next;
}

/** The fight as it opens with every caller's present bodies already beside them. */
export function presentAtStart(round: Round): Round {
  const callers = round.fighters.filter((f) => presentCalls(f).length > 0);
  if (callers.length === 0) return round;
  const stood = callers.reduce(
    (r, caller) => presentCalls(caller).reduce((at, call) => standing(at, caller.id, call), r),
    round,
  );
  return plannedSummons(stood);
}
