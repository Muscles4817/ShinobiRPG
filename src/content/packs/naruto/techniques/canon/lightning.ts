import type { TechniqueDef } from '@/systems/techniques';

/**
 * Canon lightning ninjutsu: Raiga's (on the Archives' shelves, the sword ones needing a blade)
 * and Kakashi's Lightning Transmission, which he teaches.
 */
export const CANON_LIGHTNING: readonly TechniqueDef[] = [
  {
    id: 'fangs-of-lightning',
    name: 'Fangs of Lightning',
    description: 'Two swords crossed overhead call lightning down wherever you want it.',
    discipline: 'kenjutsu',
    element: 'lightning',
    reach: ['mid', 'far'],
    needs: { weapon: 'blade', nature: 'lightning' },
    effects: [
      { verb: 'area', power: 18, size: 'wide' },
      { verb: 'daze', power: 6 },
    ],
    chakraCost: 17,
    rank: 'B',
    difficulty: 115,
  },
  {
    id: 'banquet-of-lightning',
    name: 'Lightning Burial: Banquet of Lightning',
    description: 'Thunderbolts that cut through the ground and the air towards the target.',
    discipline: 'ninjutsu',
    element: 'lightning',
    accuracy: 'sure',
    needs: { nature: 'lightning' },
    effects: [
      { verb: 'damage', power: 20 },
      { verb: 'daze', power: 6 },
    ],
    chakraCost: 16,
    rank: 'B',
    difficulty: 110,
  },
  {
    id: 'lightning-dragon-tornado',
    name: 'Lightning Dragon Tornado',
    description: 'You spin with your swords inside a vortex of lightning that rears like a dragon.',
    discipline: 'kenjutsu',
    element: 'lightning',
    needs: { weapon: 'blade', nature: 'lightning' },
    effects: [
      { verb: 'area', power: 20, size: 'wide' },
      { verb: 'knock', power: 8, to: 'mid' },
    ],
    chakraCost: 18,
    rank: 'B',
    difficulty: 115,
  },
  {
    id: 'lightning-strike-armour',
    name: 'Lightning Strike Armour',
    description: 'A shell of lightning that quickens you and shocks whoever touches it.',
    discipline: 'ninjutsu',
    element: 'lightning',
    needs: { nature: 'lightning' },
    effects: [
      { verb: 'shroud', power: 10, kind: 'lightning' },
      { verb: 'counter', power: 10 },
    ],
    chakraCost: 16,
    rank: 'B',
    difficulty: 110,
  },
  {
    id: 'rock-avalanche',
    name: 'Rock Avalanche',
    description: 'Lightning driven into a cliff face brings the rocks down on everyone below.',
    discipline: 'ninjutsu',
    element: 'lightning',
    effects: [
      { verb: 'area', power: 14, size: 'wide' },
      { verb: 'pin', power: 8 },
    ],
    chakraCost: 13,
    rank: 'C',
    difficulty: 80,
  },
  {
    id: 'lightning-transmission',
    name: 'Lightning Transmission',
    description:
      'You and a clone each hold a Lightning Blade, and a cord of lightning between cuts.',
    discipline: 'ninjutsu',
    element: 'lightning',
    reach: ['close', 'mid'],
    needs: { nature: 'lightning', minReserves: 14 },
    effects: [
      { verb: 'clone', power: 6 },
      { verb: 'area', power: 22 },
    ],
    chakraCost: 22,
    rank: 'A',
    difficulty: 140,
  },
];
