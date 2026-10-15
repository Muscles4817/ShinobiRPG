import type { ConversationDef } from '../../../../types';

/** Kakashi’s story, a beat for each stage of closeness (`SenseiWays.story`). */
export const KAKASHI_STORY: readonly ConversationDef[] = [
  {
    id: 'kakashi-stone',
    personId: 'kakashi',
    minStage: 1,
    opener:
      'You find Kakashi at the memorial stone at dawn. “I got lost on the road of life,” he says, not turning round.',
    choices: [
      {
        label: '“Who are you visiting?”',
        tone: 'curious',
        reply: '“Friends,” he says. That is all.',
      },
      {
        label: 'Stand beside him.',
        tone: 'quiet',
        reply: 'He lets you. After a while he says, “Thanks.”',
      },
      {
        label: '“Is that why you’re always late?”',
        tone: 'tease',
        reply: 'His eye creases. “Maybe.”',
      },
    ],
  },
  {
    id: 'kakashi-white-fang',
    personId: 'kakashi',
    minStage: 2,
    opener:
      '“My father broke the rules to save his team,” Kakashi says. “The village never forgave him. I followed the rules after that. For a while.”',
    choices: [
      {
        label: '“He did the right thing.”',
        tone: 'earnest',
        reply: '“Someone taught me that,” Kakashi says. “Late.”',
      },
      {
        label: '“What changed?”',
        tone: 'curious',
        reply: '“A friend,” he says, and doesn’t go on.',
      },
      {
        label: '“Rules matter too.”',
        tone: 'challenge',
        reply: '“They do,” he says. “Just not most.”',
      },
    ],
  },
  {
    id: 'kakashi-obito',
    personId: 'kakashi',
    minStage: 3,
    opener:
      'Kakashi touches the scar over his left eye. “This was a gift. From Obito. He gave it to me the day he died. Rin died later. My fault.”',
    choices: [
      {
        label: '“They wouldn’t want you to carry that.”',
        tone: 'kind',
        reply: '“No,” he says. “I carry it anyway.”',
      },
      {
        label: '“Thank you for telling me.”',
        tone: 'earnest',
        reply: 'He nods, and closes his book.',
      },
      { label: 'Say nothing.', tone: 'quiet', reply: 'He seems to prefer it.' },
    ],
  },
  {
    id: 'kakashi-scum',
    personId: 'kakashi',
    minStage: 4,
    opener:
      '“Those who break the rules are scum,” Kakashi says. “But those who abandon their friends are worse than scum. Remember that, if you remember anything I say.”',
    choices: [
      {
        label: '“I’ll remember.”',
        tone: 'earnest',
        reply: '“Good,” he says. “Then I did one thing right.”',
      },
      {
        label: '“You did more than one thing right.”',
        tone: 'kind',
        reply: 'He looks away. You think he’s smiling.',
      },
      { label: '“Even if it costs the mission?”', tone: 'challenge', reply: '“Especially then.”' },
    ],
  },
];
