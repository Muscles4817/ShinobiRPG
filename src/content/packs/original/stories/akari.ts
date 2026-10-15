import type { ConversationDef } from '../../../types';

/** Akari’s story, a beat for each stage of closeness (`SenseiWays.story`). */
export const AKARI_STORY: readonly ConversationDef[] = [
  {
    id: 'akari-gate-lantern',
    personId: 'akari',
    minStage: 1,
    opener:
      'Akari cups a flame at the gate and the great lantern takes it. “Every dusk, for years. People notice when a thing is always done.”',
    choices: [
      {
        label: '“Can I try?”',
        tone: 'challenge',
        reply: '“One day. When you won’t burn the gate down.”',
      },
      {
        label: '“It’s beautiful.”',
        tone: 'praise',
        reply: 'She pretends not to be pleased. She is.',
      },
      {
        label: '“Do you ever miss a night?”',
        tone: 'curious',
        reply: '“Never,” she says. “Not once.”',
      },
    ],
  },
  {
    id: 'akari-brother',
    personId: 'akari',
    minStage: 2,
    opener:
      '“The lantern should have been my brother’s,” Akari says. “He was the gifted one. He left the village and never wrote.”',
    choices: [
      { label: '“Maybe he’ll come back.”', tone: 'kind', reply: '“Maybe. I keep it lit in case.”' },
      {
        label: '“His loss. You’re here.”',
        tone: 'praise',
        reply: 'Her eyes go bright for a moment, then hard. “Yes. I am.”',
      },
      {
        label: '“Why did he go?”',
        tone: 'curious',
        reply: '“Because everyone expected him to stay,” she says.',
      },
    ],
  },
  {
    id: 'akari-hands',
    personId: 'akari',
    minStage: 3,
    opener:
      'Akari turns her palms up: old burns, pale and shiny. “I pushed too hard learning. I pushed a student too hard once, too. She quit.”',
    choices: [
      {
        label: '“I won’t quit.”',
        tone: 'earnest',
        reply: '“She said that too,” Akari says, softer than you’ve heard her.',
      },
      {
        label: '“Push me anyway.”',
        tone: 'challenge',
        reply: 'A flicker of a smile. “Careful what you ask for.”',
      },
      {
        label: 'Take her hand a moment.',
        tone: 'kind',
        reply: 'She lets you, then takes it back, embarrassed. “Enough.”',
      },
    ],
  },
  {
    id: 'akari-promise',
    personId: 'akari',
    minStage: 4,
    opener:
      '“Promise me something,” Akari says. “If I push too hard, you tell me. Out loud. I don’t always hear it otherwise.”',
    choices: [
      {
        label: '“I promise.”',
        tone: 'earnest',
        reply: '“Good.” She lights the lantern without looking. It burns steadier than ever.',
      },
      {
        label: '“You’re pushing too hard right now.”',
        tone: 'tease',
        reply: 'She laughs, a real one. “Noted.”',
      },
      {
        label: '“You’ll hear it. I’m loud.”',
        tone: 'joke',
        reply: '“That,” she says, “I believe.”',
      },
    ],
  },
];
