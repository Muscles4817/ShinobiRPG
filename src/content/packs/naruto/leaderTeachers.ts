import type { TeacherProfile } from '../../types';

/** How the clan heads teach: their clans' hiden to their own, and what they ask for it. */

export const HIASHI_TEACHER: TeacherProfile = {
  quirk: 'harsh',
  steers: { focus: 'specialty', freeAtStage: 4 },
  teaches: [
    'gentle-fist',
    'air-palm',
    'sixty-four-palms',
    'eight-trigrams-rotation',
    'hundred-twenty-eight-palms',
    'palm-bottom',
    'one-blow-body',
    'protecting-sixty-four-palms',
    'vacuum-wall-palm',
    'twin-lion-fists',
  ],
  price: { kind: 'bond', minStage: 3, line: '“The Hyūga do not instruct strangers.”' },
};

export const INOICHI_TEACHER: TeacherProfile = {
  quirk: 'patient',
  teaches: ['mind-body-switch', 'mind-destruction', 'mind-clone-switch', 'sensing-water-sphere'],
  price: {
    kind: 'all',
    parts: [
      { kind: 'bond', minStage: 1 },
      {
        kind: 'mission',
        missionId: 'yamanaka-weeding',
        line: '“Help with the flower beds first. A mind is a garden too.”',
      },
    ],
  },
};

export const SHIKAKU_TEACHER: TeacherProfile = {
  quirk: 'natural',
  teaches: [
    'shadow-possession',
    'shadow-neck-bind',
    'shadow-clutch',
    'shadow-gathering',
    'shadow-imitation-shuriken',
    'shadow-sewing',
  ],
  price: {
    kind: 'favour',
    favourId: 'shikaku-shogi',
    ask: 'Shikaku wants a game of shōgi first. He doesn’t care if you win; he cares how you lose.',
  },
};

export const CHOZA_TEACHER: TeacherProfile = {
  quirk: 'patient',
  teaches: [
    'partial-expansion',
    'human-bullet-tank',
    'multi-size',
    'spiked-human-bullet-tank',
    'super-multi-size',
    'butterfly-mode',
    'butterfly-bullet-bombing',
    'ballistic-waterwheel',
    'super-open-hand-slap',
  ],
  price: {
    kind: 'bond',
    minStage: 1,
    line: '“Eat with me once and we’re friends. Then we train.”',
  },
};

export const TSUME_TEACHER: TeacherProfile = {
  quirk: 'harsh',
  steers: { focus: 'specialty', freeAtStage: 3 },
  teaches: [
    'fang-over-fang',
    'passing-fang',
    'four-legs',
    'beast-human-clone',
    'double-headed-wolf',
    'fang-wolf-fang',
    'fang-rotating-fang',
    'three-headed-wolf',
    'tail-chasing-rotating-fang',
  ],
  price: {
    kind: 'all',
    parts: [
      { kind: 'bond', minStage: 2 },
      {
        kind: 'mission',
        missionId: 'border-bandits',
        line: '“Bring me back some bandit scent off the border. Then we’ll see.”',
      },
    ],
  },
};

export const SHIBI_TEACHER: TeacherProfile = {
  quirk: 'patient',
  teaches: [
    'insect-swarm',
    'insect-jar',
    'insect-clone',
    'insect-rope',
    'insect-wall',
    'insect-jamming',
    'bug-bite',
    'insect-sphere',
  ],
  price: { kind: 'bond', minStage: 2 },
};
