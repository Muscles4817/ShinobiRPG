/**
 * The portrait's inks: the brush's ink, and the shade and light a colour takes. Skin,
 * hair and eyes are the person's own colours; these derive their shadows and highlights.
 */

/** The ink every line is brushed in. */
export const INK = '#1d1510';

/** The paper white of eyes and teeth. */
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

/** The paper a portrait is brushed on, and its lit centre. */
export const PAPER = '#e9dcbe';
export const PAPER_LIT = '#f6ecd4';

/** A shadow laid over a colour, as a wash of ink. */
export const SHADE = '#3a2416';
