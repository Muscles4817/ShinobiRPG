/**
 * How a character looks. Stored as choices from fixed palettes so portraits can be drawn
 * (and later generated) without image files.
 */
export const HAIR_STYLES = ['spiky', 'short', 'long', 'ponytail', 'buns', 'shaved'] as const;
export type HairStyle = (typeof HAIR_STYLES)[number];

export const HAIR_COLOURS = [
  '#1b1a22',
  '#4a2f1d',
  '#8a5a2b',
  '#e0b64a',
  '#e8e0d0',
  '#d8789a',
  '#3d5fa8',
  '#b8322c',
] as const;
export const EYE_COLOURS = [
  '#2a1d14',
  '#3b6fb6',
  '#4f8a3a',
  '#7a4a8a',
  '#c9c3d9',
  '#b8322c',
] as const;
export const SKIN_TONES = ['#f3d2b3', '#e2b48c', '#c68e63', '#9a6440', '#6b4128'] as const;
export const OUTFIT_COLOURS = [
  '#e8823a',
  '#2f4f7a',
  '#3e6b3a',
  '#5a3a6e',
  '#2a2a32',
  '#9a2f2a',
] as const;
export const HEADBAND_PLACES = ['forehead', 'neck', 'arm', 'belt'] as const;
export type HeadbandPlace = (typeof HEADBAND_PLACES)[number];

export interface Appearance {
  readonly hairStyle: HairStyle;
  readonly hairColour: string;
  readonly eyeColour: string;
  readonly skinTone: string;
  readonly outfitColour: string;
  readonly headband: HeadbandPlace;
}

export const DEFAULT_APPEARANCE: Appearance = {
  hairStyle: 'spiky',
  hairColour: HAIR_COLOURS[1],
  eyeColour: EYE_COLOURS[0],
  skinTone: SKIN_TONES[1],
  outfitColour: OUTFIT_COLOURS[0],
  headband: 'forehead',
};

export const PRONOUNS = ['he', 'she', 'they'] as const;
export type Pronouns = (typeof PRONOUNS)[number];
