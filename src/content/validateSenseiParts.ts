import { SENSEI_ARCHETYPES } from './senseiArchetypes';
import type { SenseiPast, SenseiTemperament } from './senseiParts';
import type { ContentPack } from './types';

/**
 * Checks the parts generated senseis are made from (`senseiParts.ts`): every reference is
 * real, every line uses only the slots a sensei is made with, and every past can be told in
 * this pack (temperaments enough to carry it, a ground in one of its regions).
 */

/** The slots a part may name: who the sensei is, and who and where their past is. */
const SLOTS = ['name', 'art', 'lost', 'foe', 'keepsake', 'place', 'you', 'them'];
/** Fewer than this and a past would repeat the same few senseis. */
const MIN_TEMPERAMENTS = 3;
const MIN_FIRESIDE = 2;
const SLOT = /\{([a-zA-Z0-9-]+)\}/g;

function texts(value: unknown): string[] {
  if (typeof value === 'string') return [value];
  if (Array.isArray(value)) return value.flatMap(texts);
  if (value !== null && typeof value === 'object') return Object.values(value).flatMap(texts);
  return [];
}

function slotProblems(part: unknown): string[] {
  const unknown = texts(part).flatMap((t) =>
    [...t.matchAll(SLOT)].map((m) => m[1] ?? '').filter((slot) => !SLOTS.includes(slot)),
  );
  return [...new Set(unknown)].map((slot) => `uses an unknown slot {${slot}}`);
}

function temperamentProblems(pack: ContentPack, t: SenseiTemperament): string[] {
  const traits = new Set(pack.traits.map((x) => x.id));
  const missing = [...t.traits, ...t.favouredTraits].filter((id) => !traits.has(id));
  return [
    ...(SENSEI_ARCHETYPES.some((a) => a.id === t.archetype)
      ? []
      : [`is of an unknown archetype "${t.archetype}"`]),
    ...missing.map((id) => `names an unknown trait "${id}"`),
    ...(t.voice.fireside.length < MIN_FIRESIDE ? ['needs more to say by the fire'] : []),
    ...slotProblems(t),
  ].map((p) => `temperament "${t.id}" ${p}`);
}

function pastProblems(pack: ContentPack, past: SenseiPast): string[] {
  const temperaments = new Set(pack.senseiParts.temperaments.map((t) => t.id));
  const known = past.temperaments.filter((id) => temperaments.has(id));
  const grounds = pack.senseiParts.grounds.filter((g) => past.regions.includes(g.region));
  return [
    ...past.temperaments
      .filter((id) => !temperaments.has(id))
      .map((id) => `names an unknown temperament "${id}"`),
    ...(known.length < MIN_TEMPERAMENTS ? ['has too few temperaments to carry it'] : []),
    ...(grounds.length === 0 ? ['has no ground in this pack to be settled on'] : []),
    ...(pack.encounters.some((e) => e.id === past.foe.encounter)
      ? []
      : [`meets its foe in an unknown encounter "${past.foe.encounter}"`]),
    ...(past.keepsakes.length === 0 ? ['needs a keepsake'] : []),
    ...slotProblems(past),
  ].map((p) => `sensei past "${past.id}" ${p}`);
}

export function validateSenseiParts(pack: ContentPack): string[] {
  const { temperaments, pasts, grounds } = pack.senseiParts;
  const regions = new Set(pack.roadEvents.flatMap((e) => e.regions));
  return [
    ...temperaments.flatMap((t) => temperamentProblems(pack, t)),
    ...pasts.flatMap((p) => pastProblems(pack, p)),
    ...grounds
      .filter((g) => !regions.has(g.region) || g.days < 1)
      .map((g) => `sensei ground "${g.id}" needs a real region and a day or more on the road`),
  ];
}
