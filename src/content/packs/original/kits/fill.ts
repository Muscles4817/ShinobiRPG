import { FILL_KITS_1 } from './fill1';

/** docs/research/lantern-techniques.md */
export const FILL_KITS: Readonly<Record<string, readonly string[]>> = {
  ...FILL_KITS_1,
};

/** People of the world without an arsenal, who keep the kit they fight with now beside these. */
export const FILL_KEPT: Readonly<Record<string, readonly string[]>> = {
  akari: [
    'palm-strike',
    'shadow-feint',
    'pebble-volley',
    'hibana-spark',
    'great-lantern-flame',
    'hibana-kiln-heart',
    'gatefire-pillar',
  ],
  bunta: ['palm-strike', 'shadow-feint', 'ember-tag', 'shrine-snare'],
  daigo: ['palm-strike', 'shadow-feint', 'lantern-cut', 'forge-cut', 'anvil-fall'],
  enji: ['palm-strike', 'shadow-feint', 'pebble-volley', 'hibana-spark'],
  gen: ['palm-strike', 'shadow-feint', 'lantern-cut', 'anvil-fall'],
  gonzo: ['palm-strike', 'shadow-feint', 'lantern-cut', 'anvil-fall'],
  hotaru: ['palm-strike', 'shadow-feint', 'lantern-mirage'],
  ito: [
    'palm-strike',
    'shadow-feint',
    'ember-tag',
    'binding-rope',
    'shrine-snare',
    'shrine-rope-binding',
    'stitch-seal',
    'ink-prison',
  ],
  kaen: ['palm-strike', 'shadow-feint', 'pebble-volley', 'hibana-spark'],
  kagero: ['palm-strike', 'shadow-feint', 'lantern-mirage'],
  kazane: ['palm-strike', 'shadow-feint', 'ember-tag', 'binding-rope', 'shrine-snare'],
  kenji: ['palm-strike', 'shadow-feint', 'gale-heel'],
  masaru: ['palm-strike', 'shadow-feint', 'gale-heel'],
  mayu: ['palm-strike', 'shadow-feint', 'lantern-mirage', 'toga-moth-dust'],
  minase: ['palm-strike', 'shadow-feint', 'pebble-volley'],
  mio: ['palm-strike', 'shadow-feint', 'gale-heel'],
  nagi: ['palm-strike', 'shadow-feint', 'gale-heel'],
  nanami: ['palm-strike', 'shadow-feint', 'ember-tag', 'shrine-snare'],
  oboro: ['palm-strike', 'shadow-feint', 'pebble-volley'],
  rin: ['palm-strike', 'shadow-feint'],
  sayo: ['palm-strike', 'shadow-feint', 'lantern-mirage', 'guiding-light'],
  shiori: ['palm-strike', 'shadow-feint', 'lantern-mirage', 'guiding-light'],
  tamaki: ['palm-strike', 'shadow-feint', 'pebble-volley'],
  tomoshi: ['palm-strike', 'shadow-feint', 'lantern-mirage', 'toga-moth-dust'],
  torokage: ['palm-strike', 'shadow-feint'],
  yomi: [
    'palm-strike',
    'shadow-feint',
    'lantern-mirage',
    'guiding-light',
    'ghost-lantern-veil',
    'grave-lantern-walk',
    'ten-thousand-wicks',
  ],
};
