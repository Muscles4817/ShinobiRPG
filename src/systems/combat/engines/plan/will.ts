import type { CombatMeter } from '../../contract';
import type { EffectUse } from '../../rules/verbs';
import { alive } from '../../rules/body';
import { tell } from '../../rules/telling';
import { maxWill, WILL_BACK, willDrained } from '../../rules/will';
import { say, type PlanFighter, type Round } from './state';
import { wound } from './wound';

/**
 * The will in a fight (`rules/will.ts`): an ordeal of the mind draws it down, and at nothing the
 * fighter passes out. It is shown beside breath once something has touched it.
 */

type Willed = Pick<PlanFighter, 'attributes' | 'will'>;

export function willOf(f: Willed): number {
  return f.will ?? maxWill(f.attributes);
}

function withWill(round: Round, id: string, will: number): Round {
  return { ...round, fighters: round.fighters.map((f) => (f.id === id ? { ...f, will } : f)) };
}

/** A will drain landing: the mind gives a little, or gives out. */
export function drainWill(
  round: Round,
  { actor, target }: { readonly actor: PlanFighter; readonly target: PlanFighter },
  use: EffectUse<'drain'>,
): Round {
  const left = willOf(target) - willDrained(actor.attributes, target.attributes, use.effect.power);
  if (left > 0)
    return say(withWill(round, target.id, left), tell('{t.poss} will frays.', { t: target }));
  const broken = say(
    withWill(round, target.id, 0),
    tell('{t.poss} mind gives out, and {t} drop{t.s} where {t} stand{t.s}.', { t: target }),
  );
  return wound(broken, target.id, target.health);
}

/** As an exchange ends: a little will comes back to everyone still standing. */
export function willAfter(round: Round): Round {
  return {
    ...round,
    fighters: round.fighters.map((f) => {
      if (f.will === undefined || !alive(f)) return f;
      const will = Math.min(maxWill(f.attributes), f.will + WILL_BACK);
      return will >= maxWill(f.attributes) ? withoutWill(f) : { ...f, will };
    }),
  };
}

function withoutWill(f: PlanFighter): PlanFighter {
  const { will: _full, ...rest } = f;
  return rest;
}

/** A fighter's will on the fight screen, once something has worn at it. */
export function willMeter(f: Willed): CombatMeter | null {
  if (f.will === undefined) return null;
  return { id: 'will', label: 'Will', value: f.will, max: maxWill(f.attributes) };
}
