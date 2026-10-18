import type { MissionDef } from '@/systems/missions';

/**
 * Kōun's Three Favours, acts one and two: the Ash Lantern asks three favours and names two,
 * and the first is a comedy. The small graces you show along the way are counted (a village
 * tally); the third favour, when it comes, reads them.
 */

export const KOUN = 'Kōun, the Ash Lantern';
/** Small graces shown on Kōun's favours: he notices, and so does the bridge. */
export const KOUN_GRACE = 'koun-grace';

export const ASH_LANTERNS_BARGAIN: MissionDef = {
  id: 'arc-koun-bargain',
  title: 'The Ash Lantern’s Bargain',
  rank: 'D',
  client: KOUN,
  summary: 'Kōun, who held the east bridge alone in the last war, has asked for you by name.',
  slots: 1,
  energyCost: 10,
  reward: { ryo: 60, reputation: 4 },
  minMissionsCompleted: 5,
  stages: [
    {
      kind: 'narrative',
      text: 'Kōun is sweeping the training ground at dawn, as he always is. He hands you the second broom without a word, and you sweep until the sun clears the wall.',
    },
    {
      kind: 'decision',
      text: '“Three favours,” he says, leaning on the broom. “I’ll tell you two now. The third, when the two are done. Do them, and I will speak for you where it matters.”',
      options: [
        {
          label: 'Agree without asking more',
          tone: 'earnest',
          reply: '“Good,” he says. “Don’t be so quick next time.”',
          ledger: 'Agreed to Kōun’s three favours.',
        },
        {
          label: 'Ask what the third favour is',
          tone: 'curious',
          reply: '“Something I couldn’t do myself,” he says. “That’s all favours are.”',
          ledger: 'Asked about the third favour. Kōun wouldn’t say.',
        },
        {
          label: 'Ask what it will cost you',
          tone: 'challenge',
          reply: '“Sensible,” Kōun says, and smiles for the first time. “Less than it cost me.”',
          ledger: 'Asked the price before agreeing.',
        },
      ],
    },
    {
      kind: 'ending',
      endings: [
        {
          text: 'The first: dance at a wedding he promised fifty years ago to dance at. The second: bring home a sword he lost. “Either order,” he says, and goes back to his sweeping.',
        },
      ],
    },
  ],
};

export const WEDDING_DANCE: MissionDef = {
  id: 'arc-koun-wedding',
  title: 'A Dance Owed',
  rank: 'D',
  client: KOUN,
  summary:
    'Kōun swore to dance at his old comrade Bunta’s grandson’s wedding. He has asked you to dance in his place.',
  slots: 2,
  energyCost: 20,
  reward: { ryo: 100, reputation: 3 },
  minMissionsCompleted: 5,
  stages: [
    {
      kind: 'narrative',
      text: 'The wedding fills a whole lane of the lower town. Old Bunta sits at the head of it, arms folded, glaring at the gate Kōun didn’t come through.',
    },
    {
      kind: 'check',
      text: 'The drums start. Everyone turns to see who will dance the Ash Lantern’s dance, and the answer is you, in his borrowed coat.',
      approaches: [
        { label: 'Throw yourself into it', stat: 'speed', difficulty: 8 },
        { label: 'Make it look like Kōun dancing', stat: 'genjutsu', difficulty: 9 },
        { label: 'Copy the old men’s feet exactly', stat: 'perception', difficulty: 8 },
      ],
      success:
        'By the third turn the whole lane is clapping in time, and Bunta’s scowl is cracking.',
      failure:
        'You go left when the drum says right, and take a paper lantern down with you. The children love it.',
      onFailure: 'forward',
    },
    {
      kind: 'decision',
      text: 'Bunta’s son-in-law, red with sake, stands up and makes a speech about cowards who send children to keep their promises.',
      options: [
        {
          label: 'Make the whole lane laugh at him',
          tone: 'tease',
          reply: 'They do. He sits down, purple. Bunta doesn’t laugh.',
          ledger: 'Made a fool of Bunta’s son-in-law.',
        },
        {
          label: 'Let him finish, then give Bunta Kōun’s message',
          tone: 'kind',
          reply:
            'When he runs out of breath you kneel by Bunta and tell him what Kōun said: that he can’t dance any more, and couldn’t stand to be seen not dancing. Bunta looks at the gate a long time. “Stubborn old fool,” he says, and pours you a cup.',
          effects: [{ kind: 'tally', tally: KOUN_GRACE, by: 1 }],
          ledger: 'Gave Bunta Kōun’s message, and the old man forgave him.',
        },
      ],
    },
    {
      kind: 'ending',
      endings: [
        {
          text: 'You report back at dawn. Kōun listens, sweeping, and stops only once, at Bunta’s name.',
          effects: [{ kind: 'memory', text: 'dancing the Ash Lantern’s dance at the wedding' }],
        },
      ],
    },
  ],
};
