import { NAME_SLOTS, TOPIC_SLOTS } from './conversationTopics';
import { placeholdersIn } from './missionTemplates';
import { PERSON_ROLES, type ConversationDef, type TopicKind } from './people';
import type { ContentPack } from './types';

/**
 * Checks templated talk: each topic names a real specialty, trait, clan or role and gives
 * exactly the words its kind promises, and each conversation uses only the slots it may.
 */
export function validateTalk(pack: ContentPack): string[] {
  return [...topicProblems(pack), ...pack.conversations.flatMap(slotProblems)];
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
    );
    return problems;
  });
}

function slotProblems(c: ConversationDef): string[] {
  const allowed = new Set([...NAME_SLOTS, ...Object.keys(c.about ? TOPIC_SLOTS[c.about] : {})]);
  const used = new Set(placeholdersIn(JSON.stringify(c)));
  return [...used]
    .filter((s) => !allowed.has(s))
    .map((s) => `conversation "${c.id}" uses slot "{${s}}" it has no words for`);
}
