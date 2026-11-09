import type { NatureKit, ShinobiVillage } from '../../shared/foreignShinobi';

/**
 * The other hidden villages whose shinobi you meet on the road and at the exam: Sakyūgakure in
 * the dunes, the small villages of the Ashfield in the Land of Embers, and the squall village
 * across the Southern Sea. Their foes are composed from these (`shared/foreignShinobi`).
 */
export const ORIGINAL_VILLAGES: readonly ShinobiVillage[] = [
  {
    id: 'sakyugakure',
    short: 'Dune',
    headband: 'A sand-coloured headband, and a scarf against the grit even under a roof.',
    natures: ['wind', 'earth'],
    rogueNames: [
      'Isago of the Dry Wells',
      'Kazemi the Glass-Eyed',
      'Sunao Nine-Winds',
      'Hokori',
      'Tsuchi the Patient',
      'Amane Sandglass',
      'Karasu of the Red Dunes',
      'Yūsa',
      'Sekka Whitecloth',
      'Ibuki the Long Walk',
      'Mitsu Dustcaller',
      'Rōka',
    ],
  },
  {
    id: 'ashfield',
    short: 'Ashfield',
    headband: 'A soot-grey headband from one of the small villages of the Ashfield.',
    natures: ['fire', 'earth'],
    rogueNames: [
      'Sumi',
      'Kagari the Smoulder',
      'Enji',
      'Haiji Cinderhand',
      'Toki of the Kilns',
      'Akane',
      'Hinoe',
      'Kuroba',
      'Rokushō',
      'Tadashi Ashwalker',
      'Momiji',
      'Kōen',
    ],
  },
  {
    id: 'arashigakure',
    short: 'Squall',
    headband:
      'A salt-stiff headband from the Village Hidden in the Squalls, across the Southern Sea.',
    natures: ['water', 'lightning'],
    rogueNames: [
      'Nami',
      'Shio the Drowned',
      'Raiko',
      'Umihiko',
      'Kaito Stormglass',
      'Nagisa',
      'Arata',
      'Shibuki',
      'Tatsumi',
      'Uzu',
      'Kairi of the Lighthouses',
      'Ikazuchi',
    ],
  },
];

/** The original pack's nature techniques, for its villages' shinobi. */
export const ORIGINAL_NATURE_KIT: NatureKit = {
  fire: { shot: 'ember-flick', heavy: 'great-lantern-flame', master: 'ember-rain' },
  earth: { shot: 'pebble-volley', heavy: 'mud-grip', master: 'landslide' },
  wind: { shot: 'gust-palm', heavy: 'vacuum-blade', master: 'great-gale' },
  water: { shot: 'water-needle', heavy: 'tide-lash', master: 'falls-hammer' },
  lightning: { shot: 'static-touch', heavy: 'wire-spark', master: 'thunder-lantern' },
};
