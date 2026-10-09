import type { Rng } from '@/core';

import type { RangeBand } from '../../contract';
import { alive, chakraCost, hasPerk, strikeDamage, techniqueDamage } from '../../rules/body';
import {
  inReach,
  preferredRange,
  RANGE_BANDS,
  reachOf,
  stepBack,
  stepIn,
  stepTowards,
  STRIKE_REACH,
} from '../../rules/range';
import { guardBlock, playOn } from './cards';
import { absorb, patch, type Card, type DeckFighter, type Intent } from './state';

/**
 * Opponents announce what they will do next turn (Slay the Spire style), then do it. The
 * player sees the intent in advance; insight also reveals which jutsu is coming.
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
  const scale = inReach(STRIKE_REACH, range) ? 1 : KUNAI_SCALE;
  return Math.round(strikeDamage(self, target, 0.5) * scale);
}

export function chooseIntent(
  self: DeckFighter,
  target: DeckFighter,
  range: RangeBand,
  rng: Rng,
): Intent {
  if (self.stunned > 0) return { kind: 'dazed', estimate: 0 };
  const goal = preferredRange(self);
  if (goal !== range && rng.chance(MOVE_TOWARDS_CHANCE)) {
    const closer = RANGE_BANDS.indexOf(stepTowards(range, goal)) < RANGE_BANDS.indexOf(range);
    return { kind: closer ? 'step-in' : 'step-back', estimate: 0 };
  }
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

interface Duo {
  readonly self: DeckFighter;
  readonly target: DeckFighter;
}

function attack(fighters: DeckFighter[], { self, target }: Duo, range: RangeBand, rng: Rng) {
  const scale = inReach(STRIKE_REACH, range) ? 1 : KUNAI_SCALE;
  const damage = Math.max(1, Math.round(strikeDamage(self, target, rng.next()) * scale));
  const after = absorb(target, damage);
  const blocked = target.health - after.health < damage ? ' (some blocked)' : '';
  return {
    fighters: patch(fighters, target.id, after),
    lines: [`${self.name} hits ${target.name} for ${damage}${blocked}.`],
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

/** Carries out one enemy's intent against the player. */
export function enemyAct(
  turn: TurnResult,
  self: DeckFighter,
  intent: Intent,
  rng: Rng,
): TurnResult {
  const target = turn.fighters.find((f) => f.isPlayer);
  if (!target || !alive(self) || !alive(target)) return turn;
  const fresh = patch(turn.fighters, self.id, { block: 0 });
  switch (intent.kind) {
    case 'dazed':
      return { ...turn, fighters: fresh, lines: [...turn.lines, `${self.name} is dazed.`] };
    case 'step-in':
    case 'step-back': {
      const range = intent.kind === 'step-in' ? stepIn(turn.range) : stepBack(turn.range);
      const verb = intent.kind === 'step-in' ? 'closes in' : 'backs off';
      return { fighters: fresh, range, lines: [...turn.lines, `${self.name} ${verb}.`] };
    }
    case 'guard': {
      const block = guardBlock(self);
      return {
        ...turn,
        fighters: patch(fresh, self.id, { block }),
        lines: [...turn.lines, `${self.name} braces.`],
      };
    }
    case 'attack': {
      const hit = attack(fresh, { self, target }, turn.range, rng);
      return { ...turn, fighters: hit.fighters, lines: [...turn.lines, ...hit.lines] };
    }
    case 'jutsu':
      return jutsuAct({ ...turn, fighters: fresh }, { self, target }, intent, rng);
  }
}
