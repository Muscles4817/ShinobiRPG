import type { ConversationDef } from '../../../types';

import { GORAN_OLD_DEBT } from './marks';

/** Goran’s story, a beat for each stage of closeness (`SenseiWays.story`). */
export const GORAN_STORY: readonly ConversationDef[] = [
  {
    id: 'goran-scar',
    personId: 'goran',
    minStage: 1,
    opener:
      'Gōran rolls up his sleeve before you can ask, and there is a long white scar from the elbow to the wrist. “Kurobane, the Black Wing of the pass. His blade, my arm. We argued about it for a while, and the arm’s still here.”',
    choices: [
      {
        label: '“Did it hurt?”',
        tone: 'curious',
        reply: '“More than anything before or since. I’d do it again, mind you.”',
      },
      {
        label: '“I’d have dodged.”',
        tone: 'tease',
        reply:
          'He laughs until the bench shakes. “You’d have tried, and I’d have been carrying you home.”',
      },
      {
        label: 'Look at it a long while.',
        tone: 'quiet',
        reply:
          'He lets you look as long as you like before he rolls the sleeve back down. “You don’t forget a lesson that leaves a mark. That’s all I’ll say for it.”',
      },
    ],
  },
  {
    id: 'goran-old-team',
    personId: 'goran',
    minStage: 2,
    opener:
      '“There were three of us,” Gōran says, watching you on the stairs. “Sae, who runs the teahouse now, and Daichi, and me. I was the loud one, if you can believe it.”',
    choices: [
      {
        label: '“What happened to Daichi?”',
        tone: 'curious',
        reply:
          'He doesn’t answer. He runs the stairs himself instead, up and down twice without stopping.',
      },
      {
        label: '“You’re still the loud one.”',
        tone: 'joke',
        reply: '“Somebody on a team has to be,” he says, pleased with you in spite of himself.',
      },
      {
        label: '“Tell me about them.”',
        tone: 'earnest',
        reply:
          'He talks until the lanterns are lit, mostly about Sae and the night the three of them got lost in their own village, and you notice he hardly says Daichi’s name.',
      },
    ],
  },
  {
    id: 'goran-daichi',
    personId: 'goran',
    minStage: 3,
    opener:
      '“Daichi died on the pass,” Gōran says. “Kurobane’s men caught us in the rocks, and I was a step too slow getting to him. That’s why I make you run the stairs, if you ever wondered.”',
    choices: [
      {
        label: '“It wasn’t your fault.”',
        tone: 'kind',
        reply: '“Maybe not. I still count that step, though, and I expect I always will.”',
      },
      {
        label: '“Then I’ll be fast enough.”',
        tone: 'earnest',
        reply: 'He puts a heavy hand on your head. “That’s the whole idea, yes.”',
      },
      {
        label: 'Say nothing, and stay.',
        tone: 'quiet',
        reply:
          'You sit with him while the light goes, and when you get up he thanks you gruffly, as if it costs him.',
      },
    ],
  },
  {
    id: 'goran-kurobane',
    personId: 'goran',
    minStage: 4,
    opener:
      '“Kurobane is back on the pass,” Gōran says quietly. “The traders talk about it at the teahouse. One of these days I’m going up there, and I’d like you with me when I do.”',
    choices: [
      {
        label: '“I’ll be there.”',
        tone: 'earnest',
        reply: '“I know you will. Why do you think I asked you first?”',
        worldMark: GORAN_OLD_DEBT,
      },
      {
        label: '“You can’t go alone. You’d get lost.”',
        tone: 'tease',
        reply: 'He snorts. “Fine, fine. You can carry the rice, then.”',
        worldMark: GORAN_OLD_DEBT,
      },
      {
        label: '“Is this revenge?”',
        tone: 'challenge',
        reply: '“It’s a debt. I just haven’t decided yet how I mean to pay it.”',
        worldMark: GORAN_OLD_DEBT,
      },
    ],
  },
];
