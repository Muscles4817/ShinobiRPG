import type { Rng } from '@/core';

import { hasPerk } from '../../rules/body';
import { strikeDamage } from '../../rules/damage';
import { harmLine } from '../../rules/narration';
import {
  carriesThrough,
  CLONE_CARRY_SCALE,
  CLONE_RULES,
  decoyChance,
  effectsOf,
  kindOf,
  oneBurst,
  resistOf,
  type Clones,
} from '../../rules/verbs';
import { taken, wound } from './wound';
import { fighterIn, patch, say, type PlanFighter, type Round } from './state';
import { tell } from '../../rules/telling';

/**
 * Clones taking hits in a planned fight. A hit only gets here once it has reached its target
 * past the rows, so clones stand in their maker's row: a screened back-row maker's clones are
 * screened with them. A single-target hit may strike a clone instead (it bursts, and that is
 * the end of the hit, unless it is heavy enough to carry on through it); an area hit bursts
 * every clone and still reaches the maker. What a struck clone does depends on its kind
 * (`cloneKinds.ts`): earth may stand, lightning shocks a blow that bursts it up close.
 */

/** A hit about to land, as clones see it. */
export interface Incoming {
  readonly attacker: PlanFighter;
  readonly target: PlanFighter;
  /** What hit, for the narration. */
  readonly what: string;
  /** An area hit washes over the clones and the maker alike. */
  readonly area: boolean;
  /** How hard it would land, and whether it breaks: a heavy hit carries through a clone. */
  readonly raw: number;
  readonly breaks: boolean;
  /** A blow or a blade, which bursting a lightning clone up close shocks. */
  readonly physical?: boolean;
  readonly rng: Rng;
}

/** The attacker's eyes against the clones' maker, by the clone technique's profile. */
export function eyes(attacker: PlanFighter, maker: PlanFighter): number {
  const technique = maker.techniques.find((t) => t.id === maker.clones?.techniqueId);
  const [effect] = technique ? effectsOf(technique, 'clone') : [];
  if (!technique || !effect) return attacker.attributes.perception;
  return resistOf(attacker, { technique, effect });
}

/** What clones do to a hit: the round after, and whether a clone took it instead. */
export function throughClones(
  round: Round,
  hit: Incoming,
): { readonly round: Round; readonly absorbed: boolean; readonly carried?: number } {
  const maker = fighterIn(round, hit.target.id);
  const clones = maker?.clones;
  if (!maker || !clones || clones.count <= 0) return { round, absorbed: false };
  if (hit.area) {
    const burst = patch(round.fighters, maker.id, { clones: { ...clones, count: 0 } });
    return {
      round: say({ ...round, fighters: burst }, tell('{m.poss} clones burst apart.', { m: maker })),
      absorbed: false,
    };
  }
  const chance = decoyChance(clones, eyes(hit.attacker, maker), hasPerk(hit.attacker, 'insight'));
  if (!hit.rng.chance(chance)) return { round, absorbed: false };
  if (carriesThrough(hit.raw, maker.maxHealth, hit.breaks)) {
    const fighters = patch(round.fighters, maker.id, { clones: oneBurst(clones) });
    const line = tell('{a.poss} {what} tears straight through a clone of {m}.', {
      a: hit.attacker,
      what: hit.what,
      m: maker,
    });
    return {
      round: say({ ...round, fighters }, line),
      absorbed: false,
      carried: CLONE_CARRY_SCALE,
    };
  }
  return { round: struckClone(round, { hit, maker, clones }), absorbed: true };
}

interface Struck {
  readonly hit: Incoming;
  readonly maker: PlanFighter;
  readonly clones: Clones;
}

/**
 * A clone taking a hit that stops at it: an earth clone may shrug it off and stand; any other
 * bursts, and a lightning clone burst by a blow up close shocks whoever struck it.
 */
function struckClone(round: Round, { hit, maker, clones }: Struck): Round {
  const rule = CLONE_RULES[kindOf(clones)];
  const at = (end: string) =>
    tell(`{a.poss} {what} strikes a clone of {m}, ${end}`, {
      a: hit.attacker,
      what: hit.what,
      m: maker,
    });
  if (hit.rng.chance(rule.sturdy)) return say(round, at('which takes it and stands.'));
  const burst = say(
    { ...round, fighters: patch(round.fighters, maker.id, { clones: oneBurst(clones) }) },
    at('which bursts.'),
  );
  const close = hit.physical === true && round.range === 'close';
  if (rule.shock <= 0 || !close) return burst;
  const raw = strikeDamage(maker, hit.attacker, hit.rng.next()) * rule.shock;
  const damage = taken(hit.attacker, Math.max(1, Math.round(raw)));
  const leaps = tell('The clone’s lightning leaps into {t}.', { t: hit.attacker });
  const line = harmLine(leaps, damage);
  return wound(say(burst, line), hit.attacker.id, damage);
}
