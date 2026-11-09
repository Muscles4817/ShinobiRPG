import { alive } from '../../rules/body';
import { tell } from '../../rules/telling';
import type { EffectUse } from '../../rules/verbs';
import { empowerSelf } from './empower';
import { carrierOf } from './riding';
import { fighterIn, patch, say, type PlanFighter, type Round } from './state';

/**
 * Meditating into Sage Mode (an empower that is `still`): the turn it is used goes into sitting
 * still and drawing natural energy in, and the user is open as if gathering (`gather.ts`): no
 * slipping anything, only a Guard. A mount of theirs may carry them clear (`riding.ts`), or they
 * may have hidden first. As their next turn begins the mode opens, if nothing dazed them or hurt
 * them more than a graze (`STILLNESS_BROKEN`) in between; else the stillness breaks and the
 * energy scatters, paid for and lost.
 */

/** A share of their health lost while still that breaks the stillness; a graze doesn't. */
export const STILLNESS_BROKEN = 0.1;

const STILL =
  '{a} go{a.es} perfectly still, drawing in the natural energy of the world around {a.them}.';
const CARRIED = '{m} crouches beneath {a.them}, ready to leap clear.';
const BROKEN = 'The stillness breaks, and the natural energy scatters from {a}.';

/** The turn spent going still: open until the next, carried or hidden if they saw to it. */
export function meditate(round: Round, actor: PlanFighter, use: EffectUse<'empower'>): Round {
  const meditating = { techniqueId: use.technique.id, health: actor.health };
  const fighters = patch(round.fighters, actor.id, { gathering: true, meditating });
  const still = say({ ...round, fighters }, tell(STILL, { a: actor }));
  const mount = carrierOf(still, { ...actor, gathering: true });
  return mount ? say(still, tell(CARRIED, { a: actor, m: mount })) : still;
}

/** An empower played: Sage Mode is meditated into, opening as the next turn begins; any other at once. */
export function empowering(round: Round, actor: PlanFighter, use: EffectUse<'empower'>): Round {
  return use.effect.still ? meditate(round, actor, use) : empowerSelf(round, actor, use);
}

function withoutMeditation(round: Round, id: string): Round {
  return {
    ...round,
    fighters: round.fighters.map((f) => {
      if (f.id !== id) return f;
      const { meditating: _done, ...rest } = f;
      return rest;
    }),
  };
}

/** As a meditating fighter's turn begins: the mode opens, or the stillness breaks. */
export function meditationEnds(round: Round, id: string): Round {
  const f = fighterIn(round, id);
  const still = f?.meditating;
  if (!f || !still || !alive(f)) return round;
  const done = withoutMeditation(round, id);
  const actor = fighterIn(done, id) ?? f;
  const technique = f.techniques.find((t) => t.id === still.techniqueId);
  const effect = technique?.effects.find((e) => e.verb === 'empower');
  const broken = still.health - f.health >= f.maxHealth * STILLNESS_BROKEN || f.stunned > 0;
  if (broken || !technique || effect?.verb !== 'empower') return say(done, tell(BROKEN, { a: f }));
  return empowerSelf(done, actor, { technique, effect });
}
