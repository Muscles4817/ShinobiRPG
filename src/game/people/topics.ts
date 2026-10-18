import type { ConversationDef, ConversationTopic, PersonDef, TopicKind } from '@/content';

import type { GameContext } from '../context';

/**
 * What a person talks about, and what they have already said to you. Templated talk is filled
 * from one of the person's facets (their art, any of their traits, their clan, their role), so
 * one template is as many anecdotes as the facets it fits. The bond's `heard` list keeps each
 * anecdote said (`template@facet`), newest last, so a person rotates through what they have to
 * say and never tells the same one twice running.
 */

/** How many of the latest anecdotes a person steers away from the facets of. */
export const FACET_MEMORY = 2;

/** One thing a person could say: a conversation and, for a template, the facet it fills from. */
export interface TalkPick {
  readonly def: ConversationDef;
  /** The topic key a template is filled from; null for authored talk, or the first that fits. */
  readonly topicKey: string | null;
}

/** The person's own facets of a topic kind: their art, clan or role, or traits in order. */
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

/** Every topic of a kind this person can fill a template from, in the order of their facets. */
export function topicsFor(
  ctx: GameContext,
  person: PersonDef,
  kind: TopicKind,
): readonly ConversationTopic[] {
  const topics = ctx.content.conversationTopics.filter((t) => t.kind === kind);
  return keysFor(person, kind).flatMap((key) => topics.filter((t) => t.key === key));
}

/**
 * The topic a templated conversation is filled from for this person: the facet named, or their
 * first that fits (a conversation begun before talk rotated). Null if none fits.
 */
export function topicFor(
  ctx: GameContext,
  person: PersonDef,
  kind: TopicKind,
  key: string | null = null,
): ConversationTopic | null {
  const topics = topicsFor(ctx, person, kind);
  return topics.find((t) => t.key === key) ?? topics[0] ?? null;
}

/** Everything this person could say of a conversation: once, or once per facet it fits. */
export function picksOf(ctx: GameContext, person: PersonDef, def: ConversationDef): TalkPick[] {
  if (!def.about) return [{ def, topicKey: null }];
  return topicsFor(ctx, person, def.about).map((t) => ({ def, topicKey: t.key }));
}

/**
 * A conversation in progress as a pick, its facet settled: one begun before talk rotated has
 * none, and is about the person's first facet of its kind.
 */
export function talkPick(
  ctx: GameContext,
  person: PersonDef,
  talking: { readonly conversationId: string; readonly topicKey: string | null },
): TalkPick {
  const def = ctx.content.conversations.require(talking.conversationId);
  const topic = def.about ? topicFor(ctx, person, def.about, talking.topicKey) : null;
  return { def, topicKey: topic?.key ?? null };
}

/** How an anecdote is kept in the bond's `heard` list. */
export function heardId(pick: TalkPick): string {
  return pick.topicKey === null ? pick.def.id : `${pick.def.id}@${pick.topicKey}`;
}

/**
 * Whether you have heard this. Saves from before talk rotated kept a template's bare id, said
 * about the person's first facet of its kind.
 */
export function hasHeard(
  heard: readonly string[],
  pick: TalkPick,
  firstKey: string | null,
): boolean {
  const legacy =
    pick.topicKey !== null && pick.topicKey === firstKey && heard.includes(pick.def.id);
  return legacy || heard.includes(heardId(pick));
}

/** A facet as `kind:key` ("trait:brash"), or null for authored talk. */
function facetOf(pick: TalkPick): string | null {
  return pick.def.about && pick.topicKey !== null ? `${pick.def.about}:${pick.topicKey}` : null;
}

/** The facets of the latest anecdotes heard, newest last. */
function recentFacets(ctx: GameContext, heard: readonly string[]): readonly string[] {
  return heard.slice(-FACET_MEMORY).flatMap((id) => {
    const [defId = '', key = null] = id.split('@');
    const def = ctx.content.conversations.get(defId);
    const facet = def && facetOf({ def, topicKey: key });
    return facet ? [facet] : [];
  });
}

/**
 * The picks worth choosing among: never the last thing said when there is anything else, and
 * away from the facets talked about lately when another is left.
 */
export function freshPicks(
  ctx: GameContext,
  heard: readonly string[],
  picks: readonly TalkPick[],
): readonly TalkPick[] {
  const last = heard.at(-1);
  const notLast = picks.filter((p) => heardId(p) !== last);
  const pool = notLast.length > 0 ? notLast : picks;
  const recent = recentFacets(ctx, heard);
  const fresh = pool.filter((p) => {
    const facet = facetOf(p);
    return facet === null || !recent.includes(facet);
  });
  return fresh.length > 0 ? fresh : pool;
}
