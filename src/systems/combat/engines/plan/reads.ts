import type { RangeBand } from '../../contract';
import { effectsOf, hasVerb, isWounding } from '../../rules/verbs';
import { isDefenceCard, type Card } from './cards';
import type { AttackStyle, DefenceKind, Read, Reads, Round } from './state';

/**
 * Fighters read each other as a fight goes on. Every defence that reacts gives itself away at
 * that distance, and every attack is noted by its style: a hand-to-hand blow, a flurry, a
 * guard-breaker, a sure technique, an illusion, or any other jutsu. Reads are public: whoever
 * faces a fighter knows what has been seen of them (`adapt.ts` puts it to use).
 */

const EMPTY: Read = { defences: {}, attacks: {} };

function isPhysical(card: Extract<Card, { kind: 'jutsu' }>): boolean {
  const art = card.technique.discipline;
  return art === 'taijutsu' || art === 'kenjutsu';
}

function jutsuStyle(card: Extract<Card, { kind: 'jutsu' }>): AttackStyle {
  const t = card.technique;
  if (t.discipline === 'genjutsu') return 'illusion';
  if (hasVerb(t, 'break')) return 'break';
  if (effectsOf(t, 'damage').some((e) => (e.hits ?? 1) > 1)) return 'flurry';
  if (t.accuracy === 'sure') return 'sure';
  return isPhysical(card) ? 'blow' : 'jutsu';
}

/** How an attack reads to the one it's aimed at, or null for what isn't an attack. */
export function styleOf(card: Card): AttackStyle | null {
  if (isDefenceCard(card)) return null;
  switch (card.kind) {
    case 'strike':
    case 'throw':
      return 'blow';
    case 'jutsu':
      return isWounding(card.technique) ? jutsuStyle(card) : null;
    case 'item':
      return card.item.effect === 'blast' ? 'jutsu' : null;
    case 'step':
    case 'gather':
    case 'reveal':
    case 'search':
    case 'dispel':
      return null;
  }
}

/** The kind of defence a ready card is, or null for what isn't one. */
export function defenceKind(card: Card): DefenceKind | null {
  switch (card.kind) {
    case 'guard':
    case 'dodge':
    case 'counter':
      return card.kind;
    case 'jutsu':
      return 'swap';
    case 'strike':
    case 'throw':
    case 'item':
    case 'step':
    case 'evade':
    case 'brace':
    case 'gather':
    case 'reveal':
    case 'search':
    case 'dispel':
      return null;
  }
}

/** What has been seen of a fighter so far. */
export function readOf(reads: Reads | undefined, id: string): Read {
  return reads?.[id] ?? EMPTY;
}

function withRead(round: Round, id: string, read: Read): Round {
  return { ...round, reads: { ...round.reads, [id]: read } };
}

/** Notes an attack the actor threw this exchange. */
export function noteAttack(round: Round, actorId: string, card: Card): Round {
  const style = styleOf(card);
  if (!style) return round;
  const read = readOf(round.reads, actorId);
  const attacks = { ...read.attacks, [style]: (read.attacks[style] ?? 0) + 1 };
  return withRead(round, actorId, { ...read, attacks });
}

/** Notes the defence a fighter was seen to use at a distance. */
export function noteDefence(
  round: Round,
  id: string,
  band: RangeBand,
  kind: DefenceKind | null,
): Round {
  if (!kind) return round;
  const read = readOf(round.reads, id);
  if (read.defences[band] === kind) return round;
  return withRead(round, id, { ...read, defences: { ...read.defences, [band]: kind } });
}
