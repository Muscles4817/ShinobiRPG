import type { MissionDef } from '@/systems/missions';

import { KIRI_REGIME_JOBS } from './regimeJobs';
import { KIRI_RESCUE_JOBS } from './rescues';

/**
 * The Broker's Shed: work in the harbour ward that the village won't post and a foreigner can
 * take. The small jobs are the harbour's own; the larger ones are the Bloody Mist's.
 */
const HARBOUR_JOBS: readonly MissionDef[] = [
  {
    id: 'kiri-fog-lantern',
    title: 'Lantern in the Fog',
    rank: 'D',
    client: 'The harbour pilots',
    summary:
      'The fog has come in thick and three boats are still out. Stand the night at the light.',
    slots: 2,
    energyCost: 20,
    reward: { ryo: 90, reputation: 2 },
    minMissionsCompleted: 0,
    stages: [
      {
        kind: 'narrative',
        text: 'The harbour light is a lantern on a pole at the end of the breakwater. The fog swallows it a few paces out.',
      },
      {
        kind: 'check',
        text: 'Somewhere out on the water, a boat’s bell rings, and rings again, further from the harbour mouth.',
        approaches: [
          {
            label: 'Follow the bell by ear and swing the light to it',
            stat: 'perception',
            difficulty: 9,
          },
          {
            label: 'Walk out on the water with the lantern',
            stat: 'chakraControl',
            difficulty: 10,
          },
        ],
        success:
          'The boat comes in on your light with a hold full of mackerel. The pilot gives you the pick of it.',
        failure:
          'The boat finds the rocks before it finds the harbour. Its crew wade in, cursing the fog and you.',
        onFailure: 'penalty',
        failureDamage: 2,
      },
    ],
  },
  {
    id: 'kiri-auction-thumb',
    title: 'A Thumb on the Scales',
    rank: 'D',
    client: 'Ryūgo, auctioneer',
    summary:
      'Somebody at the dawn auction is short-weighting every catch. Ryūgo wants to know who.',
    slots: 2,
    energyCost: 15,
    reward: { ryo: 80, reputation: 2 },
    minMissionsCompleted: 0,
    stages: [
      {
        kind: 'check',
        text: 'Hands flick bids through the fog, crates thump onto the scales, and nobody looks at anybody else.',
        approaches: [
          { label: 'Watch the scales, not the bidders', stat: 'perception', difficulty: 9 },
          { label: 'Tally the weights against the catch', stat: 'intellect', difficulty: 9 },
        ],
        success:
          'The weigh-master keeps a lead plug in his sleeve. Ryūgo hands him to the fishermen, who are less polite than the patrol.',
        failure:
          'The weigh-master sees you watching, and the scales are honest for the rest of the week.',
        onFailure: 'penalty',
        failureDamage: 1,
      },
    ],
  },
  {
    id: 'kiri-graduation',
    title: 'The Last Exam',
    rank: 'C',
    client: 'Ryūgo, auctioneer',
    summary:
      'The academy’s final exam is a fight to the death between classmates. Ryūgo’s son sits it in three days.',
    slots: 3,
    energyCost: 25,
    reward: { ryo: 320, reputation: 6 },
    minMissionsCompleted: 6,
    once: true,
    stages: [
      {
        kind: 'narrative',
        text: 'Ryūgo’s boy Kai is thirteen. He practises with a wooden kunai behind the auction sheds. He has already chosen who he will fight. The boy he chose is his best friend.',
      },
      {
        kind: 'decision',
        text: 'Ryūgo can’t ask you to break the village’s law. He asks you what he should do.',
        options: [
          {
            label: '“Get him on a boat before the exam.”',
            tone: 'earnest',
            reply: 'Ryūgo nods slowly. “Then he needs a boat nobody checks.”',
            effects: [{ kind: 'mark', mark: 'flight' }],
            ledger: 'Told Ryūgo to get his son away.',
          },
          {
            label: '“Teach him to survive it.”',
            tone: 'challenge',
            reply: 'Ryūgo looks at his hands for a long time. “Then teach him. I can’t.”',
            ledger: 'Agreed to teach the boy to survive the exam.',
          },
        ],
      },
      {
        kind: 'check',
        when: { has: 'flight' },
        text: 'A smuggler’s skiff leaves from the shingle at the turn of the tide. The patrol walks the cliff path above it.',
        approaches: [
          {
            label: 'Time the patrol and slip him down the cliff',
            stat: 'perception',
            difficulty: 11,
          },
          { label: 'Talk the smuggler into leaving early', stat: 'willpower', difficulty: 11 },
        ],
        success:
          'The skiff pulls away into the fog with Kai curled up in the bow. Ryūgo doesn’t wave in case someone sees.',
        failure:
          'The patrol’s lantern swings your way and the smuggler casts off without him. Kai sits the exam after all. He lives, and doesn’t speak about it.',
        onFailure: 'forward',
      },
      {
        kind: 'check',
        when: { lacks: 'flight' },
        text: 'Three days on the sea cliffs, teaching a boy who doesn’t want to win how not to lose.',
        approaches: [
          {
            label: 'Drill him in the blind fog until he hears a blow coming',
            stat: 'perception',
            difficulty: 11,
          },
          {
            label: 'Teach him to end a fight without ending a life',
            stat: 'taijutsu',
            difficulty: 11,
          },
        ],
        success:
          'Kai and his friend both walk out of the arena. Nobody in the stands can say quite how. The proctor marks them both as passed and looks the other way.',
        failure:
          'Kai walks out of the arena and his friend doesn’t. He comes to thank you, and can’t finish the sentence.',
        onFailure: 'forward',
      },
      {
        kind: 'ending',
        endings: [
          {
            text: 'Ryūgo sends a whole tuna to the Fog Lantern and won’t say what it’s for.',
            effects: [{ kind: 'memory', text: 'the boy who sat the last exam' }],
          },
        ],
      },
    ],
  },
];

export const KIRI_JOBS: readonly MissionDef[] = [
  ...HARBOUR_JOBS,
  ...KIRI_RESCUE_JOBS,
  ...KIRI_REGIME_JOBS,
];
