import type { ContentPack, PersonDef } from './types';

/** Fewest names a pool needs so generated classmates don't all share one. */
const MIN_GIVEN_NAMES = 8;
const MIN_FAMILY_NAMES = 4;
/** Friendship stages run 0 (stranger) to 4 (bonded). */
const MAX_STAGE = 4;

/** Checks the cast: people resolve to real places, clans and traits; senseis can be offered. */
export function validatePeople(pack: ContentPack): string[] {
  return [
    ...pack.people.flatMap((p) => personProblems(pack, p)),
    ...senseiProblems(pack),
    ...conversationProblems(pack),
    ...nameProblems(pack),
  ];
}

function personProblems(pack: ContentPack, person: PersonDef): string[] {
  const start = pack.locations.find((l) => l.id === pack.startLocationId);
  const placeIds = new Set(start?.places.map((p) => p.id));
  const traitIds = new Set(pack.traits.map((t) => t.id));
  const problems = Object.values(person.schedule)
    .filter((placeId): placeId is string => placeId !== null && !placeIds.has(placeId))
    .map((placeId) => `person "${person.id}" is scheduled at unknown place "${placeId}"`);
  for (const id of [...person.traitIds, ...(person.sensei?.favouredTraits ?? [])]) {
    if (!traitIds.has(id)) problems.push(`person "${person.id}" references unknown trait "${id}"`);
  }
  if (person.clanId !== undefined && !pack.clans.some((c) => c.id === person.clanId)) {
    problems.push(`person "${person.id}" belongs to unknown clan "${person.clanId}"`);
  }
  const techniqueIds = new Set(pack.techniques.map((t) => t.id));
  for (const id of person.sensei?.teaches ?? []) {
    if (!techniqueIds.has(id))
      problems.push(`sensei "${person.id}" teaches unknown technique "${id}"`);
  }
  if ((person.role === 'sensei') !== (person.sensei !== undefined)) {
    problems.push(`person "${person.id}" needs a sensei profile exactly when their role is sensei`);
  }
  return problems;
}

/** Team assignment offers two senseis with different specialties. */
function senseiProblems(pack: ContentPack): string[] {
  const specialties = new Set(pack.people.flatMap((p) => (p.sensei ? [p.sensei.specialty] : [])));
  return specialties.size < 2 ? ['pack needs senseis with at least two different specialties'] : [];
}

function conversationProblems(pack: ContentPack): string[] {
  const personIds = new Set(pack.people.map((p) => p.id));
  const problems = pack.conversations.flatMap((c) => {
    const own: string[] = [];
    if (c.personId !== undefined && !personIds.has(c.personId)) {
      own.push(`conversation "${c.id}" is for unknown person "${c.personId}"`);
    }
    if (c.choices.length < 2) own.push(`conversation "${c.id}" needs at least two choices`);
    if (c.minStage < 0 || c.minStage > MAX_STAGE) {
      own.push(`conversation "${c.id}" has a stage outside 0–${MAX_STAGE}`);
    }
    return own;
  });
  if (!pack.conversations.some((c) => c.personId === undefined && c.minStage === 0)) {
    problems.push('pack needs generic small talk for strangers');
  }
  return problems;
}

function nameProblems(pack: ContentPack): string[] {
  const problems: string[] = [];
  if (new Set(pack.names.given).size < MIN_GIVEN_NAMES) {
    problems.push(`name pool needs at least ${MIN_GIVEN_NAMES} distinct given names`);
  }
  if (new Set(pack.names.family).size < MIN_FAMILY_NAMES) {
    problems.push(`name pool needs at least ${MIN_FAMILY_NAMES} distinct family names`);
  }
  return problems;
}
