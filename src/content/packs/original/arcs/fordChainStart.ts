import type { MissionDef } from '@/systems/missions';

import type { EnemyDef } from '../../../types';

/**
 * The Chain at Kiri Ford, acts one and two: a ferry pilot's job posted below its rank, and the
 * hired blade on the bluff, with the youth who stands between him and you.
 */

export const FERRY_OFFICE = 'The Ferry Office';
/** Mercy shown across jobs: the village counts it, and remembers it when you plead for someone. */
export const MERCY = 'mercy';

export const USHIO: EnemyDef = {
  // Kurogane Renegade's numbers, with water in place of fire.
  id: 'ford-ushio',
  kind: 'Rogue',
  danger: 'deadly',
  name: 'Ushio of the Reeds',
  proper: true,
  pronouns: 'he',
  description: 'A missing-nin who sells his long blade to whoever pays. He has never once run.',
  baseStat: 11,
  statBonuses: { kenjutsu: 4, speed: 2, ninjutsu: 2 },
  maxChakra: 70,
  techniqueIds: ['tide-lash', 'moonfall-slash', 'bleeding-cut'],
  traits: ['swift'],
  nature: 'water',
};

export const REN: EnemyDef = {
  // Bandit Archer's numbers, a little quicker: needles for arrows, and no running away.
  id: 'ford-ren',
  kind: 'Rogue',
  danger: 'armed',
  name: 'Ren',
  proper: true,
  pronouns: 'he',
  description: 'Ushio’s ward. Throws needles from the reeds and never leaves his side.',
  baseStat: 6,
  statBonuses: { speed: 3, perception: 2, strength: -1 },
  maxChakra: 20,
  techniqueIds: [],
  traits: ['archer', 'swift'],
};

export const PILOT_HOME: MissionDef = {
  id: 'arc-ford-pilot-home',
  title: 'A Pilot Going Home',
  rank: 'D',
  client: 'Tobei Sawa',
  summary:
    'A ferry pilot from Kiri Ford wants seeing home past some bullies at the river crossing. A simple job, the notice says.',
  slots: 1,
  energyCost: 20,
  reward: { ryo: 180, reputation: 3 },
  minMissionsCompleted: 4,
  endsAt: 'kiri-ford',
  stages: [
    {
      kind: 'narrative',
      text: 'Tobei pays at the hall in small coins from a dozen purses, and won’t meet the clerk’s eye. “Bullies,” he says. “Just bullies, at the chain.”',
    },
    { kind: 'leg', text: 'A day down the river road, Tobei talking the whole way.', days: 1 },
    {
      kind: 'encounter',
      template: 'bandit-camp',
      job: 'escort',
      text: 'An iron chain hangs across the landing road, and two men with clubs sit on the toll box beneath it.',
      enemyIds: ['bandit-thug', 'bandit-thug'],
      shows: ['count'],
      canFlee: true,
      flavour: {
        terrain: 'The chain, a toll box, the river on one side and a steep bluff on the other.',
      },
    },
    {
      kind: 'narrative',
      text: 'Up on the bluff a man stands with a long blade wrapped in cloth, a thin youth beside him. “Tell the ferrymen the chain stays,” he calls down, quite calm. Then they are gone into the reeds.',
    },
    {
      kind: 'decision',
      text: 'Tobei is white. “That’s Ushio of the Reeds,” he says. “Missing-nin. The timber baron Oki pays him to keep the chain. We pooled what we had, and it came to a D-rank.” He swallows. “We wrote what we could afford.”',
      options: [
        {
          label: 'Then we see it through, at the price you could pay',
          tone: 'kind',
          reply: 'Tobei just nods, several times, and can’t say anything at all.',
          effects: [{ kind: 'world', mark: 'ford-kept-faith' }],
          ledger: 'Kept faith with the ferrymen, though they lied on the notice.',
        },
        {
          label: 'You lied on the notice. Post it again, at its real rank',
          tone: 'challenge',
          reply:
            '“The office will find the rest,” Tobei says, ashamed. “Somehow. You’re right to ask.”',
          effects: [{ kind: 'world', mark: 'ford-reposted' }],
          ledger: 'Made the ferrymen post the job at its true rank.',
        },
        {
          label: 'Who was the youth beside him?',
          tone: 'curious',
          reply:
            '“Ren. Ushio pulled him half-drowned out of the rapids, years back. Nobody’s seen one without the other since.”',
          effects: [{ kind: 'world', mark: 'ford-asked-ren' }],
          ledger: 'Heard how Ushio pulled Ren out of the rapids.',
        },
      ],
    },
    {
      kind: 'ending',
      endings: [
        {
          when: { has: 'fought-past' },
          text: 'The thugs limp off towards Oki’s timber yard. Tobei gets you a room over the ferry office and says the office will want you in the morning.',
        },
        {
          text: 'Tobei gets you a room over the ferry office. Through the thin wall you hear the ferrymen arguing until late about what they can pay.',
        },
      ],
    },
  ],
};

export const REED_BLADE: MissionDef = {
  id: 'arc-ford-reed-blade',
  title: 'The Blade on the Bluff',
  rank: 'C',
  client: FERRY_OFFICE,
  summary: 'Ushio of the Reeds keeps the chain for the timber baron. The ferrymen want it gone.',
  slots: 2,
  energyCost: 30,
  reward: { ryo: 400, reputation: 6 },
  minMissionsCompleted: 4,
  stages: [
    {
      when: { remembers: 'ford-reposted' },
      kind: 'decision',
      text: 'The office clerk counts out the fee the job should have had from the start, coin by coin, as if each one hurts.',
      options: [
        {
          label: 'Take it',
          tone: 'quiet',
          reply: 'You take it. The ferrymen at the door look at the floor.',
          effects: [{ kind: 'pay', share: 0.5 }],
          ledger: 'The ferry office paid the job its true rank.',
        },
        {
          label: 'Take half, and tell them to keep the rest',
          tone: 'kind',
          reply: 'The clerk stops counting, and the whole office breathes out.',
          effects: [{ kind: 'pay', share: 0.25 }],
          ledger: 'Took half the true fee and left the ferrymen the rest.',
        },
      ],
    },
    {
      when: { remembers: 'ford-kept-faith' },
      kind: 'decision',
      text: 'The office clerk counts out what the ferrymen promised at the hall: the D-rank price, part of it in coin and part in dried eel. Tobei can’t look at you.',
      options: [
        {
          label: 'Take what they promised',
          tone: 'kind',
          reply: 'Tobei grips your hand hard enough to hurt. “The ford won’t forget,” he says.',
          effects: [
            { kind: 'pay', share: -0.5 },
            { kind: 'world', mark: 'ford-faith-kept' },
          ],
          ledger: 'Took the ferrymen’s D-rank price, as you promised.',
        },
        {
          label: 'Tell them it’s a C-rank job now, and ask for the rest',
          tone: 'challenge',
          reply: 'They find it, somehow. Nobody at the office says much to you after that.',
          ledger: 'Asked the ferrymen for the true price after all.',
        },
      ],
    },
    {
      kind: 'narrative',
      text: 'Ushio camps on the bluff above the chain, a banked fire and a view of the whole landing. Its smoke says he isn’t hiding.',
      variants: [
        {
          when: { remembers: 'ford-asked-ren' },
          text: 'Ushio camps on the bluff above the chain. Down in the reeds below it, where the rapids begin, someone small keeps watch for him.',
        },
      ],
    },
    {
      kind: 'encounter',
      template: 'lone-rogue',
      job: 'eliminate',
      text: 'He stands as you come up the bluff, unwrapping the blade. Ren rises out of the reeds behind you with needles between his fingers.',
      enemyIds: [USHIO.id, REN.id],
      canFlee: false,
      talkable: false,
      flavour: { terrain: 'A bare bluff, a cold fire, the reeds below and the river below those.' },
    },
    {
      when: { has: 'fought-past' },
      kind: 'decision',
      text: 'Ushio is down on one knee, his blade in the grass. Ren stands over him with his arms out, shaking, between his master and you.',
      variants: [
        {
          when: { remembers: 'ford-asked-ren' },
          text: 'Ushio is down on one knee. Ren stands over him with his arms out, shaking. “He pulled me out of the river,” he says. “I’m his. That’s all.”',
        },
      ],
      options: [
        {
          label: 'Let them go, and tell them never to come back',
          tone: 'kind',
          reply:
            'Ushio looks at you a long time. Then he lets Ren help him up, and they go down into the reeds without a word.',
          effects: [
            { kind: 'world', mark: 'ford-rogue-spared' },
            { kind: 'tally', tally: MERCY, by: 1 },
            { kind: 'pay', share: -0.25 },
          ],
          ledger: 'Let Ushio and Ren go. The ferrymen wanted him gone, and paid less for it.',
        },
        {
          label: 'Bind them both for the Watch',
          tone: 'earnest',
          reply: 'Ren fights the rope. Ushio tells him to stop, and he does.',
          effects: [{ kind: 'world', mark: 'ford-rogue-bound' }],
          ledger: 'Bound Ushio and Ren for the Watch.',
        },
      ],
    },
    {
      kind: 'ending',
      endings: [
        {
          when: { has: 'fought-past' },
          text: 'The ferrymen cheer when they see you on the bluff. Nobody cuts the chain yet. Oki still holds the landing, and Oki still has money.',
          effects: [{ kind: 'memory', text: 'the fight on the bluff at Kiri Ford' }],
        },
        {
          text: 'The bluff is quiet. Oki still holds the landing, and Oki still has money.',
        },
      ],
    },
  ],
};
