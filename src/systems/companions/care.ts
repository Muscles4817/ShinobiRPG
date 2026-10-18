import { DISLIKED_TONE, LIKED_TONE } from '@/systems/bonds';

import type { Companion } from './companions';

/**
 * Looking after a companion (`docs/design/retinue-plan.md`, slice 2b): its hunger counted in
 * days without a meal, what a meal of each kind is worth, play by its tastes, and mending after
 * a fight. One meal a day keeps it fed; a missed day is only peckish; it never dies of hunger,
 * but a starving stray goes back to the streets. Scraps keep it fed and nothing more: without a
 * game, a proper meal or training now and then, the bond slowly drifts.
 */

export const COMPANION_HUNGER = ['fed', 'peckish', 'hungry', 'starving'] as const;
export type CompanionHunger = (typeof COMPANION_HUNGER)[number];

/** How it fights at each stage of hunger, as your own hunger stages do. */
const HUNGER_FIGHT: Readonly<Record<CompanionHunger, number>> = {
  fed: 1,
  peckish: 1,
  hungry: 0.85,
  starving: 0.7,
};

/** Days without a game, a proper meal or training before the bond starts to drift, and how much. */
export const NEGLECT_AFTER = 3;
export const NEGLECT_DRIFT = 1;

/** Whether it has gone long enough without real care for the bond to drift today. */
export function neglected(companion: Pick<Companion, 'lastCaredDay'>, today: number): boolean {
  return today - companion.lastCaredDay > NEGLECT_AFTER;
}

/** Bond lost each day it starves. */
export const STARVING_BOND_DRIFT = 2;
/** Days starving before a stray goes back to the streets (bred and born ones never leave). */
export const STRAY_LEAVES_AFTER = 4;

/** Whole days that have passed since its last meal, before today's. */
export function daysUnfed(companion: Pick<Companion, 'lastFedDay'>, today: number): number {
  return Math.max(0, today - companion.lastFedDay - 1);
}

export function hungerOf(companion: Pick<Companion, 'lastFedDay'>, today: number): CompanionHunger {
  const missed = daysUnfed(companion, today);
  return COMPANION_HUNGER[Math.min(missed, COMPANION_HUNGER.length - 1)] ?? 'starving';
}

export function hungerFightScale(hunger: CompanionHunger): number {
  return HUNGER_FIGHT[hunger];
}

/** Whether its own routine still works it: not when hungry, and not while laid up. */
export function keepsRoutine(hunger: CompanionHunger, injured: boolean): boolean {
  return !injured && (hunger === 'fed' || hunger === 'peckish');
}

/** What it is given, from free scraps to its favourite. */
export const MEALS = ['scraps', 'plain', 'favourite'] as const;
export type MealKind = (typeof MEALS)[number];

/** Bond a meal of each kind is worth: scraps keep it fed, food is a kindness, a favourite a joy. */
export const MEAL_BOND: Readonly<Record<MealKind, number>> = {
  scraps: 0,
  plain: 2,
  favourite: 6,
};

/** How to play with it. */
export const PLAY_KINDS = ['rough', 'fetch', 'scent', 'walk'] as const;
export type PlayKind = (typeof PLAY_KINDS)[number];

/** Bond from a game, before temperament: every game counts, a liked one more. */
export const PLAY_BASE = 3;

/** Bond from playing this way with a creature of these tastes. */
export function playBond(
  play: PlayKind,
  tastes: { readonly likes: readonly PlayKind[]; readonly dislikes: readonly PlayKind[] },
): number {
  const liked = tastes.likes.includes(play) ? LIKED_TONE : 0;
  const disliked = tastes.dislikes.includes(play) ? DISLIKED_TONE : 0;
  return Math.max(0, PLAY_BASE + liked + disliked);
}

/** The share of its maximum health a night mends. */
export const NIGHT_MENDING = 0.5;
/** Days a companion knocked down in a fight stays home. */
export const KNOCKED_DOWN_DAYS = 3;
/** A dose of medicine takes this many days off; a vet's treatment halves what is left. */
export const MEDICINE_DAYS = 1;

/** Its health after `nights` nights of rest. */
export function mended(health: number, maxHealth: number, nights: number): number {
  return Math.min(maxHealth, health + maxHealth * NIGHT_MENDING * nights);
}

/** Whether it is laid up on this day. */
export function laidUp(companion: Pick<Companion, 'injury'>, today: number): boolean {
  return companion.injury !== null && companion.injury.until > today;
}

/** The day a vet's treatment sends it home: half the days left, rounded up. */
export function treatedUntil(until: number, today: number): number {
  return today + Math.ceil(Math.max(0, until - today) / 2);
}
