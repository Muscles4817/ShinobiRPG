import type { MissionTemplate } from '../../../../missionTemplates';

/**
 * D-rank jobs on the roads and walls just outside the village: a toll gang on a bridge, a night
 * on watch. Each ends with someone to get past. (The escort, days on the road, is `dRankEscort`.)
 */
export const D_RANK_ROAD: readonly MissionTemplate[] = [
  {
    id: 'd-toll-gang',
    rank: 'D',
    slots: 3,
    energyCost: 25,
    reward: { ryo: 180, reputation: 5 },
    minMissionsCompleted: 3,
    placeholders: {
      title: 'the job’s title, e.g. Toll on the Willow Bridge',
      client: 'who complains, e.g. the Charcoal Burners',
      crossing: 'the place they hold, mid-sentence, e.g. the willow bridge on the charcoal road',
      complaint: 'a sentence: the client’s complaint, in their voice',
      gang: 'a sentence: the gang at the crossing, their toll and their swagger',
      foe: 'an enemy id: the gang’s leader, a D- or C-rank bandit, such as bandit-chief',
      crony: 'an enemy id: their crony, a D-rank bandit, such as bandit-thug',
      terrain: 'a sentence: the lie of the land at the crossing, once observed',
      parley: 'a sentence: the gang gives up the crossing, in their own words or deeds',
      ending: 'a sentence: the crossing free again, and who uses it first',
    },
    title: '{title}',
    client: '{client}',
    summary: 'A gang is charging a toll at {crossing}. Make them stop.',
    stages: [
      { kind: 'narrative', text: '{complaint}' },
      {
        kind: 'encounter',
        template: 'bandit-camp',
        job: 'patrol',
        text: '{gang}',
        enemyIds: ['{foe}', '{crony}'],
        canFlee: true,
        bypassable: false,
        flavour: { terrain: '{terrain}', parley: '{parley}' },
      },
      { kind: 'narrative', text: '{ending}' },
    ],
  },
  {
    id: 'd-night-watch',
    rank: 'D',
    slots: 3,
    energyCost: 25,
    reward: { ryo: 150, reputation: 4 },
    minMissionsCompleted: 1,
    placeholders: {
      title: 'the job’s title, e.g. Watch over the Tallow Store',
      client: 'who wants it watched, e.g. Chandler Ibuki',
      post: 'what you guard overnight, mid-sentence, e.g. the chandlers’ tallow store',
      setup: 'a sentence: the post at nightfall, and why it needs a guard tonight',
      vigil: 'a sentence: the slow small hours, and something that tempts you to doze',
      intruder: 'a sentence: the intruder at last, and what they are after',
      foe: 'an enemy id: a D-rank intruder, such as bandit-thug or academy-dropout',
      parley: 'a sentence: the intruder gives up, in their own words',
      ending: 'a sentence: dawn, the watch handed over, and the client’s reaction',
    },
    title: '{title}',
    client: '{client}',
    summary: 'Stand guard over {post} from dusk till dawn.',
    stages: [
      { kind: 'narrative', text: '{setup}' },
      {
        kind: 'check',
        text: '{vigil}',
        approaches: [
          { label: 'Keep yourself awake', stat: 'willpower', difficulty: 8 },
          { label: 'Walk the rounds all night', stat: 'stamina', difficulty: 8 },
        ],
        success: 'You are wide awake when something moves in the dark.',
        failure: 'You jerk awake to a sound in the dark. Someone is already inside.',
        onFailure: 'penalty',
      },
      {
        kind: 'encounter',
        template: 'lone-rogue',
        job: 'patrol',
        text: '{intruder}',
        enemyIds: ['{foe}'],
        canFlee: true,
        bypassable: false,
        flavour: { parley: '{parley}' },
      },
      { kind: 'narrative', text: '{ending}' },
    ],
  },
];
