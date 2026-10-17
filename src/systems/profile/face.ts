import { hashUnit } from '@/core';

/**
 * The parts a face is drawn from: its shape, the neck and shoulders under it, eyes, brows,
 * nose, ears and resting expression, with age, facial hair and a mark on top. A face left
 * out of someone's appearance is read from a hash of a key (their id), so everyone has a
 * face of their own that never changes between visits or saves.
 */
export const FACE_SHAPES = ['oval', 'round', 'square', 'long', 'heart', 'angular'] as const;
export type FaceShape = (typeof FACE_SHAPES)[number];

export const FIGURES = ['slight', 'average', 'broad'] as const;
export type Figure = (typeof FIGURES)[number];

export const EYE_SHAPES = [
  'almond',
  'round',
  'narrow',
  'upturned',
  'downturned',
  'hooded',
] as const;
export type EyeShape = (typeof EYE_SHAPES)[number];

export const BROW_SHAPES = ['straight', 'arched', 'thick', 'angled', 'thin', 'bushy'] as const;
export type BrowShape = (typeof BROW_SHAPES)[number];

export const NOSE_SHAPES = ['button', 'straight', 'hooked', 'broad', 'long', 'snub'] as const;
export type NoseShape = (typeof NOSE_SHAPES)[number];

export const EAR_SHAPES = ['small', 'large', 'protruding', 'lobed', 'pointed'] as const;
export type EarShape = (typeof EAR_SHAPES)[number];

/** The face someone wears at rest. */
export const EXPRESSIONS = ['calm', 'smile', 'grin', 'smirk', 'stern', 'worried'] as const;
export type Expression = (typeof EXPRESSIONS)[number];

export const AGES = ['young', 'grown', 'old'] as const;
export type Age = (typeof AGES)[number];

export const FACIAL_HAIR = ['none', 'stubble', 'moustache', 'goatee', 'beard'] as const;
export type FacialHair = (typeof FACIAL_HAIR)[number];

export const MARKS = ['none', 'freckles', 'mole', 'scar', 'earrings'] as const;
export type Mark = (typeof MARKS)[number];

export interface FaceParts {
  readonly shape: FaceShape;
  readonly figure: Figure;
  readonly eyes: EyeShape;
  readonly brows: BrowShape;
  readonly nose: NoseShape;
  readonly ears: EarShape;
  readonly expression: Expression;
  readonly age: Age;
  readonly facialHair: FacialHair;
  readonly mark: Mark;
}

export const DEFAULT_FACE: FaceParts = {
  shape: 'oval',
  figure: 'average',
  eyes: 'almond',
  brows: 'straight',
  nose: 'button',
  ears: 'small',
  expression: 'calm',
  age: 'young',
  facialHair: 'none',
  mark: 'none',
};

/** Pointed ears are a choice, never handed out by chance. */
const DRAWN_EARS: readonly EarShape[] = ['small', 'large', 'protruding', 'lobed'];

/** Marks by chance: most faces carry none; scars come with years. */
const MARK_ODDS: readonly (readonly [Mark, number])[] = [
  ['freckles', 0.14],
  ['mole', 0.1],
  ['earrings', 0.1],
  ['scar', 0.1],
];

function pick<T>(list: readonly T[], key: string, part: string): T {
  const index = Math.floor(hashUnit(key, part) * list.length);
  const value = list[Math.min(index, list.length - 1)];
  if (value === undefined) throw new Error('pick from an empty list');
  return value;
}

function markFor(key: string, age: Age): Mark {
  let roll = hashUnit(key, 'mark');
  for (const [mark, odds] of MARK_ODDS) {
    if (mark === 'scar' && age === 'young') continue;
    if (roll < odds) return mark;
    roll -= odds;
  }
  return 'none';
}

/**
 * A face read from a key. Facial hair is never handed out: whether someone has a beard is
 * theirs or their author's to say.
 */
export function faceFromKey(key: string, age: Age): FaceParts {
  return {
    shape: pick(FACE_SHAPES, key, 'shape'),
    figure: pick(FIGURES, key, 'figure'),
    eyes: pick(EYE_SHAPES, key, 'eyes'),
    brows: pick(BROW_SHAPES, key, 'brows'),
    nose: pick(NOSE_SHAPES, key, 'nose'),
    ears: pick(DRAWN_EARS, key, 'ears'),
    expression: pick(EXPRESSIONS, key, 'expression'),
    age,
    facialHair: 'none',
    mark: markFor(key, age),
  };
}
