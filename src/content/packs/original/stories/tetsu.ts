import type { ConversationDef } from '../../../types';

import { TETSU_BLADE } from './marks';

/** Tetsu’s story, a beat for each stage of closeness (`SenseiWays.story`). */
export const TETSU_STORY: readonly ConversationDef[] = [
  {
    id: 'tetsu-forge',
    personId: 'tetsu',
    minStage: 1,
    opener:
      'Tetsu hands you a hammer and points at the anvil, and that is the whole of the conversation.',
    choices: [
      {
        label: 'Strike, carefully.',
        tone: 'quiet',
        reply:
          'He watches the blow land and gives you one short nod, which from Tetsu feels like a medal.',
      },
      {
        label: '“Show me first.”',
        tone: 'curious',
        reply:
          'He does. Every blow lands in exactly the same place, and you spend the next hour trying to make yours do the same.',
      },
      {
        label: 'Strike as hard as you can.',
        tone: 'challenge',
        reply: 'The anvil rings, and he winces, and then very nearly laughs.',
      },
    ],
  },
  {
    id: 'tetsu-master',
    personId: 'tetsu',
    minStage: 2,
    opener:
      'Tetsu sets a cracked blade on the bench. “First one I made. My master broke it, and he was right to.” It is more than he usually says in a morning.',
    choices: [
      {
        label: '“Why did he break it?”',
        tone: 'curious',
        reply: '“It would have broken in a fight. Better it broke in the forge.”',
      },
      { label: '“You kept it.”', tone: 'kind', reply: '“To remember,” he says, and puts it away.' },
      {
        label: '“Would you break mine?”',
        tone: 'challenge',
        reply:
          '“If it needed it.” He means it, and you understand after a moment that it’s meant kindly.',
      },
    ],
  },
  {
    id: 'tetsu-blade',
    personId: 'tetsu',
    minStage: 3,
    opener:
      '“I sold a blade to a man who became our enemy,” Tetsu says. “It killed a friend of mine. I’d made it well.”',
    choices: [
      {
        label: '“You couldn’t have known.”',
        tone: 'kind',
        reply: '“A smith should know. Now I ask who it’s for, every time.”',
      },
      {
        label: '“Is that why you teach?”',
        tone: 'curious',
        reply: '“Yes. So the blades end up in the right hands.”',
      },
      {
        label: 'Stand with him at the forge.',
        tone: 'quiet',
        reply:
          'Neither of you speaks. You stand there until the coals settle, and he doesn’t send you away.',
      },
    ],
  },
  {
    id: 'tetsu-memory',
    personId: 'tetsu',
    minStage: 4,
    opener:
      '“A blade remembers who made it,” Tetsu says, looking at you. “So does a student.” He works on in silence before he adds, “My blade is on the pass, the one I sold. I’m going up for it.”',
    choices: [
      {
        label: '“I’ll remember.”',
        tone: 'earnest',
        reply: 'He grips your shoulder once, hard, and goes back to work.',
        worldMark: TETSU_BLADE,
      },
      {
        label: '“Is that a compliment?”',
        tone: 'tease',
        reply: '“Yes,” he says, and you go on thinking about it for days.',
        worldMark: TETSU_BLADE,
      },
      {
        label: 'Bow.',
        tone: 'quiet',
        reply: 'He bows back, which he has never done for you before.',
        worldMark: TETSU_BLADE,
      },
    ],
  },
];
