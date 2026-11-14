import type { RangeBand } from '../../contract';
import { distanceBetween, bandOf } from './distance';
import { ownField } from './field';
import { opponentsOf } from './senses';
import type { PlanFighter, Reads, Round } from './state';

/** The situation a fighter acts in. */
export interface Moment {
  readonly band: RangeBand;
  /** The foe they'd attack; undefined when no living foe can be seen. */
  readonly foe: PlanFighter | undefined;
  /** Some living foe is hidden in an illusion. */
  readonly hiddenFoe?: boolean;
  /** The first exchange of a round, when a smoke bomb opens. */
  readonly opening?: boolean;
  /** A field of their own side is already over the fight. */
  readonly fieldUp?: boolean;
  /** Everyone in the fight, when known: a combination technique needs a partner among them. */
  readonly fighters?: readonly PlanFighter[];
  /** The exchange the card would be played in: a foe steady after a daze can't be dazed. */
  readonly exchange?: number;
  /** What each fighter has been seen to do (`reads.ts`): foes lean on what beats it. */
  readonly reads?: Reads;
}

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
