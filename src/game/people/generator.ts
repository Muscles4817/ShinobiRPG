import { createRng, hashString, type Rng } from '@/core';
import type { PersonDef, PlaceKind } from '@/content';
import { DISCIPLINES, type Discipline } from '@/systems/techniques';
import { TIME_SLOTS, type TimeSlot } from '@/systems/time';

import type { GameContext } from '../context';
import { graduate } from './graduates';
import { randomAppearance } from './looks';

/**
 * The genin generator: classmates built from the pack's name pools, its traits and the
 * appearance palettes. Deterministic for a given Rng, so the same seed makes the same class.
 * Their stats and talent come from the save's seed and their id (not the game's dice), made
 * the way the player's are (`graduates.ts`).
 */

/** Where generated genin spend their days. */
const HAUNTS: readonly PlaceKind[] = ['training', 'market', 'missions', 'academy'];
/** Chance a generated genin is out of the village in a given daytime slot. */
const AWAY_CHANCE = 0.25;
export const GENERATED_ID_PREFIX = 'genin-';
export interface GeneratorInput {
  readonly count: number;
  /** Given names already taken (the player's, authored people's), never reused. */
  readonly takenNames: readonly string[];
  /** Numbering continues from here, so ids stay unique across calls. */
  readonly firstNumber: number;
  /** The save's seed: stats and talent come from it and the id. */
  readonly seed: number;
  /** The village they belong to and hang around in. Absent: the pack's start village. */
  readonly villageId?: string;
  /** Each one's clan by position (`yearClans`); absent or null: clanless. */
  readonly clanIds?: readonly (string | null)[];
}

export function generateGenin(ctx: GameContext, rng: Rng, input: GeneratorInput): PersonDef[] {
  const taken = new Set(input.takenNames);
  const families = new Set<string>();
  const people: PersonDef[] = [];
  for (let i = 0; i < input.count; i++) {
    const name = freshName(ctx.content.names.given, taken, rng);
    const familyName = freshName(ctx.content.names.family, families, rng);
    taken.add(name);
    families.add(familyName);
    const id = `${GENERATED_ID_PREFIX}${input.firstNumber + i}`;
    const village = input.villageId ?? ctx.content.startLocationId;
    const clanId = input.clanIds?.[i] ?? null;
    people.push(generateOne(ctx, rng, { id, name, familyName, seed: input.seed, village, clanId }));
  }
  return people;
}

function freshName(pool: readonly string[], taken: ReadonlySet<string>, rng: Rng): string {
  const free = pool.filter((n) => !taken.has(n));
  return rng.pick(free.length > 0 ? free : pool);
}

interface Identity {
  readonly id: string;
  readonly name: string;
  readonly familyName: string;
  readonly seed: number;
  readonly village: string;
  readonly clanId: string | null;
}

/** A clan child works at the clan's own art (its first art that is a discipline), if it has one. */
function clanSpecialty(ctx: GameContext, clanId: string | null): Discipline | null {
  if (!clanId) return null;
  const arts = ctx.content.clans.require(clanId).arts;
  return DISCIPLINES.find((d) => arts.includes(d)) ?? null;
}

function generateOne(ctx: GameContext, rng: Rng, who: Identity): PersonDef {
  const traitIds = pickTraits(ctx, rng);
  const notes = traitIds.map((id) => ctx.content.traits.require(id).note);
  const appearance = randomAppearance(rng);
  // Drawn for everyone, so a clan child leaves the rest of the year's draws as they were.
  const drawn = rng.pick(DISCIPLINES);
  const specialty = clanSpecialty(ctx, who.clanId) ?? drawn;
  const clan = who.clanId ? ctx.content.clans.require(who.clanId) : null;
  const dice = createRng(hashString(`${who.seed}|${who.id}`));
  const start = graduate(ctx, dice, specialty, clan?.id);
  return {
    id: who.id,
    name: who.name,
    familyName: clan?.name ?? who.familyName,
    ...(clan ? { clanId: clan.id } : {}),
    role: 'genin',
    title: 'Genin',
    rank: 'genin',
    stats: start.stats,
    aptitude: start.aptitude,
    traitIds,
    appearance,
    specialty,
    bio: notes.join(' '),
    schedule: randomSchedule(ctx, rng, who.village),
    ...(who.village === ctx.content.startLocationId ? {} : { homeLocationId: who.village }),
  };
}

/** Two traits that don't contradict each other. */
function pickTraits(ctx: GameContext, rng: Rng): string[] {
  const traits = ctx.content.traits.all;
  const first = rng.pick(traits);
  const second = rng.pick(traits.filter((t) => t.id !== first.id && t.id !== first.opposite));
  return [first.id, second.id];
}

function randomSchedule(
  ctx: GameContext,
  rng: Rng,
  villageId: string,
): Record<TimeSlot, string | null> {
  const village = ctx.content.locations.require(villageId);
  const haunts = village.places.filter((p) => HAUNTS.includes(p.kind)).map((p) => p.id);
  const slotPlace = (slot: TimeSlot): string | null =>
    slot === 'night' || haunts.length === 0 || rng.chance(AWAY_CHANCE) ? null : rng.pick(haunts);
  return Object.fromEntries(TIME_SLOTS.map((slot) => [slot, slotPlace(slot)])) as Record<
    TimeSlot,
    string | null
  >;
}
