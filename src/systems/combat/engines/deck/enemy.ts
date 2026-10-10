import type { Rng } from '@/core';

import type { RangeBand } from '../../contract';
import {
  alive,
  chakraCost,
  hasPerk,
  strikeDamage,
  targetable,
  techniqueDamage,
} from '../../rules/body';
import { HIDDEN_DAMAGE } from '../../rules/conditions';
import { attackKindOf, canAttackFrom, homeBand, kitDamageScale } from '../../rules/kit';
import {
  inReach,
  RANGE_BANDS,
  reachOf,
  stepBack,
  stepIn,
  stepTowards,
  STRIKE_REACH,
} from '../../rules/range';
import { guardBlock, playOn } from './cards';
import { kitDamage, landHit, slips } from './kit';
import { patch, type Card, type DeckFighter, type Intent } from './state';

/**
 * Opponents announce what they will do next turn (Slay the Spire style), then do it. The
 * player sees the intent in advance; insight also reveals which jutsu is coming. Opponents
 * only attack from where their kit reaches (archers keep their distance, brawlers close in).
 */

const MOVE_TOWARDS_CHANCE = 0.5;
const JUTSU_CHANCE = 0.45;
const GUARD_CHANCE = 0.15;
const KUNAI_SCALE = 0.6;

function usableJutsu(self: DeckFighter, range: RangeBand) {
  if (self.sealed > 0) return [];
  return self.techniques.filter(
    (t) => t.effect !== 'heal' && inReach(reachOf(t), range) && chakraCost(self, t) <= self.chakra,
  );
}

function estimateAgainst(self: DeckFighter, target: DeckFighter, range: RangeBand): number {
  const close = inReach(STRIKE_REACH, range);
  const scale =
    (close ? 1 : KUNAI_SCALE) *
    kitDamageScale(target, attackKindOf(null, !close)) *
    (self.hidden ? HIDDEN_DAMAGE : 1);
  return Math.round(strikeDamage(self, target, 0.5) * scale);
}

/** One step from `range` towards `goal`; bracing when already there. */
function moveTowards(range: RangeBand, goal: RangeBand): Intent {
  const next = stepTowards(range, goal);
  if (next === range) return { kind: 'guard', estimate: 0 };
  const closer = RANGE_BANDS.indexOf(next) < RANGE_BANDS.indexOf(range);
  return { kind: closer ? 'step-in' : 'step-back', estimate: 0 };
}

export function chooseIntent(
  self: DeckFighter,
  target: DeckFighter,
  range: RangeBand,
  rng: Rng,
): Intent {
  if (self.stunned > 0) return { kind: 'dazed', estimate: 0 };
  const goal = homeBand(self);
  if (!canAttackFrom(self, range)) return moveTowards(range, goal);
  if (goal !== range && rng.chance(MOVE_TOWARDS_CHANCE)) return moveTowards(range, goal);
  const jutsu = usableJutsu(self, range);
  if (jutsu.length > 0 && rng.chance(JUTSU_CHANCE)) {
    const technique = rng.pick(jutsu);
    const estimate =
      technique.effect === 'damage' ? techniqueDamage(self, target, technique, 0.5) : 0;
    return { kind: 'jutsu', technique, estimate };
  }
  if (rng.chance(GUARD_CHANCE)) return { kind: 'guard', estimate: 0 };
  return { kind: 'attack', estimate: estimateAgainst(self, target, range) };
}

/**
 * What an announced intent turns into at the current range, which the player may have changed
 * since: an attack from out of reach becomes a step towards home, a step that goes nowhere
 * becomes an attack (or a guard when they can't attack from here). The view shows this, and
 * the enemy then does exactly this.
 */
export function effectiveIntent(intent: Intent, duo: Duo, range: RangeBand): Intent {
  const { self, target } = duo;
  const attacking = intent.kind === 'attack' || intent.kind === 'jutsu';
  if (attacking && !canAttackFrom(self, range)) return moveTowards(range, homeBand(self));
  const moving = intent.kind === 'step-in' || intent.kind === 'step-back';
  const nowhere = intent.kind === 'step-in' ? stepIn(range) : stepBack(range);
  if (!moving || nowhere !== range) return intent;
  return canAttackFrom(self, range)
    ? { kind: 'attack', estimate: estimateAgainst(self, target, range) }
    : { kind: 'guard', estimate: 0 };
}

/** How an intent reads to the player. */
export function describeIntent(intent: Intent, reader: DeckFighter): string {
  switch (intent.kind) {
    case 'attack':
      return `Attacks for about ${intent.estimate}`;
    case 'jutsu': {
      if (!hasPerk(reader, 'insight')) return 'Forming hand seals…';
      const what = intent.technique?.name ?? 'a jutsu';
      return intent.estimate > 0 ? `${what}, about ${intent.estimate}` : what;
    }
    case 'guard':
      return 'Bracing to defend';
    case 'step-in':
      return 'Closing in';
    case 'step-back':
      return 'Backing off';
    case 'dazed':
      return 'Dazed';
  }
}

export interface TurnResult {
  readonly fighters: DeckFighter[];
  readonly range: RangeBand;
  readonly lines: string[];
}

export interface Duo {
  readonly self: DeckFighter;
  readonly target: DeckFighter;
}

function attack(fighters: DeckFighter[], { self, target }: Duo, range: RangeBand, rng: Rng) {
  const close = inReach(STRIKE_REACH, range);
  if (slips(target, rng)) {
    return { fighters, lines: [`${target.name} slips aside from ${self.name}'s attack.`] };
  }
  const base = Math.max(
    1,
    Math.round(strikeDamage(self, target, rng.next()) * (close ? 1 : KUNAI_SCALE)),
  );
  const blow = { attacker: self, target, kind: attackKindOf(null, !close) };
  const damage = kitDamage(fighters, blow, base);
  const blocked = target.block > 0 ? ' (some blocked)' : '';
  const landed = landHit(fighters, blow, damage, rng);
  return {
    fighters: landed.fighters,
    lines: [`${self.name} hits ${target.name} for ${damage}${blocked}.`, ...landed.lines],
  };
}

function jutsuAct(turn: TurnResult, { self, target }: Duo, intent: Intent, rng: Rng): TurnResult {
  const t = intent.technique;
  if (!t || !inReach(reachOf(t), turn.range) || self.sealed > 0) {
    return { ...turn, lines: [...turn.lines, `${self.name}'s jutsu fizzles.`] };
  }
  const card: Card = { uid: 'enemy', kind: 'jutsu', technique: t };
  const played = playOn(turn.fighters, { user: self, target, card }, rng);
  return { ...turn, fighters: played.fighters, lines: [...turn.lines, ...played.lines] };
}

/**
 * Who an enemy goes for: the player, unless they have vanished in smoke; then a teammate it
 * can see, or no one.
 */
function targetFor(fighters: readonly DeckFighter[], player: DeckFighter): DeckFighter | undefined {
  if (targetable(player)) return player;
  return fighters.find((f) => f.side === 'player' && targetable(f));
}

/** Carries out one enemy's intent against the player (or whoever it can still see). */
export function enemyAct(
  turn: TurnResult,
  self: DeckFighter,
  intent: Intent,
  rng: Rng,
): TurnResult {
  const player = turn.fighters.find((f) => f.isPlayer);
  if (!player || !alive(self) || !alive(player)) return turn;
  const fresh = { ...turn, fighters: patch(turn.fighters, self.id, { block: 0 }) };
  const target = targetFor(turn.fighters, player);
  const attacking = intent.kind === 'attack' || intent.kind === 'jutsu';
  if (attacking && !target) {
    return { ...fresh, lines: [...turn.lines, `${self.name} loses sight of you.`] };
  }
  return perform(fresh, { self, target: target ?? player }, intent, rng);
}

function perform(turn: TurnResult, duo: Duo, intent: Intent, rng: Rng): TurnResult {
  const { self } = duo;
  switch (intent.kind) {
    case 'dazed':
      return { ...turn, lines: [...turn.lines, `${self.name} is dazed.`] };
    case 'step-in':
    case 'step-back': {
      const range = intent.kind === 'step-in' ? stepIn(turn.range) : stepBack(turn.range);
      const verb = intent.kind === 'step-in' ? 'closes in' : 'backs off';
      return { ...turn, range, lines: [...turn.lines, `${self.name} ${verb}.`] };
    }
    case 'guard':
      return {
        ...turn,
        fighters: patch(turn.fighters, self.id, { block: guardBlock(self) }),
        lines: [...turn.lines, `${self.name} braces.`],
      };
    case 'attack': {
      const hit = attack(turn.fighters, duo, turn.range, rng);
      return { ...turn, fighters: hit.fighters, lines: [...turn.lines, ...hit.lines] };
    }
    case 'jutsu':
      return jutsuAct(turn, duo, intent, rng);
  }
}
