import type { TechniqueDef } from '@/systems/techniques';

/**
 * More plain illusions: a double to hide behind, footsteps that come from the wrong side, a
 * flock of paper cranes that fills the eyes, rooms that flood and processions that stop a whole
 * crowd where it stands.
 */
export const GENJUTSU_VARIANTS: readonly TechniqueDef[] = [
  {
    id: 'lantern-double',
    name: 'Lantern Double',
    description:
      'Your shape thrown on the air beside you like a shadow on a paper screen, close enough to draw the first blow.',
    discipline: 'genjutsu',
    effects: [{ verb: 'clone', power: 6, kind: 'illusion' }],
    chakraCost: 5,
    rank: 'E',
    difficulty: 30,
  },
  {
    id: 'echoing-steps',
    name: 'Echoing Steps',
    description:
      'Your footsteps go on sounding from where you were, so they turn towards the noise while you slip off the other way.',
    discipline: 'genjutsu',
    effects: [
      { verb: 'confuse', power: 6 },
      { verb: 'conceal', power: 6 },
    ],
    chakraCost: 7,
    rank: 'D',
    difficulty: 50,
  },
  {
    id: 'crane-swarm',
    name: 'Crane Swarm',
    description:
      'A storm of folded paper cranes that nobody else can see, beating at the faces of everyone near enough to be caught.',
    discipline: 'genjutsu',
    effects: [
      { verb: 'area', power: 10 },
      { verb: 'confuse', power: 8 },
    ],
    chakraCost: 11,
    rank: 'C',
    difficulty: 80,
  },
  {
    id: 'lantern-crowd',
    name: 'Lantern Crowd',
    description:
      'A street’s worth of faces in festival masks that walk the same way you do, and you among them.',
    discipline: 'genjutsu',
    effects: [
      { verb: 'clone', power: 9, kind: 'illusion' },
      { verb: 'conceal', power: 6 },
    ],
    chakraCost: 11,
    rank: 'C',
    difficulty: 75,
  },
  {
    id: 'flooded-room',
    name: 'Flooded Room',
    description:
      'The floor gives way to black water that fills the room to the neck, and their lungs believe it while their legs will not move.',
    discipline: 'genjutsu',
    effects: [
      { verb: 'pin', power: 14 },
      { verb: 'damage', power: 14 },
    ],
    chakraCost: 18,
    rank: 'B',
    difficulty: 110,
  },
  {
    id: 'masked-procession',
    name: 'Masked Procession',
    description:
      'A procession of the dead in paper masks winds through the field, and everyone it passes stands still to watch it go.',
    discipline: 'genjutsu',
    effects: [
      { verb: 'area', power: 16, size: 'wide' },
      { verb: 'daze', power: 12 },
    ],
    chakraCost: 30,
    rank: 'A',
    needs: { control: 'B' },
    difficulty: 140,
  },
];
