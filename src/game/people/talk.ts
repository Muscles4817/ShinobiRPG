import { fillSlots, type Rng } from '@/core';
import type { PersonDef } from '@/content';
import { stageOf } from '@/systems/bonds';

import type { GameContext } from '../context';
import type { GameState } from '../state';
import { bondOf } from './cast';
import { personSlots } from './pronouns';
import { freshPicks, hasHeard, picksOf, topicFor, type TalkPick } from './topics';

export { topicFor, type TalkPick } from './topics';

/**
 * Choosing what someone says. Their own lines come first, then small talk they haven't
 * used on you yet; once everything has been said, anything fitting your stage may repeat.
 * Templated talk (`about`) is said only by people it has a topic for, and once for each facet
 * it fits (their specialty, each of their traits, their clan, their role), turning to facets
 * not talked about lately (`topics.ts`).
 */
export function pickConversation(
  state: GameState,
  ctx: GameContext,
  person: PersonDef,
  rng: Rng,
): TalkPick {
  const bond = bondOf(state, person.id);
  const stage = stageOf(bond.points);
  const picks = ctx.content.conversations.all
    .filter((c) => (c.personId === undefined || c.personId === person.id) && c.minStage <= stage)
    .flatMap((c) => picksOf(ctx, person, c));
  const firstKey = (p: TalkPick) => (p.def.about ? topicFor(ctx, person, p.def.about)?.key : null);
  const unheard = picks.filter((p) => !hasHeard(bond.heard, p, firstKey(p) ?? null));
  const own = unheard.filter((p) => p.def.personId === person.id);
  if (own.length > 0) return rng.pick(own);
  const fresh = (from: readonly TalkPick[]) => rng.pick(freshPicks(ctx, bond.heard, from));
  // Closer friends talk about deeper things: the newest stage's talk comes before old small talk.
  const deepest = Math.max(...unheard.map((p) => p.def.minStage));
  const deep = unheard.filter((p) => p.def.minStage === deepest && deepest > 0);
  if (deep.length > 0) return fresh(deep);
  return fresh(unheard.length > 0 ? unheard : picks);
}

/** A slot naming the player or the person (`{you}`, `{them}`, `{them.their}`), not a topic's. */
const isNameSlot = (slot: string): boolean =>
  slot === 'you' || slot === 'them' || slot.startsWith('them.');

/**
 * Replaces `{you}`, `{them}` (and its pronoun forms) and any topic slot in an authored line.
 * The topic's words go in first, since they may themselves speak of the person
 * (`{them.their}`); the names follow, once each can see whether it opens a sentence.
 */
export function fillLine(text: string, values: Readonly<Record<string, string>>): string {
  const topic = Object.fromEntries(Object.entries(values).filter(([slot]) => !isNameSlot(slot)));
  return fillSlots(fillSlots(text, topic), values);
}

/** Replaces `{you}`, and `{them}` with its pronoun forms, in authored lines. */
export function fillNames(text: string, names: { you: string; them: PersonDef }): string {
  return fillSlots(text, { you: names.you, ...personSlots('them', names.them) });
}

/** Everything a conversation's lines may name, for this person and the facet it is about. */
export function conversationValues(
  state: GameState,
  ctx: GameContext,
  person: PersonDef,
  talk: TalkPick,
): Readonly<Record<string, string>> {
  const { def, topicKey } = talk;
  const topic = def.about ? topicFor(ctx, person, def.about, topicKey) : null;
  return { ...topic?.values, you: state.character.name, ...personSlots('them', person) };
}
