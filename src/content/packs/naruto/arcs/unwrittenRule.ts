import type { ArcDef, MissionDef } from '@/systems/missions';

/**
 * The Unwritten Rule: Ibiki Morino sets a test whose stated rules are not the test. An
 * interview with a last question you may refuse; a sealed message carried under three orders,
 * one of which you must break to save someone. What he grades is what you did when the rules
 * and your comrades pulled different ways.
 */

const IBIKI = 'Ibiki Morino';

export const INTERVIEW: MissionDef = {
  id: 'arc-ibiki-interview',
  title: 'The Interview',
  rank: 'D',
  client: IBIKI,
  summary: 'Ibiki Morino has asked to see you, alone, in a room with one chair.',
  slots: 2,
  energyCost: 15,
  reward: { ryo: 80, reputation: 3 },
  minMissionsCompleted: 4,
  stages: [
    {
      kind: 'narrative',
      text: 'The room holds one chair and one lamp, and Ibiki. He asks questions for an hour, some with no answers and some you are sure he already knows.',
    },
    {
      kind: 'decision',
      text: '“One more,” he says. “Get it wrong and you carry no message for me, now or ever. Or walk out, and nothing is written down.”',
      options: [
        {
          label: 'Take the question',
          tone: 'earnest',
          reply: 'Ibiki studies you before he speaks. “That was the question,” he says.',
          effects: [{ kind: 'world', mark: 'ibiki-took-it' }],
          ledger: 'Took Ibiki’s last question without knowing it.',
        },
        {
          label: 'Ask what kind of question',
          tone: 'curious',
          reply:
            '“The kind you take or you don’t,” he says. You take it, and he writes a line in his book.',
          effects: [{ kind: 'world', mark: 'ibiki-took-it' }],
          ledger: 'Asked, then took Ibiki’s last question.',
        },
        {
          label: 'Walk out',
          tone: 'quiet',
          reply: 'At the door he says, without turning round, “Come back tomorrow anyway.”',
          effects: [{ kind: 'world', mark: 'ibiki-walked' }],
          ledger: 'Walked out of Ibiki’s interview.',
        },
      ],
    },
    {
      kind: 'ending',
      endings: [
        {
          text: '“Tomorrow you carry a sealed message to the Fire Temple,” Ibiki says. “Three orders. Don’t open it. Don’t leave the road. Don’t let it out of your hands.”',
        },
      ],
    },
  ],
};

export const SEALED_MESSAGE: MissionDef = {
  id: 'arc-ibiki-sealed-message',
  title: 'The Sealed Message',
  rank: 'C',
  client: IBIKI,
  summary: 'Carry a sealed message to the Fire Temple under three orders, and break none of them.',
  slots: 1,
  energyCost: 30,
  reward: { ryo: 500, reputation: 5 },
  minMissionsCompleted: 4,
  stages: [
    {
      kind: 'leg',
      text: 'Out of the gate with the message in your vest.',
      days: 1,
      region: 'forest-track',
    },
    {
      kind: 'decision',
      text: 'On the forest road masked men burst out of the trees, seize a pilgrim boy walking ahead of you, and drag him off the road into the forest. “The message,” one calls back, “or the boy.”',
      options: [
        {
          label: 'Leave the road and go after them',
          tone: 'kind',
          reply: 'You go off the road at a run, the message still in your vest.',
          effects: [
            { kind: 'mark', mark: 'left-road' },
            { kind: 'world', mark: 'ibiki-left-road' },
          ],
          ledger: 'Broke an order and left the road to go after them.',
        },
        {
          label: 'Hold up the message and offer it',
          tone: 'earnest',
          reply:
            'One of them takes it from your hand and throws their hostage back to you, laughing.',
          effects: [
            { kind: 'mark', mark: 'gave-message' },
            { kind: 'world', mark: 'ibiki-gave-message' },
          ],
          ledger: 'Let the message out of your hands to buy them back.',
        },
        {
          label: 'Keep to the road, as ordered',
          tone: 'quiet',
          reply: 'You walk on, and behind you the shouting stops, which is worse.',
          effects: [{ kind: 'world', mark: 'ibiki-kept-road' }],
          ledger: 'Kept to the road as ordered, and left them behind.',
        },
      ],
    },
    {
      when: { has: 'left-road' },
      kind: 'encounter',
      template: 'bandit-camp',
      job: 'retrieve',
      text: 'In a clearing two masked men stand over their captive, oddly relaxed for kidnappers.',
      enemyIds: ['bandit-thug', 'bandit-thug'],
      canFlee: false,
      talkable: false,
      flavour: {
        terrain: 'A clearing a stone’s throw from the road, as if they wanted to be found.',
      },
    },
    {
      when: { lacks: 'gave-message' },
      kind: 'decision',
      text: 'By the fire that night, the message sits in your lap. Its seal is a plain one, easy to lift and press back.',
      options: [
        {
          label: 'Open it',
          tone: 'curious',
          reply: 'Inside, in Ibiki’s square hand: “Close it.”',
          effects: [{ kind: 'world', mark: 'ibiki-opened' }],
          ledger: 'Opened the message, which said to close it.',
        },
        {
          label: 'Leave it sealed',
          tone: 'quiet',
          reply: 'You sleep with it under your head.',
          ledger: 'Left the message sealed.',
        },
      ],
    },
    { kind: 'leg', text: 'Up the pilgrim road to the temple.', days: 1, region: 'mountain-pass' },
    {
      kind: 'ending',
      endings: [
        {
          when: { has: 'left-road' },
          text: 'Chiriku breaks the seal and reads it, and laughs out loud. Behind you two familiar chūnin limp up the road, bruised and with no masks, and you recognise Izumo and Kotetsu, who have clearly had a long day.',
        },
        {
          when: { has: 'gave-message' },
          text: 'You reach the temple with nothing to hand over. Chiriku hears you out without a word and writes a short letter of his own to Ibiki.',
        },
        {
          text: 'Chiriku breaks the seal and reads it without comment. He gives you tea and a bed for the night, and in the morning a look you can’t read.',
        },
      ],
    },
    { kind: 'leg', text: 'Home down the pilgrim road and through the forest.', days: 2 },
  ],
};

export const VERDICT: MissionDef = {
  id: 'arc-ibiki-verdict',
  title: 'Ibiki’s Verdict',
  rank: 'D',
  client: IBIKI,
  summary: 'Ibiki wants you back in the room with one chair.',
  slots: 2,
  energyCost: 10,
  reward: { ryo: 100, reputation: 5 },
  minMissionsCompleted: 4,
  stages: [
    {
      kind: 'narrative',
      text: 'Ibiki has a sheet of paper in front of him with very little on it.',
      variants: [
        {
          when: { remembers: 'ibiki-walked' },
          text: 'Ibiki has a sheet of paper in front of him. On it, in his square hand, there are two words. Walked out.',
        },
        {
          when: { remembers: 'ibiki-opened' },
          text: 'Ibiki has a sheet of paper in front of him, and the message you opened, its seal pressed back a little crooked.',
        },
      ],
    },
    {
      kind: 'ending',
      endings: [
        {
          when: { all: [{ remembers: 'ibiki-left-road' }, { remembers: 'ibiki-opened' }] },
          text: '“You left the road for the boy, with the message still on you,” Ibiki says. “You passed on the forest road.” He taps the crooked seal. “And you opened my message. Curious is good. Caught is not.”',
          effects: [{ kind: 'world', mark: 'ibiki-passed' }],
          ledger: 'Ibiki passed you, and noticed the seal.',
        },
        {
          when: { remembers: 'ibiki-left-road' },
          text: '“Three orders,” Ibiki says, “and you broke the one that could be broken, the moment someone needed you to, and kept the message on you while you did it. A shinobi who keeps every order and loses a comrade isn’t one I want. You passed on the forest road.”',
          effects: [{ kind: 'world', mark: 'ibiki-passed' }],
          ledger: 'Ibiki passed you, because you broke an order for someone who needed you.',
        },
        {
          when: { remembers: 'ibiki-gave-message' },
          text: '“You didn’t walk on,” Ibiki says. “Good. And you bought the boy back with a message that wasn’t yours to spend.” He folds the paper once. “Next time it’s a real enemy, and the message is a village’s worth of lives. Come back when you know the difference.”',
          effects: [{ kind: 'world', mark: 'ibiki-failed' }],
          ledger: 'Ibiki failed you, because you gave up the message to buy the boy back.',
        },
        {
          text: '“You kept every order,” Ibiki says. “Perfectly. And left a boy in the forest.” He doesn’t fold the paper. He tears it once, cleanly. “The test was never the message. Come back in a year.”',
          effects: [{ kind: 'world', mark: 'ibiki-failed' }],
          ledger: 'Ibiki failed you for keeping the rules and leaving someone behind.',
        },
      ],
    },
  ],
};

export const UNWRITTEN_RULE_JOBS: readonly MissionDef[] = [INTERVIEW, SEALED_MESSAGE, VERDICT];

export const UNWRITTEN_RULE_ARC: ArcDef = {
  id: 'the-unwritten-rule',
  title: 'The Unwritten Rule',
  summary: 'Ibiki Morino has asked to see you, alone.',
  acts: [
    {
      beats: ['you', 'need'],
      title: 'The interview',
      text: 'The head of interrogation wants an hour of your time, in a room with one chair.',
      jobs: ['arc-ibiki-interview'],
    },
    {
      beats: ['go', 'search', 'find'],
      title: 'Three orders',
      text: 'Carry a sealed message to the Fire Temple. Don’t open it, don’t leave the road, don’t let it go.',
      jobs: ['arc-ibiki-sealed-message'],
    },
    {
      beats: ['take', 'return', 'change'],
      title: 'The verdict',
      text: 'Back to the room with one chair.',
      jobs: ['arc-ibiki-verdict'],
    },
  ],
};
