import type { EffectOf, ScalingStat, TechniqueEffect, Verb } from '@/systems/techniques';

import type { CombatAttributes, CombatTechnique } from '../../contract';
import { profileOf } from './profiles';

/**
 * Reading a technique's effects: which it has, which leads, and how strongly a fighter drives
 * one and another resists it (averaging the stats its profile names).
 */

/** One effect of a technique, as it is being used. */
export interface EffectUse<V extends Verb = Verb> {
  readonly technique: CombatTechnique;
  readonly effect: TechniqueEffect & { readonly verb: V };
}

interface Fighter {
  readonly attributes: CombatAttributes;
}

function statValue(fighter: Fighter, stat: ScalingStat, technique: CombatTechnique): number {
  const { attributes } = fighter;
  if (stat === 'art') return attributes[technique.discipline];
  if (stat === 'guard') {
    return technique.discipline === 'genjutsu' ? attributes.willpower : attributes.perception;
  }
  return attributes[stat];
}

function average(fighter: Fighter, stats: readonly ScalingStat[], t: CombatTechnique): number {
  if (stats.length === 0) return 0;
  return stats.reduce((sum, s) => sum + statValue(fighter, s, t), 0) / stats.length;
}

/** How strongly the user drives this effect. */
export function driveOf(user: Fighter, use: EffectUse): number {
  return average(user, profileOf(use.effect).drive, use.technique);
}

/** How well the target resists this effect; zero when nothing resists it. */
export function resistOf(target: Fighter, use: EffectUse): number {
  return average(target, profileOf(use.effect).resist, use.technique);
}

function isVerb<V extends Verb>(verb: V) {
  return (e: TechniqueEffect): e is EffectOf<V> => e.verb === verb;
}

/** The technique's effects of one verb, in order. */
export function effectsOf<V extends Verb>(technique: CombatTechnique, verb: V): EffectOf<V>[] {
  return technique.effects.filter(isVerb(verb));
}

export function hasVerb(technique: CombatTechnique, verb: Verb): boolean {
  return technique.effects.some((e) => e.verb === verb);
}

/** Aimed at a foe (it hurts or hinders), rather than only at the user. */
export function isHarmful(technique: CombatTechnique): boolean {
  return technique.effects.some((e) => profileOf(e).aim === 'foe');
}

/**
 * The effect a technique is known by: its first. Engines that predate effect lists read a
 * technique through this one effect.
 */
export function primaryEffect(technique: CombatTechnique): TechniqueEffect {
  const [first] = technique.effects;
  // Validation guarantees every technique has an effect; an empty list is a content bug.
  if (!first) throw new Error(`Technique ${technique.id} has no effects`);
  return first;
}

/** How strong a technique is, for choosing between them: its leading effect's power. */
export function techniquePower(technique: CombatTechnique): number {
  return primaryEffect(technique).power;
}

/** The first effect aimed at a foe: whether the technique lands is decided against it. */
export function landingUse(technique: CombatTechnique): EffectUse | null {
  const effect = technique.effects.find((e) => profileOf(e).aim === 'foe');
  return effect ? { technique, effect } : null;
}
