import { createRng, hashString, round1, type Rng } from '@/core';
import type { PersonDef, PlaceKind } from '@/content';
import {
  EYE_COLOURS,
  HAIR_COLOURS,
  HAIR_STYLES,
  HEADBAND_PLACES,
  OUTFIT_COLOURS,
  SKIN_TONES,
  type Appearance,
} from '@/systems/profile';
import { createStats, STAT_IDS, type StatId, type Stats } from '@/systems/stats';
import { DISCIPLINES, type Discipline } from '@/systems/techniques';
import { TIME_SLOTS, type TimeSlot } from '@/systems/time';

import { rollCharacterAptitude } from '../aptitude';
import type { GameContext } from '../context';

/**
 * The genin generator: classmates built from the pack's name pools, its traits and the
 * appearance palettes. Deterministic for a given Rng, so the same seed makes the same class.
 * Their stats and talent come from the save's seed and their id (not the game's dice): a fresh
 * graduate's line, a little uneven, and an aptitude rolled like a clanless character's.
 */

/** Where generated genin spend their days. */
const HAUNTS: readonly PlaceKind[] = ['training', 'market', 'missions', 'academy'];
/** Chance a generated genin is out of the village in a given daytime slot. */
const AWAY_CHANCE = 0.25;
export const GENERATED_ID_PREFIX = 'genin-';
/** A fresh graduate's stats, as old classmates were before they had stats of their own. */
const GRADUATE_BASE = 5;
/** A graduate's specialty and body work, level with the player's report card (A is +3). */
const SPECIALTY_BONUS = 3;
const BODY_BONUS = 0.5;
const BODY_STATS: readonly StatId[] = ['strength', 'speed', 'stamina'];
/** Each stat is off the line by up to this much either way. */
const STAT_SPREAD = 1;
const CLANLESS = 'none';

export interface GeneratorInput {
  readonly count: number;
  /** Given names already taken (the player's, authored people's), never reused. */
  readonly takenNames: readonly string[];
  /** Numbering continues from here, so ids stay unique across calls. */
  readonly firstNumber: number;
  /** The save's seed: stats and talent come from it and the id. */
  readonly seed: number;
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
    people.push(generateOne(ctx, rng, { id, name, familyName, seed: input.seed }));
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
}

function generateOne(ctx: GameContext, rng: Rng, who: Identity): PersonDef {
  const traitIds = pickTraits(ctx, rng);
  const notes = traitIds.map((id) => ctx.content.traits.require(id).note);
  const appearance = randomAppearance(rng);
  const specialty = rng.pick(DISCIPLINES);
  const talentRng = createRng(hashString(`${who.seed}|${who.id}`));
  return {
    id: who.id,
    name: who.name,
    familyName: who.familyName,
    role: 'genin',
    title: 'Genin',
    rank: 'genin',
    stats: graduateStats(specialty, talentRng),
    aptitude: rollCharacterAptitude(talentRng, ctx.content.clans.require(CLANLESS)),
    traitIds,
    appearance,
    specialty,
    bio: notes.join(' '),
    schedule: randomSchedule(ctx, rng),
  };
}

/** A fresh graduate's line: a specialty, some body work, every stat a little off. */
function graduateStats(specialty: Discipline, rng: Rng): Stats {
  const line = createStats(GRADUATE_BASE, {
    ...Object.fromEntries(BODY_STATS.map((id) => [id, BODY_BONUS])),
    [specialty]: SPECIALTY_BONUS,
  });
  const varied = STAT_IDS.map(
    (id) => [id, round1(line[id] + (rng.next() * 2 - 1) * STAT_SPREAD)] as const,
  );
  return Object.fromEntries(varied) as Record<StatId, number>;
}

/** Two traits that don't contradict each other. */
function pickTraits(ctx: GameContext, rng: Rng): string[] {
  const traits = ctx.content.traits.all;
  const first = rng.pick(traits);
  const second = rng.pick(traits.filter((t) => t.id !== first.id && t.id !== first.opposite));
  return [first.id, second.id];
}

function randomAppearance(rng: Rng): Appearance {
  return {
    hairStyle: rng.pick(HAIR_STYLES),
    hairColour: rng.pick(HAIR_COLOURS),
    eyeColour: rng.pick(EYE_COLOURS),
    skinTone: rng.pick(SKIN_TONES),
    outfitColour: rng.pick(OUTFIT_COLOURS),
    headband: rng.pick(HEADBAND_PLACES),
  };
}

function randomSchedule(ctx: GameContext, rng: Rng): Record<TimeSlot, string | null> {
  const start = ctx.content.locations.require(ctx.content.startLocationId);
  const haunts = start.places.filter((p) => HAUNTS.includes(p.kind)).map((p) => p.id);
  const slotPlace = (slot: TimeSlot): string | null =>
    slot === 'night' || haunts.length === 0 || rng.chance(AWAY_CHANCE) ? null : rng.pick(haunts);
  return Object.fromEntries(TIME_SLOTS.map((slot) => [slot, slotPlace(slot)])) as Record<
    TimeSlot,
    string | null
  >;
}
