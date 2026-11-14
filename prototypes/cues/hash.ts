/**
 * A deterministic unit draw from any key (FNV-1a, then a mixer): the prototype's only source of
 * imperfection. Never Math.random; the same fight, exchange and pair always see the same thing.
 */
export function hashUnit(...parts: readonly (string | number)[]): number {
  let h = 0x811c9dc5;
  const text = parts.join('|');
  for (let i = 0; i < text.length; i += 1) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  h ^= h >>> 16;
  h = Math.imul(h, 0x85ebca6b);
  h ^= h >>> 13;
  h = Math.imul(h, 0xc2b2ae35);
  h ^= h >>> 16;
  return (h >>> 0) / 0x100000000;
}
