import type { ConversationDef } from '../../../../types';

import { HOTARU_SHORE } from './marks';

/** Hotaru’s story, a beat for each stage of closeness (`SenseiWays.story`). */
export const HOTARU_STORY: readonly ConversationDef[] = [
  {
    id: 'hotaru-water',
    personId: 'hotaru',
    minStage: 1,
    opener:
      'Hotaru lifts a ribbon of river water and ties it in a knot in the air. “Water remembers its shape,” she says. “So do people.”',
    choices: [
      {
        label: '“Teach me that.”',
        tone: 'earnest',
        reply: '“Tomorrow,” she says. “Bring a towel.”',
      },
      {
        label: '“It’s beautiful.”',
        tone: 'praise',
        reply: 'She lets the knot fall back into the river, pleased.',
      },
      {
        label: 'Try it yourself.',
        tone: 'challenge',
        reply: 'You soak your sleeves. She laughs, not unkindly.',
      },
    ],
  },
  {
    id: 'hotaru-boat',
    personId: 'hotaru',
    minStage: 2,
    opener:
      '“I came here hidden in a fishing boat,” Hotaru says, “under the nets. The Land of Waves was a hard place to be a child who could do this.”',
    choices: [
      {
        label: '“Why was it hard?”',
        tone: 'curious',
        reply: '“People who can do strange things get taken,” she says. “Or sold.”',
      },
      { label: '“I’m glad you came.”', tone: 'kind', reply: '“So am I,” she says. “Most days.”' },
      {
        label: 'Listen.',
        tone: 'quiet',
        reply: 'She tells you about the smell of the nets in the dark.',
      },
    ],
  },
  {
    id: 'hotaru-brother',
    personId: 'hotaru',
    minStage: 3,
    opener:
      '“There was room under the nets for one,” Hotaru says. “My little brother pushed me in. I never saw him again. That is why nobody on my team gets left.”',
    choices: [
      { label: '“He wanted you to live.”', tone: 'kind', reply: '“I know. I wish I had argued.”' },
      {
        label: '“Have you looked for him?”',
        tone: 'curious',
        reply: '“Every letter I send to the Waves,” she says. “No answers.”',
      },
      {
        label: '“Nobody gets left. I promise.”',
        tone: 'earnest',
        reply: 'She holds your eyes a long moment, then nods.',
      },
    ],
  },
  {
    id: 'hotaru-shore',
    personId: 'hotaru',
    minStage: 4,
    opener:
      '“A letter came from the Waves at last,” Hotaru says, turning it over and over. “Someone on the old shore knows my name. I have to go. Will you come with me?”',
    choices: [
      {
        label: '“Nobody goes alone.”',
        tone: 'earnest',
        reply: 'She smiles, the way she must have before the boat.',
        worldMark: HOTARU_SHORE,
      },
      {
        label: '“What if it’s a trap?”',
        tone: 'challenge',
        reply: '“Then I’m glad you’re with me,” she says.',
        worldMark: HOTARU_SHORE,
      },
      {
        label: 'Take the letter and read it with her.',
        tone: 'kind',
        reply: 'Her hands stop shaking while you read.',
        worldMark: HOTARU_SHORE,
      },
    ],
  },
];
