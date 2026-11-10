import type { Body } from '../../rules/body';
import { isSource, sameMind, sourceConcealment } from '../../rules/minds';

/**
 * Bodies of one mind as a planned fight begins (or one is called into it): they think with the
 * sharpest of them, and a source is as hard to find as it stands off the field (`rules/minds.ts`;
 * the rest of the play is `sharedMind.ts`).
 */

type Minded = Body & { readonly concealment?: number };

/** The others of a fighter's mind. */
export function mindmates<F extends Minded>(fighters: readonly F[], f: F): F[] {
  return fighters.filter((o) => sameMind(o, f));
}

/** Every body of one mind thinks as the sharpest of them does; a source is hard to find. */
export function withOneMind<F extends Minded>(fighters: readonly F[]): F[] {
  return fighters.map((f) => {
    const mates = mindmates(fighters, f);
    if (mates.length === 0) return f;
    const sharpest = Math.max(f.attributes.intellect, ...mates.map((m) => m.attributes.intellect));
    const attributes = { ...f.attributes, intellect: sharpest };
    return isSource(f)
      ? { ...f, attributes, concealment: sourceConcealment(f) }
      : { ...f, attributes };
  });
}
