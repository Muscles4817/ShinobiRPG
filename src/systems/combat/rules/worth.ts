import type { AreaSize, TechniqueEffect, Verb } from '@/systems/techniques';

import type { CombatTechnique } from '../contract';

/**
 * What a technique is worth in chakra, read from what it does (`docs/design/combat-ai-plan.md`
 * Part 13c): rank has no say in it. Each effect is worth its power times what its verb does to
 * a fight (a turn taken from the target is worth more than a little harm), a sure or lethal
 * technique more, and how much it reaches multiplies the lot steeply, because reach is what makes
 * a technique effective: a vast blast no one can outrun and few shields hold is priced as what it
 * is, far beyond what most people hold. A technique costs at least this (`chakraCost` in
 * `body.ts`); its authored cost may ask more, never less.
 *
 * Bodies a technique brings (summons, shadow clones) are paid for apart (upkeep, a share of the
 * tank: `summons.ts`, `shadowClones.ts`), and a Gate's price is its toll, so those verbs count
 * for little here.
 */

/** Chakra worth per point of an effect's power, by what the verb does to a fight. */
export const VERB_WORTH: Readonly<Record<Verb, number>> = {
  damage: 1.2,
  // Goes through a guard.
  break: 1.5,
  // An area's power is its harm; its reach is priced by `AREA_REACH`.
  area: 1.2,
  // Each takes a turn, or a hand, from the target.
  daze: 1.5,
  pin: 1.5,
  seal: 1.5,
  confuse: 1.2,
  drain: 1,
  afflict: 1,
  heal: 1.2,
  trap: 1,
  field: 0.8,
  shroud: 0.8,
  empower: 0.8,
  clone: 0.6,
  counter: 0.6,
  conceal: 0.6,
  substitute: 0.5,
  knock: 0.4,
  sense: 0.4,
  move: 0.3,
  summon: 0.2,
};

/** How much more a technique is worth for the ground it covers: one target is ×1. */
export const AREA_REACH: Readonly<Record<AreaSize, number>> = { small: 2, wide: 4, vast: 12 };
/** A technique that can't be slipped by ordinary means is worth this much more. */
const SURE_WORTH = 1.2;
/** One that hits to kill a target who can't see or move is worth this much more. */
const LETHAL_WORTH = 1.3;

type Worthed = Pick<CombatTechnique, 'effects'> &
  Partial<Pick<CombatTechnique, 'accuracy' | 'lethal'>>;

function effectWorth(effect: TechniqueEffect): number {
  // A Gate's price is its toll (`rules/verbs/tolls.ts`), never chakra.
  if (effect.verb === 'empower' && effect.opens !== undefined) return 0;
  return Math.max(0, effect.power) * VERB_WORTH[effect.verb];
}

/** How much more a technique is worth for how far it reaches: its area, if it has one. */
export function reachWorth(t: Pick<CombatTechnique, 'effects'>): number {
  const area = t.effects.find((e) => e.verb === 'area');
  return area?.verb === 'area' ? AREA_REACH[area.size ?? 'small'] : 1;
}

/** What a technique is worth in chakra, before its user's control. */
export function chakraWorth(t: Worthed): number {
  const base = t.effects.reduce((sum, e) => sum + effectWorth(e), 0);
  const sure = t.accuracy === 'sure' ? SURE_WORTH : 1;
  const lethal = t.lethal === true ? LETHAL_WORTH : 1;
  return Math.round(base * sure * lethal * reachWorth(t));
}
