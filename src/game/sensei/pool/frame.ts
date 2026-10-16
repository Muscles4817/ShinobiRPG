import type { ContentPack, Haunt, PersonDef, SenseiPast, SenseiTemperament } from '@/content';
import type { Rng } from '@/core';
import { createStats, type Stats } from '@/systems/stats';
import { DISCIPLINES, ELEMENTS, type Discipline, type Element } from '@/systems/techniques';
import type { TimeSlot } from '@/systems/time';

import { randomAppearance } from '../../people/looks';

/**
 * The frame of a generated sensei: who they are before their temperament and past give them
 * a voice (`compose.ts`). A name from the pack's pools, a look, an art their past fits, a
 * nature, the stats of a jōnin who is good at it, signatures from the pack's own techniques,
 * and a day spent between the training ground and wherever their temperament takes them.
 */

/** A jōnin's stats: a solid chūnin base, their art at B to A, and what holds a jōnin up. */
const BASE = 14;
const ART_LOW = 24;
const ART_SPREAD = 6;
const SUPPORT = { speed: 20, stamina: 18, chakraControl: 18, perception: 17 } as const;
/** How often a sensei has a nature of their own, when their past doesn't say. */
const NATURE_CHANCE = 0.6;
/** Signature techniques they teach: the grades a jōnin would, a few of them. */
const SIGNATURE_RANKS = ['C', 'B'];
const SIGNATURES = 2;

/** The kind of place each haunt is, in the start village. */
const HAUNT_KIND: Readonly<Record<Haunt, string | null>> = {
  tavern: 'tavern',
  onsen: 'onsen',
  market: 'market',
  wilds: 'wilds',
  library: 'library',
  home: null,
};

export interface Frame {
  readonly name: string;
  readonly familyName: string;
  readonly specialty: Discipline;
  readonly nature: Element | null;
  readonly stats: Stats;
  readonly teaches: readonly string[];
  readonly favouriteRecipeId: string | null;
  readonly look: PersonDef['appearance'];
  readonly schedule: Readonly<Record<TimeSlot, string | null>>;
}

/** A grown-up's name nobody authored in this pack has (`SenseiParts.names`). */
export function freshName(pack: ContentPack, rng: Rng, also: readonly string[] = []): string {
  const taken = new Set([...pack.people.map((p) => p.name), ...also]);
  const pool = pack.senseiParts.names.given;
  const free = pool.filter((n) => !taken.has(n));
  return rng.pick(free.length > 0 ? free : pool);
}

function natureFor(past: SenseiPast, rng: Rng): Element | null {
  if (past.nature) return past.nature;
  return rng.chance(NATURE_CHANCE) ? rng.pick(ELEMENTS) : null;
}

function statsFor(specialty: Discipline, rng: Rng): Stats {
  const art = ART_LOW + Math.floor(rng.next() * ART_SPREAD);
  return createStats(BASE, { ...SUPPORT, [specialty]: art - BASE });
}

/** Plain techniques of their art (no clan, no school, no partner) they can teach. */
function signaturesFor(pack: ContentPack, art: Discipline, nature: Element | null, rng: Rng) {
  const fits = pack.techniques.filter(
    (t) =>
      t.discipline === art &&
      SIGNATURE_RANKS.includes(t.rank) &&
      !t.clan &&
      !t.school &&
      !t.combo &&
      (t.element === undefined || t.element === nature),
  );
  const left = [...fits];
  const picked: string[] = [];
  while (picked.length < SIGNATURES && left.length > 0) {
    const [taken] = left.splice(rng.int(0, left.length - 1), 1);
    if (taken) picked.push(taken.id);
  }
  return picked;
}

function placeOfKind(pack: ContentPack, kind: string | null): string | null {
  if (!kind) return null;
  const home = pack.locations.find((l) => l.id === pack.startLocationId);
  return home?.places.find((p) => p.kind === kind)?.id ?? null;
}

/** Mornings at the training ground, afternoons and evenings where their temperament goes. */
function scheduleFor(pack: ContentPack, temperament: SenseiTemperament) {
  const training = placeOfKind(pack, 'training');
  const haunt = placeOfKind(pack, HAUNT_KIND[temperament.haunt]);
  const tavern = temperament.haunt === 'tavern' ? haunt : null;
  return { morning: training, afternoon: haunt ?? training, evening: tavern, night: null };
}

export function frameFor(
  pack: ContentPack,
  parts: { readonly temperament: SenseiTemperament; readonly past: SenseiPast },
  rng: Rng,
): Frame {
  const specialty = rng.pick(parts.past.arts ?? DISCIPLINES);
  const nature = natureFor(parts.past, rng);
  return {
    name: freshName(pack, rng),
    familyName: rng.pick(pack.senseiParts.names.family),
    specialty,
    nature,
    stats: statsFor(specialty, rng),
    teaches: signaturesFor(pack, specialty, nature, rng),
    favouriteRecipeId: pack.recipes.length > 0 ? rng.pick(pack.recipes).id : null,
    look: randomAppearance(rng),
    schedule: scheduleFor(pack, parts.temperament),
  };
}
