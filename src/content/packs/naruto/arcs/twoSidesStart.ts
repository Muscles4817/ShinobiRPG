import type { MissionDef } from '@/systems/missions';

/**
 * Two Sides of the Water, acts one and two: the Waves is coming apart while the bridge goes up.
 * The builders say the fishermen cut their scaffold ropes; the fishermen say the builders cut
 * their nets. Both hire you, and both jobs must be done: only someone working for both sides
 * can see that neither did it.
 */

export const TWO_SIDES_CLUES = 'waves-two-sides-clues';

export const TOWN_APART: MissionDef = {
  id: 'arc-waves-town-apart',
  title: 'A Town Coming Apart',
  rank: 'C',
  client: 'Tsunami',
  summary:
    'Tsunami has written from the Land of Waves. The builders and the fishermen are at each other’s throats, and she is afraid of what comes next.',
  slots: 1,
  energyCost: 20,
  reward: { ryo: 300, reputation: 4 },
  minMissionsCompleted: 3,
  endsAt: 'land-of-waves',
  stages: [
    { kind: 'leg', text: 'Through the forest to the coast.', days: 1, region: 'forest-track' },
    {
      kind: 'leg',
      text: 'Down the coast road and across the water in a borrowed boat, the half-built bridge looming out of the fog.',
      days: 1,
      region: 'coast-road',
    },
    {
      kind: 'decision',
      text: 'On Tazuna’s step Inari is sitting with his arms round his knees. “The fishermen threw stones at Grandpa today,” he says. “They used to be his friends.”',
      options: [
        {
          label: 'Ask what started it',
          tone: 'curious',
          reply:
            '“Ropes cut on the bridge. Nets cut in the harbour. Same nights,” Inari says. “Everyone knows who did it. Everyone knows something different.”',
          effects: [{ kind: 'mark', mark: 'same-nights' }],
          ledger: 'Inari told you the ropes and the nets were cut on the same nights.',
        },
        {
          label: 'Tell him you’ll sort it out',
          tone: 'earnest',
          reply: 'He looks at you like he wants to believe it, and nearly does.',
          ledger: 'Promised Inari you’d sort it out.',
        },
      ],
    },
    {
      kind: 'ending',
      endings: [
        {
          when: { has: 'same-nights' },
          text: 'Tsunami makes up a bed for you. “The same nights,” she repeats, when you tell her. “Nobody here has thought about that.”',
        },
        { text: 'Tsunami makes up a bed for you, and doesn’t ask how long you’ll stay.' },
      ],
    },
  ],
};

export const CUT_NETS: MissionDef = {
  id: 'arc-waves-cut-nets',
  title: 'Cut Nets',
  rank: 'D',
  client: 'The fishermen of the Waves',
  summary: 'Every night someone cuts the fishermen’s nets. They say it’s the bridge builders.',
  slots: 2,
  energyCost: 20,
  reward: { ryo: 120, reputation: 2 },
  minMissionsCompleted: 3,
  stages: [
    {
      kind: 'check',
      text: 'You sit up in the dark with the drying nets. Past midnight, a shape slips along the jetty with a knife.',
      approaches: [
        {
          label: 'Get close enough to see his face',
          stat: 'perception',
          difficulty: 8,
          onSuccess: {
            effects: [
              { kind: 'world', mark: 'waves-saw-sandals' },
              { kind: 'mark', mark: 'saw' },
              { kind: 'tally', tally: TWO_SIDES_CLUES, by: 1 },
            ],
            ledger: 'The net-cutter wore the tycoon’s company sandals, not a builder’s boots.',
          },
        },
        {
          label: 'Follow him when he goes',
          stat: 'speed',
          difficulty: 9,
          onSuccess: {
            effects: [
              { kind: 'world', mark: 'waves-saw-sandals' },
              { kind: 'mark', mark: 'saw' },
              { kind: 'tally', tally: TWO_SIDES_CLUES, by: 1 },
            ],
            ledger: 'Followed the net-cutter to the tycoon’s warehouse on the point.',
          },
        },
      ],
      success:
        'He is no builder. He wears the tycoon’s company sandals, and he walks home to the warehouse on the point.',
      failure: 'He is gone into the fog before you can see more than a knife.',
      onFailure: 'forward',
    },
    {
      kind: 'decision',
      text: 'In the morning the fishermen want to hear you say it was the builders.',
      options: [
        {
          label: 'Say you saw who it was, and it wasn’t a builder',
          tone: 'earnest',
          when: { has: 'saw' },
          reply: 'Nobody believes you yet. But nobody throws a stone at Tazuna that day.',
          ledger: 'Told the fishermen it wasn’t the builders.',
        },
        {
          label: 'Say you couldn’t see',
          tone: 'quiet',
          reply: 'They mutter that you’re in Tazuna’s pocket.',
          ledger: 'Told the fishermen you couldn’t see.',
        },
      ],
    },
    { kind: 'ending', endings: [{ text: 'The fishermen pay you in coin and dried fish.' }] },
  ],
};
