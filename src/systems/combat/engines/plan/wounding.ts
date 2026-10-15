import { blowsOf } from '@/systems/techniques';

import type { CombatTechnique } from '../../contract';
import { alive } from '../../rules/body';
import { techniqueDamage } from '../../rules/damage';
import { matchup, matchupLine } from '../../rules/elements';
import { attackKindOf } from '../../rules/kit';
import { finisherScale } from '../../rules/team';
import type { EffectUse } from '../../rules/verbs';
import { elementBoost, recordHit } from './combo';
import { react, type Blow } from './react';
import type { Turn } from './senses';
import { isDazed } from './daze';
import { fighterIn, say, type PlanFighter, type Round } from './state';

/**
 * A technique's wounding effects in a planned fight: one blow, or a flurry's several, each
 * meeting the target's clones, defences and kit on its own (`react.ts`).
 */

/** A technique aimed at one foe, as the fighters stand now. */
export interface Aimed extends Turn {
  readonly target: PlanFighter;
}

/** The effects that wound. */
type Wounding = EffectUse<'damage' | 'area' | 'break'>;

function physical(t: CombatTechnique): boolean {
  return t.discipline === 'taijutsu' || t.discipline === 'kenjutsu';
}

/** The blows a wounding effect lands as: one, or a flurry's share of it each. */
function blowsFor(aimed: Aimed, use: Wounding, scale: number): Blow[] {
  const { actor, target, rng } = aimed;
  const t = use.technique;
  const count = blowsOf(use.effect);
  const raw = (techniqueDamage(actor, target, use, rng.next()) * scale) / count;
  const first: Blow = {
    raw,
    what: t.name,
    dodgeable: t.discipline !== 'genjutsu',
    physical: physical(t),
    kind: attackKindOf(t),
    discipline: t.discipline,
    ...(t.accuracy ? { accuracy: t.accuracy } : {}),
    ...(use.effect.verb === 'break' ? { breaks: true } : {}),
    ...(use.effect.verb === 'area' ? { area: true } : {}),
  };
  return Array.from({ length: count }, (_, i) => (i === 0 ? first : { ...first, followUp: true }));
}

/** Each blow in turn, while the target still stands. */
function strike(round: Round, aimed: Aimed, blows: readonly Blow[]): Round {
  return blows.reduce((now, blow) => {
    const target = fighterIn(now, aimed.target.id);
    if (!target || !alive(target)) return now;
    return react(now, { attacker: aimed.actor, target, blow, rng: aimed.rng });
  }, round);
}

/**
 * A wounding effect: harder on a foe left open by a daze or held by a seal (set-up and
 * payoff), in an element combo, and in a combination technique. A flurry lands as several
 * blows, each dodged on its own.
 */
export function damage(round: Round, aimed: Aimed, use: Wounding): Round {
  const { actor, target, boost } = aimed;
  const t = use.technique;
  const open = isDazed(target) || target.sealed > 0;
  const combo = elementBoost(round, actor, target.id, t);
  const scale = finisherScale({ open }) * (combo?.scale ?? 1) * (boost ?? 1);
  const hit = strike(round, aimed, blowsFor(aimed, use, scale));
  const landed = fighterIn(hit, target.id)?.health !== target.health;
  const element = matchupLine(matchup(t.element, target.nature), target.name);
  const lines = [...(landed && combo ? [combo.line] : []), ...(element ? [element] : [])];
  const told = lines.length > 0 ? say(hit, ...lines) : hit;
  return landed ? recordHit(told, actor, target.id, t) : told;
}
