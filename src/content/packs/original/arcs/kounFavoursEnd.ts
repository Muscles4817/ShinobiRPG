import type { MissionDef } from '@/systems/missions';

import { KOUN, KOUN_GRACE } from './kounFavoursStart';

/**
 * Kōun's Three Favours, the heist and the hidden third: a sword taken back from a moneylender's
 * strongroom with a crew you pick (whose loyalty is rolled when the job begins, and surfaces on
 * the way out), and the favour he held back, at the bridge where his comrade died. A letter
 * found only by looking closely at the sword, and the graces counted on the way, open the
 * kinder endings at the bridge.
 */

export const KOUN_LETTER = 'koun-letter';

export const STRONGROOM_SWORD: MissionDef = {
  id: 'arc-koun-strongroom',
  title: 'The Sword in the Strongroom',
  rank: 'C',
  client: KOUN,
  summary:
    'In a lean year the village sold Kōun’s sword to a moneylender in Kiri Ford. He wants it back, and not by asking.',
  slots: 1,
  energyCost: 30,
  reward: { ryo: 460, reputation: 5 },
  minMissionsCompleted: 5,
  twists: [
    { mark: 'helper-sells', weight: 1 },
    { mark: 'helper-true', weight: 2 },
  ],
  stages: [
    { kind: 'leg', text: 'Down the river road to Kiri Ford.', days: 1, region: 'river-road' },
    {
      kind: 'decision',
      text: 'The moneylender Hayase keeps a strongroom on the water, guarded day and night. You will need someone who knows the ford.',
      options: [
        {
          label: 'Brother Ino at the Low Water, who knows Hayase’s locks',
          tone: 'curious',
          reply: '“I made half of them,” Ino says. “He never paid for the other half.”',
          effects: [{ kind: 'mark', mark: 'crewed' }],
          ledger: 'Brought in Brother Ino, who knows the locks.',
        },
        {
          label: 'Tobei the pilot, who can row you in under the water-gate',
          tone: 'challenge',
          reply: '“At night? Under Hayase’s nose?” Tobei grins. “Done.”',
          effects: [{ kind: 'mark', mark: 'crewed' }],
          ledger: 'Brought in Tobei, to row you under the water-gate.',
        },
        {
          label: 'Go in alone',
          tone: 'quiet',
          reply: 'Fewer people, fewer mouths.',
          ledger: 'Went in alone.',
        },
      ],
    },
    {
      kind: 'encounter',
      template: 'guarded-building',
      job: 'retrieve',
      text: 'Hayase’s strongroom squats on stilts over the shallows, lamplit, two guards on the walk.',
      enemyIds: ['bandit-thug', 'bandit-archer'],
      canFlee: true,
    },
    {
      kind: 'check',
      text: 'The sword hangs among pawned things, its scabbard cracked. Something is wound tight around the hilt under the old binding.',
      approaches: [
        {
          label: 'Unwind the binding carefully',
          stat: 'perception',
          difficulty: 8,
          onSuccess: {
            effects: [{ kind: 'world', mark: KOUN_LETTER }],
            ledger: 'Found a letter folded into the sword’s hilt, never delivered.',
          },
        },
      ],
      success:
        'A letter, folded small, the ink faded brown. It is addressed to Kōun, in a hand that isn’t his.',
      failure: 'There’s no time. Lamps are moving on the walk outside.',
      onFailure: 'forward',
    },
    {
      when: { all: [{ has: 'crewed' }, { has: 'helper-sells' }] },
      kind: 'decision',
      text: 'At the landing your helper has the sword under their coat and a buyer waiting in a boat. “It’s worth a year’s wages,” they say. “He’d never know.”',
      options: [
        {
          label: 'Take it back, and let them go',
          tone: 'kind',
          reply: 'They hand it over, ashamed, and the buyer rows away empty.',
          effects: [{ kind: 'tally', tally: KOUN_GRACE, by: 1 }],
          ledger: 'Took the sword back from a crew that sold you out, and let them go.',
        },
        {
          label: 'Take it back, and hand them to the ferry office',
          tone: 'cruel',
          reply: 'They don’t look at you as the ferrymen lead them off.',
          ledger: 'Handed the crew that sold you out to the ferry office.',
        },
      ],
    },
    {
      when: { all: [{ has: 'crewed' }, { has: 'helper-true' }] },
      kind: 'decision',
      text: 'On the landing your helper hands you the sword and grins. They haven’t asked for anything.',
      options: [
        {
          label: 'Split what Kōun pays with them',
          tone: 'kind',
          reply: 'They try to refuse, and fail.',
          effects: [
            { kind: 'pay', share: -0.25 },
            { kind: 'tally', tally: KOUN_GRACE, by: 1 },
          ],
          ledger: 'Split the pay with the crew.',
        },
        {
          label: 'Thank them and go',
          tone: 'quiet',
          reply: 'They wave you off from the landing.',
        },
      ],
    },
    {
      kind: 'ending',
      endings: [
        {
          text: 'You wrap the sword for the road. When you put it in Kōun’s hands he holds it a long time, as if it were heavier than it looks.',
          effects: [{ kind: 'memory', text: 'the night at Hayase’s strongroom' }],
        },
      ],
    },
    { kind: 'leg', text: 'Back up the river road, the sword wrapped in your bedroll.', days: 1 },
  ],
};
