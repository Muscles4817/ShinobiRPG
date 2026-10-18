import type { ConversationDef } from '../../types';

/** Things only particular people say. Mixed in with the generic small talk. */
export const ORIGINAL_CONVERSATIONS: readonly ConversationDef[] = [
  {
    id: 'kaen-fire',
    personId: 'kaen',
    minStage: 0,
    opener:
      'Kaen snaps his fingers and a flame dances on the end of his thumb, a little lopsided. “Bet you can’t do that, {you}.”',
    choices: [
      {
        label: '“Bet I can beat you anyway.”',
        tone: 'challenge',
        reply: '“Ha! Training ground, tomorrow morning. Don’t you dare be late.”',
      },
      {
        label: '“That’s actually really cool.”',
        tone: 'praise',
        reply:
          'The flame gets noticeably bigger, and Kaen has to shake his hand out before it singes his eyebrows.',
      },
      {
        label: '“Careful, the roof’s still being rebuilt.”',
        tone: 'tease',
        reply: 'He scowls and blows the flame out, and you can smell burnt thumbnail.',
      },
    ],
  },
  {
    id: 'shiori-grandfather',
    personId: 'shiori',
    minStage: 0,
    opener:
      'Shiori smiles at the empty space beside you. “Grandfather says you have a kind face. He doesn’t say that about many people.”',
    choices: [
      {
        label: '“Tell him thank you.”',
        tone: 'kind',
        reply: 'She does, and tells you he bows. You bow back to the empty air, just in case.',
      },
      {
        label: '“What else does he say?”',
        tone: 'curious',
        reply:
          'She tells you cheerfully. Some of it is about you and how you sleep, and that night you don’t sleep well at all.',
      },
      {
        label: 'Stand quietly and listen.',
        tone: 'quiet',
        reply: 'For a moment you could swear you smell incense, though nobody is burning any.',
      },
    ],
  },
  {
    id: 'jin-blade',
    personId: 'jin',
    minStage: 0,
    opener:
      'Jin finishes a cut and sheathes his sword in the same motion. “You’re standing in my light.”',
    choices: [
      {
        label: '“Draw again. I’ll match you.”',
        tone: 'challenge',
        reply:
          'The corner of his mouth moves, which from Jin is a great deal. “Fine. From the top.”',
      },
      {
        label: 'Step aside and watch in silence.',
        tone: 'quiet',
        reply:
          'He does a hundred more cuts without looking at you, and when he’s done he tells you which of them were good, as if you’d asked.',
      },
      {
        label: '“Do you ever relax?”',
        tone: 'joke',
        reply: '“No,” he says, and walks off to find better light.',
      },
    ],
  },
  {
    id: 'kenji-nap',
    personId: 'kenji',
    minStage: 0,
    opener:
      'Kenji opens one eye from under the noodle stall’s awning. “Oh, it’s you. Hey. Got any snacks?”',
    choices: [
      {
        label: '“Share the shade and I might.”',
        tone: 'joke',
        reply:
          'He shuffles over without sitting up. You split a bun between you and watch the market go by until the shade moves.',
      },
      {
        label: '“Shouldn’t you be training?”',
        tone: 'earnest',
        reply: '“Probably,” he says, and closes the eye again.',
      },
      {
        label: '“How did you really pass the exam?”',
        tone: 'curious',
        reply:
          'He taps the side of his nose and won’t tell you, however you ask, and seems to enjoy each attempt more than the last.',
      },
    ],
  },
  {
    id: 'rin-file',
    personId: 'rin',
    minStage: 0,
    opener: 'Instructor Rin raises an eyebrow. “Read any good files lately, {you}?”',
    choices: [
      {
        label: '“I’m sorry. I had to know.”',
        tone: 'earnest',
        reply: '“I know you did,” she says. “I did the same thing once, at your age.”',
      },
      {
        label: '“Only the interesting ones.”',
        tone: 'tease',
        reply: 'She tries very hard not to laugh and fails, then pretends it was a cough.',
      },
      {
        label: '“Thank you for not reporting me.”',
        tone: 'kind',
        reply: '“Then make it worth my while,” she says.',
      },
    ],
  },
  {
    id: 'torokage-lantern',
    personId: 'torokage',
    minStage: 0,
    opener:
      'The Tōrokage is watching the lanterns being lit along the street. “Do you know why we light them, young one?”',
    choices: [
      {
        label: '“So the dead can find their way home.”',
        tone: 'earnest',
        reply: '“Yes, and so the living remember to wait for them,” the old man says.',
      },
      {
        label: '“Will you tell me?”',
        tone: 'curious',
        reply:
          'He tells you the story of the first lantern, slowly, the way it was told to him, and it is sadder than you expected.',
      },
      {
        label: '“One day I’ll light the first one of the year.”',
        tone: 'challenge',
        reply: 'He chuckles. “I hope I’m still around to see you do it.”',
      },
    ],
  },
  {
    id: 'yomi-grave',
    personId: 'yomi',
    minStage: 0,
    opener:
      'Yomi is looking past you. “There is a grave on the hill with no lantern. Someone is waiting there, and has been for a long while.”',
    choices: [
      {
        label: '“I’ll light one for them tonight.”',
        tone: 'kind',
        reply:
          'She smiles at the empty air beside you. “They heard you,” she says, “and so did I.”',
        favour: 'yomi-grave-lantern',
      },
      {
        label: '“Who is it?”',
        tone: 'curious',
        reply: '“Nobody remembers,” she says, “and that is the whole of the trouble.”',
      },
      {
        label: '“That’s a bit creepy.”',
        tone: 'tease',
        reply: 'She tilts her head, as if someone you can’t see has just laughed at you.',
      },
    ],
  },
];
