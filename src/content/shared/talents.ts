import type { TalentDef } from '../types';

/** Special talents noted on the academy file. Each comes with a cost. */
export const TALENTS: readonly TalentDef[] = [
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
    statBonuses: { stamina: 3, chakraControl: -2 },
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
];
