import type { Rng } from '@/core';

import { alive } from '../../rules/body';
import {
  confuseChance,
  CONFUSION_TURNS,
  HIDDEN_DAMAGE,
  rehidesNow,
  shakeOffChance,
} from '../../rules/conditions';
import {
  hasTrait,
  isPhysical,
  kitDamageScale,
  packScale,
  shouldFlee,
  SWIFT_DODGE,
  type AttackKind,
} from '../../rules/kit';
import { absorb, patch, type DeckFighter } from './state';

/**
 * Combat kits in deck fights: how traits and the shared conditions bend a hit (armour,
 * spirits, packs, hiding), what follows it (confusion, cowards running), and what happens at
 * the start of a fighter's turn (illusionists re-hiding, confusion wearing off).
 */

export const UNSEEN_REASON = "You can't see them. Search or Dispel.";

/** One attack of a given kind from one fighter onto another. */
export interface Blow {
  readonly attacker: DeckFighter;
  readonly target: DeckFighter;
  readonly kind: AttackKind;
}

export interface Landed {
  readonly fighters: DeckFighter[];
  readonly lines: string[];
}

/** A swift target slips some single-target attacks outright. Rolls only for swift targets. */
export function slips(target: DeckFighter, rng: Rng): boolean {
  return hasTrait(target, 'swift') && rng.chance(SWIFT_DODGE);
}

/** Base damage after the defender's kit, the attacker's pack and hiding. */
export function kitDamage(fighters: readonly DeckFighter[], blow: Blow, base: number): number {
  const hidden = blow.attacker.hidden ? HIDDEN_DAMAGE : 1;
  const scale =
    kitDamageScale(blow.target, blow.kind) * packScale(blow.attacker, fighters) * hidden;
  return Math.max(1, Math.round(base * scale));
}

function shrugLine({ target, kind }: Blow): string[] {
  if (hasTrait(target, 'spirit') && isPhysical(kind)) {
    return [`It passes half through ${target.name}.`];
  }
  if (hasTrait(target, 'spirit') && kind === 'seal') return [`The seal sears ${target.name}.`];
  if (hasTrait(target, 'armoured') && isPhysical(kind)) {
    return [`${target.name}'s armour turns most of it.`];
  }
  return [];
}

/** An illusionist's hit may leave the target confused. Rolls only for illusionists. */
export function confuse(fighters: DeckFighter[], blow: Blow, rng: Rng): Landed {
  const chance = confuseChance(blow.attacker, blow.target);
  const victim = fighters.find((f) => f.id === blow.target.id);
  if (chance <= 0 || !victim || !alive(victim) || !rng.chance(chance)) {
    return { fighters, lines: [] };
  }
  return {
    fighters: patch(fighters, victim.id, { confused: CONFUSION_TURNS }),
    lines: [`${victim.name}'s senses swim.`],
  };
}

function fleeIfCoward(fighters: DeckFighter[], id: string): Landed {
  const f = fighters.find((x) => x.id === id);
  if (!f || !shouldFlee(f)) return { fighters, lines: [] };
  return { fighters: patch(fighters, id, { health: 0 }), lines: [`${f.name} flees!`] };
}

/** Lands `damage` (already scaled by `kitDamage`) and everything that follows the hit. */
export function landHit(fighters: DeckFighter[], blow: Blow, damage: number, rng: Rng): Landed {
  const hurt = patch(fighters, blow.target.id, absorb(blow.target, damage));
  const dazzled = confuse(hurt, blow, rng);
  const fled = fleeIfCoward(dazzled.fighters, blow.target.id);
  return {
    fighters: fled.fighters,
    lines: [...shrugLine(blow), ...dazzled.lines, ...fled.lines],
  };
}

/** The start of a fighter's turn: an illusionist in the open may re-hide; confusion wears. */
export function startOfTurn(fighters: DeckFighter[], id: string, round: number, rng: Rng): Landed {
  const f = fighters.find((x) => x.id === id);
  if (!f || !alive(f)) return { fighters, lines: [] };
  const rehides = !f.hidden && rehidesNow(f, round);
  const lines = rehides ? [`${f.name} melts back into the illusion.`] : [];
  let next = rehides ? patch(fighters, id, { hidden: true }) : fighters;
  if (f.confused > 0) {
    const shaken = rng.chance(shakeOffChance(f));
    next = patch(next, id, { confused: shaken ? 0 : f.confused - 1 });
    if (shaken) lines.push(`${f.name} shakes off the confusion.`);
  }
  return { fighters: next, lines };
}
