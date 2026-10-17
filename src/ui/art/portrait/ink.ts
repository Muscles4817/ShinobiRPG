/**
 * The portrait's inks: the woodblock key line, and the shade and light a colour takes. Skin,
 * hair and eyes are the person's own colours; these derive their shadows and highlights.
 */

/** The print's key-block ink, outlining every shape. */
export const INK = '#1d1510';

/** Warm light from the lanterns, caught along the far edge of a face. */
export const RIM = '#ffb46a';

/** The inside of an open mouth, and the paper white of eyes and teeth. */
export const MOUTH = '#5a1e1e';
export const WHITE = '#fbf6ee';

function channels(hex: string): readonly [number, number, number] {
  const n = parseInt(hex.replace('#', '').slice(0, 6), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function toHex(rgb: readonly number[]): string {
  return `#${rgb
    .map((c) =>
      Math.round(Math.min(255, Math.max(0, c)))
        .toString(16)
        .padStart(2, '0'),
    )
    .join('')}`;
}

/** The colour in shadow: darker by `amount` (0–1). */
export function shaded(hex: string, amount = 0.2): string {
  return toHex(channels(hex).map((c) => c * (1 - amount)));
}

/** The colour in light: mixed towards white by `amount` (0–1). */
export function lit(hex: string, amount = 0.5): string {
  return toHex(channels(hex).map((c) => c + (255 - c) * amount));
}
