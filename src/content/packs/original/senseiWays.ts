import type { SenseiWays } from '../../types';

/** How each of the village's senseis runs a team (`docs/design/sensei-plan.md`). */

export const GORAN_WAYS: SenseiWays = {
  philosophy: 'body',
  lens: 'specialty',
  grip: 'tight',
  loosensAtStage: 3,
  cadence: { sessions: 6, slot: 'morning', punctuality: 'punctual' },
  formats: ['march', 'drill', 'spar'],
  feedback: 'blunt',
  rituals: [
    {
      kind: 'challenge',
      line: 'Gōran bets the team that none of you can beat him up the shrine stairs, and wins the bet three times over.',
    },
    { kind: 'meal', line: 'Gōran buys grilled fish for the whole team and eats twice as much.' },
  ],
  rewards: ['signature', 'meal'],
  onMissions: 'shield',
  test: 'spar',
  gatekeeping: { passStage: 1, permitStage: 2, nominates: 'early', readiness: 'specialist' },
  classRegard: 'champions-last',
  story: {
    wound:
      'He was a step too slow to save his teammate on the pass, and has run the stairs ever since.',
    beats: ['goran-scar', 'goran-old-team', 'goran-daichi', 'goran-kurobane'],
    arcId: 'the-broken-blade',
  },
};

export const AKARI_WAYS: SenseiWays = {
  philosophy: 'edge',
  lens: 'hidden-talent',
  grip: 'firm',
  loosensAtStage: 3,
  cadence: { sessions: 3, slot: 'evening', punctuality: 'punctual' },
  formats: ['drill', 'spar', 'theory'],
  feedback: 'competitive',
  rituals: [
    {
      kind: 'challenge',
      line: 'Akari lines the team up under the gate lantern, and whoever holds a flame in their palm longest eats free.',
    },
  ],
  rewards: ['signature', 'praise'],
  onMissions: 'watchful',
  test: 'survival',
  gatekeeping: { passStage: 1, permitStage: 2, nominates: 'early', readiness: 'specialist' },
  classRegard: 'pushes-best',
  story: {
    wound: 'She pushed a student too hard once, and the student quit.',
    beats: ['akari-gate-lantern', 'akari-brother', 'akari-hands', 'akari-promise'],
    arcId: 'the-lantern-keepers-brother',
  },
};

export const YOMI_WAYS: SenseiWays = {
  philosophy: 'shadow',
  lens: 'weakest-stat',
  grip: 'loose',
  loosensAtStage: 2,
  cadence: { sessions: 2, slot: 'afternoon', punctuality: 'irregular' },
  formats: ['field', 'meditation', 'theory'],
  feedback: 'cryptic',
  rituals: [
    {
      kind: 'tea',
      line: 'Yomi pours tea for the team among the grave lanterns, and for an hour hardly anyone says a word.',
    },
  ],
  rewards: ['praise', 'recipe', 'signature'],
  onMissions: 'lets-fail',
  test: 'interview',
  gatekeeping: { passStage: 2, permitStage: 2, nominates: 'late', readiness: 'specialist' },
  classRegard: 'even',
  story: {
    wound: 'Her teammate’s ghost has never come to his grave, and she keeps looking for him.',
    beats: ['yomi-grandmother', 'yomi-sight', 'yomi-teammate-grave', 'yomi-lantern-promise'],
    arcId: 'the-unfinished',
  },
};

export const TETSU_WAYS: SenseiWays = {
  philosophy: 'fundamentals',
  lens: 'weakest-defence',
  grip: 'firm',
  loosensAtStage: 2,
  cadence: { sessions: 4, slot: 'morning', punctuality: 'punctual' },
  formats: ['drill', 'review', 'meditation'],
  feedback: 'blunt',
  rituals: [
    {
      kind: 'tea',
      line: 'Tetsu boils water on the forge, pours for each of you, and drinks his in silence.',
    },
  ],
  // Silence is praise: he gives things instead.
  rewards: ['gear', 'signature'],
  onMissions: 'shield',
  test: 'none',
  gatekeeping: { passStage: 1, permitStage: 2, nominates: 'usual', readiness: 'rounded' },
  classRegard: 'even',
  story: {
    wound: 'A blade he forged and sold went on to kill a friend of his.',
    beats: ['tetsu-forge', 'tetsu-master', 'tetsu-blade', 'tetsu-memory'],
    arcId: 'the-forged-blade',
  },
};

export const ITO_WAYS: SenseiWays = {
  philosophy: 'control',
  lens: 'team-gap',
  grip: 'firm',
  loosensAtStage: 3,
  cadence: { sessions: 3, slot: 'afternoon', punctuality: 'punctual' },
  formats: ['theory', 'team-drill', 'review'],
  feedback: 'socratic',
  rituals: [
    {
      kind: 'debrief',
      line: 'Ito spreads the last job’s map on the hall table and asks what each of you would change.',
    },
  ],
  rewards: ['signature', 'recipe'],
  onMissions: 'watchful',
  test: 'bells',
  gatekeeping: { passStage: 1, permitStage: 3, nominates: 'usual', readiness: 'specialist' },
  classRegard: 'even',
  story: {
    wound: 'A seal she wrote once failed, and what got out is still waiting.',
    beats: ['ito-seal', 'ito-ropes', 'ito-failed-seal', 'ito-trust'],
    arcId: 'the-patient-thing',
  },
};
