import type { MissionTemplate } from '../../../../missionTemplates';

/**
 * S-rank work: a jōnin sent after one of their own kind, a rogue of jōnin grade, with a chūnin
 * squad behind them. The trail is hard to read, and the quarry never fights alone.
 */
export const S_RANK_JOBS: readonly MissionTemplate[] = [
  {
    id: 's-hunt',
    rank: 'S',
    slots: 8,
    energyCost: 50,
    reward: { ryo: 1600, reputation: 24 },
    minMissionsCompleted: 20,
    placeholders: {
      title: 'the job’s title, e.g. The Hollow Lantern',
      client: 'who signs the order, e.g. the Tōrokage’s Office',
      quarry: 'who you hunt, mid-sentence, e.g. the rogue jōnin they call the Hollow Lantern',
      briefing: 'a sentence or two: who the quarry was, what they did, and why now',
      trail: 'a sentence: where the trail starts, and why it is hard to follow',
      found: 'a sentence: you find where they are, before they know you are coming',
      cold: 'a sentence: you find them, but they have had word of you',
      lair: 'a sentence: where they are, and who stands with them',
      foe: 'an enemy id: the quarry, a jōnin-grade rogue, such as hollow-lantern',
      second: 'an enemy id: whoever stands with them, a chūnin-grade rogue',
      surrender: 'a sentence: the quarry gives themselves up, in their own words or deeds',
      ending: 'a sentence: the quarry dealt with, and what the village keeps quiet',
    },
    title: '{title}',
    client: '{client}',
    summary: 'Hunt down {quarry}, and bring the village’s name home clean.',
    stages: [
      { kind: 'narrative', text: '{briefing}' },
      {
        kind: 'check',
        text: '{trail}',
        approaches: [
          { label: 'Read the trail they hid', stat: 'perception', difficulty: 16 },
          { label: 'Work out where they must go', stat: 'intellect', difficulty: 16 },
          { label: 'Feel for their chakra', stat: 'chakraControl', difficulty: 17 },
        ],
        success: '{found}',
        failure: '{cold}',
        onFailure: 'penalty',
        failureDamage: 8,
      },
      {
        kind: 'encounter',
        template: 'lone-rogue',
        job: 'eliminate',
        text: '{lair}',
        enemyIds: ['{foe}', '{second}'],
        canFlee: false,
        bypassable: false,
        flavour: { parley: '{surrender}' },
      },
      { kind: 'narrative', text: '{ending}' },
    ],
  },
];
