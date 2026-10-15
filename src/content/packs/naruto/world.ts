import type { LocationDef, SettingText } from '../../types';
import { APTITUDE_TEXT } from '../../shared/aptitude';
import { CHAKRA_PAPER_TEXT } from '../../shared/chakraPaper';
import { TOOL_IDS } from '../../shared/tools';
import { PROMOTIONS } from './exam';
import { SHOPPING_DISTRICT } from './market';
import { ACADEMY_SHELF, ARCHIVE_SHELF } from './shelves';
import { KONOHA_WILDS } from './wilds';
import { LAND_OF_WAVES } from './landOfWaves';
import { TANZAKU_TOWN } from './tanzaku';
import { SHUKUBA_TOWN } from './shukuba';
import { OTAFUKU_TOWN } from './otafuku';
import { FIRE_TEMPLE } from './fireTemple';

export const NARUTO_TEXT: SettingText = {
  nation: 'the Land of Fire',
  leaderTitle: 'Hokage',
  currency: 'ryo',
  intro:
    'The Hidden Leaf sits deep in the forests of the Land of Fire, watched over by the faces ' +
    'carved into the Hokage Rock. Spirits walk the old roads, and the elements answer to ' +
    'those who listen. Today you tied on your forehead protector for the first time.',
  graduate: 'Tie on your forehead protector',
  sleepWell: 'You sleep soundly. Somewhere a cicada keeps time.',
  sleepHungry: 'You sleep fitfully on an empty stomach.',
  sleepLockedOut: 'Your landlady has locked the door over unpaid rent. You sleep on the stairs.',
  hospitalWake: 'You wake in Konoha Hospital, under clean sheets and a medic’s frown.',
  aptitude: APTITUDE_TEXT,
  chakraPaper: CHAKRA_PAPER_TEXT,
  promotions: PROMOTIONS,
};

export const NARUTO_LOCATIONS: readonly LocationDef[] = [
  {
    id: 'konohagakure',
    name: 'Konohagakure',
    epithet: 'Village Hidden in the Leaves',
    map: { x: 48, y: 29, label: 'right' },
    backdrop: 'leaf-village',
    places: [
      {
        id: 'mission-desk',
        kind: 'missions',
        name: 'Mission Assignment Desk',
        icon: 'board',
        blurb: 'Iruka hands out D-ranks',
        missionIds: [
          'border-patrol',
          'catch-tora',
          'yamanaka-weeding',
          'farm-medicine',
          'merchant-escort',
          'stolen-scrolls',
          'haunted-granary',
          'border-bandits',
          'missing-nin-forest',
          'demon-brothers',
          'bridge-builder',
          'sound-spies',
          'lightning-swordsman',
          'scroll-of-seals',
          'smugglers-of-tanzaku',
          'bridge-builders-debt',
          'border-outpost-orders',
        ],
      },
      {
        id: 'training-grounds',
        kind: 'training',
        name: 'Training Grounds',
        icon: 'post',
        blurb: 'Posts, trees and the falls',
        trainingIds: [
          'training-posts',
          'rooftop-runs',
          'wall-laps',
          'tree-climbing',
          'seal-drills',
          'library-study',
          'illusion-spotting',
          'waterfall-meditation',
          'youth-sparring',
          'sword-kata',
          'seal-calligraphy',
        ],
        exerciseIds: ['tree-walking', 'water-walking'],
      },
      SHOPPING_DISTRICT,
      {
        id: 'weapon-shop',
        kind: 'gear',
        name: 'Higurashi Weapons',
        icon: 'anvil',
        blurb: 'Every blade a shinobi could want',
        hours: ['morning', 'afternoon', 'evening'],
        keeper: 'Tenten’s father',
        gearIds: [
          'fingerless-gloves',
          'tanto',
          'trench-knives',
          'ninjato',
          'katana',
          'weighted-kunai',
          'senbon-case',
          'windmill-shuriken',
          'sealing-brush',
          'genjutsu-bell',
        ],
        toolIds: TOOL_IDS,
      },
      {
        id: 'outfitter',
        kind: 'gear',
        name: 'Shinobi Outfitters',
        icon: 'vest',
        blurb: 'Armour and charms',
        hours: ['morning', 'afternoon'],
        keeper: 'The tailor by the gate',
        gearIds: [
          'mesh-shirt',
          'shadow-cloak',
          'shinobi-armour',
          'flak-vest',
          'samurai-plate',
          'prayer-beads',
          'hawk-talisman',
          'chakra-paper-charm',
        ],
      },
      {
        id: 'academy',
        kind: 'academy',
        name: 'Ninja Academy',
        icon: 'scroll',
        blurb: 'Library of techniques',
        hours: ['morning', 'afternoon'],
        techniqueIds: ACADEMY_SHELF,
      },
      {
        id: 'archives',
        kind: 'library',
        name: 'Village Archives',
        icon: 'stacks',
        blurb: 'The restricted stacks',
        hours: ['morning', 'afternoon'],
        techniqueIds: ARCHIVE_SHELF,
      },
      {
        id: 'izakaya',
        kind: 'tavern',
        name: 'Izakaya Tanuki',
        icon: 'sake',
        blurb: 'Where off-duty shinobi unwind',
        hours: ['evening', 'night'],
        keeper: 'Old Tanuki, behind the counter',
        foodIds: ['tavern-yakitori', 'tavern-oden', 'barley-tea'],
        roundCost: 40,
        cupCost: 12,
        pastimes: [
          {
            id: 'shogi',
            name: 'Shōgi at the back table',
            scene:
              'A shōgi board by the window, and a jōnin with a cigarette losing to a Nara who looks half asleep.',
          },
          {
            id: 'hanafuda',
            name: 'Hanafuda',
            scene:
              'Flower cards slapped down on the mat, and off-duty chūnin arguing over who owes whom.',
          },
        ],
      },
      {
        id: 'bathhouse',
        kind: 'onsen',
        name: 'Konoha Bathhouse',
        icon: 'spring',
        blurb: 'Hot baths behind a tall bamboo fence, and a sign on it about peeping.',
        hours: ['morning', 'afternoon', 'evening'],
        keeper:
          'The attendant at the counter, who has chased a white-haired peeper off the fence more than once',
        waters: 'bathhouse',
        soakCost: 10,
      },
      {
        id: 'apartment',
        kind: 'home',
        name: 'Your Apartment',
        icon: 'house',
        blurb: 'One room, one window',
        lodging: 'One-room apartment off the main street',
        rentPerWeek: 30,
      },
      {
        id: 'hospital',
        kind: 'hospital',
        name: 'Konoha Hospital',
        icon: 'heal',
        blurb: 'Medical ninja on call',
        treatmentCost: 60,
      },
      ...KONOHA_WILDS,
    ],
  },
  {
    id: 'sunagakure',
    name: 'Sunagakure',
    epithet: 'Village Hidden in the Sand',
    map: { x: 12, y: 51 },
    backdrop: 'dunes',
    places: [],
    lockedReason: 'Coming soon',
  },
  {
    id: 'kirigakure',
    name: 'Kirigakure',
    epithet: 'Village Hidden in the Mist',
    map: { x: 92, y: 36, label: 'left' },
    backdrop: 'mist',
    places: [],
    lockedReason: 'Coming soon',
  },
  LAND_OF_WAVES,
  TANZAKU_TOWN,
  SHUKUBA_TOWN,
  OTAFUKU_TOWN,
  FIRE_TEMPLE,
  {
    id: 'mount-myoboku',
    name: 'Mount Myōboku',
    epithet: 'Where the toads train sages',
    map: { x: 61, y: 22, label: 'right' },
    backdrop: 'mountain',
    places: [],
    lockedReason: 'Needs a summoning contract',
  },
];
