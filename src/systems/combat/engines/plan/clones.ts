import { alive } from '../../rules/body';
import { strikeDamage } from '../../rules/damage';
import { attackKindOf } from '../../rules/kit';
import type { CloneKind } from '@/systems/techniques';

import {
  cloneBlowScale,
  clonesFrom,
  clonesLeft,
  driveOf,
  kindOf,
  type EffectUse,
} from '../../rules/verbs';
import { isOffence, type Card } from './cards';
import { react, type Blow } from './react';
import { canHit } from './rows';
import type { Turn } from './senses';
import { fighterIn, patch, say, type PlanFighter, type Round } from './state';

/**
 * Clones in a planned fight: a clone technique sets clones beside its user (replacing any left
 * from before); hits on them are `decoys.ts`, their upkeep `cloneUpkeep.ts`. Solid clones join
 * their maker's attacks with a blow of their own, as hard as their kind allows, up close or
 * thrown from further off, and only at a foe that blow can reach past the rows.
 */

/** How each kind of clone comes into the fight. */
const ENTRANCES: Readonly<Record<CloneKind, (name: string) => string>> = {
  illusion: (name) => `Copies of ${name} shimmer into being beside them.`,
  water: (name) => `Clones of ${name} rise out of running water.`,
  wind: (name) => `Clones of ${name} spin up out of the wind.`,
  earth: (name) => `Clones of ${name} heave up out of the ground.`,
  lightning: (name) => `Clones of ${name} crackle into being.`,
  fire: (name) => `Clones of ${name} step out of the flames.`,
  shadow: (name) => `Clones of ${name} burst out of the smoke beside them.`,
};

export function makeClones(round: Round, actor: PlanFighter, use: EffectUse<'clone'>): Round {
  const clones = clonesFrom(driveOf(actor, use), actor.maxChakra, use);
  return say(
    { ...round, fighters: patch(round.fighters, actor.id, { clones }) },
    ENTRANCES[kindOf(clones)](actor.name),
  );
}

/** After an attack: a maker's solid clones pile in on the same foe. */
export function cloneFollowUp(round: Round, { actor, target, rng }: Turn, card: Card): Round {
  const self = fighterIn(round, actor.id);
  const foe = target && fighterIn(round, target.id);
  if (!self || !alive(self) || !self.clones?.strikes || clonesLeft(self) === 0) return round;
  if (!foe || !alive(foe) || !isOffence(card)) return round;
  const thrown = round.range !== 'close';
  if (!canHit({ kind: thrown ? 'throw' : 'strike' }, foe, round.fighters)) return round;
  const blow: Blow = {
    raw: strikeDamage(self, foe, rng.next()) * cloneBlowScale(self.clones),
    what: 'clone',
    dodgeable: true,
    physical: false,
    kind: attackKindOf(null, thrown),
  };
  return react(round, { attacker: self, target: foe, blow, rng });
}
