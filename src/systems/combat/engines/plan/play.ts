import { COUNTER_IDS } from '../../rules/counters';
import { roundOfExchange } from './keepTryingShape';
import { afterUsing } from '../../rules/trumps';
import { restingAfter } from './recovery';
import { strike } from './arms';
import { isReadyDefence, spendsOnSelf, type Card, type SelfCard } from './cards';
import { commit } from './commitment';
import { gather } from './gather';
import { useJutsu } from './jutsu';
import { useTool } from './pouch';
import { facing } from './distance';
import { sealsBroken } from './closeQuarters';
import { dispel, search, type Turn } from './senses';
import { fighterIn, patch, type PlanFighter, type Round } from './state';
import { step } from './steps';

/**
 * A card played on a fighter's turn (`round.ts` decides which): a step, a search or dispel, a
 * technique, a tool, a blow or a throw, or a turn spent on themself (committing to a defence,
 * gathering, uncovering an eye). Defences kept ready react on their own and take no turn.
 */

/** Counts a plain strike or a step towards the fighter's usage report. */
function practise(round: Round, actor: PlanFighter, work: 'blows' | 'footwork'): Round {
  const done = fighterIn(round, actor.id)?.[work] ?? 0;
  return { ...round, fighters: patch(round.fighters, actor.id, { [work]: done + 1 }) };
}

/** A step taken while making for where they fight marks the round they tried in (`keepTrying.ts`). */
function triedFor(round: Round, actor: PlanFighter): Round {
  if (actor.keepAt === undefined) return round;
  const triedFor = roundOfExchange(round.number);
  const fighters = round.fighters.map((f) => (f.id === actor.id ? { ...f, triedFor } : f));
  return { ...round, fighters };
}

export function play(round: Round, turn: Turn, card: Card): Round {
  if (isReadyDefence(card)) return round;
  if (spendsOnSelf(card)) return spent(round, turn, card);
  switch (card.kind) {
    case 'step':
      return step(
        triedFor(practise(round, turn.actor, 'footwork'), turn.actor),
        { ...turn, target: turn.target ?? facing(round, turn.actor) },
        card.direction,
      );
    case 'search':
      return search(round, turn);
    case 'dispel':
      return dispel(round, turn);
    case 'jutsu': {
      // Up close, hand signs may come apart before the technique is cast (`closeQuarters.ts`).
      const broken = sealsBroken(round, turn, card.technique);
      if (broken) return broken;
      const trumpsUsed = afterUsing(turn.actor, card.technique);
      const resting = restingAfter(turn.actor, card.technique);
      const used = { trumpsUsed, ...(resting ? { recovering: resting } : {}) };
      const marked = {
        ...round,
        fighters: round.fighters.map((f) => (f.id === turn.actor.id ? { ...f, ...used } : f)),
      };
      return useJutsu(marked, turn, card.technique);
    }
    case 'item':
      return useTool(round, turn, card.item);
    case 'strike':
      return strike(practise(round, turn.actor, 'blows'), turn, false);
    case 'throw':
      return strike(round, turn, true);
  }
}

/** A turn spent on oneself: committing to a defence, gathering, uncovering an eye. */
function spent(round: Round, turn: Turn, card: SelfCard): Round {
  switch (card.kind) {
    case 'evade':
    case 'brace':
      return commit(round, turn, card.kind);
    case 'counter':
      return commit(round, turn, COUNTER_IDS[card.waits]);
    case 'gather':
      return gather(round, turn);
  }
}
