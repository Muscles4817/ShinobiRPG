import { alive } from '../../rules/body';
import { tell } from '../../rules/telling';
import { strikeWith, throwWith, type Attack } from '../../rules/weapons';
import { react, type Blow } from './react';
import type { Turn } from './senses';
import { canDaze, dazeIn } from './daze';
import { blowWord } from './scene';
import { fighterIn, patch, say, type PlanFighter, type Round } from './state';

/**
 * The strike and kunai cards, as the fighter's weapons make them (`rules/weapons.ts`): a blade's
 * cut, knuckles' heavier blows, better throwing steel or senbon. Once a hit lands, what the
 * weapon does besides wounding follows: a senbon or a unique weapon may daze, a draining one
 * drinks the target's chakra.
 */

/**
 * The blows a strike lands as: a plain strike goes by the striker's own word for it (a wolf's
 * bite, a spirit's touch), and several blades split it into a flurry whose later blows only a
 * Dodge stands in the way of.
 */
function blowsOf(attack: Attack, thrown: boolean, striker: PlanFighter): Blow[] {
  const first: Blow = {
    raw: attack.raw / attack.blows,
    what: attack.what === 'strike' ? blowWord(striker) : attack.what,
    dodgeable: true,
    physical: !thrown,
    kind: attack.kind,
    ...(attack.pierce > 0 ? { pierce: attack.pierce } : {}),
  };
  return Array.from({ length: attack.blows }, (_, i) =>
    i === 0 ? first : { ...first, followUp: true as const },
  );
}

/** A hit that landed: the target lost health to it. */
function landed(before: PlanFighter, after: Round): number {
  const now = fighterIn(after, before.id);
  return now ? before.health - now.health : 0;
}

function dazeOnHit(round: Round, { actor, target, rng }: Turn, chance: number): Round {
  const struck = target && fighterIn(round, target.id);
  if (chance <= 0 || !struck || !alive(struck) || !canDaze(struck, round.number)) return round;
  if (!rng.chance(chance)) return round;
  return say(
    { ...round, fighters: patch(round.fighters, struck.id, dazeIn(round.number, actor.id)) },
    tell('{t} reel{t.s} from the blow.', { t: struck }),
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
  const after = blowsOf(attack, thrown, actor).reduce((now, blow) => {
    const struck = fighterIn(now, target.id);
    if (!struck || !alive(struck)) return now;
    return react(now, { attacker: actor, target: struck, blow, rng });
  }, round);
  const damage = landed(target, after);
  if (damage <= 0) return after;
  const dazed = dazeOnHit(after, turn, attack.daze);
  return attack.drain > 0 ? drainOnHit(dazed, turn, damage * attack.drain) : dazed;
}
