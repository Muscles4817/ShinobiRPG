import type { ExerciseDef } from '../exercises';

/** The two control exercises every shinobi hears about: up a tree, and across the water. */
export const EXERCISES: readonly ExerciseDef[] = [
  {
    id: 'tree-walking',
    name: 'Tree-Walking',
    description:
      'Walk up a tree trunk on chakra held in the soles of your feet. Too little and you slip; too much and the bark bursts.',
    minControl: 'D',
    progressPerSession: 18,
    energyCost: 20,
    startedBy: 'sensei',
    walk: 'trees',
    limitBonus: { chakraControl: 2 },
    lines: {
      start:
        'Your sensei walks up the nearest tree as if it were a path, sits on a branch and drops three kunai at your feet. “Mark how high you get. Then beat it.”',
      practice: [
        'Three running steps up the trunk, a crack of bark, and you are on your back looking at the sky. The kunai mark is a little higher than yesterday’s.',
        'You reach the first branch before your feet lose their grip. You scratch a new mark, well above the old ones.',
        'You walk up slowly, every step even, and only slip within reach of the top. The tree is covered in your marks.',
      ],
      fall: 'Your foot pushes too hard, the bark explodes, and you come down the hard way.',
      mastered:
        'You walk up the trunk, along the branch, and stand there upside down underneath it, because you can.',
    },
  },
  {
    id: 'water-walking',
    name: 'Water-Walking',
    description:
      'Stand on water with chakra that never stops changing: the surface moves, so your feet must too.',
    minControl: 'C',
    progressPerSession: 14,
    energyCost: 25,
    walk: 'water',
    limitBonus: { chakraControl: 3 },
    lines: {
      practice: [
        'You stand for a heartbeat, then a wave rolls under you and you are swimming, again.',
        'You manage a dozen steps before the spray catches you off guard.',
        'You walk out past the end of the stone, and the water holds. Mostly.',
      ],
      fall: 'The water stops holding you all at once. You come up spitting salt.',
      mastered:
        'You walk out over the water until the shore is small behind you, and the sea lets you.',
    },
  },
];
