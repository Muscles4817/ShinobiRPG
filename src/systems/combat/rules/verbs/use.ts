import type {
  Discipline,
  EffectOf,
  ScalingStat,
  TechniqueEffect,
  Verb,
} from '@/systems/techniques';

import type { CombatAttributes, CombatTechnique } from '../../contract';
import type { CombatGear } from '../../gearContract';
import { focusDrive } from '../focus';
import { weaponArt } from '../mastery';
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
  readonly gear?: CombatGear;
}

/**
 * An illusion is a contest of chakra control as well as the art (`docs/design/combat-ai-plan.md`
 * Part 13c): its caster needs control to land it, and its target's own control fights it off
 * beside their will. This share of each side's rating is their chakra control.
 */
export const ILLUSION_CONTROL_SHARE = 0.35;

/** A mind's hold against an illusion: will, steadied by chakra control. */
function mindGuard(attributes: CombatAttributes): number {
  const share = ILLUSION_CONTROL_SHARE;
  return attributes.willpower * (1 - share) + attributes.chakraControl * share;
}

/** What breaks a hold of this art: will an illusion, control chakra, strength hands and wire. */
function bindBreaker(attributes: CombatAttributes, discipline: Discipline): number {
  switch (discipline) {
    case 'genjutsu':
      return mindGuard(attributes);
    case 'ninjutsu':
    case 'fuuinjutsu':
      return attributes.chakraControl;
    case 'taijutsu':
    case 'kenjutsu':
      return attributes.strength;
  }
}

/** The art behind a technique: a blade art is fought at the mastery of the weapon in hand. */
function artOf(fighter: Fighter, discipline: Discipline): number {
  const held = fighter.gear?.held;
  if (discipline === 'kenjutsu' && held) return weaponArt(fighter, held.weaponClass);
  const { attributes } = fighter;
  // An illusion is moulded as much as it is woven: control lands it.
  if (discipline === 'genjutsu') {
    const share = ILLUSION_CONTROL_SHARE;
    return attributes.genjutsu * (1 - share) + attributes.chakraControl * share;
  }
  return attributes[discipline];
}

function statValue(fighter: Fighter, stat: ScalingStat, technique: CombatTechnique): number {
  const { attributes } = fighter;
  if (stat === 'art') return artOf(fighter, technique.discipline);
  if (stat === 'guard') {
    return technique.discipline === 'genjutsu' ? mindGuard(attributes) : attributes.perception;
  }
  if (stat === 'bind') return bindBreaker(attributes, technique.discipline);
  if (stat === 'poise') {
    return technique.discipline === 'genjutsu' ? mindGuard(attributes) : attributes.stamina;
  }
  return attributes[stat];
}

function average(fighter: Fighter, stats: readonly ScalingStat[], t: CombatTechnique): number {
  if (stats.length === 0) return 0;
  return stats.reduce((sum, s) => sum + statValue(fighter, s, t), 0) / stats.length;
}

/** How strongly the user drives this effect, sharpened by a focus that covers it. */
export function driveOf(user: Fighter, use: EffectUse): number {
  const focus = focusDrive(user, use.effect.verb, use.technique.discipline);
  return average(user, profileOf(use.effect).drive, use.technique) * focus;
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

/** Deals damage: to one foe, to every foe, or through their guard. */
export function isWounding(technique: CombatTechnique): boolean {
  return technique.effects.some(
    (e) => e.verb === 'damage' || e.verb === 'area' || e.verb === 'break',
  );
}

/** Holds a foe back without wounding them: dazes, seals, confuses or pins them. */
export function isHindering(technique: CombatTechnique): boolean {
  return technique.effects.some(
    (e) => e.verb === 'daze' || e.verb === 'seal' || e.verb === 'confuse' || e.verb === 'pin',
  );
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
