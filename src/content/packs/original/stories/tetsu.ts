import type { ConversationDef } from '../../../types';

/** Tetsu’s story, a beat for each stage of closeness (`SenseiWays.story`). */
export const TETSU_STORY: readonly ConversationDef[] = [
  {
    id: 'tetsu-forge',
    personId: 'tetsu',
    minStage: 1,
    opener: 'Tetsu hands you a hammer and points at the anvil. That is the whole conversation.',
    choices: [
      {
        label: 'Strike, carefully.',
        tone: 'quiet',
        reply: 'He watches. Nods once. It feels like a medal.',
      },
      {
        label: '“Show me first.”',
        tone: 'curious',
        reply: 'He does. Every blow lands in the same place. You try to.',
      },
      {
        label: 'Strike as hard as you can.',
        tone: 'challenge',
        reply: 'The anvil rings. He winces, then almost laughs.',
      },
    ],
  },
  {
    id: 'tetsu-master',
    personId: 'tetsu',
    minStage: 2,
    opener:
      'Tetsu sets a cracked blade on the bench. “First one I made,” he says, which is more words than usual. “My master broke it. Rightly.”',
    choices: [
      {
        label: '“Why did he break it?”',
        tone: 'curious',
        reply: '“It would have broken in a fight. Better in the forge.”',
      },
      { label: '“You kept it.”', tone: 'kind', reply: '“To remember,” he says, and puts it away.' },
      {
        label: '“Would you break mine?”',
        tone: 'challenge',
        reply: '“If it needed it.” He means it. It is a kindness.',
      },
    ],
  },
  {
    id: 'tetsu-blade',
    personId: 'tetsu',
    minStage: 3,
    opener:
      '“I sold a blade to a man who became our enemy,” Tetsu says. “It killed a friend of mine. I made it well.”',
    choices: [
      {
        label: '“You couldn’t have known.”',
        tone: 'kind',
        reply: '“A smith should know,” he says. “Now I ask who.”',
      },
      {
        label: '“Is that why you teach?”',
        tone: 'curious',
        reply: 'He nods. “So the blades go to the right hands.”',
      },
      {
        label: 'Stand with him at the forge.',
        tone: 'quiet',
        reply: 'Neither of you speaks. The fire speaks enough.',
      },
    ],
  },
  {
    id: 'tetsu-memory',
    personId: 'tetsu',
    minStage: 4,
    opener: '“A blade remembers who made it,” Tetsu says, and looks at you. “So does a student.”',
    choices: [
      {
        label: '“I’ll remember.”',
        tone: 'earnest',
        reply: 'He grips your shoulder, once, hard. Then back to work.',
      },
      {
        label: '“Is that a compliment?”',
        tone: 'tease',
        reply: '“Yes,” he says. You will think about it for days.',
      },
      { label: 'Bow.', tone: 'quiet', reply: 'He bows back. He has never bowed to you before.' },
    ],
  },
];
