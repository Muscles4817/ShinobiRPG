import type { ConversationDef } from '../../../types';

import { GORAN_OLD_DEBT } from './marks';

/** Goran’s story, a beat for each stage of closeness (`SenseiWays.story`). */
export const GORAN_STORY: readonly ConversationDef[] = [
  {
    id: 'goran-scar',
    personId: 'goran',
    minStage: 1,
    opener:
      'Gōran rolls up his sleeve before you can ask. “Kurobane. The Black Wing of the pass. His blade, my arm. My arm won.”',
    choices: [
      {
        label: '“Did it hurt?”',
        tone: 'curious',
        reply: '“Like nothing else. Worth it.” He grins.',
      },
      {
        label: '“I’d have dodged.”',
        tone: 'tease',
        reply: 'He laughs until the bench shakes. “You’d have tried.”',
      },
      {
        label: 'Look at it a long while.',
        tone: 'quiet',
        reply: 'He lets you. “Scars are lessons you can’t forget,” he says.',
      },
    ],
  },
  {
    id: 'goran-old-team',
    personId: 'goran',
    minStage: 2,
    opener:
      '“There were three of us,” Gōran says, watching the stairs. “Sae, who runs the teahouse now. Daichi. And me, the loud one.”',
    choices: [
      {
        label: '“What happened to Daichi?”',
        tone: 'curious',
        reply: 'He doesn’t answer. He does another set of stairs instead.',
      },
      {
        label: '“You’re still the loud one.”',
        tone: 'joke',
        reply: '“Somebody has to be,” he says, and almost smiles.',
      },
      {
        label: '“Tell me about them.”',
        tone: 'earnest',
        reply: 'He talks until the lanterns are lit. He leaves one name out.',
      },
    ],
  },
  {
    id: 'goran-daichi',
    personId: 'goran',
    minStage: 3,
    opener:
      '“Daichi died on the pass,” Gōran says. “Kurobane’s men. I was a step too slow. That’s why I make you run the stairs.”',
    choices: [
      { label: '“It wasn’t your fault.”', tone: 'kind', reply: '“Maybe. I still count the step.”' },
      {
        label: '“Then I’ll be fast enough.”',
        tone: 'earnest',
        reply: 'He puts a heavy hand on your head. “That’s the idea.”',
      },
      {
        label: 'Say nothing, and stay.',
        tone: 'quiet',
        reply: 'You sit with him while the light goes. He seems glad of it.',
      },
    ],
  },
  {
    id: 'goran-kurobane',
    personId: 'goran',
    minStage: 4,
    opener:
      '“Kurobane is back on the pass,” Gōran says quietly. “Traders talk. One day I’m going up there. I’d like you with me when I do.”',
    choices: [
      {
        label: '“I’ll be there.”',
        tone: 'earnest',
        reply: '“I know,” he says. “That’s why I asked.”',
        worldMark: GORAN_OLD_DEBT,
      },
      {
        label: '“You can’t go alone. You’d get lost.”',
        tone: 'tease',
        reply: 'He snorts. “Fine. You can carry the rice.”',
        worldMark: GORAN_OLD_DEBT,
      },
      {
        label: '“Is this revenge?”',
        tone: 'challenge',
        reply: '“It’s a debt,” he says. “I haven’t decided how to pay it.”',
        worldMark: GORAN_OLD_DEBT,
      },
    ],
  },
];
