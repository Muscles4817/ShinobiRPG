import type { ModifierSpec } from '@/systems/modifiers';

import type { Register, Tone } from './people';

/** A personality trait. Opposites can't be taken together. */
export interface TraitDef {
  readonly id: string;
  readonly name: string;
  /** How an instructor would write it in your file. */
  readonly note: string;
  readonly opposite?: string;
  readonly modifiers: ModifierSpec;
  /** How people with this trait react to the tone of what you say. */
  readonly likes: readonly Tone[];
  readonly dislikes: readonly Tone[];
  /** How people with this as their first trait talk: the phrasing of templated lines. */
  readonly register: Register;
}
