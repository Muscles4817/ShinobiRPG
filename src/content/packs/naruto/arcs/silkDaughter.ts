import type { ArcDef, MissionDef } from '@/systems/missions';

import {
  BANDITS_BLAMED,
  DANJURO,
  DAUGHTER_TAKEN,
  HER_ROOM,
  OCHO_CLUES,
  PILGRIM_ROAD,
} from './silkDaughterStart';

/**
 * The Silk Merchant's Daughter: the client is the villain, and the "kidnapping" was a flight
 * from him. It ends in a fork of three roads, each its own job: take her home and be paid well,
 * lie to him for less, or take the truth to the magistrate touring the temple lands for almost
 * nothing, where only what you found along the way makes the case. Finishing one closes the
 * others.
 */

export const BRING_HER_HOME: MissionDef = {
  id: 'arc-silk-bring-her-home',
  title: 'Bring Her Home',
  rank: 'C',
  client: DANJURO,
  summary: 'Do what you were paid for: take Ochō back to her father in Shukuba.',
  slots: 1,
  energyCost: 25,
  reward: { ryo: 640, reputation: 2 },
  minMissionsCompleted: 4,
  endsAt: 'konohagakure',
  stages: [
    {
      kind: 'leg',
      text: 'Down the pilgrim road, Ochō silent beside you.',
      variants: [
        {
          when: { remembers: 'ocho-trusts' },
          text: 'Down the pilgrim road, Ochō silent beside you. She comes because you asked her to, and that is worse.',
        },
      ],
      days: 2,
      region: 'mountain-pass',
    },
    {
      kind: 'decision',
      text: 'At his door Danjūrō takes his daughter by the wrist, and she flinches.',
      options: [
        {
          when: { tally: OCHO_CLUES, atLeast: 2 },
          label: 'Tell him, before his servants, that you know what she ran from',
          unseen: 'You don’t know enough of what she ran from to say it.',
          tone: 'challenge',
          reply:
            'His servants hear every word. So does the street. Danjūrō lets go of her wrist, and for once says nothing at all.',
          effects: [{ kind: 'mark', mark: 'witnessed' }],
          ledger: 'Said before witnesses what Ochō had run from.',
        },
        {
          label: 'Take your fee and go',
          tone: 'quiet',
          reply: 'He counts it out carefully. Ochō doesn’t look at you.',
          ledger: 'Handed Ochō back to her father.',
        },
      ],
    },
    {
      kind: 'ending',
      endings: [
        {
          when: { has: 'witnessed' },
          text: 'Word goes round Shukuba by evening. The creditor withdraws his suit, and within the month Ochō walks out of her father’s house on her own terms.',
          effects: [{ kind: 'world', mark: 'silk-daughter-done' }],
          ledger: 'Ochō went home, but the whole town knows why she left.',
        },
        {
          text: 'You hear later that she was married to the creditor by the next new moon.',
          effects: [{ kind: 'world', mark: 'silk-daughter-done' }],
          ledger: 'Ochō went home to her father.',
        },
      ],
    },
    { kind: 'leg', text: 'Home down the post road.', days: 1 },
  ],
};

export const WORD_OF_HER_DEATH: MissionDef = {
  id: 'arc-silk-word-of-death',
  title: 'Word of Her Death',
  rank: 'C',
  client: 'Ochō',
  summary:
    'Tell Danjūrō his daughter drowned crossing the river, and leave her at the temple. He will pay for the news, not for the job.',
  slots: 1,
  energyCost: 20,
  reward: { ryo: 380, reputation: 1 },
  minMissionsCompleted: 4,
  endsAt: 'konohagakure',
  stages: [
    {
      kind: 'leg',
      text: 'Down the pilgrim road without her, her comb wrapped in a cloth.',
      days: 2,
      region: 'mountain-pass',
    },
    {
      kind: 'decision',
      text: 'Danjūrō turns the comb over in his hands. “The river,” he says. “And the creditor’s money?”',
      options: [
        {
          label: 'Say nothing more',
          tone: 'quiet',
          reply: 'He pays you for the news, not a coin more, and sends you out.',
          ledger: 'Told Danjūrō his daughter drowned. He paid for the news.',
        },
        {
          label: 'Tell him she drowned running from him',
          tone: 'cruel',
          reply:
            'He goes grey to the lips. He pays you anyway, to be rid of you, and doesn’t look up.',
          ledger: 'Told Danjūrō his daughter drowned running from him.',
        },
      ],
    },
    {
      kind: 'ending',
      endings: [
        {
          text: 'At the Fire Temple a young woman in a pilgrim’s robe sweeps the courtyard every morning, and nobody on the post road ever asks her name.',
          effects: [{ kind: 'world', mark: 'silk-daughter-done' }],
          ledger: 'Ochō stays at the temple, dead to her father.',
        },
      ],
    },
    { kind: 'leg', text: 'Home down the post road.', days: 1 },
  ],
};

export const BEFORE_THE_MAGISTRATE: MissionDef = {
  id: 'arc-silk-magistrate',
  title: 'Before the Magistrate',
  rank: 'C',
  client: 'Ochō',
  summary:
    'The daimyō’s magistrate is touring the temple lands. Let Ochō speak before him. Her father will be there, and his money; all she can pay you with is her mother’s comb.',
  slots: 1,
  energyCost: 30,
  reward: { ryo: 260, reputation: 8 },
  minMissionsCompleted: 4,
  endsAt: 'konohagakure',
  stages: [
    {
      kind: 'check',
      text: 'The magistrate sits in judgement at the temple gate, and is bored. Danjūrō’s lawyer is not. “A daughter’s tale,” he says, “against a man of standing.”',
      approaches: [
        {
          when: { tally: OCHO_CLUES, atLeast: 2 },
          label: 'Lay out what you found, piece by piece',
          stat: 'intellect',
          difficulty: 6,
          onSuccess: {
            effects: [{ kind: 'mark', mark: 'case-made' }],
            ledger: 'Laid the case out, piece by piece.',
          },
        },
        {
          label: 'Let Ochō speak, and stand beside her',
          stat: 'willpower',
          difficulty: 10,
          onSuccess: {
            effects: [{ kind: 'mark', mark: 'case-made' }],
            ledger: 'Stood beside Ochō while she spoke, and the magistrate listened.',
          },
        },
      ],
      success: 'The magistrate stops looking bored.',
      failure:
        'The lawyer talks longer than anyone, and the magistrate believes the man who talks longest.',
      onFailure: 'forward',
    },
    {
      kind: 'ending',
      endings: [
        {
          when: { has: 'case-made' },
          text: 'The magistrate frees Ochō from her father’s house and voids the marriage contract. Outside, she laughs, and can’t stop.',
          effects: [
            { kind: 'world', mark: 'silk-daughter-done' },
            { kind: 'world', mark: 'ocho-free' },
            { kind: 'memory', text: 'the morning Ochō walked out of the temple gate free' },
          ],
          ledger: 'The magistrate set Ochō free of her father.',
        },
        {
          text: 'The case is dismissed. Ochō goes back up to the temple, and Chiriku closes the gate behind her.',
          effects: [{ kind: 'world', mark: 'silk-daughter-done' }],
          ledger: 'The magistrate dismissed the case. Ochō went back to the temple.',
        },
      ],
    },
    { kind: 'leg', text: 'Home down the pilgrim road and through the forest.', days: 2 },
  ],
};

export const SILK_DAUGHTER_JOBS: readonly MissionDef[] = [
  DAUGHTER_TAKEN,
  HER_ROOM,
  BANDITS_BLAMED,
  PILGRIM_ROAD,
  BRING_HER_HOME,
  WORD_OF_HER_DEATH,
  BEFORE_THE_MAGISTRATE,
];

export const SILK_DAUGHTER_ARC: ArcDef = {
  id: 'the-silk-merchants-daughter',
  title: 'The Silk Merchant’s Daughter',
  summary: 'A silk merchant of Shukuba says bandits took his daughter.',
  acts: [
    {
      beats: ['you', 'need'],
      title: 'A daughter taken',
      text: 'Danjūrō of Shukuba wants his daughter found and brought home.',
      jobs: ['arc-silk-daughter-taken'],
    },
    {
      beats: ['go', 'search'],
      title: 'Where she went',
      text: 'Look at the room she last slept in, or go after the bandits her father blames.',
      jobs: ['arc-silk-her-room', 'arc-silk-bandits'],
      baseLocationId: 'shukuba-town',
      pass: 'any',
    },
    {
      beats: ['find'],
      title: 'Sanctuary',
      text: 'The trail leads up the pilgrim road to the Fire Temple.',
      jobs: ['arc-silk-pilgrim-road'],
      baseLocationId: 'shukuba-town',
    },
    {
      beats: ['take', 'return', 'change'],
      title: 'Three roads',
      text: 'Take her home, lie for her, or take the truth to the magistrate touring the temple lands.',
      jobs: ['arc-silk-bring-her-home', 'arc-silk-word-of-death', 'arc-silk-magistrate'],
      baseLocationId: 'fire-temple',
      pass: 'one',
    },
  ],
};
