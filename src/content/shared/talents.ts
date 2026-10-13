import type { TalentDef } from '../types';

/**
 * Special notes on the academy file. Most are trade-offs, a gift with a cost; a few are
 * one-sided, for building someone who really is hopeless at something or good at everything,
 * and a file can say nothing special at all.
 */
export const TALENTS: readonly TalentDef[] = [
  {
    id: 'unremarkable',
    name: 'Nothing special',
    description: 'The instructors left this part of the file blank.',
    statBonuses: {},
    modifiers: {},
  },
  {
    id: 'prodigy',
    name: 'Prodigy',
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
  },
  {
    id: 'hard-worker',
    name: 'Hard worker',
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
    description: 'More chakra than a jōnin, and very little idea how to steer it.',
    statBonuses: { reserves: 4, chakraControl: -2 },
    modifiers: { growth: { chakraControl: 0.85 } },
  },
  {
    id: 'perfect-control',
    name: 'Perfect chakra control',
    description: 'Not a drop wasted. The body hasn’t caught up with the mind.',
    statBonuses: { chakraControl: 3, strength: -1 },
    modifiers: { studyDiscipline: { ninjutsu: 1.1 } },
  },
  {
    id: 'sensor',
    name: 'Sensor',
    description: 'Feels chakra like others feel the wind. Never was much of a fighter.',
    statBonuses: { perception: 3, strength: -1 },
    modifiers: {},
  },
  {
    id: 'tactician',
    name: 'Tactician',
    description: 'Thinks ten moves ahead. Moves rather slower than that.',
    statBonuses: { intellect: 3, speed: -1 },
    modifiers: { studyDiscipline: { fuuinjutsu: 1.2 } },
  },
  {
    id: 'iron-stomach',
    name: 'Iron stomach',
    description: 'Can go a day on one rice ball. Built for comfort, not speed.',
    statBonuses: {},
    modifiers: { hungerRate: 0.7, growth: { speed: 0.9 } },
  },
  {
    id: 'no-chakra',
    name: 'Can’t mould chakra',
    description: 'Can’t make a single hand seal take. Ninjutsu and genjutsu will never come.',
    statBonuses: { ninjutsu: -2, genjutsu: -2 },
    modifiers: {},
    aptitude: { ninjutsu: 0, genjutsu: 0 },
  },
  {
    id: 'all-rounder',
    name: 'Good at everything',
    description: 'Never top in any one art, never behind in any. Annoying to share a class with.',
    statBonuses: { taijutsu: 1, ninjutsu: 1, genjutsu: 1, kenjutsu: 1, fuuinjutsu: 1 },
    modifiers: {},
  },
];
