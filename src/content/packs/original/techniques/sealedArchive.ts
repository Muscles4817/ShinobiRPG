import type { TechniqueDef } from '@/systems/techniques';

/**
 * The Lantern Archive's sealed archive: plain A-rank techniques, one for each art, kept for
 * jōnin (`game/permits.ts`). No school and no clan, so every art has a move at A that no
 * teacher has to give you; the signature A-rank techniques stay with the people who teach them.
 */
export const SEALED_ARCHIVE: readonly TechniqueDef[] = [
  {
    id: 'falling-lintel',
    name: 'Falling Lintel',
    description: 'The whole body brought down like a roof beam, the guard first and then the rest.',
    discipline: 'taijutsu',
    effects: [
      { verb: 'break', power: 16 },
      { verb: 'damage', power: 18 },
    ],
    chakraCost: 16,
    rank: 'A',
    difficulty: 135,
  },
  {
    id: 'lamp-black-hammer',
    name: 'Lamp-Black Hammer',
    description: 'Raw chakra packed as hard as soot in a chimney, and struck once.',
    discipline: 'ninjutsu',
    effects: [
      { verb: 'damage', power: 20 },
      { verb: 'knock', power: 10, to: 'mid' },
    ],
    chakraCost: 19,
    rank: 'A',
    difficulty: 135,
  },
  {
    id: 'street-of-shut-doors',
    name: 'Street of Shut Doors',
    description:
      'Every door the target tries opens onto the same empty street, and you are not in it.',
    discipline: 'genjutsu',
    effects: [
      { verb: 'confuse', power: 16 },
      { verb: 'conceal', power: 8 },
    ],
    chakraCost: 18,
    rank: 'A',
    difficulty: 135,
  },
  {
    id: 'tile-splitting-cut',
    name: 'Tile-Splitting Cut',
    description: 'One cut, taught on roof tiles: through the first and the second, and the third.',
    discipline: 'kenjutsu',
    needs: { weapon: 'blade' },
    effects: [
      { verb: 'damage', power: 22 },
      { verb: 'break', power: 10 },
    ],
    chakraCost: 17,
    rank: 'A',
    difficulty: 135,
  },
  {
    id: 'seven-knot-seal',
    name: 'Seven-Knot Seal',
    description: 'Seven knots tied in the air, each holding what the last one caught.',
    discipline: 'fuuinjutsu',
    reach: ['mid', 'far'],
    effects: [
      { verb: 'pin', power: 18 },
      { verb: 'seal', power: 14 },
    ],
    chakraCost: 19,
    rank: 'A',
    difficulty: 135,
  },
];
