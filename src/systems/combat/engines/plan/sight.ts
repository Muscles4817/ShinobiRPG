import type { CombatTechnique } from '../../contract';
import { hasPerk } from '../../rules/body';
import { concealmentFrom, driveOf, hasVerb, senseChance, type EffectUse } from '../../rules/verbs';
import type { Card } from './cards';
import type { ToolMoment } from './pouch';
import { opponentsOf, type Turn } from './senses';
import { patch, say, type PlanFighter, type Round } from './state';
import { tell } from '../../rules/telling';

/**
 * Conceal and sense in a planned fight. A conceal hides its user as a smoke bomb would, but
 * how hard they are to find comes from their own art; attacking gives them away as ever. A
 * sense pulls hidden foes into the open, and for the rest of the fight its user reads foes as
 * insight does: every card they hold, and anyone who slips away again is found by a Search.
 */

export function conceal(round: Round, actor: PlanFighter, use: EffectUse<'conceal'>): Round {
  const concealment = concealmentFrom(driveOf(actor, use), use);
  return say(
    { ...round, fighters: patch(round.fighters, actor.id, { hidden: true, concealment }) },
    tell('{a} fade{a.s} from sight.', { a: actor }),
  );
}

function sensed(actor: PlanFighter): PlanFighter['perks'] {
  return hasPerk(actor, 'insight') ? actor.perks : [...actor.perks, 'insight'];
}

export function sense(round: Round, { actor, rng }: Turn, use: EffectUse<'sense'>): Round {
  const drive = driveOf(actor, use);
  const hidden = opponentsOf(round.fighters, actor).filter((f) => f.hidden);
  const found = hidden.filter((foe) => rng.chance(senseChance(drive, use, foe)));
  const fighters = found.reduce(
    (all, foe) => patch(all, foe.id, { hidden: false }),
    patch(round.fighters, actor.id, { perks: sensed(actor) }),
  );
  const spread = tell('{a.poss} senses spread across the field.', { a: actor });
  const reached = say({ ...round, fighters }, spread);
  if (found.length > 0) {
    return say(reached, tell('{found} can’t hide from {a.them}.', { found, a: actor }));
  }
  return hidden.length > 0 ? say(reached, 'Someone stays just out of reach.') : reached;
}

/** What decides whether sight is worth a turn: a tool's moment, and whether their field is up. */
export interface SightMoment extends ToolMoment {
  readonly fieldUp: boolean;
}

/**
 * A slotted sense the moment calls for (a foe is hidden and they don't read foes already), a
 * field whenever none of their side's is up (as a plan raises one: a field a foe laid over
 * theirs is taken back at once), or to open a round, a conceal (as a smoke bomb would).
 */
export function sightInstinct(
  self: PlanFighter,
  ready: readonly Card[],
  moment: SightMoment,
): Card | undefined {
  const opens = (c: CombatTechnique) => !self.hidden && hasVerb(c, 'conceal');
  const wants = (c: Card) =>
    c.kind === 'jutsu' &&
    ((moment.hiddenFoe && !hasPerk(self, 'insight') && hasVerb(c.technique, 'sense')) ||
      (!moment.fieldUp && hasVerb(c.technique, 'field')) ||
      (moment.opening && opens(c.technique)));
  return ready.find(wants);
}
