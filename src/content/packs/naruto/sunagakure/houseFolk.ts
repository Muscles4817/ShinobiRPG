import { look } from '../../../look';
import { statLine } from '../../../statLine';
import type { PersonDef } from '../../../types';

/**
 * Members of the great families met in the Outer Ring, each home at their compound in the
 * evening: a cousin of the Kazekage's house on the tower guard, a Red Sand journeyman with
 * a workshop doll, a sail-hand of the Cutting Wind and an old priest of the Dunes, who comes
 * inside the wall only to file the barges' papers.
 */
const SUNA = 'sunagakure';

export const SUNA_HOUSE_FOLK: readonly PersonDef[] = [
  {
    id: 'sabaku-hisui',
    name: 'Hisui',
    familyName: 'of the Sands',
    pronouns: 'she',
    homeLocationId: SUNA,
    clanId: 'sabaku',
    role: 'shinobi',
    title: 'Tower guard',
    rank: 'chunin',
    stats: statLine('D', { ninjutsu: 'B', chakraControl: 'C', willpower: 'C', intellect: 'C' }),
    traitIds: ['proud', 'focused'],
    appearance: look(
      'ponytail',
      { hair: '#7a4a2a', eyes: '#3e6b5a', skin: '#e2b48c', outfit: '#e8e0d0' },
      'forehead',
      { expression: 'stern', age: 'young' },
    ),
    specialty: 'ninjutsu',
    bio: 'A cousin of the Kazekage’s, on the tower guard. She carries a pouch of gold dust and has been told never to let anyone see her use plain sand.',
    schedule: {
      morning: 'envoys-office',
      afternoon: 'wind-gallery',
      evening: 'sabaku-compound',
      night: null,
    },
    arsenal: { techniqueIds: ['gold-dust-hammer'], dust: 'gold-dust' },
  },
  {
    id: 'akasuna-tsumugi',
    name: 'Tsumugi',
    familyName: 'of the Red Sand',
    pronouns: 'he',
    homeLocationId: SUNA,
    clanId: 'akasuna',
    role: 'shinobi',
    title: 'Journeyman puppeteer',
    rank: 'chunin',
    stats: statLine('D', { chakraControl: 'B', ninjutsu: 'B', intellect: 'C', perception: 'C' }),
    traitIds: ['curious', 'diligent'],
    appearance: look(
      'shaggy',
      { hair: '#b8322c', eyes: '#5f4a3a', skin: '#f3d2b3', outfit: '#3a3632' },
      'belt',
      { expression: 'smile', age: 'young' },
    ),
    specialty: 'ninjutsu',
    bio: 'Has lacquer under every fingernail and a plain red doll in a scroll on his back. Talks about Sasori the way other boys talk about the Kazekage, and lowers his voice to do it.',
    schedule: {
      morning: 'thread-yard',
      afternoon: 'thread-yard',
      evening: 'akasuna-compound',
      night: 'last-well',
    },
    arsenal: { techniqueIds: ['chakra-threads'], puppets: ['workshop-doll'] },
  },
  {
    id: 'kamaitachi-hayase',
    name: 'Hayase',
    familyName: 'of the Cutting Wind',
    pronouns: 'she',
    homeLocationId: SUNA,
    clanId: 'kamaitachi',
    role: 'shinobi',
    title: 'Sail-hand of the barges',
    rank: 'chunin',
    stats: statLine('D', { ninjutsu: 'B', strength: 'C', stamina: 'C', speed: 'C' }),
    traitIds: ['brash', 'kind'],
    appearance: look(
      'topknot',
      { hair: '#2a1d14', eyes: '#5f4a3a', skin: '#b98a5e', outfit: '#c9a46a' },
      'arm',
      { expression: 'grin', age: 'young' },
    ),
    specialty: 'ninjutsu',
    bio: 'Fills a barge’s sail with a fan twice her height and sleeps on the deck between crossings. The only one in her family who says good morning to the priests.',
    schedule: {
      morning: 'wind-gallery',
      afternoon: 'covered-bazaar',
      evening: 'kamaitachi-compound',
      night: 'last-well',
    },
    arsenal: { techniqueIds: ['fan-gust', 'wind-scythe'] },
  },
  {
    id: 'sakyu-koro',
    name: 'Kōro',
    familyName: 'of the Dunes',
    pronouns: 'he',
    homeLocationId: SUNA,
    clanId: 'sakyu',
    role: 'shinobi',
    title: 'Priest of the barge manifests',
    rank: 'chunin',
    stats: statLine('D', { ninjutsu: 'B', perception: 'B', willpower: 'C', chakraControl: 'C' }),
    traitIds: ['calm', 'humble'],
    appearance: look(
      'shaved',
      { hair: '#3a3632', eyes: '#c9a46a', skin: '#a5774f', outfit: '#8a3a2a' },
      'neck',
      { expression: 'calm', age: 'old' },
    ),
    specialty: 'ninjutsu',
    bio: 'Comes inside the wall each morning to file the barges’ papers, and goes back out before noon. People step off the path when he passes, and he thanks them for it.',
    schedule: {
      morning: 'envoys-office',
      afternoon: 'sakyu-compound',
      evening: 'sakyu-compound',
      night: null,
    },
    arsenal: { techniqueIds: ['quicksand-sink', 'sand-bullet', 'sandstorm-veil'] },
  },
];
