import type { MissionDef } from '@/systems/missions';

/**
 * Work at the bridge site: Tazuna can't pay much, and the tycoon’s men make sure of it. Short
 * civilian jobs for a shinobi staying in the town.
 */
export const WAVES_JOBS: readonly MissionDef[] = [
  {
    id: 'waves-bridge-night-watch',
    title: 'Night Watch on the Bridge',
    rank: 'D',
    client: 'Tazuna, bridge builder',
    summary: 'Someone has been cutting the scaffold ropes at night. Sit up with the tools.',
    slots: 2,
    energyCost: 20,
    reward: { ryo: 70, reputation: 2 },
    minMissionsCompleted: 0,
    stages: [
      {
        kind: 'narrative',
        text: 'The builders go home at dusk. The scaffolds creak, and the tide slaps at the pylons.',
      },
      {
        kind: 'check',
        text: 'Past midnight, a boat with its oars wrapped in rags slides in under the scaffold.',
        approaches: [
          { label: 'Stay awake and keep watching', stat: 'willpower', difficulty: 8 },
          { label: 'Listen for the oars over the water', stat: 'perception', difficulty: 8 },
        ],
        success:
          'You drop a kunai into the hull beside the man with the knife. He rows away faster than he came.',
        failure: 'You wake to a splash. Two ropes are cut, and the builders lose a morning.',
        onFailure: 'penalty',
        failureDamage: 2,
      },
    ],
  },
  {
    id: 'waves-market-shakedown',
    title: 'The Tycoon’s Collection',
    rank: 'D',
    client: 'The fish stall',
    summary:
      'Two of the tycoon’s hired men come round the market every week. Make them think twice.',
    slots: 2,
    energyCost: 25,
    reward: { ryo: 60, reputation: 3 },
    minMissionsCompleted: 1,
    stages: [
      {
        kind: 'narrative',
        text: 'The men walk the market as if they own it, which, on paper, they do.',
      },
      {
        kind: 'check',
        text: 'One of them kicks over a basket of clams, and the stallholder doesn’t even look up.',
        approaches: [
          { label: 'Step between them and stare', stat: 'willpower', difficulty: 9 },
          { label: 'Pin his sleeve to the post with a kunai', stat: 'speed', difficulty: 9 },
        ],
        success: 'They leave without the week’s money. The market is very quiet, then very loud.',
        failure:
          'They laugh and take the money anyway. One shoves you into the clams on the way out.',
        onFailure: 'penalty',
        failureDamage: 3,
      },
    ],
  },
  {
    id: 'waves-inari-ran-off',
    title: 'Inari Ran Off',
    rank: 'D',
    client: 'Tsunami',
    summary: 'Inari didn’t come home from the jetty. Tsunami is trying not to look worried.',
    slots: 2,
    energyCost: 20,
    reward: { ryo: 50, reputation: 2 },
    minMissionsCompleted: 0,
    stages: [
      {
        kind: 'check',
        text: 'The jetty is empty. A fisherman’s hat floats in the reeds further along the shore.',
        approaches: [
          { label: 'Follow the small footprints in the mud', stat: 'perception', difficulty: 8 },
          { label: 'Run the shoreline before dark', stat: 'speed', difficulty: 8 },
        ],
        success:
          'He is sitting on a rock where Kaiza used to tie up his boat, crying where no one can see. You sit with him a while.',
        failure:
          'You find him after dark, cold through and furious at being found. He won’t speak to you for a day.',
        onFailure: 'penalty',
        failureDamage: 1,
      },
    ],
  },
];
