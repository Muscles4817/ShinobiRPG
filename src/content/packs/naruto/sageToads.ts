import type { SummonDef } from '../../contracts';
import { statLine } from '../../statLine';

/**
 * The two Great Sage Toads of Mount Myōboku, Fukasaku and Shima, called together by one
 * technique. They never fight on the field: they land on their summoner's shoulders (`perch`)
 * and draw natural energy in with them, which Sage Mode and its duet need.
 */
export const SAGE_TOADS: readonly SummonDef[] = [
  {
    id: 'fukasaku',
    name: 'Fukasaku',
    description:
      'One of the two Great Sage Toads of the mountain: small, old, sharp-eyed, and a teacher of sages.',
    techniqueId: 'summoning-two-great-sage-toads',
    standing: 4,
    stats: statLine(16, {
      strength: 4,
      speed: 18,
      stamina: 10,
      reserves: 30,
      chakraControl: 40,
      intellect: 36,
      perception: 38,
      willpower: 36,
      taijutsu: 26,
      ninjutsu: 32,
      genjutsu: 34,
      kenjutsu: 0,
      fuuinjutsu: 10,
    }),
    healthScale: 0.4,
    maxChakra: 300,
    techniqueIds: [],
    upkeep: 6,
    perch: true,
  },
  {
    id: 'shima',
    name: 'Shima',
    description:
      'The other Great Sage Toad, Fukasaku’s wife, fierce and quicker with her tongue than he is.',
    techniqueId: 'summoning-two-great-sage-toads',
    standing: 4,
    stats: statLine(15, {
      strength: 4,
      speed: 18,
      stamina: 10,
      reserves: 30,
      chakraControl: 38,
      intellect: 32,
      perception: 36,
      willpower: 36,
      taijutsu: 18,
      ninjutsu: 32,
      genjutsu: 34,
      kenjutsu: 0,
      fuuinjutsu: 10,
    }),
    healthScale: 0.4,
    maxChakra: 300,
    techniqueIds: [],
    upkeep: 6,
    perch: true,
  },
];
