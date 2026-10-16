import type { Rng } from '@/core';
import {
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
