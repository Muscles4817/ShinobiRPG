import type { ConversationDef } from '../../types';

/** What the village's clan heads and jōnin say at first, including the favours they ask. */
export const ROSTER_CONVERSATIONS: readonly ConversationDef[] = [
  {
    id: 'sayo-guest',
    personId: 'sayo',
    minStage: 0,
    opener:
      'Sayo is talking to an empty bench, and breaks off when she sees you. “My guest is hungry. Would you leave a little rice at the shrine for him?”',
    choices: [
      {
        label: '“Of course. Who is he?”',
        tone: 'kind',
        reply:
          'She doesn’t say. You leave the rice, and when you look back from the shrine steps the bowl is already empty and Sayo looks satisfied.',
        favour: 'sayo-offering',
      },
      {
        label: '“There’s nobody there.”',
        tone: 'challenge',
        reply: '“Not for you, there isn’t,” she says, and goes back to her conversation.',
      },
    ],
  },
  {
    id: 'koun-tea',
    personId: 'koun',
    minStage: 0,
    opener:
      'Old Kōun leans his broom against the wall and pours two cups of tea. “Sit, if you’re not in a hurry.”',
    choices: [
      {
        label: 'Sit, drink, and keep quiet.',
        tone: 'quiet',
        reply:
          'The tea goes cold before either of you speaks. When he finally does, it’s only to say you can come again.',
        favour: 'koun-tea',
      },
      {
        label: '“Is it true you held the bridge alone?”',
        tone: 'curious',
        reply:
          'He finishes his tea, picks up his broom and goes back to sweeping as if you hadn’t asked.',
      },
    ],
  },
];
