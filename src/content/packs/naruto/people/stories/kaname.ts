import type { ConversationDef } from '../../../../types';

import { KANAME_BELL } from './marks';

/** Kaname’s story, a beat for each stage of closeness (`SenseiWays.story`). */
export const KANAME_STORY: readonly ConversationDef[] = [
  {
    id: 'kaname-stance',
    personId: 'kaname',
    minStage: 1,
    opener:
      'Kaname is standing on one leg in the river shallows. He has been there since dawn. “Join me,” he says.',
    choices: [
      {
        label: 'Step into the water.',
        tone: 'quiet',
        reply: 'You last a minute. He nods as if it were an hour.',
      },
      {
        label: '“Why one leg?”',
        tone: 'curious',
        reply: '“Because two is easy. What is easy teaches nothing.”',
      },
      {
        label: '“I’ll do it longer than you.”',
        tone: 'challenge',
        reply: 'He smiles. “Good. Begin.” You fall in.',
      },
    ],
  },
  {
    id: 'kaname-temple',
    personId: 'kaname',
    minStage: 2,
    opener:
      '“The monks of the Fire Temple raised me,” Kaname says. “They taught me to fall before they taught me to strike.”',
    choices: [
      {
        label: '“Why falling first?”',
        tone: 'curious',
        reply: '“Everyone falls. Few get up well.”',
      },
      {
        label: '“Do you miss them?”',
        tone: 'kind',
        reply: 'A long pause. “Every morning, when I hear a bell.”',
      },
      {
        label: '“Teach me to fall.”',
        tone: 'earnest',
        reply: 'He does, all afternoon. You bruise in new places.',
      },
    ],
  },
  {
    id: 'kaname-war',
    personId: 'kaname',
    minStage: 3,
    opener:
      '“My village burned in the last war,” Kaname says. “I was six. A monk carried me out. He did not make it back to the temple.”',
    choices: [
      {
        label: '“I’m sorry.”',
        tone: 'kind',
        reply: '“So was I, for a long time. Now I am grateful instead.”',
      },
      {
        label: '“Is that why you protect us so carefully?”',
        tone: 'curious',
        reply: '“Someone carried me. I carry you.”',
      },
      {
        label: 'Sit with him by the river.',
        tone: 'quiet',
        reply: 'The water talks for both of you.',
      },
    ],
  },
  {
    id: 'kaname-bell',
    personId: 'kaname',
    minStage: 4,
    opener:
      '“The temple’s great bell has gone silent,” Kaname says. “A letter came. Something is wrong there. I have not been back in years. Will you come?”',
    choices: [
      {
        label: '“Of course.”',
        tone: 'earnest',
        reply: '“Thank you,” he says, and bows, deeply.',
        worldMark: KANAME_BELL,
      },
      {
        label: '“Are you afraid to go back?”',
        tone: 'curious',
        reply: '“Yes,” he says simply. “That is why I asked.”',
        worldMark: KANAME_BELL,
      },
      {
        label: '“I’ll carry you this time.”',
        tone: 'kind',
        reply: 'He laughs, surprised, and his eyes are wet.',
        worldMark: KANAME_BELL,
      },
    ],
  },
];
