import type { TalentDef } from '../types';

/**
 * Special notes on the academy file. Each is weighed: a major note is a real edge, a minor one a
 * smaller one, and a flaw a cost that makes room for one more minor note. Most are trade-offs,
 * a gift with its price; a few are one-sided, for someone who really is hopeless at something.
 * Class standing sets how many the file carries (`STANDING_INFO.notes`), and a file may carry
 * none. Notes that contradict each other name their `opposite`.
 */

/** About half a grade of limit, in stat points (as a frame's). */
const HALF_GRADE = 3;
const EVERY_ART = { taijutsu: 1, ninjutsu: 1, genjutsu: 1, kenjutsu: 1, fuuinjutsu: 1 };

const MAJOR: readonly TalentDef[] = [
  {
    id: 'prodigy',
    name: 'Quick study',
    weight: 'major',
    description: 'Learns everything fast. Pushes too hard, and the body pays for it.',
    statBonuses: { stamina: -2 },
    modifiers: {
      training: 1.15,
      studyDiscipline: {
        taijutsu: 1.15,
        ninjutsu: 1.15,
        genjutsu: 1.15,
        kenjutsu: 1.15,
        fuuinjutsu: 1.15,
      },
    },
    opposite: 'slow-learner',
  },
  {
    id: 'hard-worker',
    name: 'Hard worker',
    weight: 'major',
    description: 'Can barely mould chakra, so trains the body twice as hard instead.',
    statBonuses: {},
    modifiers: {
      growth: { taijutsu: 1.4, kenjutsu: 1.2, stamina: 1.2 },
      studyDiscipline: { ninjutsu: 0.5, genjutsu: 0.5 },
    },
  },
  {
    id: 'chakra-reserves',
    name: 'Huge chakra reserves',
    weight: 'major',
    description: 'More chakra than a jōnin, and very little idea how to steer it.',
    statBonuses: { reserves: 4, chakraControl: -2 },
    modifiers: { growth: { chakraControl: 0.85 } },
    // Reserves are born: this deep a well keeps deepening long after anyone else's stops.
    aptitude: { reserves: 1.5 },
  },
  {
    id: 'all-rounder',
    name: 'Good at everything',
    weight: 'major',
    description: 'Never top in any one art, never behind in any. Annoying to share a class with.',
    statBonuses: EVERY_ART,
    modifiers: {},
  },
  {
    id: 'sprinter',
    name: 'Born sprinter',
    weight: 'major',
    description: 'Was faster than the older children at five. Runs out of breath just as fast.',
    statBonuses: { speed: 1 },
    modifiers: { limitBonus: { speed: HALF_GRADE }, growth: { stamina: 0.85 } },
  },
  {
    id: 'blade-born',
    name: 'Born to the blade',
    weight: 'major',
    description: 'Held a practice sword before chopsticks. Illusions slide right past.',
    statBonuses: { kenjutsu: 1 },
    modifiers: {
      growth: { kenjutsu: 1.3 },
      studyDiscipline: { kenjutsu: 1.2, genjutsu: 0.8 },
    },
  },
];

const MINOR: readonly TalentDef[] = [
  {
    id: 'perfect-control',
    name: 'Perfect chakra control',
    weight: 'minor',
    description: 'Not a drop wasted. The body hasn’t caught up with the mind.',
    statBonuses: { chakraControl: 3, strength: -1 },
    modifiers: { studyDiscipline: { ninjutsu: 1.1 } },
  },
  {
    id: 'sensor',
    name: 'Sensor',
    weight: 'minor',
    description: 'Feels chakra like others feel the wind. Never was much of a fighter.',
    statBonuses: { perception: 3, strength: -1 },
    modifiers: {},
  },
  {
    id: 'tactician',
    name: 'Tactician',
    weight: 'minor',
    description: 'Thinks ten moves ahead. Moves rather slower than that.',
    statBonuses: { intellect: 3, speed: -1 },
    modifiers: { studyDiscipline: { fuuinjutsu: 1.2 } },
  },
  {
    id: 'iron-stomach',
    name: 'Iron stomach',
    weight: 'minor',
    description: 'Can go a day on one rice ball. Built for comfort, not speed.',
    statBonuses: {},
    modifiers: { hungerRate: 0.7, growth: { speed: 0.9 } },
    opposite: 'bottomless-pit',
  },
  {
    id: 'night-owl',
    name: 'Night owl',
    weight: 'minor',
    description: 'Comes alive after dark. Mornings are a write-off.',
    statBonuses: {},
    modifiers: { afterDark: 1.15 },
  },
  {
    id: 'light-sleeper',
    name: 'Light sleeper',
    weight: 'minor',
    description: 'Wakes at a footstep, and notices what made it. Never quite rested.',
    statBonuses: {},
    modifiers: { checks: { perception: 1.2 }, sleepHealing: 0.85 },
    opposite: 'restless-sleeper',
  },
  {
    id: 'iron-constitution',
    name: 'Iron constitution',
    weight: 'minor',
    description: 'Shrugs off a broken rib in a week. Thick-headed in other ways too.',
    statBonuses: {},
    modifiers: { injuryNights: 1, studyDiscipline: { genjutsu: 0.85 } },
  },
  {
    id: 'boundless-energy',
    name: 'Boundless energy',
    weight: 'minor',
    description: 'Never sits still. Never stops eating, either.',
    statBonuses: {},
    modifiers: { energyCost: 0.85, hungerRate: 1.15 },
  },
  {
    id: 'charming',
    name: 'Charming',
    weight: 'minor',
    description: 'Everyone’s friend by the second meeting. Nobody’s idea of a scholar.',
    statBonuses: {},
    modifiers: { bondGain: 1.2, checks: { intellect: 0.9 } },
    opposite: 'awkward',
  },
  {
    id: 'loner',
    name: 'Loner',
    weight: 'minor',
    description: 'Trains alone, eats alone, and gets a great deal done.',
    statBonuses: {},
    modifiers: { training: 1.08, bondGain: 0.85 },
  },
  {
    id: 'street-smart',
    name: 'Street-smart',
    weight: 'minor',
    description: 'Grew up reading people and alleys. Never had the patience for seals.',
    statBonuses: {},
    modifiers: {
      checks: { perception: 1.15, intellect: 1.15 },
      studyDiscipline: { fuuinjutsu: 0.85 },
    },
  },
  {
    id: 'fire-in-the-blood',
    name: 'Fire in the blood',
    weight: 'minor',
    description: 'Warm hands in winter and a short temper all year. Water never sits right.',
    statBonuses: {},
    modifiers: { studyElement: { fire: 1.3, water: 0.8 } },
  },
  {
    id: 'steady-hands',
    name: 'Steady hands',
    weight: 'minor',
    description: 'Writes a seal without a tremor. Throws a punch like a letter.',
    statBonuses: {},
    modifiers: {
      studyDiscipline: { fuuinjutsu: 1.15, kenjutsu: 1.1 },
      growth: { taijutsu: 0.9 },
    },
  },
];

const FLAWS: readonly TalentDef[] = [
  {
    id: 'no-chakra',
    name: 'Can’t mould chakra',
    weight: 'flaw',
    description: 'Can’t make a single hand seal take. Ninjutsu and genjutsu will never come.',
    statBonuses: { ninjutsu: -2, genjutsu: -2 },
    modifiers: {},
    aptitude: { ninjutsu: 0, genjutsu: 0 },
  },
  {
    id: 'bottomless-pit',
    name: 'Bottomless pit',
    weight: 'flaw',
    description: 'Eats like three genin and is hungry again by noon.',
    statBonuses: {},
    modifiers: { hungerRate: 1.3 },
    opposite: 'iron-stomach',
  },
  {
    id: 'frail',
    name: 'Frail',
    weight: 'flaw',
    description: 'Catches every cold going. The body is slow to harden.',
    statBonuses: {},
    modifiers: { growth: { stamina: 0.85, strength: 0.9 } },
  },
  {
    id: 'slow-learner',
    name: 'Slow learner',
    weight: 'flaw',
    description: 'Gets there in the end. The end is a long way off.',
    statBonuses: {},
    modifiers: { training: 0.9 },
    opposite: 'prodigy',
  },
  {
    id: 'restless-sleeper',
    name: 'Restless sleeper',
    weight: 'flaw',
    description: 'Up three times a night, and grey in the face by morning.',
    statBonuses: {},
    modifiers: { sleepHealing: 0.8 },
    opposite: 'light-sleeper',
  },
  {
    id: 'awkward',
    name: 'Awkward',
    weight: 'flaw',
    description: 'Says the wrong thing, then the wrong thing about that.',
    statBonuses: {},
    modifiers: { bondGain: 0.85 },
    opposite: 'charming',
  },
];

export const TALENTS: readonly TalentDef[] = [...MAJOR, ...MINOR, ...FLAWS];
