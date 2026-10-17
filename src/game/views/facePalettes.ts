import {
  BROW_SHAPES,
  EAR_SHAPES,
  EXPRESSIONS,
  EYE_SHAPES,
  FACE_SHAPES,
  FIGURES,
  MARKS,
  NOSE_SHAPES,
  type BrowShape,
  type EarShape,
  type Expression,
  type EyeShape,
  type FaceShape,
  type Figure,
  type Mark,
  type NoseShape,
} from '@/systems/profile';

/** The face parts a new character picks from; age and facial hair come with the years. */
export interface FacePalettes {
  readonly shape: readonly FaceShape[];
  readonly figure: readonly Figure[];
  readonly eyes: readonly EyeShape[];
  readonly brows: readonly BrowShape[];
  readonly nose: readonly NoseShape[];
  readonly ears: readonly EarShape[];
  readonly expression: readonly Expression[];
  readonly mark: readonly Mark[];
}

export const FACE_PALETTES: FacePalettes = {
  shape: FACE_SHAPES,
  figure: FIGURES,
  eyes: EYE_SHAPES,
  brows: BROW_SHAPES,
  nose: NOSE_SHAPES,
  ears: EAR_SHAPES,
  expression: EXPRESSIONS,
  mark: MARKS,
};
