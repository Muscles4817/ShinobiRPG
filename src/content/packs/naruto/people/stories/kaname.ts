import type { ConversationDef } from '../../../../types';

import { KANAME_BELL } from './marks';

/** Kaname’s story, a beat for each stage of closeness (`SenseiWays.story`). */
export const KANAME_STORY: readonly ConversationDef[] = [
  {
    id: 'kaname-stance',
    personId: 'kaname',
    minStage: 1,
    opener:
      'Kaname is standing on one leg in the river shallows, where he has been since dawn. “Join me, if you like,” he says.',
    choices: [
      {
        label: 'Step into the water.',
        tone: 'quiet',
        reply: 'You last about a minute, and he treats it as if it had been an hour.',
      },
      {
        label: '“Why one leg?”',
        tone: 'curious',
        reply: '“Because two is easy, and what is easy teaches you nothing.”',
      },
      {
        label: '“I’ll do it longer than you.”',
        tone: 'challenge',
        reply: '“Good. Begin, then,” he says, and a moment later you fall in.',
      },
    ],
  },
  {
    id: 'kaname-temple',
    personId: 'kaname',
    minStage: 2,
    opener:
      '“The monks of the Fire Temple raised me,” Kaname says. “They taught me how to fall long before they taught me how to strike.”',
    choices: [
      {
        label: '“Why falling first?”',
        tone: 'curious',
        reply: '“Everyone falls. Very few people know how to get up well.”',
      },
      {
        label: '“Do you miss them?”',
        tone: 'kind',
        reply: 'He takes his time answering. “Every morning, when I hear a bell.”',
      },
      {
        label: '“Teach me to fall.”',
        tone: 'earnest',
        reply: 'He does, all afternoon, and you find bruises in places you didn’t know you had.',
      },
    ],
  },
  {
    id: 'kaname-war',
    personId: 'kaname',
    minStage: 3,
    opener:
      '“My village burned in the last war, when I was six,” Kaname says. “A monk carried me out of it, and he did not make it back to the temple.”',
    choices: [
      {
        label: '“I’m sorry.”',
        tone: 'kind',
        reply: '“So was I, for a long time. These days I try to be grateful instead.”',
      },
      {
        label: '“Is that why you protect us so carefully?”',
        tone: 'curious',
        reply: '“Someone carried me once. Now I carry you.”',
      },
      {
        label: 'Sit with him by the river.',
        tone: 'quiet',
        reply: 'Neither of you talks, and you listen to the water instead until the light goes.',
      },
    ],
  },
  {
    id: 'kaname-bell',
    personId: 'kaname',
    minStage: 4,
    opener:
      '“The temple’s great bell has gone silent,” Kaname says. “A letter came saying the monks are in trouble, and I have not been back in years. Will you come with me?”',
    choices: [
      {
        label: '“Of course.”',
        tone: 'earnest',
        reply: '“Thank you,” he says, and bows to you, deeply.',
        worldMark: KANAME_BELL,
      },
      {
        label: '“Are you afraid to go back?”',
        tone: 'curious',
        reply: '“Yes,” he says simply. “That is why I asked you.”',
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
