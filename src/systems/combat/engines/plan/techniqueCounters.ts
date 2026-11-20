import type { CombatTechnique } from '../../contract';
import { isHarmful } from '../../rules/verbs';
import { approachOf, tagsOf } from '../../rules/tags';
import { techniqueIncoming } from './avoid';
import { counterOn, type Coming } from './counter';
import type { Turn } from './senses';
import { fighterIn, type PlanFighter, type Round } from './state';

/**
 * A technique meeting counters as it is used (`counter.ts`): a foe waiting for this kind of
 * attack meets it before anything of it lands (a grab reversed whole, a Chidori turned aside), and
 * is no longer among its targets; one who read it wrong is still a target, now open.
 */

interface Aimed {
  readonly t: CombatTechnique;
  readonly targets: readonly PlanFighter[];
}

function coming(round: Round, turn: Turn, foe: PlanFighter, t: CombatTechnique): Coming {
  const tags = tagsOf(t);
  const incoming = techniqueIncoming(turn.actor, foe, t, round);
  return {
    attacker: turn.actor,
    target: foe,
    what: t.name,
    came: approachOf(t),
    skill: incoming?.skill ?? turn.actor.attributes.ninjutsu,
    opens: tags.execution.opensUser === true,
    eyeContact: tags.delivery.includes('eye-contact'),
    rng: turn.rng,
  };
}

/** The targets a technique still has once waiting counters have met it, and the round after. */
export function metByCounters(
  round: Round,
  turn: Turn,
  { t, targets }: Aimed,
): { round: Round; targets: PlanFighter[] } {
  if (!isHarmful(t)) return { round, targets: [...targets] };
  return targets.reduce<{ round: Round; targets: PlanFighter[] }>(
    (acc, foe) => {
      if (foe.side === turn.actor.side || !foe.committed) {
        return { ...acc, targets: [...acc.targets, foe] };
      }
      const met = counterOn(acc.round, coming(acc.round, turn, foe, t));
      if (met.stopped) return { ...acc, round: met.round };
      // Read wrong: still a target, now open (the fresh fighter carries it).
      return { round: met.round, targets: [...acc.targets, fighterIn(met.round, foe.id) ?? foe] };
    },
    { round, targets: [] },
  );
}
