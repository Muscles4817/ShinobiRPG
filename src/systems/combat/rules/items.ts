import type { Rng } from '@/core';

import type { CombatItem, CombatItemEffect } from '../contract';
import type { Body } from './body';
import { variance } from './damage';
import { kitDamageScale } from './kit';
import { tell } from './telling';

/**
 * Fight tools, the same in every engine. A smoke bomb hides you until you next attack (that
 * attack lands harder, as any hidden attacker's does); a flash tag lights up every hidden foe;
 * an explosive tag is a seal blast at one foe, which armour can't blunt and spirits fear; pills
 * and salves restore chakra and health; a clarity charm clears confusion. Engines offer each
 * carried tool, ask `itemBlocker` why not, and call `useItem`.
 */

/**
 * A blast does the same to anyone, whatever the gap: a bit more than a plain blow between
 * equals, so it matters most to the weaker side.
 */
export const BLAST_POWER = 40;
export const CHAKRA_RESTORE = 25;
export const HEAL_RESTORE = 30;

export interface ItemUse<B extends Body> {
  readonly user: B;
  /** The opposing side, after the tool (a flash reveals them; a blast hurts the target). */
  readonly foes: readonly B[];
  readonly log: readonly string[];
}

/** Tools aimed at one foe: the UI asks for a target. */
export function itemTargeted(effect: CombatItemEffect): boolean {
  return effect === 'blast';
}

/** One tool in the pouch, by id; null when none was carried. */
export function carried(user: Pick<Body, 'items'>, itemId: string): CombatItem | null {
  return user.items.find((i) => i.id === itemId) ?? null;
}

function pointless(user: Body, effect: CombatItemEffect, foes: readonly Body[]): string | null {
  switch (effect) {
    case 'smoke':
      return user.hidden ? 'You are already hidden.' : null;
    case 'flash':
      return foes.some((f) => f.health > 0 && f.hidden) ? null : 'No one is hiding.';
    case 'blast':
      return null;
    case 'chakra':
      return user.chakra >= user.maxChakra ? 'Your chakra is full.' : null;
    case 'heal':
      return user.health >= user.maxHealth ? 'You are unhurt.' : null;
    case 'clarity':
      return user.confused > 0 ? null : 'Your head is clear.';
  }
}

/** Why this tool can't be used right now, or null. */
export function itemBlocker(user: Body, item: CombatItem, foes: readonly Body[]): string | null {
  if (item.count <= 0) return `No ${item.name} left.`;
  return pointless(user, item.effect, foes);
}

/** Damage an explosive tag does: a fixed seal blast, through armour, hard on spirits. */
export function blastDamage(target: Body, roll: number): number {
  return Math.max(1, Math.round(BLAST_POWER * variance(roll) * kitDamageScale(target, 'seal')));
}

function spend<B extends Body>(user: B, itemId: string): B {
  const items = user.items.map((i) => (i.id === itemId ? { ...i, count: i.count - 1 } : i));
  return { ...user, items };
}

interface Use<B extends Body> {
  readonly user: B;
  readonly item: CombatItem;
  readonly foes: readonly B[];
  /** The foe a blast is aimed at. */
  readonly targetId?: string;
}

function blast<B extends Body>(use: Use<B>, rng: Rng): ItemUse<B> {
  const target = use.foes.find((f) => f.id === use.targetId && f.health > 0 && !f.hidden);
  if (!target) return { user: use.user, foes: use.foes, log: ['The tag flies wide.'] };
  const damage = blastDamage(target, rng.next());
  const foes = use.foes.map((f) =>
    f.id === target.id ? { ...f, health: Math.max(0, f.health - damage) } : f,
  );
  const line = tell('The {what} bursts on {t}.', { what: use.item.name, t: target });
  return { user: use.user, foes, log: [line] };
}

function selfEffect<B extends Body>(user: B, effect: CombatItemEffect): B {
  switch (effect) {
    case 'smoke':
      return { ...user, hidden: true };
    case 'chakra':
      return { ...user, chakra: Math.min(user.maxChakra, user.chakra + CHAKRA_RESTORE) };
    case 'heal':
      return { ...user, health: Math.min(user.maxHealth, user.health + HEAL_RESTORE) };
    case 'clarity':
      return { ...user, confused: 0 };
    case 'flash':
    case 'blast':
      return user;
  }
}

const USE_LINE: Readonly<Record<Exclude<CombatItemEffect, 'blast'>, string>> = {
  smoke: '{a} vanish{a.es} in a burst of smoke.',
  flash: '{a} set{a.s} off a flash that lights every corner of the field.',
  chakra: '{a} swallow{a.s} a pill, and {a.their} chakra comes flooding back.',
  heal: '{a} press{a.es} salve into {a.their} wounds.',
  clarity: '{a} grip{a.s} a charm until the fog in {a.their} head lifts.',
};

/** Uses one of the tool: spends it and applies its effect. Check `itemBlocker` first. */
export function useItem<B extends Body>(use: Use<B>, rng: Rng): ItemUse<B> {
  const user = spend(use.user, use.item.id);
  const { effect } = use.item;
  if (effect === 'blast') return blast({ ...use, user }, rng);
  const foes = effect === 'flash' ? use.foes.map((f) => ({ ...f, hidden: false })) : use.foes;
  return { user: selfEffect(user, effect), foes, log: [tell(USE_LINE[effect], { a: user })] };
}

/**
 * Attacking gives a smoke-hidden fighter away. Illusionists live in hiding and stay hidden
 * (they're found by Search or Dispel instead).
 */
export function revealOnAttack<B extends Body>(attacker: B): B {
  if (!attacker.hidden || attacker.traits.includes('illusionist')) return attacker;
  return { ...attacker, hidden: false };
}

/** What's left in the pouch, for `CombatOutcome.items`. */
export function itemsLeft(user: Pick<Body, 'items'>): Readonly<Record<string, number>> {
  return Object.fromEntries(user.items.map((i) => [i.id, i.count]));
}
