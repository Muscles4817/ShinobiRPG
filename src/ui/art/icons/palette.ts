/**
 * The few paints the icons share. Outlines are always `currentColor`, so an icon takes the
 * ink of wherever it sits (a lantern, a plaque, a paper card); these colour what is inside.
 */
export const PAINT = {
  red: '#d0472f',
  redDark: '#8f2a1c',
  paper: '#f3e6c8',
  white: '#fbf6ea',
  wood: '#9a6436',
  gold: '#e0a83a',
  broth: '#f3d88a',
  green: '#5f9a5e',
  leaf: '#8cc46a',
  blue: '#5d8fd0',
  blueDark: '#3f6aa8',
  water: '#57c7b8',
  steel: '#d3dae3',
  iron: '#5a5464',
  stone: '#7a6a5e',
  clay: '#c27a48',
  pink: '#f2a6bc',
  plum: '#c85a7a',
  olive: '#66784a',
  nori: '#24302a',
  lacquer: '#2a2030',
} as const;

/** Steam or smoke: drawn in the outline's ink, but faint. */
export const STEAM = { strokeOpacity: 0.55, strokeWidth: 1.4 } as const;

/** A highlight laid on a fill: no outline. */
export const SHINE = { stroke: 'none', fill: '#fff', opacity: 0.55 } as const;
