import type { NatureKit, ShinobiVillage } from '../../shared/foreignShinobi';

/**
 * The great villages beyond the Leaf whose shinobi you meet on the road and at the exam: the
 * Mist, the Sand, the Stone and the Cloud. Their foes are composed from these
 * (`shared/foreignShinobi`); the missing-nin's names are the pack's own, not canon.
 */
export const NARUTO_VILLAGES: readonly ShinobiVillage[] = [
  {
    id: 'kirigakure',
    short: 'Mist',
    headband: 'A Mist headband, the wave mark on a strip of cloth tied tight.',
    natures: ['water', 'lightning'],
    rogueNames: [
      'Kirisame',
      'Mizuchi',
      'Shizuku',
      'Tōru',
      'Ame',
      'Raito',
      'Oboro',
      'Nagare',
      'Sazanami',
      'Kasumi',
      'Fuyu',
      'Kaiun',
    ],
  },
  {
    id: 'sunagakure',
    short: 'Sand',
    headband: 'A Sand headband worn loose, over a hood against the sun.',
    natures: ['wind', 'earth'],
    rogueNames: [
      'Sarasa',
      'Bakuto',
      'Jinpū',
      'Saji',
      'Kazari',
      'Iwao',
      'Fūga',
      'Hazama',
      'Mirai',
      'Sajin',
      'Tsumuji',
      'Akagi',
    ],
  },
  {
    id: 'iwagakure',
    short: 'Stone',
    headband:
      'A Stone headband, and a sleeve torn off at the shoulder the way Stone shinobi wear it.',
    natures: ['earth', 'fire'],
    rogueNames: [
      'Ganseki',
      'Iwaki',
      'Katai',
      'Ishimaru',
      'Daichi',
      'Kōseki',
      'Rekka',
      'Banjaku',
      'Sekiei',
      'Gōtetsu',
      'Hayao',
      'Kakō',
    ],
  },
  {
    id: 'kumogakure',
    short: 'Cloud',
    headband: 'A Cloud headband, its metal plate dented and polished bright.',
    natures: ['lightning', 'wind'],
    rogueNames: [
      'Inazuma',
      'Kumoi',
      'Shiden',
      'Tenpū',
      'Narukami',
      'Unkai',
      'Hekireki',
      'Sōen',
      'Kaminari',
      'Fūrai',
      'Ryūun',
      'Seiran',
    ],
  },
];

/** The fan pack's nature techniques, for its villages' shinobi. */
export const NARUTO_NATURE_KIT: NatureKit = {
  fire: { shot: 'phoenix-flower', heavy: 'dragon-fire', master: 'great-dragon-fire' },
  earth: { shot: 'mud-bullet', heavy: 'earth-wave', master: 'earth-dragon-bullet' },
  wind: { shot: 'air-bullet', heavy: 'vacuum-bullet', master: 'vacuum-sphere' },
  water: { shot: 'water-gun', heavy: 'water-bullet', master: 'water-shark-bullet' },
  lightning: { shot: 'static-palm', heavy: 'lightning-hound', master: 'banquet-of-lightning' },
};
