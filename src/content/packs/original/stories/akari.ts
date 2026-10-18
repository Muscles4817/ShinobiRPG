import type { ConversationDef } from '../../../types';

import { AKARI_BROTHER } from './marks';

/** Akari’s story, a beat for each stage of closeness (`SenseiWays.story`). */
export const AKARI_STORY: readonly ConversationDef[] = [
  {
    id: 'akari-gate-lantern',
    personId: 'akari',
    minStage: 1,
    opener:
      'Akari cups a flame at the gate and the great lantern takes it. “I’ve done this every dusk for years. People notice when a thing is always done, even if they couldn’t tell you why they sleep easier for it.”',
    choices: [
      {
        label: '“Can I try?”',
        tone: 'challenge',
        reply: '“One day, when I’m sure you won’t burn the gate down.”',
      },
      {
        label: '“It’s beautiful.”',
        tone: 'praise',
        reply: 'She tries to look as if she isn’t pleased, and doesn’t manage it.',
      },
      {
        label: '“Do you ever miss a night?”',
        tone: 'curious',
        reply: '“Never, not once. I’d sooner miss my own supper.”',
      },
    ],
  },
  {
    id: 'akari-brother',
    personId: 'akari',
    minStage: 2,
    opener:
      '“The lantern should have been my brother’s,” Akari says. “He was the gifted one, everybody said so. Then he left the village and never once wrote.”',
    choices: [
      {
        label: '“Maybe he’ll come back.”',
        tone: 'kind',
        reply: '“Maybe he will. I keep it lit in case he does.”',
      },
      {
        label: '“His loss. You’re here.”',
        tone: 'praise',
        reply: 'Her eyes go bright for a moment, then hard. “Yes. I’m the one who stayed.”',
      },
      {
        label: '“Why did he go?”',
        tone: 'curious',
        reply:
          '“Because everyone expected him to stay, I think. He never could stand being expected.”',
      },
    ],
  },
  {
    id: 'akari-hands',
    personId: 'akari',
    minStage: 3,
    opener:
      'Akari turns her palms up to show you the old burns, pale and shiny. “I pushed too hard when I was learning. And once I pushed a student too hard, and she quit.”',
    choices: [
      {
        label: '“I won’t quit.”',
        tone: 'earnest',
        reply: '“She told me that too,” Akari says, more softly than you’ve ever heard her.',
      },
      {
        label: '“Push me anyway.”',
        tone: 'challenge',
        reply: '“Be careful what you ask for,” she says, and you can’t tell whether she’s amused.',
      },
      {
        label: 'Take her hand a moment.',
        tone: 'kind',
        reply: 'She lets you, then takes it back, embarrassed. “That’s enough of that.”',
      },
    ],
  },
  {
    id: 'akari-promise',
    personId: 'akari',
    minStage: 4,
    opener:
      '“Promise me one thing,” Akari says. “If I push too hard, you tell me, out loud.” She hesitates. “And come down the river road with me. Someone there is selling fire without matches, and I think it’s my brother.”',
    choices: [
      {
        label: '“I promise.”',
        tone: 'earnest',
        reply:
          '“Good.” She lights the lantern without looking at it, and it burns steadier than you’ve ever seen it.',
        worldMark: AKARI_BROTHER,
      },
      {
        label: '“You’re pushing too hard right now.”',
        tone: 'tease',
        reply: 'She laughs, really laughs. “Noted, thank you.”',
        worldMark: AKARI_BROTHER,
      },
      {
        label: '“You’ll hear it. I’m loud.”',
        tone: 'joke',
        reply: '“That much I do believe,” she says.',
        worldMark: AKARI_BROTHER,
      },
    ],
  },
];
