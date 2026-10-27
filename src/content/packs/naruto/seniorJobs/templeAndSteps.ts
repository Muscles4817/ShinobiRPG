import type { MissionDef } from '@/systems/missions';

/**
 * B-rank work on the pilgrim roads: a sutra stolen from the Fire Temple by one of its own
 * fighting monks, and a disgraced lord's retainers charging pilgrims to climb the Thousand Steps.
 */

export const TEMPLE_SUTRA: MissionDef = {
  id: 'senior-temple-sutra',
  title: 'The Sutra That Walked Out',
  rank: 'B',
  client: 'Chiriku, head monk of the Fire Temple',
  summary:
    'A fighting monk has left the Fire Temple with a sealed sutra the temple has guarded for a hundred years. Chiriku wants it back, and him with it if he will come.',
  slots: 4,
  energyCost: 35,
  reward: { ryo: 580, reputation: 11 },
  minMissionsCompleted: 10,
  goesTo: 'fire-temple',
  endsAt: 'konohagakure',
  stages: [
    { kind: 'road', to: 'outbound', text: 'North into the mountains and up the pilgrim road.' },
    {
      kind: 'narrative',
      text: 'Chiriku shows you the empty shelf and the cut cord. “Ensei taught half the temple to fight,” he says. “He was the best of us, and lately the angriest.”',
    },
    {
      kind: 'check',
      text: 'Ensei went down the mountain on foot, and a monk who has walked these paths for forty years knows ways the pilgrims don’t.',
      approaches: [
        { label: 'Track him down the goat paths', stat: 'perception', difficulty: 13 },
        { label: 'Ask the monks where he went to pray', stat: 'willpower', difficulty: 12 },
        {
          label: 'Work out where a sutra like that is worth selling',
          stat: 'intellect',
          difficulty: 13,
        },
      ],
      success:
        'He is at a ruined shrine below the pass, waiting for a buyer, with the sutra across his knees.',
      failure: 'You find the shrine late, and the buyer’s horse is already tied outside.',
      onFailure: 'penalty',
      failureDamage: 4,
    },
    {
      kind: 'encounter',
      template: 'lone-rogue',
      job: 'retrieve',
      text: 'Ensei sits in the ruined shrine with the sutra across his knees, and stands when he sees your headband.',
      enemyIds: ['temple-abbot'],
      canFlee: true,
      flavour: {
        parley:
          '“They keep it on a shelf,” Ensei says, “and pray to the shelf.” He holds the sutra out to you. “Give it back to them, then. I am tired of carrying it.”',
      },
    },
    {
      kind: 'decision',
      when: { lacks: 'slipped-past' },
      text: 'Ensei won’t go back up the mountain on his own feet. He asks you to let him walk the other way.',
      options: [
        {
          label: 'Let him go',
          tone: 'kind',
          reply: 'He bows to you, and to the mountain, and walks off down the valley road.',
          effects: [{ kind: 'mark', mark: 'ensei-free' }],
          ledger: 'Let Ensei walk away once the sutra was back in your hands.',
        },
        {
          label: 'Bring him back to Chiriku',
          tone: 'earnest',
          reply:
            'He climbs the pilgrim road ahead of you, slower with every step, and stops at the gate before he goes in.',
          effects: [{ kind: 'mark', mark: 'ensei-home' }],
          ledger: 'Walked Ensei back up to the temple to answer for himself.',
        },
      ],
    },
    {
      kind: 'ending',
      endings: [
        {
          when: { has: 'ensei-home' },
          text: 'Chiriku and Ensei talk in the meditation hall until dawn, and in the morning the sutra is off its shelf and open on the floor between them.',
        },
        {
          when: { has: 'ensei-free' },
          text: 'Chiriku takes the sutra back and asks only which way Ensei went. He doesn’t send anyone after him.',
        },
        {
          text: 'The sutra goes back on its shelf, and the temple’s fighting monks train without their teacher.',
        },
      ],
    },
    { kind: 'road', to: 'home' },
  ],
};

export const STEPS_TOLL: MissionDef = {
  id: 'senior-steps-toll',
  title: 'The Toll on the Thousand Steps',
  rank: 'B',
  client: 'The pilgrims of the Thousand Steps',
  summary:
    'A lord stripped of his lands has set his retainers on the Thousand Steps, charging pilgrims to climb them. The pilgrims have pooled what they had left to hire the Leaf.',
  slots: 3,
  energyCost: 30,
  reward: { ryo: 500, reputation: 12 },
  minMissionsCompleted: 8,
  goesTo: 'thousand-steps',
  endsAt: 'konohagakure',
  stages: [
    { kind: 'road', to: 'outbound', text: 'Out along the forest track to the foot of the steps.' },
    {
      kind: 'narrative',
      text: 'A rope is strung across the steps a third of the way up, and an old woman is counting coins into a retainer’s palm to be let past it.',
    },
    {
      kind: 'check',
      text: 'The retainers are soldiers and know their business, but their lord pays them in promises.',
      approaches: [
        { label: 'Find out what they are owed', stat: 'intellect', difficulty: 12 },
        { label: 'Climb past them unseen to the lord', stat: 'speed', difficulty: 13 },
      ],
      success:
        'The lord sits in a pilgrims’ rest at the top, drinking the tolls, and his retainers haven’t been paid since autumn.',
      failure:
        'The retainers spot you on the steps, and their captain comes down to meet you with his sword drawn.',
      onFailure: 'penalty',
      failureDamage: 6,
    },
    {
      kind: 'encounter',
      template: 'bandit-camp',
      job: 'eliminate',
      text: 'The retainers’ captain stands in the middle of the steps with a sword across his back, and a bowman sits on the wall above.',
      enemyIds: ['retainer-captain', 'bandit-archer'],
      canFlee: true,
      flavour: {
        parley:
          'The captain looks up the steps at his lord’s rest, and back at you. “We were soldiers once,” he says, and cuts the rope himself.',
      },
    },
    {
      kind: 'ending',
      endings: [
        {
          when: { has: 'talked-down' },
          text: 'The retainers carry their lord down the steps on his own sedan chair, and the pilgrims climb behind them singing.',
        },
        {
          text: 'The rope comes down and the pilgrims climb again. The lord is found at the top asleep beside a box of other people’s coins.',
        },
      ],
    },
    { kind: 'road', to: 'home' },
  ],
};
