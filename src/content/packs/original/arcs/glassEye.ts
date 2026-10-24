import type { ArcDef, MissionDef } from '@/systems/missions';

/**
 * The Glass-Eyed Scout: a story of two of Sakyūgakure's missing-nin, composed foes from the
 * pack's villages (`shinobiVillages.ts`). Someone is blinding the watchtowers on the dune line;
 * the one you catch is Isago, and Isago was taught by Kazemi the Glass-Eyed, who sells every
 * border in the Land of Embers to whoever pays. Then go and find the teacher.
 */

const CLIENT = 'The Border Watch';
export const GLASS_EYE_NAMED = 'glass-eye-named';
export const GLASS_EYE_SETTLED = 'glass-eye-settled';

export const BLINDED_TOWERS: MissionDef = {
  id: 'arc-glass-eye-towers',
  title: 'The Blinded Towers',
  rank: 'B',
  client: CLIENT,
  summary: 'Someone is smashing the lenses in the watchtowers on the dune line, one a night.',
  slots: 4,
  energyCost: 35,
  reward: { ryo: 560, reputation: 9 },
  minMissionsCompleted: 12,
  stages: [
    {
      kind: 'narrative',
      text: 'The Border Watch captain lays a handful of broken glass on the table. “Four towers in four nights. Nobody saw who climbed them.”',
    },
    {
      kind: 'leg',
      text: 'Out along the dune line, tower by tower, in a wind that fills your mouth with sand.',
      days: 2,
      region: 'dune-road',
    },
    {
      kind: 'check',
      text: 'The fifth tower still has its lens. Whoever comes for it tonight will have to climb.',
      approaches: [
        {
          label: 'Wait in the tower itself',
          stat: 'willpower',
          difficulty: 11,
          onSuccess: { ledger: 'Waited out the night in the tower and heard the climber come.' },
        },
        {
          label: 'Read the old tracks round its foot',
          stat: 'perception',
          difficulty: 11,
          role: 'tracker',
          onSuccess: { ledger: 'Read where the climber would come from, and waited there.' },
        },
      ],
      success: 'An hour before dawn a shape comes up the wall without a rope.',
      failure:
        'You are looking the wrong way when the glass breaks, and have to run them down across the dunes.',
      onFailure: 'forward',
    },
    {
      kind: 'encounter',
      template: 'lone-rogue',
      job: 'eliminate',
      ground: 'desert',
      text: 'Isago of the Dry Wells drops off the tower with the lens in a sack, and does not run.',
      enemyIds: ['rogue-sakyugakure-scout-chunin'],
      canFlee: false,
      bypassable: false,
    },
    {
      kind: 'decision',
      text: 'Isago sits in the sand with their hands on their knees. “They’re only lenses. Nobody dies of a blind tower. Not yet.”',
      options: [
        {
          label: 'Ask who wants the towers blind',
          tone: 'curious',
          reply:
            '“The one who taught me to climb them,” Isago says. “Kazemi. The Glass-Eyed. Sells every border in the land to whoever pays, and I owed a debt.”',
          ledger: 'Asked who wanted the towers blind, and got a name.',
        },
        {
          label: 'Tell them the next blind tower will cost a life',
          tone: 'challenge',
          reply:
            'Isago looks at the broken glass for a long while. “Kazemi,” they say at last. “Ask for the Glass-Eyed in the caravan towns. Then stop asking.”',
          ledger: 'Put it plainly to Isago, who gave up the name.',
        },
      ],
    },
    {
      kind: 'ending',
      endings: [
        {
          text: 'The lenses go back up, and Isago goes back to the village under guard. The Border Watch writes one more name on the board: Kazemi the Glass-Eyed.',
          effects: [
            { kind: 'world', mark: GLASS_EYE_NAMED },
            { kind: 'memory', text: 'the night on the fifth tower' },
          ],
        },
      ],
    },
    {
      kind: 'leg',
      text: 'Back along the dune line, with Isago walking ahead in silence.',
      days: 2,
    },
  ],
};

export const GLASS_EYED: MissionDef = {
  id: 'arc-glass-eye-teacher',
  title: 'The Glass-Eyed',
  rank: 'A',
  client: CLIENT,
  summary: 'Kazemi the Glass-Eyed sells our borders. Find where Kazemi keeps the maps.',
  slots: 6,
  energyCost: 45,
  reward: { ryo: 1100, reputation: 16 },
  minMissionsCompleted: 14,
  stages: [
    {
      kind: 'narrative',
      text: 'Every caravan town on the dune road has heard of the Glass-Eyed, and nobody in any of them has seen Kazemi’s face.',
    },
    {
      kind: 'leg',
      text: 'Three days of caravan towns, buying tea for drovers and listening.',
      days: 3,
      region: 'dune-road',
    },
    {
      kind: 'check',
      text: 'A drover with a new mule and old debts says the Glass-Eyed buys lamp oil by the barrel, for a tower nobody uses.',
      approaches: [
        {
          label: 'Work out which tower needs that much oil',
          stat: 'intellect',
          difficulty: 13,
          onSuccess: { ledger: 'Worked out which dead watchtower burns a lamp all night.' },
        },
        {
          label: 'Follow the oil cart',
          stat: 'speed',
          difficulty: 12,
          role: 'tracker',
          onSuccess: { ledger: 'Followed the oil cart to a dead watchtower in the deep sand.' },
        },
      ],
      success: 'An old Dune watchtower, half buried, with one window lit in the top.',
      failure:
        'The cart loses you in a sandstorm, and you find the tower only by its light, a day late.',
      onFailure: 'forward',
    },
    {
      kind: 'encounter',
      template: 'lone-rogue',
      job: 'eliminate',
      ground: 'desert',
      text: 'Maps cover every wall of the tower room, and Kazemi the Glass-Eyed turns from the window with a lens screwed into one eye.',
      enemyIds: ['rogue-sakyugakure-scout-jonin'],
      canFlee: false,
      bypassable: false,
    },
    {
      kind: 'decision',
      text: 'Kazemi lowers the lens. “Burn them if you like. I remember every one. Or take me home, and I’ll draw your village the borders the others think they have.”',
      options: [
        {
          label: 'Burn the maps',
          tone: 'challenge',
          reply:
            'The maps go up one wall at a time. Kazemi watches every one burn, and says nothing.',
          effects: [{ kind: 'mark', mark: 'maps-burned' }],
          ledger: 'Burned Kazemi’s maps of every border.',
        },
        {
          label: 'Take Kazemi home, maps and all',
          tone: 'earnest',
          reply:
            '“Sensible,” Kazemi says, and starts rolling them up before you can change your mind.',
          ledger: 'Brought Kazemi home with the maps, for the village to use.',
        },
      ],
    },
    {
      kind: 'ending',
      endings: [
        {
          when: { has: 'maps-burned' },
          text: 'The tower burns behind you all night. The Border Watch never learns what was on the walls, and the dune line stays as it was, for better and worse.',
          effects: [
            { kind: 'world', mark: GLASS_EYE_SETTLED },
            { kind: 'memory', text: 'the night the maps burned' },
          ],
        },
        {
          text: 'Kazemi draws borders for the Tōrokage’s office for a year, under guard, and every one of them is right. Nobody is quite sure whether that makes it better.',
          effects: [
            { kind: 'world', mark: GLASS_EYE_SETTLED },
            { kind: 'memory', text: 'the walk home with Kazemi’s maps' },
          ],
        },
      ],
    },
    { kind: 'leg', text: 'Home up the dune road with sand in everything.', days: 3 },
  ],
};

export const GLASS_EYE_JOBS: readonly MissionDef[] = [BLINDED_TOWERS, GLASS_EYED];

export const GLASS_EYE_ARC: ArcDef = {
  id: 'the-glass-eyed-scout',
  title: 'The Glass-Eyed Scout',
  summary: 'Someone is blinding the watchtowers on the dune line, and has a teacher.',
  acts: [
    {
      beats: ['you', 'need', 'go', 'search'],
      title: 'The blinded towers',
      text: 'Find out who is smashing the watchtower lenses on the dune line.',
      jobs: [BLINDED_TOWERS.id],
    },
    {
      beats: ['find', 'take', 'return', 'change'],
      title: 'The teacher',
      text: 'Isago named Kazemi the Glass-Eyed. Find the tower where the borders are sold.',
      jobs: [GLASS_EYED.id],
    },
  ],
};
