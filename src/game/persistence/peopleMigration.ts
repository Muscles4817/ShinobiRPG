import { createRng, hashString } from '@/core';
import { CONTENT_PACKS } from '@/content';
import { evenAptitude, type Aptitude } from '@/systems/stats';

import { rollCharacterAptitude } from '../aptitude';

/** The people step of the save migrations (see `migrations.ts`). */

type RawState = Record<string, unknown>;

function asRecord(value: unknown): RawState {
  return typeof value === 'object' && value !== null ? (value as RawState) : {};
}

function asArray(value: unknown): unknown[] {
  return Array.isArray(value) ? (value as unknown[]) : [];
}

function numberOr(value: unknown, fallback: number): number {
  return typeof value === 'number' ? value : fallback;
}

/**
 * How a genin's stats were derived up to save version 18, from your mission record, written
 * out here so this step never changes.
 */
const OLD_STAT_IDS = [
  'strength',
  'speed',
  'stamina',
  'reserves',
  'chakraControl',
  'intellect',
  'perception',
  'willpower',
  'taijutsu',
  'ninjutsu',
  'genjutsu',
  'kenjutsu',
  'fuuinjutsu',
];
const OLD_BODY = ['strength', 'speed', 'stamina'];

function oldGeninStats(specialty: unknown, missionsCompleted: number): Record<string, number> {
  const base = 5 + Math.min(12, missionsCompleted * 0.4);
  const value = (id: string) => base + (id === specialty ? 4 : OLD_BODY.includes(id) ? 1 : 0);
  return Object.fromEntries(OLD_STAT_IDS.map((id) => [id, value(id)]));
}

/** A classmate's talent, rolled from the save's seed and their id as new classmates' are. */
function classmateAptitude(packId: unknown, seed: number, id: unknown): Aptitude {
  const clan = CONTENT_PACKS.find((p) => p.id === packId)?.clans.find((c) => c.id === 'none');
  if (!clan) return evenAptitude(1);
  return rollCharacterAptitude(createRng(hashString(`${seed}|${String(id)}`)), clan);
}

/**
 * v18 → v19: people have real stats and genin grow on their own. Every genin (authored or
 * generated) keeps the stats the old rule gave them at this save's mission record, so nobody
 * jumps; generated classmates also get a rank and a talent. Growing starts from today.
 */
export function v18ToV19(state: RawState): RawState {
  const people = asRecord(state.people);
  const missions = numberOr(asRecord(state.standing).missionsCompleted, 0);
  const seed = numberOr(asRecord(state.board).seed, 1);
  const lastGrownDay = numberOr(asRecord(state.time).day, 1) - 1;
  const generated = asArray(people.generated).map((raw): RawState => {
    const person = asRecord(raw);
    return {
      ...person,
      rank: 'genin',
      stats: oldGeninStats(person.specialty, missions),
      aptitude: classmateAptitude(state.packId, seed, person.id),
    };
  });
  const authored = CONTENT_PACKS.find((p) => p.id === state.packId)?.people ?? [];
  const genin = [
    ...authored.filter((p) => p.role === 'genin'),
    ...generated.map((p) => ({ id: String(p.id), specialty: p.specialty })),
  ];
  const progress = Object.fromEntries(
    genin.map((p) => [p.id, { stats: oldGeninStats(p.specialty, missions), lastGrownDay }]),
  );
  return { ...state, people: { ...people, generated, progress } };
}
