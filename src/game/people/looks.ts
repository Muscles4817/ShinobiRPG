import type { PersonDef } from '@/content';
import { hashUnit, type Rng } from '@/core';
import {
  lookOf,
  type Age,
  type Look,
  EYE_COLOURS,
  HAIR_COLOURS,
  HAIR_STYLES,
  HEADBAND_PLACES,
  OUTFIT_COLOURS,
  SKIN_TONES,
  type Appearance,
} from '@/systems/profile';

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

/**
 * Someone's look with their face settled: their own, or one read from who they are. Generated
 * genin reuse ids from save to save, so their drawn names go into the key too.
 */
export function personLook(person: PersonDef): Look {
  const key = `${person.id}:${person.name}:${person.familyName}`;
  return lookOf(person.appearance, key, ageOf(person));
}
