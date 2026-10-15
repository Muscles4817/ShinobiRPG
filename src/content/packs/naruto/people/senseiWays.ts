import type { SenseiWays } from '../../../types';

/** How each sensei runs a team (`docs/design/sensei-plan.md`). */

export const KAKASHI_WAYS: SenseiWays = {
  philosophy: 'teamwork',
  lens: 'team-gap',
  grip: 'firm',
  loosensAtStage: 3,
  cadence: { sessions: 2, slot: 'afternoon', punctuality: 'late' },
  formats: ['team-drill', 'spar', 'review'],
  feedback: 'cryptic',
  rituals: [
    {
      kind: 'debrief',
      line: 'Kakashi has the team sit on the memorial stones and asks who covered whom, and why not.',
    },
  ],
  rewards: ['signature', 'praise'],
  onMissions: 'lets-fail',
  test: 'bells',
  gatekeeping: { passStage: 1, permitStage: 2, nominates: 'late' },
  classRegard: 'pushes-best',
  story: {
    wound: 'He lost both his teammates, and carries one of them in his eye.',
    beats: ['kakashi-stone', 'kakashi-white-fang', 'kakashi-obito', 'kakashi-scum'],
  },
};

export const GUY_WAYS: SenseiWays = {
  philosophy: 'body',
  lens: 'specialty',
  grip: 'tight',
  loosensAtStage: 4,
  cadence: { sessions: 7, slot: 'morning', punctuality: 'punctual' },
  formats: ['march', 'drill', 'spar'],
  feedback: 'competitive',
  rituals: [
    {
      kind: 'challenge',
      line: 'Guy challenges the whole team to a race around the village. On his hands.',
    },
    { kind: 'meal', line: 'Guy treats the team to the hottest curry in the village and cries.' },
  ],
  rewards: ['praise', 'signature', 'gear'],
  onMissions: 'shield',
  test: 'spar',
  gatekeeping: { passStage: 1, permitStage: 2, nominates: 'early' },
  classRegard: 'champions-last',
  story: {
    wound: 'His father opened the last gate, and he would too.',
    beats: ['guy-count', 'guy-father', 'guy-gates', 'guy-precious'],
  },
};

export const KURENAI_WAYS: SenseiWays = {
  philosophy: 'fundamentals',
  lens: 'weakest-defence',
  grip: 'firm',
  loosensAtStage: 2,
  cadence: { sessions: 3, slot: 'afternoon', punctuality: 'punctual' },
  formats: ['theory', 'drill', 'meditation'],
  feedback: 'warm',
  rituals: [
    {
      kind: 'tea',
      line: 'Kurenai takes the team to a tea house and asks each of you how you really are.',
    },
  ],
  rewards: ['praise', 'signature'],
  onMissions: 'shield',
  test: 'interview',
  gatekeeping: { passStage: 1, permitStage: 2, nominates: 'usual' },
  classRegard: 'even',
  story: {
    wound: 'Her father never told her she was good enough.',
    beats: ['kurenai-care', 'kurenai-father', 'kurenai-asuma', 'kurenai-family'],
  },
};

export const ASUMA_WAYS: SenseiWays = {
  philosophy: 'edge',
  lens: 'specialty',
  grip: 'loose',
  loosensAtStage: 2,
  cadence: { sessions: 2, slot: 'afternoon', punctuality: 'punctual' },
  formats: ['spar', 'drill', 'review'],
  feedback: 'blunt',
  rituals: [
    { kind: 'meal', line: 'Asuma takes the team out for barbecue and pays for every plate.' },
  ],
  rewards: ['meal', 'signature'],
  onMissions: 'watchful',
  test: 'survival',
  gatekeeping: { passStage: 1, permitStage: 2, nominates: 'usual' },
  classRegard: 'even',
  story: {
    wound: 'He left to be more than his father’s son, and came back fighting him still.',
    beats: ['asuma-shogi', 'asuma-guardians', 'asuma-father', 'asuma-king'],
  },
};

export const ANKO_WAYS: SenseiWays = {
  philosophy: 'survival',
  lens: 'weakest-defence',
  grip: 'tight',
  loosensAtStage: 3,
  cadence: { sessions: 4, slot: 'afternoon', punctuality: 'irregular' },
  formats: ['field', 'spar', 'march'],
  feedback: 'blunt',
  rituals: [{ kind: 'meal', line: 'Anko drags the team out for dango and eats most of it.' }],
  rewards: ['meal', 'signature'],
  onMissions: 'lets-fail',
  test: 'survival',
  gatekeeping: { passStage: 2, permitStage: 2, nominates: 'early' },
  classRegard: 'pushes-best',
  story: {
    wound: 'Her teacher used her and threw her away, and left his mark on her neck.',
    beats: ['anko-dango', 'anko-forest', 'anko-mark', 'anko-used'],
    arcId: 'the-white-snakes-den',
  },
};
