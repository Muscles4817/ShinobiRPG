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
  readonly id?: string;
}

function trailing(name: string, count: number): string[] {
  const words = name.split(' ');
  const last = words.at(-1) ?? name;
  // A number ends a name only as a tally ("Ghost 2"): it never stands alone.
  const take = /^\d+$/.test(last) && words.length > 1 ? count + 1 : count;
  return words.slice(-Math.min(take, words.length));
}

function capital(word: string): string {
  return word.charAt(0).toUpperCase() + word.slice(1);
}

function markOf(words: readonly string[], letters: number): string {
  if (words.length === 1) return capital((words[0] ?? '').slice(0, letters));
  return words.map((w) => (/^\d+$/.test(w) ? w : capital(w.charAt(0)))).join('');
}

/** Fighters who share a whole name (two shadow clones) are told apart by their count. */
function tallied(name: string, field: readonly Named[], id: string | undefined): string {
  const same = field.filter((f) => f.name === name);
  const at = id === undefined ? -1 : same.findIndex((f) => f.id === id);
  return same.length > 1 && at >= 0 ? `${name} ${at + 1}` : name;
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

/** A fighter's short name, told apart from everyone else in the fight (`id` tells twins apart). */
export function shortName(name: string, field: readonly Named[] = [], id?: string): ShortName {
  if (id !== undefined) {
    const named = field.map((f) => ({ name: tallied(f.name, field, f.id) }));
    return shortName(tallied(name, field, id), named);
  }
  const others = [...new Set(field.map((f) => f.name))].filter((n) => n !== name);
  const words = trailing(name, wordsNeeded(name, others));
  const label = words.join(' ');
  const otherMarks = others.map((o) => markOf(trailing(o, wordsNeeded(o, [name, ...others])), 1));
  let letters = 1;
  while (otherMarks.includes(markOf(words, letters)) && letters < label.length) letters++;
  return { label, mark: markOf(words, letters) };
}
