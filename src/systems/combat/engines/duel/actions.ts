import type { Rng } from '@/core';

import type { CombatItem, CombatTechnique } from '../../contract';
import { CONFUSION_TURNS, confuseChance, HIDDEN_DAMAGE } from '../../rules/conditions';
import {
  attackKindOf,
  hasTrait,
  kitDamageScale,
  packScale,
  shouldFlee,
  type AttackKind,
} from '../../rules/kit';
import {
  dodgeChance,
  GUARD_CHAKRA_GAIN,
  healAmount,
  resistChance,
  strikeDamage,
  sealTurns,
  stunTurns,
  swiftDodge,
  techniqueDamage,
} from './formulas';
import type { Fighter } from './state';

export type AttackAction =
  { readonly kind: 'strike' } | { readonly kind: 'technique'; readonly technique: CombatTechnique };

export type DuelAction =
  | AttackAction
  | { readonly kind: 'guard' }
  | { readonly kind: 'flee' }
  | { readonly kind: 'close-in' }
  | { readonly kind: 'search' }
  | { readonly kind: 'dispel' }
  | { readonly kind: 'item'; readonly item: CombatItem };

/** The effect of one fighter's action: updated fighters and narration. */
export interface ActionResult {
  readonly fighters: readonly Fighter[];
  readonly lines: readonly string[];
}

/** Who is acting on whom this turn. */
export interface Turn {
  readonly actor: Fighter;
  readonly target: Fighter;
}

type Patch = Partial<
  Pick<
    Fighter,
    'health' | 'chakra' | 'stunned' | 'sealed' | 'guarding' | 'hidden' | 'confused' | 'distant'
  >
>;

export function patchFighter(fighters: readonly Fighter[], id: string, patch: Patch): Fighter[] {
  return fighters.map((f) => (f.id === id ? { ...f, ...patch } : f));
}

/** ±20% damage variance so fights aren't fully predictable. */
function variance(rng: Rng): number {
  return 0.8 + rng.next() * 0.4;
}

/** Armour and spirit bodies shrug off some attacks, packs hit harder, hidden attackers too. */
function kitDamage(fighters: readonly Fighter[], turn: Turn, base: number, kind: AttackKind) {
  const { actor, target } = turn;
  const scale =
    kitDamageScale(target, kind) * packScale(actor, fighters) * (actor.hidden ? HIDDEN_DAMAGE : 1);
  return Math.max(1, Math.round(base * scale));
}

export function kitLine(target: Fighter, kind: AttackKind): string[] {
  const scale = kitDamageScale(target, kind);
  if (scale > 1) return [`The seal bites deep into ${target.name}.`];
  if (scale === 1) return [];
  return hasTrait(target, 'spirit')
    ? [`It passes half through ${target.name}.`]
    : [`It glances off ${target.name}'s armour.`];
}

/** Damage lands: the target may fall, run (cowards) or be left confused (illusionists). */
export function land(
  fighters: readonly Fighter[],
  turn: Turn,
  damage: number,
  rng: Rng,
): ActionResult {
  const { actor, target } = turn;
  const health = Math.max(0, target.health - damage);
  const hurt = { ...target, health };
  if (health === 0) {
    return {
      fighters: patchFighter(fighters, target.id, { health }),
      lines: [`${target.name} falls!`],
    };
  }
  if (shouldFlee(hurt)) {
    return {
      fighters: patchFighter(fighters, target.id, { health: 0 }),
      lines: [`${target.name} flees!`],
    };
  }
  const confuses = hasTrait(actor, 'illusionist') && rng.chance(confuseChance(actor, target));
  return confuses
    ? {
        fighters: patchFighter(fighters, target.id, { health, confused: CONFUSION_TURNS }),
        lines: [`${target.name}'s senses swim. They are confused!`],
      }
    : { fighters: patchFighter(fighters, target.id, { health }), lines: [] };
}

function strike(fighters: readonly Fighter[], turn: Turn, rng: Rng): ActionResult {
  const { actor, target } = turn;
  if (rng.chance(dodgeChance(actor, target))) {
    return { fighters, lines: [`${actor.name} strikes, but ${target.name} slips aside.`] };
  }
  const kind = attackKindOf(null);
  const damage = kitDamage(fighters, turn, strikeDamage(actor, target, variance(rng)), kind);
  const landed = land(fighters, turn, damage, rng);
  return {
    fighters: landed.fighters,
    lines: [
      `${actor.name} lands a blow on ${target.name} for ${damage} damage.`,
      ...kitLine(target, kind),
      ...landed.lines,
    ],
  };
}

function avoidLine(target: Fighter, technique: CombatTechnique): string {
  return technique.discipline === 'genjutsu'
    ? `${target.name} shakes off the illusion.`
    : `${target.name} sees it coming and evades.`;
}

function techniqueEffect(
  paid: readonly Fighter[],
  turn: Turn,
  technique: CombatTechnique,
  rng: Rng,
): ActionResult {
  const { target } = turn;
  if (technique.effect === 'seal') {
    return {
      fighters: patchFighter(paid, target.id, {
        sealed: (target.sealed ?? 0) + sealTurns(technique),
      }),
      lines: [`Seals crawl over ${target.name}. Their chakra is locked!`],
    };
  }
  if (technique.effect === 'stun') {
    return {
      fighters: patchFighter(paid, target.id, { stunned: target.stunned + stunTurns(technique) }),
      lines: [`${target.name} is dazed!`],
    };
  }
  const kind = attackKindOf(technique);
  const base = techniqueDamage(turn.actor, target, technique, variance(rng));
  const damage = kitDamage(paid, turn, base, kind);
  const landed = land(paid, turn, damage, rng);
  return {
    fighters: landed.fighters,
    lines: [`${target.name} takes ${damage} damage.`, ...kitLine(target, kind), ...landed.lines],
  };
}

function useTechnique(
  fighters: readonly Fighter[],
  turn: Turn,
  technique: CombatTechnique,
  rng: Rng,
): ActionResult {
  const { actor, target } = turn;
  const paid = patchFighter(fighters, actor.id, { chakra: actor.chakra - technique.chakraCost });
  const opener = `${actor.name} uses ${technique.name}!`;

  if (technique.effect === 'heal') {
    const amount = healAmount(actor, technique);
    const health = Math.min(actor.maxHealth, actor.health + amount);
    return {
      fighters: patchFighter(paid, actor.id, { health }),
      lines: [opener, `${actor.name} recovers ${health - actor.health} health.`],
    };
  }
  if (rng.chance(resistChance(actor, target, technique) + swiftDodge(target))) {
    return { fighters: paid, lines: [opener, avoidLine(target, technique)] };
  }
  const effect = techniqueEffect(paid, turn, technique, rng);
  return { fighters: effect.fighters, lines: [opener, ...effect.lines] };
}

/** Resolves a strike or technique against the turn's target. */
export function performAttack(
  fighters: readonly Fighter[],
  turn: Turn,
  action: AttackAction,
  rng: Rng,
): ActionResult {
  switch (action.kind) {
    case 'strike':
      return strike(fighters, turn, rng);
    case 'technique':
      return useTechnique(fighters, turn, action.technique, rng);
  }
}

export function applyGuard(fighters: readonly Fighter[], actor: Fighter): Fighter[] {
  return patchFighter(fighters, actor.id, {
    guarding: true,
    chakra: Math.min(actor.maxChakra, actor.chakra + GUARD_CHAKRA_GAIN),
  });
}
