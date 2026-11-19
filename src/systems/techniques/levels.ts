import type { MoveDistance, TechniqueEffect } from './effects';
import type { WrittenTags } from './tags';

/**
 * A technique cast at more than one size (`docs/design/technique-tags.md`, levels): Almighty Push
 * close about its user, out to the middle distance, or over a whole village. Each level is a
 * technique of its own in a fight ("Almighty Push: wide"), with its own reach, effects and cost,
 * so picking the card when it is slotted is picking the level. Its id is the technique's with the
 * level's after a tilde.
 */
export interface TechniqueLevel {
  /** Joined to the technique's id: `almighty-push~wide`. */
  readonly id: string;
  /** Said after the technique's name: "Almighty Push: wide". */
  readonly label: string;
  readonly reach?: readonly MoveDistance[];
  readonly effects: readonly TechniqueEffect[];
  /** Asks at least this much chakra (it may ask more for what it does). */
  readonly chakraCost?: number;
  /** Tags of this level, over the technique's own. */
  readonly tags?: WrittenTags;
}

interface Levelled {
  readonly id: string;
  readonly name: string;
  readonly effects: readonly TechniqueEffect[];
  readonly chakraCost: number;
  readonly reach?: readonly MoveDistance[];
  readonly tags?: WrittenTags;
  readonly levels?: readonly TechniqueLevel[];
}

/** The id a level of a technique goes by in a fight. */
export function levelId(techniqueId: string, level: Pick<TechniqueLevel, 'id'>): string {
  return `${techniqueId}~${level.id}`;
}

/** A technique as the techniques it is in a fight: itself, or one for each of its levels. */
export function atEachLevel<T extends Levelled>(t: T): T[] {
  if (!t.levels || t.levels.length === 0) return [t];
  return t.levels.map((level) => {
    const { levels: _all, ...base } = t;
    const reach = level.reach ?? t.reach;
    return {
      ...base,
      id: levelId(t.id, level),
      name: `${t.name}: ${level.label}`,
      effects: level.effects,
      chakraCost: level.chakraCost ?? t.chakraCost,
      ...(reach ? { reach } : {}),
      ...(level.tags || t.tags ? { tags: { ...t.tags, ...level.tags } } : {}),
    } as T; // the same technique with one level's fields laid over it
  });
}
