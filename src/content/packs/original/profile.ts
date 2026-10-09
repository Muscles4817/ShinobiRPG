import type { Discipline } from '@/systems/techniques';

import type { BreakInScene, NindoDef } from '../../types';

/** Techniques every graduate knows, regardless of specialty. */
export const ACADEMY_TECHNIQUES: readonly string[] = ['palm-strike', 'shadow-feint'];

export const DISCIPLINE_STARTERS: Readonly<Record<Discipline, string>> = {
  taijutsu: 'gale-heel',
  ninjutsu: 'pebble-volley',
  genjutsu: 'lantern-mirage',
  kenjutsu: 'lantern-cut',
  fuuinjutsu: 'ember-tag',
};

export const NINDOS: readonly NindoDef[] = [
  {
    id: 'leader',
    name: 'Become Tōrokage',
    essay: 'One day I will light the first lantern of the year, as Tōrokage.',
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
    essay: 'Why don’t the dead rest here? Someone knows. I will find out.',
  },
  {
    id: 'world',
    name: 'See the world',
    essay: 'There is more to the world than one valley of lanterns.',
  },
];

export const BREAK_IN: BreakInScene = {
  intro:
    'The night before graduation, the lanterns along the Academy wall burn low. Somewhere inside ' +
    'is your file, and the grades the instructors have refused to tell anyone.',
  approaches: [
    {
      id: 'roof',
      label: 'Run the lantern wires to the roof',
      stat: 'speed',
      difficulty: 6,
      success: 'You run the wire like a lamplighter and drop through the skylight without a sound.',
      failure: 'A lantern swings loose and smashes in the yard. You freeze. Nobody comes. Yet.',
    },
    {
      id: 'lock',
      label: 'Pick the lock on the records-room shutter',
      stat: 'intellect',
      difficulty: 6,
      success: 'Two pins, a twist, and the shutter lifts without a squeak.',
      failure: 'The pick snaps. You squeeze through the ash chute instead, filthy.',
    },
    {
      id: 'mirage',
      label: 'Walk past the night watch inside a lantern mirage',
      stat: 'genjutsu',
      difficulty: 6,
      success: 'The watchman sees only a drifting lantern-light, and lets it drift past.',
      failure: 'The mirage flickers. The watchman rubs his eyes and decides he needs more sleep.',
    },
  ],
  records:
    'The records room smells of dust and lamp oil. Your file is in the third drawer, thicker than you expected.',
  instructor: 'Instructor Rin',
  caught:
    'A lantern flares in the doorway. "Reading your own file the night before graduation?" ' +
    'Instructor Rin sighs, and almost smiles. "Go home. Be on time tomorrow. And put the drawer back."',
};
