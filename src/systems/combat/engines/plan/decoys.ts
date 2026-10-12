import type { Rng } from '@/core';

import { hasPerk } from '../../rules/body';
import { decoyChance, effectsOf, oneBurst, resistOf } from '../../rules/verbs';
import { fighterIn, patch, say, type PlanFighter, type Round } from './state';

/**
 * Clones taking hits in a planned fight. A hit only gets here once it has reached its target
 * past the rows, so clones stand in their maker's row: a screened back-row maker's clones are
 * screened with them. A single-target hit may strike a clone instead (it bursts, and that is
 * the end of the hit); an area hit bursts every clone and still reaches the maker.
 */

/** A hit about to land, as clones see it. */
export interface Incoming {
  readonly attacker: PlanFighter;
  readonly target: PlanFighter;
  /** What hit, for the narration. */
  readonly what: string;
  /** An area hit washes over the clones and the maker alike. */
  readonly area: boolean;
  readonly rng: Rng;
}

/** The attacker's eyes against the clones' maker, by the clone technique's profile. */
function eyes(attacker: PlanFighter, maker: PlanFighter): number {
  const technique = maker.techniques.find((t) => t.id === maker.clones?.techniqueId);
  const [effect] = technique ? effectsOf(technique, 'clone') : [];
  if (!technique || !effect) return attacker.attributes.perception;
  return resistOf(attacker, { technique, effect });
}

/** What clones do to a hit: the round after, and whether a clone took it instead. */
export function throughClones(
  round: Round,
  hit: Incoming,
): { readonly round: Round; readonly absorbed: boolean } {
  const maker = fighterIn(round, hit.target.id);
  const clones = maker?.clones;
  if (!maker || !clones || clones.count <= 0) return { round, absorbed: false };
  if (hit.area) {
    const burst = patch(round.fighters, maker.id, { clones: { ...clones, count: 0 } });
    return {
      round: say({ ...round, fighters: burst }, `${maker.name}'s clones burst apart.`),
      absorbed: false,
    };
  }
  const chance = decoyChance(clones, eyes(hit.attacker, maker), hasPerk(hit.attacker, 'insight'));
  if (!hit.rng.chance(chance)) return { round, absorbed: false };
  const fighters = patch(round.fighters, maker.id, { clones: oneBurst(clones) });
  return {
    round: say(
      { ...round, fighters },
      `${hit.attacker.name}'s ${hit.what} strikes a clone of ${maker.name}, which bursts.`,
    ),
    absorbed: true,
  };
}
