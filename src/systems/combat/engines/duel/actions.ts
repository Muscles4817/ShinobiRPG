import type { Rng } from '@/core';

import type { CombatTechnique } from '../../contract';
import {
  dodgeChance,
  GUARD_CHAKRA_GAIN,
  healAmount,
  resistChance,
  strikeDamage,
  sealTurns,
  stunTurns,
  techniqueDamage,
} from './formulas';
import type { Fighter } from './state';

export type DuelAction =
  | { readonly kind: 'strike' }
  | { readonly kind: 'guard' }
  | { readonly kind: 'flee' }
  | { readonly kind: 'technique'; readonly technique: CombatTechnique };

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

type Patch = Partial<Pick<Fighter, 'health' | 'chakra' | 'stunned' | 'sealed' | 'guarding'>>;

export function patchFighter(fighters: readonly Fighter[], id: string, patch: Patch): Fighter[] {
  return fighters.map((f) => (f.id === id ? { ...f, ...patch } : f));
}

/** ±20% damage variance so fights aren't fully predictable. */
function variance(rng: Rng): number {
  return 0.8 + rng.next() * 0.4;
}

function hit(fighters: readonly Fighter[], target: Fighter, damage: number): Fighter[] {
  return patchFighter(fighters, target.id, { health: Math.max(0, target.health - damage) });
}

function strike(fighters: readonly Fighter[], { actor, target }: Turn, rng: Rng): ActionResult {
  if (rng.chance(dodgeChance(actor, target))) {
    return { fighters, lines: [`${actor.name} strikes, but ${target.name} slips aside.`] };
  }
  const damage = strikeDamage(actor, target, variance(rng));
  return {
    fighters: hit(fighters, target, damage),
    lines: [`${actor.name} lands a blow on ${target.name} for ${damage} damage.`],
  };
}

function useTechnique(
  fighters: readonly Fighter[],
  { actor, target }: Turn,
  technique: CombatTechnique,
  rng: Rng,
): ActionResult {
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
  if (rng.chance(resistChance(actor, target, technique))) {
    const avoided =
      technique.discipline === 'genjutsu'
        ? `${target.name} shakes off the illusion.`
        : `${target.name} sees it coming and evades.`;
    return { fighters: paid, lines: [opener, avoided] };
  }
  if (technique.effect === 'seal') {
    const turns = sealTurns(technique);
    return {
      fighters: patchFighter(paid, target.id, { sealed: (target.sealed ?? 0) + turns }),
      lines: [opener, `Seals crawl over ${target.name}. Their chakra is locked!`],
    };
  }
  if (technique.effect === 'stun') {
    const turns = stunTurns(technique);
    return {
      fighters: patchFighter(paid, target.id, { stunned: target.stunned + turns }),
      lines: [opener, `${target.name} is dazed!`],
    };
  }
  const damage = techniqueDamage(actor, target, technique, variance(rng));
  return {
    fighters: hit(paid, target, damage),
    lines: [opener, `${target.name} takes ${damage} damage.`],
  };
}

/** Resolves an offensive/supportive action. Guard and flee are handled at round level. */
export function performAction(
  fighters: readonly Fighter[],
  turn: Turn,
  action: DuelAction,
  rng: Rng,
): ActionResult {
  switch (action.kind) {
    case 'strike':
      return strike(fighters, turn, rng);
    case 'technique':
      return useTechnique(fighters, turn, action.technique, rng);
    case 'guard':
      return { fighters, lines: [`${turn.actor.name} braces and gathers chakra.`] };
    case 'flee':
      return { fighters, lines: [] };
  }
}

export function applyGuard(fighters: readonly Fighter[], actor: Fighter): Fighter[] {
  return patchFighter(fighters, actor.id, {
    guarding: true,
    chakra: Math.min(actor.maxChakra, actor.chakra + GUARD_CHAKRA_GAIN),
  });
}
