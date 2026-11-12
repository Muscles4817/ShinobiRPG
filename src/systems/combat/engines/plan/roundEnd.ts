import { betweenRounds } from './adapt';
import { closingLine } from './falls';
import { foeMarkFor } from './foeTeam';
import { asRound } from './intent';
import { adaptLines } from './learned';
import { foesRestanced } from './restance';
import { playerOf, type PlanState } from './state';
import { quietAfter } from './tiring';

/**
 * The end of a round: a fight no one is winning ends in a stalemate (`tiring.ts`); otherwise
 * foes look at their team again (`restance.ts`) and rethink their defences (`adapt.ts`), saying
 * so when they change one (`learned.ts`), and it is back to the card table.
 */

/** Exchanges per round; the cards can be changed between rounds. */
export const ROUND_EXCHANGES = 4;

const nextRound = (watching: boolean) => (watching ? ['— The next round begins —'] : []);

/** When the round is over, back to the card table. */
export function endOfRound(ended: PlanState): PlanState {
  if (ended.result || ended.exchange < ROUND_EXCHANGES) return ended;
  // A fight no one is winning ends in a stalemate (`tiring.ts`).
  const next = { ...ended, ...quietAfter(ended) };
  if (next.result) return { ...next, log: [...next.log, closingLine(asRound(next), next.result)] };
  const watching = next.watching ?? false;
  const restanced = foesRestanced(next.fighters);
  const fighters = betweenRounds(restanced, next.reads, watching);
  return {
    ...next,
    phase: watching ? 'fight' : 'loadout',
    bout: next.bout + 1,
    exchange: 0,
    fighters,
    ...foeMarkFor(next.fighters),
    // Between rounds the plan screen says what to do; the story only marks the new round.
    // A foe that changes the defence it keeps says so (`learned.ts`).
    log: [...next.log, ...adaptLines(restanced, fighters, playerOf(next)), ...nextRound(watching)],
  };
}
