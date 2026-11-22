import { betweenRounds } from './adapt';
import { closingLine } from './falls';
import { foeMarkFor } from './foeTeam';
import { asRound } from './intent';
import { adaptLines } from './learned';
import { foesRestanced } from './restance';
import { playerOf, type PlanState } from './state';
import { healthNow } from './roundOpened';
import { roundReads } from './roundReads';
import { quietAfter } from './tiring';
import { draftedForRound } from './whoPlans';
import { dividerTold } from './staging';
import { toldOn } from './toldPools';

/**
 * The end of a round: a fight no one is winning ends in a stalemate (`tiring.ts`); otherwise
 * foes look at their team again (`restance.ts`) and rethink their defences (`adapt.ts`), saying
 * so when they change one (`learned.ts`), and it is back to the card table.
 */

/** Exchanges per round; the cards can be changed between rounds. */
export { ROUND_EXCHANGES } from './keepTryingShape';
import { ROUND_EXCHANGES } from './keepTryingShape';

const nextRound = (watching: boolean) =>
  watching ? [dividerTold('— The next round begins —')] : [];

/** When the round is over, back to the card table. */
export function endOfRound(ended: PlanState): PlanState {
  if (ended.result || ended.exchange < ROUND_EXCHANGES) return ended;
  // A fight no one is winning ends in a stalemate (`tiring.ts`).
  const next = { ...ended, ...quietAfter(ended) };
  if (next.result)
    return { ...next, story: toldOn(next.story, closingLine(asRound(next), next.result)) };
  const watching = next.watching ?? false;
  const restanced = foesRestanced(next.fighters);
  const fighters = betweenRounds(restanced, next.reads, watching);
  // At plan-then-edit or orders, the mind drafts the new round around your slots (`whoPlans.ts`).
  return draftedForRound({
    ...next,
    phase: watching ? 'fight' : 'loadout',
    bout: next.bout + 1,
    exchange: 0,
    fighters,
    ...foeMarkFor(next.fighters),
    // Between rounds the plan screen says what to do; the story only marks the new round.
    // A foe that changes the defence it keeps says so (`learned.ts`).
    healthAtRound: healthNow(fighters),
    // What the player's fighter made of the round (`roundReads.ts`).
    story: toldOn(
      next.story,
      ...adaptLines(restanced, fighters, playerOf(next)),
      ...roundReads(next),
      ...nextRound(watching),
    ),
  });
}
