import type { EncounterTemplate } from '@/systems/missions';

/**
 * The encounter the exam's survival forest is built on: another team of genin, out for the same
 * prize as you. They are wary (everyone in the forest is), and they would listen to a truce, a
 * trade or a threat, being as tired and scared as you are.
 */
export const EXAM_ENCOUNTERS: readonly EncounterTemplate[] = [
  {
    id: 'rival-team',
    name: 'Rival team',
    approaches: [
      'head-on',
      'ambush',
      'sneak',
      'talk',
      'bribe',
      'intimidate',
      'set-ground',
      'withdraw',
    ],
    recon: [
      { id: 'observe', label: 'Watch them from the branches', difficulty: 9 },
      { id: 'track', label: 'Read where they have been', difficulty: 8 },
      { id: 'sense', label: 'Feel for their chakra', difficulty: 9 },
    ],
    alertness: 'wary',
    talkable: true,
    resolve: 10,
    flavour: {
      terrain:
        'A clearing under the canopy, one stream to drink from and a dozen trees to hide in.',
      noticed: 'A twig snaps under your foot. Three heads turn at once.',
      slipped: 'You slip from branch to branch above them and lift what you came for.',
      caught: '“There! In the trees!” Kunai come up in three hands.',
      parley: 'A long look between their leader and yours, then they back off into the green.',
      ambush: 'You drop out of the canopy on top of them.',
      spotted: 'They were in the branches above you all along. Kunai first, questions never.',
    },
  },
];
