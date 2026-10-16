import { patch, say, type PlanFighter, type Round } from './state';
import { momentOf, reelingLine } from './voice';

/**
 * A turn lost before it starts in a planned fight: reeling from a daze, or gathering after a
 * combination. Null when the fighter is free to act.
 */
export function lostTurn(round: Round, actor: PlanFighter): Round | null {
  if (actor.stunned > 0) {
    const fighters = patch(round.fighters, actor.id, { stunned: actor.stunned - 1 });
    return say({ ...round, fighters }, reelingLine(momentOf(round, actor.id), actor.name));
  }
  if (actor.joined) {
    const fighters = patch(round.fighters, actor.id, { joined: false });
    return say({ ...round, fighters }, `${actor.name} gathers themself after the combination.`);
  }
  return null;
}
