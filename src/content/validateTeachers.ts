import type { PersonDef } from './people';
import type { PriceTemplate, SimplePrice, TeacherProfile } from './teachers';
import type { ContentPack } from './types';

/**
 * Checks teacher profiles: signatures are real techniques a teacher can actually pass on, the
 * teacher can be found where people train, prices name real jobs and favours someone can
 * actually do, numbers are sane, and every sensei has a profile.
 */

/** Friendship stages run 0 (stranger) to 4 (bonded). */
const MAX_STAGE = 4;
const DAYS_PER_WEEK = 7;

export function validateTeachers(pack: ContentPack): string[] {
  const favoursDone = new Set(
    pack.conversations.flatMap((c) => c.choices.flatMap((choice) => choice.favour ?? [])),
  );
  const favoursAsked = new Set(
    pack.people.flatMap((p) =>
      p.teacher ? partsOf(p.teacher.price).flatMap((part) => favourOf(part)) : [],
    ),
  );
  return [
    ...pack.people.flatMap((p) => teacherProblems(pack, p, favoursDone)),
    ...[...favoursDone]
      .filter((id) => !favoursAsked.has(id))
      .map((id) => `favour "${id}" is done in conversation but no teacher asks for it`),
  ];
}

function partsOf(price: PriceTemplate | undefined): readonly SimplePrice[] {
  if (!price) return [];
  return price.kind === 'all' ? price.parts : [price];
}

function favourOf(part: SimplePrice): string[] {
  return part.kind === 'favour' ? [part.favourId] : [];
}

function teacherProblems(
  pack: ContentPack,
  person: PersonDef,
  favoursDone: ReadonlySet<string>,
): string[] {
  const teacher = person.teacher;
  const who = `teacher "${person.id}"`;
  if (!teacher) return person.sensei ? [`sensei "${person.id}" needs a teacher profile`] : [];
  const problems: string[] = [];
  if (person.rank === 'civilian') problems.push(`${who} is a civilian and can’t teach`);
  const techniqueIds = new Set(pack.techniques.map((t) => t.id));
  for (const id of teacher.teaches) {
    if (!techniqueIds.has(id)) problems.push(`${who} teaches unknown technique "${id}"`);
  }
  problems.push(...reachProblems(pack, person).map((p) => `${who} ${p}`));
  problems.push(...shapeProblems(teacher).map((p) => `${who} ${p}`));
  const parts = partsOf(teacher.price);
  for (const part of parts) {
    problems.push(...priceProblems(pack, part, favoursDone).map((p) => `${who} ${p}`));
  }
  return problems;
}

/**
 * A teacher can actually be learned from: they come to a training place at some hour (your
 * sensei comes to you), and a clan's own techniques are taught only by its members.
 */
function reachProblems(pack: ContentPack, person: PersonDef): string[] {
  const problems: string[] = [];
  const homeId = person.homeLocationId ?? pack.startLocationId;
  const home = pack.locations.find((l) => l.id === homeId);
  const training = new Set(home?.places.filter((p) => p.kind === 'training').map((p) => p.id));
  const visits = Object.values(person.schedule).some((id) => id !== null && training.has(id));
  if (!person.sensei && !visits) problems.push('never comes to a training place');
  for (const id of person.teacher?.teaches ?? []) {
    const clan = pack.techniques.find((t) => t.id === id)?.clan;
    if (clan !== undefined && clan !== person.clanId) {
      problems.push(`teaches "${id}" but isn’t of the ${clan} clan`);
    }
  }
  return problems;
}

/** Steering, sessions and the price's shape. */
function shapeProblems(teacher: TeacherProfile): string[] {
  const problems: string[] = [];
  const free = teacher.steers?.freeAtStage;
  if (free !== undefined && (free < 1 || free > MAX_STAGE)) {
    problems.push(`lets you choose at a stage outside 1–${MAX_STAGE}`);
  }
  const sessions = teacher.sessionsPerWeek;
  if (sessions !== undefined && !(Number.isInteger(sessions) && sessions >= 1)) {
    problems.push('needs a whole number of sessions a week, at least one');
  } else if (sessions !== undefined && sessions > DAYS_PER_WEEK) {
    problems.push('can’t teach more than once a day');
  }
  return [...problems, ...combinedPriceProblems(teacher.price)];
}

function combinedPriceProblems(price: PriceTemplate | undefined): string[] {
  if (price?.kind !== 'all') return [];
  const parts = partsOf(price);
  return [
    ...(new Set(parts.map((p) => p.kind)).size !== parts.length
      ? ['has a combined price that repeats a kind']
      : []),
    ...(parts.length < 2 ? ['has a combined price with fewer than two parts'] : []),
  ];
}

function priceProblems(
  pack: ContentPack,
  part: SimplePrice,
  favoursDone: ReadonlySet<string>,
): string[] {
  switch (part.kind) {
    case 'bond':
      return part.minStage >= 0 && part.minStage <= MAX_STAGE
        ? []
        : [`asks for a bond stage outside 0–${MAX_STAGE}`];
    case 'ryo':
      return part.perSession > 0 ? [] : ['must charge more than nothing a session'];
    case 'mission':
      return pack.missions.some((m) => m.id === part.missionId)
        ? []
        : [`asks for unknown mission "${part.missionId}"`];
    case 'favour':
      return favoursDone.has(part.favourId)
        ? []
        : [`asks for favour "${part.favourId}" that no conversation reply does`];
  }
}
