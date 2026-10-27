import type { CompanionKindDef } from '../companions';

/**
 * Companion kinds of the chakra beasts' lines (`docs/design/chakra-beasts-plan.md`): found by
 * tracking like any wild kind, but only by someone who has fought one of their kind
 * (`WildHaunt.after`), and in fewer places than a wolf. Their techniques are the beasts' own,
 * opened by the bond.
 */

export const MIST_FOX: CompanionKindDef = {
  id: 'mist-fox-kit',
  name: 'Mist fox',
  description:
    'A red fox from the deep woods with a trick of hiding in plain sight. It plays the same tricks on you as on anything else.',
  temperament: 'wild',
  body: {
    adult: { strength: 5, speed: 14, stamina: 10, perception: 15 },
    maturesInDays: 60,
  },
  baseStat: 4,
  statBonuses: { genjutsu: 1, intellect: -1 },
  healthScale: 0.5,
  maxChakra: 30,
  traits: ['illusionist', 'swift'],
  aptitude: {
    speed: 1.3,
    perception: 1.3,
    stamina: 1,
    strength: 0.6,
    taijutsu: 0.9,
    genjutsu: 1.2,
    intellect: 0.7,
    chakraControl: 0.8,
    ninjutsu: 0,
    kenjutsu: 0,
    fuuinjutsu: 0,
  },
  diet: ['wild-game', 'eggs', 'river-fish', 'sweetfish'],
  techniques: [
    { techniqueId: 'fang-rush', stage: 1 },
    { techniqueId: 'fox-haze', stage: 2 },
    { techniqueId: 'fox-fire-lure', stage: 4 },
  ],
  roles: ['sensor'],
  plays: { likes: ['scent', 'fetch'], dislikes: ['rough'] },
  names: ['Kiri', 'Hotaru', 'Yūgiri', 'Kagerō', 'Mayoi', 'Akane'],
  wild: {
    biome: 'woods',
    chance: 0.35,
    after: 'mist-fox',
    sign: 'A fox’s tracks that go round a tree and don’t come out the other side.',
    closer:
      'A red fox sits in the path, watching you. When you look again it is sitting further off, still watching.',
    lost: 'The tracks lead you round in a circle back to your own. A fox barks off in the trees.',
    comes:
      'Today the fox follows you out of the trees. It keeps a little behind, and stops when you stop.',
  },
};

export const THUNDER_KITE: CompanionKindDef = {
  id: 'thunder-kite-chick',
  name: 'Thunder kite',
  description:
    'A kite of the high peaks that flies into storms rather than away from them. It hunts from higher than you can see.',
  temperament: 'wild',
  body: {
    adult: { strength: 6, speed: 18, stamina: 9, perception: 18 },
    maturesInDays: 80,
  },
  baseStat: 4,
  statBonuses: { taijutsu: 1, intellect: -1 },
  healthScale: 0.6,
  maxChakra: 40,
  nature: 'lightning',
  traits: ['swift'],
  aptitude: {
    speed: 1.4,
    perception: 1.4,
    stamina: 0.9,
    strength: 0.6,
    taijutsu: 1.1,
    chakraControl: 0.8,
    intellect: 0.6,
    ninjutsu: 0,
    genjutsu: 0,
    kenjutsu: 0,
    fuuinjutsu: 0,
  },
  diet: ['river-fish', 'wild-game', 'sweetfish', 'mountain-trout'],
  techniques: [
    { techniqueId: 'fang-rush', stage: 1 },
    { techniqueId: 'thunder-dive', stage: 3 },
  ],
  roles: ['tracker'],
  plays: { likes: ['walk', 'fetch'], dislikes: ['scent'] },
  names: ['Raikō', 'Hayate', 'Inazuma', 'Sora', 'Tobi', 'Kumo'],
  wild: {
    biome: 'mountain',
    chance: 0.35,
    after: 'thunder-kite',
    sign: 'A scorched feather on a rock above the falls, and the rock smells burnt.',
    closer: 'A kite circles over you most of the afternoon, a little lower each time round.',
    lost: 'Cloud comes down over the peak and the kite goes up into it. You wait till dark, and it doesn’t come down.',
    comes:
      'The kite drops out of the sky onto the rock beside you and stays there, feathers settling, until you go home. Then it follows.',
  },
};

export const BEAST_KINDS: readonly CompanionKindDef[] = [MIST_FOX, THUNDER_KITE];
