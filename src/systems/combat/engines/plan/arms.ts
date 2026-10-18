import type { Rng } from '@/core';

import { alive } from '../../rules/body';
import { tell } from '../../rules/telling';
import { strikeWith, throwWith, type Attack } from '../../rules/weapons';
import { react, type Blow } from './react';
import type { Turn } from './senses';
import { canDaze, dazeIn } from './daze';
import { fighterIn, patch, say, type PlanFighter, type Round } from './state';

/**
 * The strike and kunai cards, as the fighter's weapons make them (`rules/weapons.ts`): a blade's
 * cut, knuckles' heavier blows, better throwing steel or senbon. Once a hit lands, what the
 * weapon does besides wounding follows: a senbon or a unique weapon may daze, a draining one
 * drinks the target's chakra.
 */

function blowOf(attack: Attack, thrown: boolean): Blow {
  return {
    raw: attack.raw,
    what: attack.what,
    dodgeable: true,
    physical: !thrown,
    kind: attack.kind,
    ...(attack.pierce > 0 ? { pierce: attack.pierce } : {}),
  };
}

/** A hit that landed: the target lost health to it. */
function landed(before: PlanFighter, after: Round): number {
  const now = fighterIn(after, before.id);
  return now ? before.health - now.health : 0;
}

function dazeOnHit(round: Round, target: PlanFighter, chance: number, rng: Rng): Round {
  const struck = fighterIn(round, target.id);
  if (chance <= 0 || !struck || !alive(struck) || !canDaze(struck, round.number)) return round;
  if (!rng.chance(chance)) return round;
  return say(
    { ...round, fighters: patch(round.fighters, target.id, dazeIn(round.number)) },
    tell('{t} reel{t.s} from the blow.', { t: target }),
  );
}

function drainOnHit(round: Round, turn: Turn, drained: number): Round {
  const struck = turn.target && fighterIn(round, turn.target.id);
  const self = fighterIn(round, turn.actor.id);
  const taken = struck ? Math.min(struck.chakra, Math.round(drained)) : 0;
  if (!struck || !self || taken <= 0) return round;
  const fighters = patch(
    patch(round.fighters, struck.id, { chakra: struck.chakra - taken }),
    self.id,
    { chakra: Math.min(self.maxChakra, self.chakra + taken) },
  );
  const line = tell('{a.poss} weapon drinks {t.poss} chakra.', { a: self, t: struck });
  return say({ ...round, fighters }, line);
}

/** Plays the strike or kunai card at the turn's target. */
export function strike(round: Round, turn: Turn, thrown: boolean): Round {
  const { actor, target, rng } = turn;
  if (!target) return round;
  const attack = (thrown ? throwWith : strikeWith)(actor, target, rng.next());
  const after = react(round, { attacker: actor, target, blow: blowOf(attack, thrown), rng });
  const damage = landed(target, after);
  if (damage <= 0) return after;
  const dazed = dazeOnHit(after, target, attack.daze, rng);
  return attack.drain > 0 ? drainOnHit(dazed, turn, damage * attack.drain) : dazed;
}
