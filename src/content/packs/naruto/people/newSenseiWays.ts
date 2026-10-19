import type { SenseiWays } from '../../../types';

/** How the Leaf's new senseis run a team (`docs/design/sensei-plan.md`). */

export const KANAME_WAYS: SenseiWays = {
  philosophy: 'control',
  lens: 'weakest-stat',
  grip: 'firm',
  loosensAtStage: 2,
  cadence: { sessions: 4, slot: 'morning', punctuality: 'punctual' },
  formats: ['meditation', 'drill', 'spar'],
  feedback: 'socratic',
  rituals: [
    {
      kind: 'tea',
      line: 'Kaname brews temple tea for the team by the river and asks each of you what you are afraid of.',
    },
  ],
  rewards: ['praise', 'signature', 'recipe'],
  onMissions: 'shield',
  test: 'interview',
  gatekeeping: { passStage: 1, permitStage: 2, nominates: 'usual', readiness: 'specialist' },
  classRegard: 'champions-last',
  story: {
    wound: 'The war took his family; the temple gave him another, and he has not been back to it.',
    beats: ['kaname-stance', 'kaname-temple', 'kaname-war', 'kaname-bell'],
    arcId: 'the-temple-bell',
  },
};

export const HOTARU_WAYS: SenseiWays = {
  philosophy: 'teamwork',
  lens: 'team-gap',
  grip: 'firm',
  loosensAtStage: 3,
  cadence: { sessions: 3, slot: 'afternoon', punctuality: 'punctual' },
  formats: ['team-drill', 'drill', 'review'],
  feedback: 'warm',
  rituals: [
    {
      kind: 'meal',
      line: 'Hotaru cooks a pot of fish broth for the team and won’t let anyone leave hungry.',
    },
    {
      kind: 'debrief',
      line: 'Hotaru goes over the last job with the team, and makes sure every one of you is heard.',
    },
  ],
  rewards: ['recipe', 'praise', 'signature'],
  onMissions: 'watchful',
  test: 'bells',
  gatekeeping: { passStage: 1, permitStage: 2, nominates: 'usual', readiness: 'rounded' },
  classRegard: 'even',
  story: {
    wound:
      'She left her little brother on the shore the night she escaped, and never knew what became of him.',
    beats: ['hotaru-water', 'hotaru-boat', 'hotaru-brother', 'hotaru-shore'],
    arcId: 'the-drowned-shore',
  },
};

export const SHION_WAYS: SenseiWays = {
  philosophy: 'shadow',
  lens: 'hidden-talent',
  grip: 'loose',
  loosensAtStage: 2,
  cadence: { sessions: 2, slot: 'evening', punctuality: 'irregular' },
  formats: ['field', 'theory', 'meditation'],
  feedback: 'cryptic',
  rituals: [
    {
      kind: 'tea',
      line: 'Shion takes the team to a teahouse and has you guess what everyone else in it is hiding.',
    },
  ],
  rewards: ['signature', 'praise'],
  onMissions: 'lets-fail',
  test: 'none',
  gatekeeping: { passStage: 2, permitStage: 2, nominates: 'late', readiness: 'specialist' },
  classRegard: 'pushes-best',
  story: {
    wound:
      'An informant who trusted her was found out because of a mistake she made, and paid for it.',
    beats: ['shion-cards', 'shion-tanzaku', 'shion-informant', 'shion-debt'],
    arcId: 'the-loaded-dice',
  },
};

export const MASARU_WAYS: SenseiWays = {
  philosophy: 'edge',
  lens: 'specialty',
  grip: 'tight',
  loosensAtStage: 3,
  cadence: { sessions: 5, slot: 'morning', punctuality: 'punctual' },
  formats: ['drill', 'spar', 'march'],
  feedback: 'competitive',
  rituals: [
    {
      kind: 'challenge',
      line: 'Masaru has the team cut falling leaves, keeping score on the fence, and wins by a long way.',
    },
    {
      kind: 'meal',
      line: 'Masaru buys the team skewers and makes a contest of who can eat the most.',
    },
  ],
  rewards: ['gear', 'signature', 'praise'],
  onMissions: 'shield',
  test: 'spar',
  gatekeeping: { passStage: 1, permitStage: 2, nominates: 'early', readiness: 'specialist' },
  classRegard: 'pushes-best',
  story: {
    wound: 'He walked out of his father’s sword school the day he was meant to inherit it.',
    beats: ['masaru-score', 'masaru-school', 'masaru-father', 'masaru-letter'],
    arcId: 'the-sword-school',
  },
};
