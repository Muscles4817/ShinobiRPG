import type { Moment } from './choose';
import { distanceBetween, bandOf } from './distance';
import { ownField } from './field';
import { opponentsOf } from './senses';
import type { PlanFighter, Round } from './state';

/**
 * The moment a fighter acts in, read from the round: whom they'd go for, at what distance, and
 * the whole field, so instinct sees what a plan sees (an open foe, a killer, a partner). A
 * telegraph rolled between exchanges and a turn taken in one both build it here.
 */
export function momentIn(round: Round, self: PlanFighter, foe: PlanFighter | undefined): Moment {
  return {
    band: foe ? distanceBetween(round, self.id, foe.id) : bandOf(round, self),
    foe,
    hiddenFoe: opponentsOf(round.fighters, self).some((f) => f.hidden),
    opening: round.opening ?? false,
    fieldUp: ownField(round.field, self),
    fighters: round.fighters,
    exchange: round.number,
    ...(round.reads ? { reads: round.reads } : {}),
  };
}
