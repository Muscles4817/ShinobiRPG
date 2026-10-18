import type { ConversationDef } from '../../types';

/** What the village's clan heads and jōnin say at first, including the favours they ask. */
export const ROSTER_CONVERSATIONS: readonly ConversationDef[] = [
  {
    id: 'sayo-guest',
    personId: 'sayo',
    minStage: 0,
    opener:
      'Sayo is talking to an empty bench. She stops. “My guest is hungry. Would you leave a little rice at the shrine for him?”',
    choices: [
      {
        label: '“Of course. Who is he?”',
        tone: 'kind',
        reply: 'You leave the rice. When you look back, the bowl is empty. Sayo nods, satisfied.',
        favour: 'sayo-offering',
      },
      {
        label: '“There’s nobody there.”',
        tone: 'challenge',
        reply: '“Not to you,” she says, and goes back to her conversation.',
      },
    ],
  },
  {
    id: 'koun-tea',
    personId: 'koun',
    minStage: 0,
    opener:
      'Old Kōun sets down his broom and pours two cups of tea. “Sit, if you’re not in a hurry.”',
    choices: [
      {
        label: 'Sit, drink, and say nothing.',
        tone: 'quiet',
        reply: 'The tea goes cold before either of you speaks. “Good,” he says. “Come again.”',
        favour: 'koun-tea',
      },
      {
        label: '“Is it true you held the bridge alone?”',
        tone: 'curious',
        reply: 'He finishes his tea, picks up his broom and goes back to sweeping.',
      },
    ],
  },
];
