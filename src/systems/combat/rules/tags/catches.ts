import type { Catches } from '@/systems/techniques';

import type { BodySize } from '../../contract';

/**
 * How much of a body a technique catches, against how big the body is (`docs/design/technique-tags.md`):
 * a point strike (a Chidori) is a small share of a huge body and barely hurts it, while a move
 * that catches the whole body (a push, a crush, a slam) has more of it to work on and hurts a big
 * body more than a small one. Its harm is scaled by this, on top of the toughness size already
 * gives (`rules/size.ts`), so a point strike's scale is gentle.
 */
export const CATCH_SCALE: Readonly<Record<Catches, Readonly<Record<BodySize, number>>>> = {
  point: { small: 1, human: 1, large: 0.9, huge: 0.7 },
  whole: { small: 0.9, human: 1, large: 1.2, huge: 1.5 },
  none: { small: 1, human: 1, large: 1, huge: 1 },
};

/** The scale on a technique's harm for how much of this body it catches. */
export function catchScale(catches: Catches, size: BodySize): number {
  return CATCH_SCALE[catches][size];
}
