import type { ConversationDef } from '../../types';

/** Things only particular people say. Mixed in with the generic small talk. */
export const ORIGINAL_CONVERSATIONS: readonly ConversationDef[] = [
  {
    id: 'kaen-fire',
    personId: 'kaen',
    minStage: 0,
    opener:
      'Kaen snaps his fingers and a flame dances on his thumb. "Bet you can’t do that, {you}."',
    choices: [
      {
        label: '“Bet I can beat you anyway.”',
        tone: 'challenge',
        reply: '"Ha! Training ground. Tomorrow. Don’t be late."',
      },
      {
        label: '“That’s actually really cool.”',
        tone: 'praise',
        reply: 'The flame gets noticeably bigger. So does his grin.',
      },
      {
        label: '“Careful, the roof’s still being rebuilt.”',
        tone: 'tease',
        reply: 'He scowls and blows the flame out.',
      },
    ],
  },
  {
    id: 'shiori-grandfather',
    personId: 'shiori',
    minStage: 0,
    opener: 'Shiori smiles at the empty space beside you. "Grandfather says you have a kind face."',
    choices: [
      {
        label: '“Tell him thank you.”',
        tone: 'kind',
        reply: 'She does. She says he bows. You bow back, just in case.',
      },
      {
        label: '“What else does he say?”',
        tone: 'curious',
        reply: 'She tells you. Some of it is about you. You do not sleep well.',
      },
      {
        label: 'Stand quietly and listen.',
        tone: 'quiet',
        reply: 'For a moment you swear you smell incense.',
      },
    ],
  },
  {
    id: 'jin-blade',
    personId: 'jin',
    minStage: 0,
    opener: 'Jin finishes a cut and sheathes his sword in one motion. "You’re in my light."',
    choices: [
      {
        label: '“Draw again. I’ll match you.”',
        tone: 'challenge',
        reply: 'He almost smiles. Almost. "Fine."',
      },
      {
        label: 'Step aside and watch in silence.',
        tone: 'quiet',
        reply: 'He does a hundred more cuts. Afterwards he nods at you.',
      },
      { label: '“Do you ever relax?”', tone: 'joke', reply: '"No," he says, and walks away.' },
    ],
  },
  {
    id: 'kenji-nap',
    personId: 'kenji',
    minStage: 0,
    opener: 'Kenji opens one eye from under the noodle stall awning. "Oh. Hey. Got any snacks?"',
    choices: [
      {
        label: '“Share the shade and I might.”',
        tone: 'joke',
        reply: 'He shuffles over. You split a bun and watch the market.',
      },
      {
        label: '“Shouldn’t you be training?”',
        tone: 'earnest',
        reply: '"Probably," he says, and closes the eye again.',
      },
      {
        label: '“How did you really pass the exam?”',
        tone: 'curious',
        reply: 'He taps his nose and says nothing. Infuriating.',
      },
    ],
  },
  {
    id: 'rin-file',
    personId: 'rin',
    minStage: 0,
    opener: 'Instructor Rin raises an eyebrow. "Read any good files lately, {you}?"',
    choices: [
      {
        label: '“I’m sorry. I had to know.”',
        tone: 'earnest',
        reply: '"I know," she says. "I did the same thing, once."',
      },
      {
        label: '“Only the interesting ones.”',
        tone: 'tease',
        reply: 'She tries very hard not to laugh, and fails.',
      },
      {
        label: '“Thank you for not reporting me.”',
        tone: 'kind',
        reply: '"Make it worth it," she says.',
      },
    ],
  },
  {
    id: 'torokage-lantern',
    personId: 'torokage',
    minStage: 0,
    opener: 'The Tōrokage is watching the lanterns. "Do you know why we light them, young one?"',
    choices: [
      {
        label: '“So the dead can find their way home.”',
        tone: 'earnest',
        reply: '"And so the living remember them," the old man adds.',
      },
      {
        label: '“Tell me?”',
        tone: 'curious',
        reply: 'He tells you the story of the first lantern. It is sadder than you expected.',
      },
      {
        label: '“One day I’ll light the first one of the year.”',
        tone: 'challenge',
        reply: 'He chuckles. "I hope I am around to see it."',
      },
    ],
  },
];
