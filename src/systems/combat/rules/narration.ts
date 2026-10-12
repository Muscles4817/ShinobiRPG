/**
 * Amounts in fight narration. Story text never shows numbers (the fight screen shows them as
 * chips), so a line that reports damage or healing carries its amount in a marker:
 * engines write it with `harmLine`/`healLine`, and `splitNarration` reads it back into the
 * sentence and its amounts. Lines without a marker (older saves) pass through unchanged.
 */

export type NarrationAmountKind = 'harm' | 'heal';

export interface NarrationAmount {
  readonly kind: NarrationAmountKind;
  readonly amount: number;
}

export interface Narration {
  readonly text: string;
  readonly amounts: readonly NarrationAmount[];
}

const MARKER = /\s*⟦([+-])(\d+)⟧/g;

/** "Goro lands a blow on Aoi." with 7 damage dealt. */
export function harmLine(text: string, damage: number): string {
  return `${text} ⟦-${damage}⟧`;
}

/** "Aoi recovers." with 12 health restored. */
export function healLine(text: string, healed: number): string {
  return `${text} ⟦+${healed}⟧`;
}

export function splitNarration(line: string): Narration {
  const amounts = [...line.matchAll(MARKER)].map((m): NarrationAmount => ({
    kind: m[1] === '+' ? 'heal' : 'harm',
    amount: Number(m[2]),
  }));
  return { text: line.replace(MARKER, ''), amounts };
}

/**
 * Fighters who share a name ("Hungry Ghost" twice) are numbered in the order they stand
 * ("Hungry Ghost 1", "Hungry Ghost 2"), so the fight screen and every line about them can tell
 * them apart. A name nobody shares is left as it is.
 */
export function numberedNames<T extends { readonly name: string }>(fighters: readonly T[]): T[] {
  const count = (name: string) => fighters.filter((f) => f.name === name).length;
  return fighters.map((f, i) => {
    if (count(f.name) < 2) return f;
    const nth = fighters.slice(0, i + 1).filter((o) => o.name === f.name).length;
    return { ...f, name: `${f.name} ${nth}` };
  });
}

/** The opening line: "The bandit squares up", "Bandit, Archer square up". */
export function squareUpLine(names: readonly string[]): string {
  return `${names.join(', ')} ${names.length === 1 ? 'squares' : 'square'} up.`;
}
