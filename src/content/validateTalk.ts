import { PRONOUN_FORMS } from '@/core';

import { NAME_SLOTS, TOPIC_SLOTS } from './conversationTopics';
import {
  PERSON_ROLES,
  REGISTERS,
  type ConversationDef,
  type Register,
  type TopicKind,
} from './people';
import type { ContentPack } from './types';

/**
 * Checks templated talk: each topic names a real specialty, trait, clan or role and gives
 * exactly the words its kind promises, and each conversation uses only the slots it may. A
 * topic's words may speak of the person (`{them.their}`), but name no other slot.
 */

/** `{slot}` or `{slot.form}`, as `fillSlots` reads them. */
const SLOT = /\{([a-zA-Z0-9-]+(?:\.[a-zA-Z']+)?)\}/g;

const slotsIn = (text: string): string[] => [...text.matchAll(SLOT)].map((m) => m[1] ?? '');

/** The person's name and every pronoun form of it: `{them}`, `{them.their}`, `{them.s}`… */
const PERSON_SLOTS: readonly string[] = ['them', ...PRONOUN_FORMS.map((form) => `them.${form}`)];

/** Slots any conversation may use: the names and the person's pronoun forms. */
const SPEAKING_SLOTS: ReadonlySet<string> = new Set([...NAME_SLOTS, ...PERSON_SLOTS]);
export function validateTalk(pack: ContentPack): string[] {
  return [
    ...topicProblems(pack),
    ...pack.conversations.flatMap(slotProblems),
    ...pack.conversations.flatMap(landingProblems),
    ...pack.conversations.flatMap(phrasingProblems),
  ];
}

/** The two pairs of registers; a phrased line must read in one of each, so it fits everyone. */
const REGISTER_PAIRS: readonly (readonly Register[])[] = [
  ['blunt', 'wry'],
  ['warm', 'formal'],
];

/**
 * A phrased line gives a phrasing in each pair of registers, so it reads right whoever says
 * it, and a template's opener gives one for every register: the first words two people say
 * are never the same.
 */
function phrasingProblems(c: ConversationDef): string[] {
  const lines = [c.opener, ...c.choices.flatMap((x) => [x.reply, x.warm, x.cool])];
  const halfPhrased = lines.some(
    (line) =>
      typeof line === 'object' && REGISTER_PAIRS.some((pair) => pair.every((r) => !line[r])),
  );
  const opener = c.opener;
  const openerShort =
    c.about !== undefined && (typeof opener === 'string' || REGISTERS.some((r) => !opener[r]));
  return [
    ...(halfPhrased
      ? [`conversation "${c.id}" has a line phrased for only one pair of registers`]
      : []),
    ...(openerShort ? [`conversation "${c.id}" needs its opener phrased for every register`] : []),
  ];
}

/**
 * A template answers by how your reply landed, so each of its choices has a warm and a cool
 * answer besides the plain one. Authored talk may leave them out: it answers plainly.
 */
function landingProblems(c: ConversationDef): string[] {
  if (!c.about) return [];
  return c.choices.flatMap((choice, i) =>
    (['warm', 'cool'] as const)
      .filter((landing) => !choice[landing])
      .map((landing) => `conversation "${c.id}" choice ${i + 1} has no ${landing} answer`),
  );
}

function keysOf(pack: ContentPack, kind: TopicKind): ReadonlySet<string> {
  switch (kind) {
    case 'specialty':
      return new Set(Object.keys(pack.disciplineStarters));
    case 'trait':
      return new Set(pack.traits.map((t) => t.id));
    case 'clan':
      return new Set(pack.clans.map((c) => c.id));
    case 'role':
      return new Set(PERSON_ROLES);
  }
}

function topicProblems(pack: ContentPack): string[] {
  const seen = new Set<string>();
  return pack.conversationTopics.flatMap((t) => {
    const name = `${t.kind} topic "${t.key}"`;
    const problems: string[] = [];
    if (seen.has(`${t.kind}|${t.key}`)) problems.push(`duplicate ${name}`);
    seen.add(`${t.kind}|${t.key}`);
    if (!keysOf(pack, t.kind).has(t.key)) problems.push(`${name} names no ${t.kind} in the pack`);
    const wanted = Object.keys(TOPIC_SLOTS[t.kind]);
    const given = Object.keys(t.values);
    problems.push(
      ...wanted.filter((s) => !given.includes(s)).map((s) => `${name} is missing "${s}"`),
      ...given.filter((s) => !wanted.includes(s)).map((s) => `${name} has unknown slot "${s}"`),
      ...slotsIn(Object.values(t.values).join(' '))
        .filter((s) => !PERSON_SLOTS.includes(s))
        .map((s) => `${name} uses slot "{${s}}" it has no words for`),
    );
    return problems;
  });
}

function slotProblems(c: ConversationDef): string[] {
  const allowed = new Set([...SPEAKING_SLOTS, ...Object.keys(c.about ? TOPIC_SLOTS[c.about] : {})]);
  const used = new Set(slotsIn(JSON.stringify(c)));
  return [...used]
    .filter((s) => !allowed.has(s))
    .map((s) => `conversation "${c.id}" uses slot "{${s}}" it has no words for`);
}
