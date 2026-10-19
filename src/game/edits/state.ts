import type { StatId } from '@/systems/stats';

/**
 * What a player has changed in a pack's content with the editor: a sparse set of overrides
 * over the pack as written, so anything left alone still follows the pack (and a later version
 * of it). Edits are kept on the device; a new game copies the pack's edits into its save
 * (`GameState.edits`), so a game keeps the world it began with whatever is edited later.
 */

/** A fighter changed from the pack: only what differs is kept. */
export interface FighterEdit {
  /** Stat values in place of the pack's, stat by stat. */
  readonly stats?: Readonly<Partial<Record<StatId, number>>>;
  /** What they fight with, in place of the pack's list. */
  readonly techniqueIds?: readonly string[];
}

/** One pack's edits. Fighters are keyed by roster id (`person:<id>`, `enemy:<id>`). */
export interface ContentEdits {
  readonly fighters: Readonly<Record<string, FighterEdit>>;
}

export const NO_EDITS: ContentEdits = { fighters: {} };

const PERSON_KEY = 'person:';
const ENEMY_KEY = 'enemy:';

export type FighterRef =
  | { readonly kind: 'person'; readonly id: string }
  | { readonly kind: 'enemy'; readonly id: string };

export function personKey(id: string): string {
  return `${PERSON_KEY}${id}`;
}

export function enemyKey(id: string): string {
  return `${ENEMY_KEY}${id}`;
}

/** The person or foe a roster id names, or null for one that is neither. */
export function fighterRef(key: string): FighterRef | null {
  if (key.startsWith(PERSON_KEY)) return { kind: 'person', id: key.slice(PERSON_KEY.length) };
  if (key.startsWith(ENEMY_KEY)) return { kind: 'enemy', id: key.slice(ENEMY_KEY.length) };
  return null;
}

export function hasEdits(edits: ContentEdits): boolean {
  return Object.keys(edits.fighters).length > 0;
}
