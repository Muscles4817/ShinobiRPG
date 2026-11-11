import type { PersonDef } from '@/content';
import { hashUnit, type Rng } from '@/core';
import {
  lookOf,
  type Age,
  type Bearing,
  type Dress,
  type Look,
  type Pronouns,
  EYE_COLOURS,
  HAIR_COLOURS,
  HAIR_STYLES,
  HEADBAND_PLACES,
  OUTFIT_COLOURS,
  SKIN_TONES,
  type Appearance,
} from '@/systems/profile';
import type { Rank } from '@/systems/standing';

import { sealFor } from './seal';

/** A look picked from the appearance palettes: for generated genin and senseis alike. */
export function randomAppearance(rng: Rng): Appearance {
  return {
    hairStyle: rng.pick(HAIR_STYLES),
    hairColour: rng.pick(HAIR_COLOURS),
    eyeColour: rng.pick(EYE_COLOURS),
    skinTone: rng.pick(SKIN_TONES),
    outfitColour: rng.pick(OUTFIT_COLOURS),
    headband: rng.pick(HEADBAND_PLACES),
  };
}

/** Chūnin and civilians come in every age; the odds a face is young, then grown. */
const MIXED_AGES = { chunin: [0.5, 0.95], civilian: [0.3, 0.75] } as const;

/** How old someone looks, from what they are: genin are young, kages old. */
function ageOf(person: PersonDef): Age {
  if (person.rank === 'genin') return 'young';
  if (person.rank === 'kage') return 'old';
  if (person.rank === 'jonin') return hashUnit(person.id, 'age') < 0.8 ? 'grown' : 'old';
  const [young, grown] = MIXED_AGES[person.rank];
  const roll = hashUnit(person.id, 'age');
  if (roll < young) return 'young';
  return roll < grown ? 'grown' : 'old';
}

/** What a rank wears: seniors a flak vest, a villager a robe, everyone else a shinobi's jacket. */
function dressOf(rank: PersonDef['rank'] | Rank): Dress {
  if (rank === 'civilian') return 'robe';
  return rank === 'chunin' || rank === 'jonin' || rank === 'kage' ? 'flak' : 'jacket';
}

/**
 * Someone's look with their face settled: their own, or one read from who they are. Generated
 * genin reuse ids from save to save, so their drawn names go into the key too. Their bearing
 * (dress, art, name tag) is read from the person, so a promotion changes what they wear.
 */
export function personLook(person: PersonDef): Look {
  const key = `${person.id}:${person.name}:${person.familyName}`;
  const bearing: Bearing = {
    dress: dressOf(person.rank),
    seal: person.seal ?? sealFor(person.name),
    lashes: person.pronouns === 'she',
    ...(person.specialty && { art: person.specialty }),
  };
  return { ...lookOf(person.appearance, key, ageOf(person)), bearing };
}

/** Who the player is, for their own portrait. */
export interface PlayerBearing {
  readonly name: string;
  readonly appearance: Appearance;
  readonly pronouns?: Pronouns;
  readonly rank?: Rank;
  /** The art they are best at. */
  readonly art?: string;
}

/** The player's look. A save from before faces were chosen reads one from the character's name. */
export function playerLook(you: PlayerBearing): Look {
  const bearing: Bearing = {
    dress: dressOf(you.rank ?? 'genin'),
    seal: sealFor(you.name),
    lashes: you.pronouns === 'she',
    ...(you.art && { art: you.art }),
  };
  return { ...lookOf(you.appearance, `player:${you.name}`, 'young'), bearing };
}
