import { afterUsing } from '../../rules/trumps';
import { strike } from './arms';
import { isReadyDefence, spendsOnSelf, type Card, type SelfCard } from './cards';
import { commit } from './commitment';
import { gather } from './gather';
import { useJutsu } from './jutsu';
import { useTool } from './pouch';
import { dispel, opponentsOf, search, type Turn } from './senses';
import { fighterIn, patch, type PlanFighter, type Round } from './state';
import { step } from './steps';
import { reveal } from './veil';

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

export function play(round: Round, turn: Turn, card: Card): Round {
  if (isReadyDefence(card)) return round;
  if (spendsOnSelf(card)) return spent(round, turn, card);
  switch (card.kind) {
    case 'step':
      return step(
        practise(round, turn.actor, 'footwork'),
        { ...turn, target: turn.target ?? opponentsOf(round.fighters, turn.actor)[0] },
        card.direction,
      );
    case 'search':
      return search(round, turn);
    case 'dispel':
      return dispel(round, turn);
    case 'jutsu': {
      const trumpsUsed = afterUsing(turn.actor, card.technique);
      const marked = { ...round, fighters: patch(round.fighters, turn.actor.id, { trumpsUsed }) };
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
    case 'gather':
      return gather(round, turn);
    case 'reveal':
      return reveal(round, turn);
  }
}
