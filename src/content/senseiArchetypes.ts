import type {
  MissionPosture,
  OpeningTest,
  RitualKind,
  SenseiFeedback,
  SenseiGrip,
  SenseiLens,
  SenseiPhilosophy,
  SessionFormat,
} from './senseis';

/**
 * Kinds of sensei, for the jōnin a pack doesn't write ways for (`game/sensei/generate.ts`).
 * Each fixes what makes it that kind; everything else is rolled from the person's id, and the
 * result keeps the coherence rules `validateSenseis` checks. `{name}` is filled in lines.
 */
export interface SenseiArchetype {
  readonly id: string;
  readonly philosophy: SenseiPhilosophy;
  readonly lens: SenseiLens;
  readonly grip: SenseiGrip;
  readonly formats: readonly SessionFormat[];
  readonly feedback: SenseiFeedback;
  readonly onMissions: MissionPosture;
  readonly test: OpeningTest;
  readonly rituals: readonly RitualKind[];
  /** What weighs on them; `{name}` and its pronoun forms are the sensei. */
  readonly wound: string;
}

export const SENSEI_ARCHETYPES: readonly SenseiArchetype[] = [
  {
    id: 'drillmaster',
    philosophy: 'body',
    lens: 'specialty',
    grip: 'tight',
    formats: ['march', 'drill', 'spar'],
    feedback: 'blunt',
    onMissions: 'shield',
    test: 'spar',
    rituals: ['challenge'],
    wound: 'Someone {name.they} trained too gently didn’t come back.',
  },
  {
    id: 'strategist',
    philosophy: 'teamwork',
    lens: 'team-gap',
    grip: 'firm',
    formats: ['team-drill', 'review', 'theory'],
    feedback: 'socratic',
    onMissions: 'watchful',
    test: 'bells',
    rituals: ['debrief', 'tea'],
    wound: 'A plan of {name.theirs} once cost a teammate.',
  },
  {
    id: 'guardian',
    philosophy: 'fundamentals',
    lens: 'weakest-defence',
    grip: 'firm',
    formats: ['drill', 'theory', 'meditation'],
    feedback: 'warm',
    onMissions: 'shield',
    test: 'interview',
    rituals: ['tea'],
    wound: '{name.they} {name.was} the only one of {name.their} team to come home.',
  },
  {
    id: 'gourmand',
    philosophy: 'edge',
    lens: 'specialty',
    grip: 'loose',
    formats: ['spar', 'drill', 'review'],
    feedback: 'blunt',
    onMissions: 'watchful',
    test: 'survival',
    rituals: ['meal'],
    wound: '{name.they} grew up hungry, and never will be again.',
  },
  {
    id: 'prodigy',
    philosophy: 'edge',
    lens: 'hidden-talent',
    grip: 'firm',
    formats: ['spar', 'drill', 'theory'],
    feedback: 'competitive',
    onMissions: 'lets-fail',
    test: 'spar',
    rituals: ['challenge'],
    wound: '{name.they} {name.was} a genius at twelve, and lonely for it.',
  },
  {
    id: 'old-hand',
    philosophy: 'survival',
    lens: 'weakest-stat',
    grip: 'loose',
    formats: ['field', 'march', 'review'],
    feedback: 'cryptic',
    onMissions: 'lets-fail',
    test: 'survival',
    rituals: ['camp', 'meal'],
    wound: '{name.they} {name.has} buried more friends than {name.they} talk{name.s} about.',
  },
  {
    id: 'eccentric',
    philosophy: 'shadow',
    lens: 'weakest-stat',
    grip: 'loose',
    formats: ['field', 'meditation', 'theory'],
    feedback: 'cryptic',
    onMissions: 'watchful',
    test: 'none',
    rituals: ['tea'],
    wound: 'Nobody has ever quite known what {name.they} lost.',
  },
];

/** A team day's line for a generated sensei, by kind (no numbers). */
export const RITUAL_LINES: Readonly<Record<RitualKind, string>> = {
  meal: '{name} takes the team out to eat, and pays for all of it.',
  challenge: '{name} challenges the whole team, and beats every one of you.',
  tea: '{name} pours tea for the team and lets the talk go where it goes.',
  debrief: '{name} goes through the last job with the team, choice by choice.',
  camp: '{name} takes the team out past the walls for a night under the stars.',
};
