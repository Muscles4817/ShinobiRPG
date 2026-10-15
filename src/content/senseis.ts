import type { TimeSlot } from '@/systems/time';

/**
 * Content schema for how a sensei runs your genin years (`docs/design/sensei-plan.md`): what
 * they believe in, how they read you, how much of your week they claim, how they teach, what
 * they do with the team, how they behave on a job, how they test you, what they gatekeep and
 * the story they carry. Every dimension is read by a rule, so two senseis with different ways
 * play differently, and a generated sensei is as distinct as an authored one.
 */

/** What they think makes a shinobi: decides the order they teach things in and their formats. */
export const SENSEI_PHILOSOPHIES = [
  'body',
  'teamwork',
  'fundamentals',
  'edge',
  'survival',
  'control',
  'shadow',
] as const;
export type SenseiPhilosophy = (typeof SENSEI_PHILOSOPHIES)[number];

/**
 * What they look at first when they read you: your weakest stat, the weakest layer of your
 * defence (what gets you killed), your specialty, what the team lacks, or a talent you haven't
 * found.
 */
export const SENSEI_LENSES = [
  'weakest-stat',
  'weakest-defence',
  'specialty',
  'team-gap',
  'hidden-talent',
] as const;
export type SenseiLens = (typeof SENSEI_LENSES)[number];

/** How much of your week they claim, and how hard they take an absence. */
export const SENSEI_GRIPS = ['tight', 'firm', 'loose'] as const;
export type SenseiGrip = (typeof SENSEI_GRIPS)[number];

/** Whether they turn up when they said, later, or on a day of their own choosing. */
export const PUNCTUALITIES = ['punctual', 'late', 'irregular'] as const;
export type Punctuality = (typeof PUNCTUALITIES)[number];

/** What a short session with them is. The full weekly lesson is always the lesson. */
export const SESSION_FORMATS = [
  'drill',
  'spar',
  'team-drill',
  'field',
  'theory',
  'meditation',
  'march',
  'review',
] as const;
export type SessionFormat = (typeof SESSION_FORMATS)[number];

/** How they tell you what they think. */
export const SENSEI_FEEDBACK = ['blunt', 'warm', 'socratic', 'competitive', 'cryptic'] as const;
export type SenseiFeedback = (typeof SENSEI_FEEDBACK)[number];

/** What a team day with them is. */
export const RITUAL_KINDS = ['meal', 'challenge', 'tea', 'debrief', 'camp'] as const;
export type RitualKind = (typeof RITUAL_KINDS)[number];

/** What they give when you have done what they asked. */
export const SENSEI_REWARDS = ['praise', 'signature', 'gear', 'recipe', 'meal'] as const;
export type SenseiReward = (typeof SENSEI_REWARDS)[number];

/** How they treat you on a job: step in early, watch and help, or let you fail and learn. */
export const MISSION_POSTURES = ['shield', 'watchful', 'lets-fail'] as const;
export type MissionPosture = (typeof MISSION_POSTURES)[number];

/** The test they set a new team. It never fails you; what you did sets how they rate you. */
export const OPENING_TESTS = ['bells', 'survival', 'spar', 'interview', 'none'] as const;
export type OpeningTest = (typeof OPENING_TESTS)[number];

/** How soon they put a student forward for the chūnin exam. */
export const NOMINATION_HABITS = ['early', 'usual', 'late'] as const;
export type NominationHabit = (typeof NOMINATION_HABITS)[number];

/** How your place in the class colours their first view of you. */
export const CLASS_REGARDS = ['champions-last', 'pushes-best', 'even'] as const;
export type ClassRegard = (typeof CLASS_REGARDS)[number];

/** When they train you: how many times a week in all (the lesson among them), and when. */
export interface SenseiCadence {
  readonly sessions: number;
  readonly slot: TimeSlot;
  readonly punctuality: Punctuality;
}

/** A team day of theirs, with their words for it (no numbers). */
export interface SenseiRitual {
  readonly kind: RitualKind;
  readonly line: string;
}

/** The slips and nominations they hold back until you have earned them. */
export interface SenseiGatekeeping {
  /** Bond stage before they sign a travel pass. */
  readonly passStage: number;
  /** Bond stage before they sign the library permit. */
  readonly permitStage: number;
  readonly nominates: NominationHabit;
}

export interface SenseiWays {
  readonly philosophy: SenseiPhilosophy;
  readonly lens: SenseiLens;
  readonly grip: SenseiGrip;
  /** Bond stage at which they ease off: a smaller plan, and an assignment you may swap. */
  readonly loosensAtStage: number;
  readonly cadence: SenseiCadence;
  /** Their short sessions, in order of liking (never empty). */
  readonly formats: readonly SessionFormat[];
  readonly feedback: SenseiFeedback;
  readonly rituals: readonly SenseiRitual[];
  /** What they give for work done, in order of liking (never empty). */
  readonly rewards: readonly SenseiReward[];
  readonly onMissions: MissionPosture;
  readonly test: OpeningTest;
  readonly gatekeeping: SenseiGatekeeping;
  readonly classRegard: ClassRegard;
}
