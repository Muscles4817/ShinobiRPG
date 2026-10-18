import type { ArcDef, MissionDef } from '@/systems/missions';

import { BARONS_BILL, REN_HEARING } from './fordChainEnd';
import { PILOT_HOME, REED_BLADE } from './fordChainStart';

/**
 * The Chain at Kiri Ford: a job posted below its rank because the ferrymen couldn't pay for the
 * truth; a hired blade and the ward who serves him by choice; a baron who betrays his own
 * blade; and a hearing where the mercy you've shown before is your argument. Its middle acts
 * are lived in Kiri Ford.
 */

export const FORD_CHAIN_JOBS: readonly MissionDef[] = [
  PILOT_HOME,
  REED_BLADE,
  BARONS_BILL,
  REN_HEARING,
];

/** The jobs posted at the ferry office: the acts based in the ford. */
export const FORD_CHAIN_FORD_JOBS = [REED_BLADE.id, BARONS_BILL.id, REN_HEARING.id];

export const FORD_CHAIN: ArcDef = {
  id: 'the-chain-at-kiri-ford',
  title: 'The Chain at Kiri Ford',
  summary: 'A ferry pilot wants seeing home past some bullies at the river crossing.',
  acts: [
    {
      beats: ['you', 'need'],
      title: 'A simple job',
      text: 'Tobei the ferry pilot has posted a cheap job at the hall: see him home to Kiri Ford.',
      jobs: [PILOT_HOME.id],
    },
    {
      beats: ['go', 'search'],
      title: 'The blade on the bluff',
      text: 'A missing-nin keeps the timber baron’s chain across the landing, and a youth keeps him.',
      jobs: [REED_BLADE.id],
      baseLocationId: 'kiri-ford',
    },
    {
      beats: ['find', 'take'],
      title: 'The baron’s bill',
      text: 'The baron who hired the blade doesn’t pay for losing. He sends pirates instead.',
      jobs: [BARONS_BILL.id],
      baseLocationId: 'kiri-ford',
    },
    {
      beats: ['return', 'change'],
      title: 'What becomes of Ren',
      text: 'Take Ren to the village, and speak for him if you will.',
      jobs: [REN_HEARING.id],
      baseLocationId: 'kiri-ford',
    },
  ],
};
