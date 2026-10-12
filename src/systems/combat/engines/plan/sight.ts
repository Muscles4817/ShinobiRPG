import { hasPerk } from '../../rules/body';
import { concealmentFrom, driveOf, hasVerb, senseChance, type EffectUse } from '../../rules/verbs';
import type { Card } from './cards';
import type { ToolMoment } from './pouch';
import { opponentsOf, type Turn } from './senses';
import { patch, say, type PlanFighter, type Round } from './state';

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
    `${actor.name} fades from sight.`,
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
  const reached = say({ ...round, fighters }, `${actor.name}'s senses spread across the field.`);
  if (found.length > 0) {
    return say(reached, `${found.map((f) => f.name).join(' and ')} can't hide from them.`);
  }
  return hidden.length > 0 ? say(reached, 'Someone stays just out of reach.') : reached;
}

/**
 * A slotted sense the moment calls for (a foe is hidden and they don't read foes already), or
 * a conceal to open a round from hiding, as a smoke bomb would.
 */
export function sightInstinct(
  self: PlanFighter,
  ready: readonly Card[],
  moment: ToolMoment,
): Card | undefined {
  const wants = (c: Card) =>
    c.kind === 'jutsu' &&
    ((moment.hiddenFoe && !hasPerk(self, 'insight') && hasVerb(c.technique, 'sense')) ||
      (moment.opening && !self.hidden && hasVerb(c.technique, 'conceal')));
  return ready.find(wants);
}
