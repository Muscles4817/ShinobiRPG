import type { Discipline } from '@/systems/techniques';

import type { BreakInScene, NindoDef } from '../../types';

/** Techniques every academy graduate knows. */
export const ACADEMY_TECHNIQUES: readonly string[] = ['shuriken-jutsu', 'clone-jutsu'];

export const DISCIPLINE_STARTERS: Readonly<Record<Discipline, string>> = {
  taijutsu: 'leaf-whirlwind',
  ninjutsu: 'phoenix-flower',
  genjutsu: 'hell-viewing',
  kenjutsu: 'iaido-draw',
  fuuinjutsu: 'explosive-tag',
};

export const NINDOS: readonly NindoDef[] = [
  {
    id: 'leader',
    name: 'Become Hokage',
    essay: 'One day the whole village will look up at my face on that rock.',
  },
  {
    id: 'clan',
    name: 'Restore my clan',
    essay: 'My family’s name will mean something again. I will make sure of it.',
  },
  {
    id: 'protect',
    name: 'Protect my friends',
    essay: 'Nobody I care about gets left behind. Not ever.',
  },
  {
    id: 'strongest',
    name: 'Become the strongest',
    essay: 'I will fight everyone worth fighting, and I will win.',
  },
  {
    id: 'truth',
    name: 'Uncover the truth',
    essay: 'This village keeps secrets. I want to know all of them.',
  },
  {
    id: 'world',
    name: 'See the world',
    essay: 'There are five great nations and I have seen one village.',
  },
];

export const BREAK_IN: BreakInScene = {
  intro:
    'The night before graduation, the Academy is dark. Somewhere inside is your file, and the ' +
    'grades the instructors have refused to tell anyone.',
  approaches: [
    {
      id: 'roof',
      label: 'Climb to the roof and drop through a window',
      stat: 'speed',
      difficulty: 6,
      success: 'You are up the wall and through the window before the moon clears a cloud.',
      failure:
        'A tile slides out from under your foot and shatters in the yard. You freeze. Nobody comes. Yet.',
    },
    {
      id: 'lock',
      label: 'Pick the lock on the back door',
      stat: 'intellect',
      difficulty: 6,
      success: 'Two pins, a twist, and the door swings open without a sound.',
      failure: 'The pick snaps in the lock. You squeeze through the coal hatch instead, filthy.',
    },
    {
      id: 'transform',
      label: 'Transform into a cat and slip past the night guard',
      stat: 'genjutsu',
      difficulty: 6,
      success: 'The guard scratches your ears and lets you in. Undignified, but effective.',
      failure:
        'Your transformation leaves you with a human nose. The guard squints, shrugs, and lets you pass.',
    },
  ],
  records:
    'The records room smells of dust and ink. Your file is in the third drawer, thicker than you expected.',
  instructor: 'Iruka-sensei',
  caught:
    'A lamp flares in the doorway. "Reading your own file the night before graduation?" Iruka-sensei ' +
    'sighs, and almost smiles. "Go home. Be on time tomorrow. And put the drawer back."',
};
