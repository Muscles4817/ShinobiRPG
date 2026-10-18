import type { ConversationDef } from '../../../../types';

/** Kakashi’s story, a beat for each stage of closeness (`SenseiWays.story`). */
export const KAKASHI_STORY: readonly ConversationDef[] = [
  {
    id: 'kakashi-stone',
    personId: 'kakashi',
    minStage: 1,
    opener:
      'You find Kakashi at the memorial stone at dawn, hands in his pockets, reading the names. “I got lost on the road of life,” he says without turning round.',
    choices: [
      {
        label: '“Who are you visiting?”',
        tone: 'curious',
        reply: '“Friends,” he says, and doesn’t name any of them.',
      },
      {
        label: 'Stand beside him.',
        tone: 'quiet',
        reply:
          'He lets you, and after a while he says thanks, without looking away from the stone.',
      },
      {
        label: '“Is that why you’re always late?”',
        tone: 'tease',
        reply: 'His one visible eye creases. “Maybe. Don’t tell anyone, it spoils the mystery.”',
      },
    ],
  },
  {
    id: 'kakashi-white-fang',
    personId: 'kakashi',
    minStage: 2,
    opener:
      '“My father broke the rules to save his team,” Kakashi says, “and the village never forgave him for it. So I followed the rules after that. For a while, anyway.”',
    choices: [
      {
        label: '“He did the right thing.”',
        tone: 'earnest',
        reply: '“Someone had to teach me that. They taught me late, but they did teach me.”',
      },
      {
        label: '“What changed?”',
        tone: 'curious',
        reply: '“A friend,” he says, and turns a page of his book instead of going on.',
      },
      {
        label: '“Rules matter too.”',
        tone: 'challenge',
        reply: '“They do. Just not as much as most people think they do.”',
      },
    ],
  },
  {
    id: 'kakashi-obito',
    personId: 'kakashi',
    minStage: 3,
    opener:
      'Kakashi touches the scar over his left eye. “This was a gift from Obito, the day he died. Rin died later, and that one was my fault.”',
    choices: [
      {
        label: '“They wouldn’t want you to carry that.”',
        tone: 'kind',
        reply: '“No, they wouldn’t,” he says. “I carry it anyway.”',
      },
      {
        label: '“Thank you for telling me.”',
        tone: 'earnest',
        reply: 'He closes his book, which you have never seen him do halfway through a chapter.',
      },
      {
        label: 'Say nothing.',
        tone: 'quiet',
        reply: 'You stay quiet, and he seems to prefer it that way.',
      },
    ],
  },
  {
    id: 'kakashi-scum',
    personId: 'kakashi',
    minStage: 4,
    opener:
      '“Those who break the rules are scum,” Kakashi says. “But those who abandon their friends are worse than scum. If you remember anything I ever tell you, remember that.”',
    choices: [
      {
        label: '“I’ll remember.”',
        tone: 'earnest',
        reply: '“Good. Then I’ve got at least one thing right.”',
      },
      {
        label: '“You did more than one thing right.”',
        tone: 'kind',
        reply: 'He looks away, but from the way the mask moves you think he’s smiling.',
      },
      {
        label: '“Even if it costs the mission?”',
        tone: 'challenge',
        reply: '“Especially then. That’s the only time it counts.”',
      },
    ],
  },
];
