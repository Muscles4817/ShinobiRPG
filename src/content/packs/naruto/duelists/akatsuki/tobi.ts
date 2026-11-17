import type { TechniqueDef } from '@/systems/techniques';

import { look } from '../../../../look';
import { statLine } from '../../../../statLine';
import type { PersonDef } from '../../../../types';

import { akatsukiFighter } from './fighter';

/**
 * Tobi, the masked man (Obito Uchiha, though he lets the world think him Madara), and Zetsu,
 * the Akatsuki's spy. Kamui's intangibility is read as a spin (`substitute` with `spins`): it
 * turns aside every hit for chakra, and only an illusion or an empty tank gets past it, which is
 * near enough to how he was beaten. Pulling a foe into the other dimension is read as a hold.
 */
export const TOBI_ARTS: readonly TechniqueDef[] = [
  {
    id: 'kamui-intangibility',
    name: 'Kamui: Intangibility',
    description:
      'Blades, fists and fire pass through him as if he weren’t there. Part of him isn’t: it is in another world.',
    discipline: 'ninjutsu',
    clan: 'uchiha',
    effects: [{ verb: 'substitute', power: 18, spins: true }],
    chakraCost: 14,
    rank: 'S',
    difficulty: 180,
  },
  {
    id: 'kamui-absorption',
    name: 'Kamui: Absorption',
    description: 'A hand on the foe, and the air round the mask twists them halfway into a spiral.',
    discipline: 'ninjutsu',
    clan: 'uchiha',
    reach: ['close'],
    effects: [
      { verb: 'pin', power: 20 },
      { verb: 'damage', power: 12 },
    ],
    chakraCost: 22,
    rank: 'S',
    difficulty: 180,
  },
  {
    id: 'wood-cutting',
    name: 'Wood Release: Cutting Technique',
    description: 'Sharpened branches burst out of his arm and run the target through.',
    discipline: 'ninjutsu',
    reach: ['close', 'mid'],
    effects: [
      { verb: 'damage', power: 18, hits: 2 },
      { verb: 'pin', power: 10 },
    ],
    chakraCost: 18,
    rank: 'A',
    difficulty: 140,
  },
  {
    id: 'mayfly',
    name: 'Mayfly',
    description: 'He sinks into the ground or a tree trunk and comes up wherever he likes.',
    discipline: 'ninjutsu',
    effects: [
      { verb: 'conceal', power: 18, scaling: { drive: ['ninjutsu'] } },
      { verb: 'move', power: 6 },
    ],
    chakraCost: 10,
    rank: 'B',
    difficulty: 110,
  },
  {
    id: 'zetsu-spores',
    name: 'Spore Technique',
    description: 'Tiny white copies of him cling to the target and drink their chakra.',
    discipline: 'ninjutsu',
    reach: ['close', 'mid'],
    effects: [{ verb: 'drain', power: 14, absorb: true }],
    chakraCost: 10,
    rank: 'B',
    difficulty: 110,
  },
];

export const TOBI_FIGHTERS: readonly PersonDef[] = [
  akatsukiFighter({
    id: 'tobi',
    name: 'Tobi',
    familyName: '',
    pronouns: 'he',
    clanId: 'uchiha',
    title: 'The Masked Man',
    // Kage-level: he tamed the Nine-Tails and ran the Mist through its Kage.
    rank: 'kage',
    stats: statLine(26, {
      strength: 24,
      speed: 34,
      stamina: 34,
      reserves: 46,
      chakraControl: 38,
      intellect: 44,
      perception: 40,
      willpower: 44,
      taijutsu: 36,
      ninjutsu: 44,
      genjutsu: 38,
      kenjutsu: 16,
      fuuinjutsu: 34,
    }),
    traitIds: ['cunning', 'calm'],
    appearance: look(
      'spiky',
      { hair: '#1b1a22', eyes: '#b8322c', skin: '#efd6c0', outfit: '#2a2a32' },
      'belt',
      { shape: 'angular', expression: 'calm', mark: 'scar', age: 'grown' },
    ),
    specialty: 'ninjutsu',
    bio: 'An orange spiral mask with one eyehole, and a voice that plays the fool until it doesn’t. He says he is Madara Uchiha.',
    arsenal: {
      techniqueIds: [
        'kamui-intangibility',
        'kamui-absorption',
        'wood-cutting',
        'coercion-sharingan',
        'great-fireball',
      ],
      // A Sharingan behind the mask: it reads every foe and sees each move coming.
      perks: ['insight', 'foresight'],
    },
  }),
  akatsukiFighter({
    id: 'zetsu',
    name: 'Zetsu',
    familyName: '',
    pronouns: 'he',
    title: 'Spy of the Akatsuki',
    // Ranked as a jōnin for versus: he watches and reports, and seldom fights.
    rank: 'jonin',
    stats: statLine(18, {
      strength: 16,
      speed: 20,
      stamina: 30,
      reserves: 30,
      chakraControl: 30,
      intellect: 30,
      perception: 36,
      willpower: 24,
      ninjutsu: 30,
      genjutsu: 10,
      kenjutsu: 6,
      fuuinjutsu: 10,
    }),
    traitIds: ['curious', 'cunning'],
    appearance: look(
      'short',
      { hair: '#3f8a4a', eyes: '#c9a43a', skin: '#e8e0d0', outfit: '#2a2a32' },
      'belt',
      { shape: 'round', expression: 'grin', age: 'grown' },
    ),
    specialty: 'ninjutsu',
    bio: 'Half of him white and half black, framed in the leaves of a flytrap, and the two halves argue. He sees everything and tells the leader.',
    arsenal: {
      techniqueIds: ['mayfly', 'zetsu-spores'],
    },
  }),
];
