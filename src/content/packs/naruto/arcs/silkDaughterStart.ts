import type { MissionDef } from '@/systems/missions';

/**
 * The Silk Merchant's Daughter, acts one to three: a merchant of Shukuba says bandits took his
 * daughter. Two leads open at once (her room, and the bandits he blames); either moves the
 * story on, and what you learn from her room is what the fork at the end can use. On the
 * pilgrim road you find her at the Fire Temple, and the truth: she ran from him.
 */

export const DANJURO = 'Danjūrō, silk merchant of Shukuba';
/** What you've found out about why Ochō left. */
export const OCHO_CLUES = 'ocho-clues';

export const DAUGHTER_TAKEN: MissionDef = {
  id: 'arc-silk-daughter-taken',
  title: 'A Daughter Taken',
  rank: 'C',
  client: DANJURO,
  summary:
    'A silk merchant of Shukuba says bandits took his daughter on the post road. He wants her found and brought home.',
  slots: 1,
  energyCost: 20,
  reward: { ryo: 260, reputation: 4 },
  minMissionsCompleted: 4,
  endsAt: 'shukuba-town',
  stages: [
    { kind: 'leg', text: 'A day up the post road to Shukuba.', days: 1, region: 'forest-track' },
    {
      kind: 'narrative',
      text: 'Danjūrō receives you in a room full of silk, and shouts at the maid who brings the tea for bringing it slowly. “Bandits,” he says, “on the post road. My only daughter, and I am a man of standing in this town.”',
    },
    {
      kind: 'check',
      text: 'The maid keeps her left sleeve pulled down over her wrist as she pours.',
      approaches: [
        {
          label: 'Catch her eye as she goes',
          stat: 'perception',
          difficulty: 8,
          onSuccess: {
            effects: [
              { kind: 'world', mark: 'ocho-bruise' },
              { kind: 'tally', tally: OCHO_CLUES, by: 1 },
            ],
            ledger: 'Saw the bruise under the maid’s sleeve, the shape of a hand.',
            noted: true,
          },
        },
      ],
      success: 'Under the sleeve is a bruise in the shape of a hand. She sees you see it.',
      failure: 'She is gone before you can look properly.',
      onFailure: 'forward',
    },
    {
      kind: 'ending',
      endings: [
        {
          text: 'Danjūrō pays for your room at the Highway Inn, the same inn, he says, where his daughter last slept.',
        },
      ],
    },
  ],
};

export const HER_ROOM: MissionDef = {
  id: 'arc-silk-her-room',
  title: 'The Room at the Highway Inn',
  rank: 'D',
  client: DANJURO,
  summary: 'Ochō’s last night before she vanished was spent at the Highway Inn. Look at her room.',
  slots: 2,
  energyCost: 10,
  reward: { ryo: 90, reputation: 2 },
  minMissionsCompleted: 4,
  stages: [
    {
      kind: 'check',
      text: 'The innkeeper kept the room as it was, with the bed made and nothing broken.',
      approaches: [
        {
          label: 'Search it properly',
          stat: 'perception',
          difficulty: 7,
          onSuccess: {
            effects: [
              { kind: 'world', mark: 'ocho-fled' },
              { kind: 'tally', tally: OCHO_CLUES, by: 1 },
            ],
            ledger:
              'Her winter clothes were gone, and her mother’s comb, which no bandit would bother to take.',
            noted: true,
          },
        },
        {
          label: 'Ask the innkeeper what she was like that night',
          stat: 'intellect',
          difficulty: 7,
          onSuccess: {
            effects: [
              { kind: 'world', mark: 'ocho-fled' },
              { kind: 'tally', tally: OCHO_CLUES, by: 1 },
            ],
            ledger:
              'The innkeeper says she paid a post rider to carry a letter to the Fire Temple.',
            noted: true,
          },
        },
      ],
      success:
        'Nobody took Ochō. She packed for winter, paid a rider to carry a letter to the Fire Temple, and walked out before dawn.',
      failure:
        'A made bed and a cold room. On your way out the innkeeper mentions she asked the way to the temple road.',
      onFailure: 'forward',
    },
    {
      kind: 'ending',
      endings: [
        {
          text: 'The innkeeper asks you not to tell the merchant what you found. “She was kind,” she says.',
        },
      ],
    },
  ],
};

export const BANDITS_BLAMED: MissionDef = {
  id: 'arc-silk-bandits',
  title: 'The Bandits He Blames',
  rank: 'D',
  client: DANJURO,
  summary: 'Danjūrō wants the bandits on the post road dealt with. He is sure they took her.',
  slots: 2,
  energyCost: 25,
  reward: { ryo: 150, reputation: 3 },
  minMissionsCompleted: 4,
  stages: [
    {
      kind: 'encounter',
      template: 'bandit-camp',
      job: 'eliminate',
      text: 'The bandits camp in a hollow off the post road, exactly where the merchant said.',
      enemyIds: ['bandit-chief', 'bandit-thug'],
      canFlee: true,
    },
    {
      when: { lacks: 'slipped-past' },
      kind: 'narrative',
      text: 'Their chief swears he never took any merchant’s daughter. “A girl walked past us alone, before dawn, a month back,” he says. “Towards the temple road. We let her be. She looked like she had nothing worth taking.”',
    },
    {
      when: { lacks: 'slipped-past' },
      kind: 'decision',
      text: 'Danjūrō has sent word ahead that there will be a bonus if you bring the bandits to him. He means to hang them for his daughter, whatever they did.',
      options: [
        {
          label: 'Hand them to Danjūrō',
          tone: 'cruel',
          reply: 'They go to Shukuba in a cart. You don’t ask what happens to them there.',
          effects: [
            { kind: 'pay', share: 0.5 },
            { kind: 'world', mark: 'ocho-bandits-hanged' },
          ],
          ledger: 'Handed the bandits to Danjūrō for a bonus, for a kidnapping they didn’t do.',
        },
        {
          label: 'Take their word, and send them off the post road',
          tone: 'curious',
          reply: 'The chief looks at you as if you’ve grown another head, then goes, fast.',
          effects: [{ kind: 'tally', tally: OCHO_CLUES, by: 1 }],
          ledger:
            'Believed the bandits, who said a girl walked past them alone towards the temple.',
          noted: true,
        },
      ],
    },
    {
      kind: 'ending',
      endings: [
        {
          text: 'Danjūrō is delighted the bandits are dealt with, and doesn’t ask what they said.',
        },
      ],
    },
  ],
};

export const PILGRIM_ROAD: MissionDef = {
  id: 'arc-silk-pilgrim-road',
  title: 'Sanctuary',
  rank: 'C',
  client: DANJURO,
  summary: 'The trail leads up the pilgrim road to the Fire Temple.',
  slots: 1,
  energyCost: 25,
  reward: { ryo: 300, reputation: 4 },
  minMissionsCompleted: 4,
  endsAt: 'fire-temple',
  stages: [
    {
      kind: 'leg',
      text: 'Back through the forest, then up into the hills.',
      days: 1,
      region: 'forest-track',
    },
    {
      kind: 'leg',
      text: 'The pilgrim road climbs to the temple gate.',
      days: 1,
      region: 'mountain-pass',
    },
    {
      kind: 'narrative',
      text: 'Chiriku meets you at the gate and doesn’t let you through it. “She asked for sanctuary,” he says mildly. “The temple gave it.” Behind him, sweeping the courtyard in a borrowed pilgrim’s robe, is a young woman who stops when she sees your headband.',
    },
    {
      kind: 'decision',
      text: '“He sent you,” Ochō says. “Of course he did. Did he tell you he broke my mother’s arm twice? Did he tell you he sold me to his creditor to clear a debt?”',
      options: [
        {
          label: 'Tell her you won’t drag her anywhere',
          tone: 'kind',
          reply: 'She sits down on the temple steps very suddenly, and Chiriku lets you through.',
          effects: [{ kind: 'world', mark: 'ocho-trusts' }],
          ledger: 'Promised Ochō you wouldn’t drag her home.',
        },
        {
          label: 'Tell her the job is to bring her home',
          tone: 'challenge',
          reply: '“Then you’ll have to carry me,” she says, and Chiriku folds his arms.',
          ledger: 'Told Ochō the job was to bring her home.',
        },
        {
          label: 'Ask her to tell you everything, from the start',
          tone: 'curious',
          reply:
            'She does, for an hour, on the temple steps. Chiriku brings tea and doesn’t interrupt.',
          effects: [
            { kind: 'world', mark: 'ocho-trusts' },
            { kind: 'tally', tally: OCHO_CLUES, by: 1 },
          ],
          ledger: 'Heard Ochō’s whole story.',
          noted: true,
        },
      ],
    },
    {
      kind: 'ending',
      endings: [
        {
          text: '“What will you tell him?” Ochō asks, when it is dark. You don’t know yet. Chiriku gives you a pilgrim’s cell for the night to think about it.',
        },
      ],
    },
  ],
};
