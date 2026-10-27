import type { MissionDef } from '@/systems/missions';

/**
 * B-rank work towards the Wind Country: spice from the tainted belt coming into the Leaf's
 * markets by way of Kagerō Landing, and someone taking orphans out of the Land of Rivers.
 */

export const SPICE_RUNNERS: MissionDef = {
  id: 'senior-spice-runners',
  title: 'Spice by the Caravan Road',
  rank: 'B',
  client: 'The Leaf’s market wardens',
  summary:
    'Dark sand that makes the eyes ring black is turning up in the Leaf’s back alleys. It comes in by caravan through Kagerō Landing.',
  slots: 4,
  energyCost: 35,
  reward: { ryo: 620, reputation: 10 },
  minMissionsCompleted: 11,
  goesTo: 'kagero-landing',
  endsAt: 'konohagakure',
  stages: [
    { kind: 'road', to: 'outbound', text: 'West through the hills and down the river road.' },
    {
      kind: 'narrative',
      text: 'The Landing is all wells and camels and shouting. Every caravan in from the sands is searched at the gate, and none of them is searched well.',
    },
    {
      kind: 'check',
      text: 'The spice travels sewn into the caravans’ goods. You need to know which goods before the next caravan leaves for the Leaf.',
      approaches: [
        { label: 'Search a caravan as it unloads', stat: 'perception', difficulty: 13 },
        { label: 'Buy a pinch and follow the seller home', stat: 'willpower', difficulty: 13 },
        { label: 'Read the water market’s ledgers', stat: 'intellect', difficulty: 12 },
      ],
      success:
        'It rides in the camel saddles, packed between layers of felt, and every saddle comes from one saddler’s yard by the barge office.',
      failure:
        'You find the saddles at last, but the saddler has had word of you and has moved his stock.',
      onFailure: 'penalty',
      failureDamage: 6,
    },
    {
      kind: 'encounter',
      template: 'guarded-building',
      job: 'eliminate',
      ground: 'desert',
      text: 'Behind the saddler’s yard a Sand missing-nin weighs out spice on a cloth, and a hired sword keeps the gate.',
      enemyIds: ['rogue-sunagakure-trapper-chunin', 'mercenary-veteran'],
      canFlee: true,
    },
    {
      kind: 'decision',
      text: 'There are sacks of spice in the yard, enough to keep the Leaf’s alleys black-eyed for a year.',
      options: [
        {
          label: 'Burn it in the yard',
          tone: 'challenge',
          reply:
            'The spice burns with a smell like a struck bell, and the whole Landing comes out to watch the smoke.',
          effects: [{ kind: 'mark', mark: 'spice-burned' }],
          ledger: 'Burned the spice where it was stored, in front of everyone.',
        },
        {
          label: 'Hand it to the barge priests',
          tone: 'curious',
          reply:
            'A priest of the Dunes weighs a sack in both hands and says it came from too close to the tomb. They take it all into the sands.',
          effects: [{ kind: 'mark', mark: 'spice-to-priests' }],
          ledger: 'Gave the spice to the sand priests, who know what it is better than anyone.',
        },
      ],
    },
    {
      kind: 'ending',
      endings: [
        {
          when: { has: 'spice-to-priests' },
          text: 'Sunao of the Dunes says the priests will remember a Leaf shinobi who gave back what the sand had made.',
        },
        {
          text: 'The market wardens find no more black-eyed sellers in the alleys that season, and the saddler’s yard stands empty.',
        },
      ],
    },
    { kind: 'road', to: 'home' },
  ],
};

export const RIVERS_ORPHANS: MissionDef = {
  id: 'senior-rivers-orphans',
  title: 'The Orphans of the Rivers',
  rank: 'B',
  client: 'The Leaf’s orphanage',
  summary:
    'Children are going missing from the river villages along the border, and a well-spoken stranger has been seen at every one of them. Find out who is taking them.',
  slots: 4,
  energyCost: 35,
  reward: { ryo: 560, reputation: 12 },
  minMissionsCompleted: 12,
  goesTo: 'land-of-rivers',
  endsAt: 'konohagakure',
  stages: [
    { kind: 'road', to: 'outbound', text: 'West along the hill road and down to the rivers.' },
    {
      kind: 'narrative',
      text: 'The headman of the last village says the stranger offered the orphans food and a trade, and that some of them went gladly.',
    },
    {
      kind: 'check',
      text: 'The children were walked away by night along the riverbanks, where the mud keeps footprints for a day.',
      approaches: [
        { label: 'Follow the prints along the bank', stat: 'perception', difficulty: 12 },
        { label: 'Feel for a chakra among the children’s', stat: 'chakraControl', difficulty: 13 },
      ],
      success:
        'The trail leads to a reed island in the river, and a raft hidden in the reeds with room for a dozen.',
      failure:
        'The rain comes and the prints go, and you find the island only by the smoke of their fire.',
      onFailure: 'penalty',
      failureDamage: 4,
    },
    {
      kind: 'encounter',
      template: 'bandit-camp',
      job: 'escort',
      ground: 'lake',
      text: 'Six children sit by a fire on the island, well fed and frightened. A Mist missing-nin minds them, and a hired knife minds the raft.',
      enemyIds: ['rogue-kirigakure-sensor-chunin', 'hired-assassin'],
      canFlee: false,
      flavour: {
        parley:
          '“They were starving,” the missing-nin says. “Where I am taking them, they will be fed and trained. Can your Leaf say the same?”',
      },
    },
    {
      kind: 'check',
      text: 'One of the children has a letter of passage in a hand none of them can read, with a snake drawn where the seal should be.',
      approaches: [
        { label: 'Make out the writing', stat: 'intellect', difficulty: 12 },
        { label: 'Read the seal under the drawing', stat: 'fuuinjutsu', difficulty: 13 },
      ],
      success:
        'The letter is a pass into the Land of Rice Paddies, signed by nobody, and the snake is a seal that bites whoever breaks it.',
      failure: 'The paper means nothing to you, and you bring it home for someone who can read it.',
      onFailure: 'forward',
    },
    {
      kind: 'ending',
      endings: [
        {
          text: 'The children come home to the Leaf’s orphanage, and the Hokage takes the letter with the snake on it away to read alone.',
        },
      ],
    },
    { kind: 'road', to: 'home' },
  ],
};
