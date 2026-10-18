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
      text: 'The room has one chair, one lamp and Ibiki. He asks questions for an hour. Some have no answers. Some you are sure he already knows.',
    },
    {
      kind: 'decision',
      text: '“One more,” he says. “Get it wrong and you carry no message for me, now or ever. Or walk out, and nothing is written down.”',
      options: [
        {
          label: 'Take the question',
          tone: 'earnest',
          reply: 'Ibiki looks at you for a long moment. “That was the question,” he says.',
          effects: [{ kind: 'world', mark: 'ibiki-took-it' }],
          ledger: 'Took Ibiki’s last question without knowing it.',
        },
        {
          label: 'Ask what kind of question',
          tone: 'curious',
          reply:
            '“The kind you take or you don’t,” he says. You take it. He writes something down.',
          effects: [{ kind: 'world', mark: 'ibiki-took-it' }],
          ledger: 'Asked, then took Ibiki’s last question.',
        },
        {
          label: 'Walk out',
          tone: 'quiet',
          reply: 'At the door he says, without turning round, “Come back tomorrow anyway.”',
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
      variants: [
        {
          when: { crew: 'team' },
          text: 'On the forest road masked men burst out of the trees, knock one of your team flat, and drag them off the road into the forest. “The message,” one calls back, “or your friend.”',
        },
      ],
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
          effects: [{ kind: 'world', mark: 'ibiki-gave-message' }],
          ledger: 'Let the message out of your hands to buy them back.',
        },
        {
          label: 'Keep to the road, as ordered',
          tone: 'quiet',
          reply: 'You walk on. Behind you the shouting stops, which is worse.',
          effects: [{ kind: 'world', mark: 'ibiki-kept-road' }],
          ledger: 'Kept to the road, as ordered, and left them.',
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
      kind: 'decision',
      text: 'Alone on the pilgrim road that night, the message sits in your lap. Its seal is a plain one, easy to lift and press back.',
      options: [
        {
          label: 'Open it',
          tone: 'curious',
          reply: 'Inside, in Ibiki’s square hand: “Close it.”',
          effects: [{ kind: 'world', mark: 'ibiki-opened' }],
          ledger: 'Opened the message. It said to close it.',
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
          text: 'Chiriku breaks the seal, reads, and laughs out loud. Behind you, two familiar chūnin limp up the road with bruises and no masks: Izumo and Kotetsu, who have clearly had a long day.',
        },
        {
          text: 'Chiriku breaks the seal, reads, and says nothing. He gives you tea and a bed for the night and a long look in the morning.',
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
          when: { remembers: 'ibiki-opened' },
          text: 'Ibiki has a sheet of paper in front of him, and the message you opened, its seal pressed back a little crooked.',
        },
      ],
    },
    {
      kind: 'ending',
      endings: [
        {
          when: { remembers: 'ibiki-left-road' },
          text: '“Three orders,” Ibiki says, “and you broke one the moment someone needed you to. Good. A shinobi who keeps every order and loses a comrade isn’t one I want. You passed. You passed yesterday.”',
          effects: [{ kind: 'world', mark: 'ibiki-passed' }],
          ledger: 'Ibiki passed you: you broke an order for someone who needed you.',
        },
        {
          when: { remembers: 'ibiki-gave-message' },
          text: '“You gave up the message,” Ibiki says. “And got them back. Not the way I’d have done it. But you didn’t walk on.” He writes, and it looks like a pass.',
          effects: [{ kind: 'world', mark: 'ibiki-passed' }],
          ledger: 'Ibiki passed you, just: you gave up the message rather than walk on.',
        },
        {
          text: '“You kept every order,” Ibiki says. “Perfectly. And left someone in the forest.” He folds the paper once. “The test was never the message. Come back in a year.”',
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
