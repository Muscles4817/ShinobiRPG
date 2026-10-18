import type { ArcDef, MissionDef } from '@/systems/missions';

import { GHOST_NIGHT, OHARUS_CASK, SECOND_WELL } from './brewerGhostEnd';
import { GRAVEDIGGER, OLD_HANDS } from './brewerGhostLeads';
import { OLD_WELL, SOUR_VATS } from './brewerGhostStart';

/**
 * The Brewer's Ghost: the client wants a ghost gone quickly and quietly, because the ghost is
 * the wife he drowned. Three leads open at once, one of them the wrong man he points you at;
 * the clues you find (a village tally) decide whether you can call her by name on the night;
 * and whichever way it ends comes back later as a job of its own.
 */

export const BREWER_GHOST_JOBS: readonly MissionDef[] = [
  SOUR_VATS,
  OLD_WELL,
  OLD_HANDS,
  GRAVEDIGGER,
  GHOST_NIGHT,
];

/** Jobs posted later, from how it ended: not part of the arc, posted from time to time. */
export const BREWER_AFTER_JOBS: readonly MissionDef[] = [SECOND_WELL, OHARUS_CASK];

export const BREWER_GHOST: ArcDef = {
  id: 'the-brewers-ghost',
  title: 'The Brewer’s Ghost',
  summary: 'Something cold walks the Mori brewery at night, souring the vats.',
  acts: [
    {
      beats: ['you', 'need'],
      title: 'Sour vats',
      text: 'The sake brewer Gensai Mori wants a ghost out of his cellar, quickly and without fuss.',
      jobs: [SOUR_VATS.id],
    },
    {
      beats: ['go', 'search'],
      title: 'Who she was',
      text: 'The ghost was somebody. Open the old well, find the woman who brewed beside her, and see the gravedigger Gensai blames.',
      jobs: [OLD_WELL.id, OLD_HANDS.id, GRAVEDIGGER.id],
      pass: 'any',
    },
    {
      beats: ['find', 'take', 'return', 'change'],
      title: 'The night of the ghost',
      text: 'Gensai wants it over by the month’s end. Whatever you know by then is what you’ll have.',
      jobs: [GHOST_NIGHT.id],
    },
  ],
};
