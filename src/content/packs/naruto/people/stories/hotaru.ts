import type { ConversationDef } from '../../../../types';

import { HOTARU_SHORE } from './marks';

/** Hotaru’s story, a beat for each stage of closeness (`SenseiWays.story`). */
export const HOTARU_STORY: readonly ConversationDef[] = [
  {
    id: 'hotaru-water',
    personId: 'hotaru',
    minStage: 1,
    opener:
      'Hotaru lifts a ribbon of river water and ties it in a knot in the air. “Water remembers the shape you give it, if you’re patient with it. People are the same, I find.”',
    choices: [
      {
        label: '“Teach me that.”',
        tone: 'earnest',
        reply: '“Tomorrow,” she says. “Bring a towel. Possibly two.”',
      },
      {
        label: '“It’s beautiful.”',
        tone: 'praise',
        reply: 'She lets the knot fall back into the river, pleased.',
      },
      {
        label: 'Try it yourself.',
        tone: 'challenge',
        reply: 'You soak both your sleeves to the elbow, and she laughs, not unkindly.',
      },
    ],
  },
  {
    id: 'hotaru-boat',
    personId: 'hotaru',
    minStage: 2,
    opener:
      '“I came here hidden in a fishing boat, under the nets,” Hotaru says. “The Land of Waves was a hard place to be a child who could do this.”',
    choices: [
      {
        label: '“Why was it hard?”',
        tone: 'curious',
        reply:
          '“Because people who can do strange things get taken there, or sold, if nobody hides them.”',
      },
      {
        label: '“I’m glad you came.”',
        tone: 'kind',
        reply: '“So am I. Most days I am, anyway.”',
      },
      {
        label: 'Listen.',
        tone: 'quiet',
        reply:
          'She tells you about the smell of the nets in the dark, and the boatman humming so nobody would hear her breathe.',
      },
    ],
  },
  {
    id: 'hotaru-brother',
    personId: 'hotaru',
    minStage: 3,
    opener:
      '“There was only room under the nets for one,” Hotaru says, “and my little brother pushed me in. I never saw him again. That’s why nobody on my team ever gets left behind.”',
    choices: [
      {
        label: '“He wanted you to live.”',
        tone: 'kind',
        reply: '“I know he did. I still wish I’d argued with him.”',
      },
      {
        label: '“Have you looked for him?”',
        tone: 'curious',
        reply:
          '“I ask in every letter I send to the Waves. Nobody has ever written back about him.”',
      },
      {
        label: '“Nobody gets left. I promise.”',
        tone: 'earnest',
        reply: 'She holds your eyes until she is sure you mean it, and then accepts the promise.',
      },
    ],
  },
  {
    id: 'hotaru-shore',
    personId: 'hotaru',
    minStage: 4,
    opener:
      '“A letter came from the Waves at last,” Hotaru says, turning it over and over in her hands. “Someone on the old shore knows my name. I have to go, and I’d like you to come with me.”',
    choices: [
      {
        label: '“Nobody goes alone.”',
        tone: 'earnest',
        reply: 'She smiles at you the way she must have smiled before the boat.',
        worldMark: HOTARU_SHORE,
      },
      {
        label: '“What if it’s a trap?”',
        tone: 'challenge',
        reply: '“Then I’ll be very glad you’re with me.”',
        worldMark: HOTARU_SHORE,
      },
      {
        label: 'Take the letter and read it with her.',
        tone: 'kind',
        reply: 'Her hands stop shaking while you read it together.',
        worldMark: HOTARU_SHORE,
      },
    ],
  },
];
