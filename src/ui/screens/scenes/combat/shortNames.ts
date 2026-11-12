/**
 * The word that tells a fighter apart, and their seal's letters: "Bandit Archer" is Archer (A),
 * "Hungry Ghost 2" is Ghost 2 (G2), "Kaen" is Kaen (K). Read against everyone in the fight, so
 * no two fighters share one: a label that would collide takes the word before it ("First
 * Hokage", FH), and a seal that would still collide takes another letter (Kaen Ka, Kiba Ki).
 */

export interface ShortName {
  readonly label: string;
  readonly mark: string;
}

interface Named {
  readonly name: string;
}

function trailing(name: string, count: number): string[] {
  const words = name.split(' ');
  const last = words.at(-1) ?? name;
  // A number ends a name only as a tally ("Ghost 2"): it never stands alone.
  const take = /^\d+$/.test(last) && words.length > 1 ? count + 1 : count;
  return words.slice(-Math.min(take, words.length));
}

function markOf(words: readonly string[], letters: number): string {
  if (words.length === 1) return (words[0] ?? '').slice(0, letters);
  return words.map((w) => (/^\d+$/.test(w) ? w : w.charAt(0))).join('');
}

/** How many trailing words this name needs before no other name in the field ends the same. */
function wordsNeeded(name: string, others: readonly string[]): number {
  const total = name.split(' ').length;
  for (let count = 1; count < total; count++) {
    const label = trailing(name, count).join(' ');
    if (!others.some((o) => trailing(o, count).join(' ') === label)) return count;
  }
  return total;
}

/** A fighter's short name, told apart from everyone else in the fight. */
export function shortName(name: string, field: readonly Named[] = []): ShortName {
  const others = [...new Set(field.map((f) => f.name))].filter((n) => n !== name);
  const words = trailing(name, wordsNeeded(name, others));
  const label = words.join(' ');
  const otherMarks = others.map((o) => markOf(trailing(o, wordsNeeded(o, [name, ...others])), 1));
  let letters = 1;
  while (otherMarks.includes(markOf(words, letters)) && letters < label.length) letters++;
  return { label, mark: markOf(words, letters) };
}
