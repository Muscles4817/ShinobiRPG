import type { FaceShape, Figure } from '@/game';

import { points, type Point } from './brush';

/**
 * The head, turned three-quarters to the viewer's left, in a 400 by 480 box. A face shape is its
 * contour as points: far temple, brow ridge, the dip at the far eye, cheekbone, cheek, round the
 * chin, along the near jaw to its angle, and up to the ear. The far side sits close to the far
 * eye, because the head is turned; the near jaw drops from the ear before it turns for the chin.
 */
export const CONTOURS: Readonly<Record<FaceShape, readonly Point[]>> = {
  oval: points([
    124, 168, 120, 192, 124, 214, 119, 238, 128, 268, 148, 298, 164, 315, 178, 321, 192, 316, 222,
    300, 246, 280, 258, 250, 263, 214,
  ]),
  round: points([
    124, 168, 120, 192, 124, 214, 118, 240, 125, 270, 145, 299, 163, 314, 178, 319, 193, 315, 224,
    302, 248, 283, 259, 252, 264, 214,
  ]),
  square: points([
    124, 168, 119, 192, 123, 214, 118, 240, 123, 272, 140, 302, 160, 321, 181, 327, 203, 323, 234,
    311, 254, 290, 262, 254, 265, 214,
  ]),
  long: points([
    124, 168, 120, 192, 124, 214, 120, 240, 128, 274, 146, 306, 162, 325, 177, 332, 191, 327, 220,
    309, 245, 286, 258, 252, 263, 214,
  ]),
  heart: points([
    122, 168, 117, 192, 121, 214, 116, 238, 127, 266, 150, 295, 167, 311, 177, 316, 188, 312, 218,
    296, 246, 276, 260, 248, 265, 214,
  ]),
  angular: points([
    124, 168, 120, 192, 124, 214, 120, 238, 129, 267, 150, 297, 166, 314, 178, 320, 190, 315, 219,
    298, 244, 277, 257, 248, 263, 214,
  ]),
};

/** From the ear over the top of the skull and back to the far temple: skin the hair covers. */
export const CROWN = 'L268 150C266 100 200 80 150 110C134 124 126 148 124 168Z';

/** Where the far side of the contour hands over to the chin and the near jaw. */
export const CHIN_AT = 6;

/** How far the mouth sits below its usual place on a longer or shorter face. */
export const MOUTH_DROP: Readonly<Record<FaceShape, number>> = {
  oval: 0,
  round: -1,
  square: 3,
  long: 6,
  heart: -3,
  angular: 0,
};

/** A frame's neck (how much wider than usual, each side) and shoulders (their width). */
export const FRAMES: Readonly<Record<Figure, { readonly neck: number; readonly span: number }>> = {
  slight: { neck: -3, span: 0.93 },
  average: { neck: 0, span: 1 },
  broad: { neck: 7, span: 1.07 },
};

/** The line the head turns about: features and shoulders are set either side of it. */
export const CENTRE_X = 206;
