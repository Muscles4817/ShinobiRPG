import type { MissionDef } from '@/systems/missions';

/** Salt in the Lanterns, acts one and two: the harbourmaster's letter, and the road down. */

export const HARBOUR = 'Harbourmaster Kai';

export const HARBOUR_LETTER: MissionDef = {
  id: 'arc-salt-letter',
  title: 'A Letter from the Harbour',
  rank: 'D',
  client: HARBOUR,
  summary:
    'Port Shiomachi has written to the village. The lanterns on its harbour shrine go out every night, and the boats won’t sail.',
  slots: 2,
  energyCost: 10,
  reward: { ryo: 70, reputation: 2 },
  minMissionsCompleted: 2,
  stages: [
    {
      kind: 'narrative',
      text: 'The clerk hands you a letter that smells of tar. The harbourmaster has written in a hurry that every night the shrine lanterns on the breakwater go dark, and every morning they are full of seawater.',
    },
    {
      kind: 'decision',
      text: 'The clerk wants an answer to send back with the fish cart. What do you tell the port?',
      options: [
        {
          label: 'Tell them a shinobi is coming',
          tone: 'earnest',
          reply: 'The clerk writes it down in fat strokes. “They’ll sleep better for that.”',
          effects: [{ kind: 'world', mark: 'salt-promised' }],
          ledger: 'Promised the port a shinobi would come.',
        },
        {
          label: 'Ask what else they have seen',
          tone: 'curious',
          reply:
            'The clerk adds a question at the bottom, and the answer comes back on the next cart. People have seen lights under the water, out by the old wreck.',
          effects: [{ kind: 'world', mark: 'salt-wreck-lights' }],
          ledger: 'Asked the port what else it had seen, and heard about lights under the water.',
        },
      ],
    },
    {
      kind: 'ending',
      endings: [
        {
          text: 'The letter goes south with the fish cart. The coast road will be waiting when you are.',
        },
      ],
    },
  ],
};

export const DOWN_TO_THE_COAST: MissionDef = {
  id: 'arc-salt-coast-road',
  title: 'Down the Coast Road',
  rank: 'D',
  client: HARBOUR,
  summary:
    'Take the coast road to Port Shiomachi and see the harbour lanterns for yourself. You’ll stay as long as it takes.',
  slots: 1,
  energyCost: 15,
  reward: { ryo: 160, reputation: 3 },
  minMissionsCompleted: 2,
  goesTo: 'port-shiomachi',
  endsAt: 'port-shiomachi',
  stages: [
    {
      kind: 'road',
      to: 'outbound',
      text: 'The coast road winds down through the terraces, and the wind starts to taste of salt.',
    },
    {
      kind: 'check',
      text: 'Above the last bend you can see the whole harbour, with the shrine on its breakwater. Out past the point, a pale shape moves just under the water.',
      approaches: [
        {
          label: 'Watch it until it sinks',
          stat: 'perception',
          difficulty: 7,
          onSuccess: {
            effects: [{ kind: 'world', mark: 'salt-saw-the-light' }],
            ledger: 'Saw a pale light under the water off the point.',
          },
        },
        {
          label: 'Feel for chakra on the wind',
          stat: 'chakraControl',
          difficulty: 8,
          onSuccess: {
            effects: [{ kind: 'world', mark: 'salt-saw-the-light' }],
            ledger: 'Felt chakra moving under the water off the point.',
          },
        },
      ],
      success: 'Whatever it was, it is gone by the time you reach the harbour, and it was real.',
      failure: 'A wave breaks, and when it clears there is nothing. Maybe there never was.',
      onFailure: 'forward',
    },
    {
      kind: 'ending',
      endings: [
        {
          when: { remembers: 'salt-promised' },
          text: 'Kai meets you on the slipway. “You came,” he says, as if he hadn’t believed the letter. He finds you a room at the Gull’s Rest.',
        },
        {
          text: 'Kai looks you up and down on the slipway, decides you’ll do, and finds you a room at the Gull’s Rest.',
        },
      ],
    },
  ],
};
