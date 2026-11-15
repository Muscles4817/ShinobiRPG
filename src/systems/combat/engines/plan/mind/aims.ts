import { alive } from '../../../rules/body';
import type { Round } from '../state';
import { assess } from './assess';
import { identityOf } from './identity';
import { choose } from './objectives';

/**
 * Everyone standing settles the objective they hold for the exchanges ahead, from the fight as
 * it now stands (`objectives.ts`). In shadow: kept on the fighter and written in the decision
 * log beside what they actually do, never read by a choice.
 */
export function objectivesAfter(round: Round): Round {
  const fighters = round.fighters.map((f) =>
    alive(f)
      ? {
          ...f,
          objective: choose(assess(f, round), identityOf(f), {
            held: f.objective,
            now: round.number,
          }),
        }
      : f,
  );
  return { ...round, fighters };
}
