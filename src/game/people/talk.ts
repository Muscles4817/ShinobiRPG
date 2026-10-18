import { fillSlots, type Rng } from '@/core';
import type { ConversationDef, ConversationTopic, PersonDef, TopicKind } from '@/content';
import { stageOf } from '@/systems/bonds';

import type { GameContext } from '../context';
import type { GameState } from '../state';
import { bondOf } from './cast';
import { personSlots } from './pronouns';

/**
 * Choosing what someone says. Their own lines come first, then small talk they haven't
 * used on you yet; once everything has been said, anything fitting your stage may repeat.
 * Templated talk (`about`) is said only by people it has a topic for: their specialty, one of
 * their traits, their clan or their role.
 */
export function pickConversation(
  state: GameState,
  ctx: GameContext,
  person: PersonDef,
  rng: Rng,
): ConversationDef {
  const bond = bondOf(state, person.id);
  const stage = stageOf(bond.points);
  const eligible = ctx.content.conversations.all.filter(
    (c) =>
      (c.personId === undefined || c.personId === person.id) &&
      c.minStage <= stage &&
      (c.about === undefined || topicFor(ctx, person, c.about) !== null),
  );
  const unheard = eligible.filter((c) => !bond.heard.includes(c.id));
  const own = unheard.filter((c) => c.personId === person.id);
  if (own.length > 0) return rng.pick(own);
  // Closer friends talk about deeper things: the newest stage's talk comes before old small talk.
  const deepest = Math.max(...unheard.map((c) => c.minStage));
  const deep = unheard.filter((c) => c.minStage === deepest && deepest > 0);
  if (deep.length > 0) return rng.pick(deep);
  return rng.pick(unheard.length > 0 ? unheard : eligible);
}

/** The person's own facet of a topic kind: their art, clan or role, or traits in order. */
function keysFor(person: PersonDef, kind: TopicKind): readonly string[] {
  switch (kind) {
    case 'specialty':
      return person.specialty ? [person.specialty] : [];
    case 'trait':
      return person.traitIds;
    case 'clan':
      return person.clanId ? [person.clanId] : [];
    case 'role':
      return [person.role];
  }
}

/** The topic a templated conversation is filled from for this person, or null if none fits. */
export function topicFor(
  ctx: GameContext,
  person: PersonDef,
  kind: TopicKind,
): ConversationTopic | null {
  const topics = ctx.content.conversationTopics.filter((t) => t.kind === kind);
  for (const key of keysFor(person, kind)) {
    const topic = topics.find((t) => t.key === key);
    if (topic) return topic;
  }
  return null;
}

/**
 * Replaces `{you}`, `{them}` (and its pronoun forms) and any topic slot in an authored line.
 * Twice, because a topic's words may themselves speak of the person (`{them.their}`).
 */
export function fillLine(text: string, values: Readonly<Record<string, string>>): string {
  return fillSlots(fillSlots(text, values), values);
}

/** Replaces `{you}`, and `{them}` with its pronoun forms, in authored lines. */
export function fillNames(text: string, names: { you: string; them: PersonDef }): string {
  return fillSlots(text, { you: names.you, ...personSlots('them', names.them) });
}

/** Everything a conversation's lines may name, for this person. */
export function conversationValues(
  state: GameState,
  ctx: GameContext,
  person: PersonDef,
  def: ConversationDef,
): Readonly<Record<string, string>> {
  const topic = def.about ? topicFor(ctx, person, def.about) : null;
  return { ...topic?.values, you: state.character.name, ...personSlots('them', person) };
}
