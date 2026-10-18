import type { ConversationDef } from '../../../../types';

import { ANKO_DEN } from './marks';

/** Anko’s story, a beat for each stage of closeness (`SenseiWays.story`). */
export const ANKO_STORY: readonly ConversationDef[] = [
  {
    id: 'anko-dango',
    personId: 'anko',
    minStage: 1,
    opener:
      'Anko is on her fourth stick of dango. “Sweet things,” she says through a mouthful, “because the rest of this job sure isn’t.”',
    choices: [
      {
        label: 'Take a stick.',
        tone: 'joke',
        reply: 'She lets you, only just. “You owe me one now, and I always collect.”',
      },
      {
        label: '“Is the job that bad?”',
        tone: 'curious',
        reply: '“Worse,” she says cheerfully. “You’re going to love it.”',
      },
      {
        label: '“You’ll rot your teeth.”',
        tone: 'tease',
        reply: 'She bares them at you. They’re perfect, and slightly alarming.',
      },
    ],
  },
  {
    id: 'anko-forest',
    personId: 'anko',
    minStage: 2,
    opener:
      '“Training Ground Forty-Four,” Anko says. “The Forest of Death. I’m the only one round here who walks in there for fun.”',
    choices: [
      {
        label: '“Take me with you.”',
        tone: 'challenge',
        reply: '“Ha! Sure, if you bring a bandage. Bring several.”',
      },
      {
        label: '“Why for fun?”',
        tone: 'curious',
        reply:
          '“Because it’s honest. Everything in there wants to eat you, and it doesn’t pretend otherwise.”',
      },
      {
        label: '“No thank you.”',
        tone: 'joke',
        reply: '“Smart. Boring, but smart,” she says.',
      },
    ],
  },
  {
    id: 'anko-mark',
    personId: 'anko',
    minStage: 3,
    opener:
      'Anko touches the mark on her neck. “My teacher left me that. Orochimaru. He used me and threw me away, and it still burns when he’s anywhere near.”',
    choices: [
      {
        label: '“He was wrong to.”',
        tone: 'kind',
        reply: '“I know he was. It took me years to actually believe it, though.”',
      },
      {
        label: '“I’d have stopped him.”',
        tone: 'earnest',
        reply: 'She laughs, not unkindly. “Grow a bit first, would you?”',
      },
      {
        label: 'Stay close a while.',
        tone: 'quiet',
        reply: 'She doesn’t send you away, and from Anko that says a lot.',
      },
    ],
  },
  {
    id: 'anko-used',
    personId: 'anko',
    minStage: 4,
    opener:
      '“Listen,” Anko says, deadly serious for once. “Never let anyone use you. Not a teacher, not me, not the village.” She looks away. “There’s an old den of his past Otafuku, and I’m going to burn it out. Promise me, and then come with me.”',
    choices: [
      {
        label: '“I promise.”',
        tone: 'earnest',
        reply: '“Good kid,” she says, and buys you dango on the way.',
        worldMark: ANKO_DEN,
      },
      {
        label: '“Not even you?”',
        tone: 'tease',
        reply: '“Especially not me,” she says, showing all her teeth.',
        worldMark: ANKO_DEN,
      },
      {
        label: '“Nobody uses you either.”',
        tone: 'kind',
        reply: 'She stares at you, and then ruffles your hair, hard.',
        worldMark: ANKO_DEN,
      },
    ],
  },
];
