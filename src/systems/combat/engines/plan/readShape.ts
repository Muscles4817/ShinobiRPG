import type { RangeBand } from '../../contract';

/**
 * What fighters give away to each other as a fight goes on (`reads.ts`), as a shape only, so the
 * fight state and the mind (`mind/`) can both hold it.
 */

/** Kinds of attack, as an opponent sizes them up (`reads.ts`). */
export type AttackStyle = 'blow' | 'flurry' | 'break' | 'sure' | 'illusion' | 'jutsu';
/** A defence as an opponent sees it react. */
export type DefenceKind = 'guard' | 'dodge' | 'counter' | 'swap';

/** What a fighter has given away this fight: their defence at each distance, the attacks they throw. */
export interface Read {
  readonly defences: Partial<Record<RangeBand, DefenceKind>>;
  readonly attacks: Partial<Record<AttackStyle, number>>;
}

/** Everyone's read, by fighter id: what their opponents have seen of them. */
export type Reads = Readonly<Record<string, Read>>;
