/**
 * Deterministic hashing for "random but reproducible" choices that must not consume the game's
 * Rng (e.g. which jobs are posted on a given day, recomputable at any time).
 */

/** 32-bit FNV-1a hash of a string. */
export function hashString(text: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash >>> 0;
}

/** A stable value in [0, 1) for the given parts. */
export function hashUnit(...parts: readonly (string | number)[]): number {
  return hashString(parts.join('|')) / 4294967296;
}

/**
 * Picks an index into a bank of `size` lines for this key, passing over the ones said lately:
 * the same key and memory always give the same pick, and a line comes back only once every
 * other has had its turn.
 */
export function freshIndex(key: string, size: number, recent: readonly number[]): number {
  const start = hashString(key) % size;
  for (let step = 0; step < size; step++) {
    const index = (start + step) % size;
    if (!recent.includes(index)) return index;
  }
  return start;
}
