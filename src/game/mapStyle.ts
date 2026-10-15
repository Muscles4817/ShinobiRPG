/**
 * How the Travel tab's map is inked: a presentation choice kept in the settings. A save from
 * before the choice existed has none, which reads as the washi chart.
 */

export const MAP_STYLES = ['washi', 'night', 'brush'] as const;
export type MapStyle = (typeof MAP_STYLES)[number];

export const DEFAULT_MAP_STYLE: MapStyle = 'washi';

/** What each style is called in the settings, and what it looks like. */
export const MAP_STYLE_TEXT: Readonly<Record<MapStyle, { name: string; blurb: string }>> = {
  washi: {
    name: 'Washi chart',
    blurb: 'Paper and ink, like a printed chart, with hatched coasts.',
  },
  night: {
    name: 'Lantern night',
    blurb: 'An indigo sea, dark lacquered land and gold-ink coasts.',
  },
  brush: { name: 'Sumi-e brush', blurb: 'Ink-wash on washi: a grey sea and heavy brush coasts.' },
};
