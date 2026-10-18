import type { MissionDef } from '@/systems/missions';

import { FERRY_OFFICE, MERCY } from './fordChainStart';

/**
 * The Chain at Kiri Ford, acts three and four: the baron who won't pay his blade, and what the
 * village does with the youth who fought for him. The hearing reads the village's count of
 * mercy you have shown, on this job and others, as your argument.
 */

export const BARONS_BILL: MissionDef = {
  id: 'arc-ford-barons-bill',
  title: 'The Baron’s Bill',
  rank: 'C',
  client: FERRY_OFFICE,
  summary:
    'Oki the timber baron won’t pay a beaten blade. He has hired river pirates to tidy up, and you are on their list.',
  slots: 2,
  energyCost: 30,
  reward: { ryo: 420, reputation: 7 },
  minMissionsCompleted: 4,
  stages: [
    {
      kind: 'narrative',
      text: 'Before dawn the ferry office door bangs open. Oki has hired pirates off the river to clear the landing for good: the ferrymen, the beaten blade, and you.',
      variants: [
        {
          when: { remembers: 'ford-rogue-spared' },
          text: 'Before dawn Ren hammers on the ferry office door, soaked from the river. “Oki won’t pay a beaten blade,” he says. “He’s sent pirates to finish Ushio. And you.”',
        },
        {
          when: { remembers: 'ford-rogue-bound' },
          text: 'Before dawn a ferryman runs in: pirates are rowing for the lock-up boat where Ushio and Ren wait for the Watch. Oki doesn’t leave loose ends, or witnesses.',
        },
      ],
    },
    {
      when: { remembers: 'ford-rogue-spared' },
      kind: 'decision',
      text: 'Ushio limps in behind Ren, blade strapped on. “He hired me,” he says. “Let me be there when he finds out what that bought him.”',
      options: [
        {
          label: 'Fight beside him',
          tone: 'earnest',
          reply: 'Ushio nods once, as if you’d agreed on a price.',
          effects: [{ kind: 'mark', mark: 'ushio-along' }],
          ledger: 'Fought beside the blade you beat.',
        },
        {
          label: 'Tell him to get Ren clear and stay out of it',
          tone: 'kind',
          reply: 'For the first time, Ushio looks unsure. Ren takes his arm, and they go.',
          ledger: 'Sent Ushio and Ren clear of the fight.',
        },
      ],
    },
    {
      kind: 'encounter',
      template: 'bandit-camp',
      job: 'eliminate',
      text: 'Three boats nose into the landing under the chain, hooks and bows ready.',
      enemyIds: ['bandit-chief', 'river-pirate', 'bandit-archer'],
      canFlee: false,
      flavour: {
        terrain: 'The landing, the chain overhead, the boats pulled up on the mud.',
      },
    },
    {
      kind: 'decision',
      text: 'When it is over Oki himself is found hiding in his own toll box, clutching the chain’s key.',
      options: [
        {
          label: 'Hand him to the ferry office for the daimyō’s magistrate',
          tone: 'earnest',
          reply: 'The ferrymen take him with great ceremony and very little gentleness.',
          effects: [{ kind: 'world', mark: 'ford-oki-tried' }],
          ledger: 'Handed the baron to the magistrate.',
        },
        {
          label: 'Let the ferrymen give him a dunking under his chain first',
          tone: 'joke',
          reply: 'He comes up spluttering three times. The whole landing cheers each one.',
          effects: [
            { kind: 'world', mark: 'ford-oki-tried' },
            { kind: 'bond', by: 1 },
          ],
          ledger: 'Let the ferrymen dunk the baron before the magistrate had him.',
        },
      ],
    },
    {
      kind: 'ending',
      endings: [
        {
          when: { has: 'ushio-along' },
          text: 'Ushio held the landing steps alone while the boats came in, as if he had always meant to. He took the hook meant for Ren. He is buried on the bluff, the chain cut and coiled over him.',
          effects: [
            { kind: 'world', mark: 'ford-chain-cut' },
            { kind: 'world', mark: 'ford-ushio-fell' },
            { kind: 'memory', text: 'Ushio holding the landing steps' },
          ],
          ledger: 'Cut the chain. Ushio fell holding the steps.',
        },
        {
          text: 'The ferrymen cut the chain themselves, all of them on the rope at once, and throw it in the river.',
          effects: [
            { kind: 'world', mark: 'ford-chain-cut' },
            { kind: 'memory', text: 'the morning the chain went in the river' },
          ],
          ledger: 'The chain at Kiri Ford is cut.',
        },
      ],
    },
  ],
};

export const REN_HEARING: MissionDef = {
  id: 'arc-ford-ren-hearing',
  title: 'What Becomes of Ren',
  rank: 'D',
  client: FERRY_OFFICE,
  summary:
    'Ren fought shinobi of the village for a missing-nin. Take him to Tōrōgakure, where the Watch will decide what he is owed.',
  slots: 1,
  energyCost: 15,
  reward: { ryo: 200, reputation: 5 },
  minMissionsCompleted: 4,
  endsAt: 'torogakure',
  stages: [
    {
      kind: 'leg',
      text: 'Up the river road to the village, Ren walking beside you without a rope.',
      variants: [
        {
          when: { remembers: 'ford-ushio-fell' },
          text: 'Up the river road to the village, Ren carrying Ushio’s blade in its cloth and not letting anyone else touch it.',
        },
      ],
      days: 1,
      region: 'river-road',
    },
    {
      kind: 'decision',
      text: 'In the Watch house Suzu of the Night Watch reads the ferry office’s letter twice. “He threw needles at the village’s shinobi for a missing-nin,” she says. “Tell me why he isn’t going to the border forts.”',
      options: [
        {
          when: { tally: MERCY, atLeast: 2 },
          label: 'Remind her of the others you have spared, and how they turned out',
          tone: 'earnest',
          reply:
            'Suzu hears you out, and then, surprisingly, smiles. “You do keep doing this,” she says. “And it keeps working. He trains with the Watch. On your word.”',
          effects: [
            { kind: 'world', mark: 'ren-with-the-watch' },
            { kind: 'mark', mark: 'ren-stays' },
          ],
          ledger: 'Spoke for Ren on the strength of the mercy you’ve shown before.',
        },
        {
          label: 'Tell her he had nobody else, and chose the one who saved him',
          tone: 'kind',
          reply:
            '“So do half the people I hang,” Suzu says, not unkindly. “The forts, then. Their kitchens, not their cells. That much I’ll give you.”',
          effects: [{ kind: 'world', mark: 'ren-to-the-forts' }],
          ledger: 'Spoke for Ren, and got him the forts’ kitchens, not their cells.',
        },
        {
          label: 'Leave it to the Watch',
          tone: 'quiet',
          reply: 'Suzu nods, and writes. Ren doesn’t look at you as they take him out.',
          effects: [{ kind: 'world', mark: 'ren-to-the-forts' }],
          ledger: 'Left Ren to the Watch.',
        },
      ],
    },
    {
      kind: 'ending',
      endings: [
        {
          when: { all: [{ has: 'ren-stays' }, { remembers: 'ford-ushio-fell' }] },
          text: 'Ren asks for one thing before he goes in: that Ushio’s blade hangs in the Watch house where he can see it. Suzu lets it.',
          effects: [{ kind: 'world', mark: 'ford-arc-done' }],
          ledger: 'Ren stays in the village, under the Watch.',
        },
        {
          when: { has: 'ren-stays' },
          text: 'Ren stands in the Watch house door, looking out at the lanterns as if he has never seen so many. He hasn’t.',
          effects: [{ kind: 'world', mark: 'ford-arc-done' }],
          ledger: 'Ren stays in the village, under the Watch.',
        },
        {
          text: 'They take Ren north with the next supply cart. He sits at the back, looking south, towards the river.',
          effects: [{ kind: 'world', mark: 'ford-arc-done' }],
          ledger: 'Ren went to the border forts.',
        },
      ],
    },
  ],
};
