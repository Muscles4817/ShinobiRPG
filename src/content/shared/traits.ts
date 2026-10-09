import type { TraitDef } from '../types';

/** Personality traits, in opposing pairs. Setting-neutral, so every pack can use them. */
export const TRAITS: readonly TraitDef[] = [
  {
    id: 'brash',
    name: 'Brash',
    note: 'Charges in before the bell has finished ringing.',
    opposite: 'calm',
    modifiers: { growth: { taijutsu: 1.1 }, studyDiscipline: { genjutsu: 0.9 } },
  },
  {
    id: 'calm',
    name: 'Calm',
    note: 'Never raises their voice. Never misses a detail.',
    opposite: 'brash',
    modifiers: { growth: { willpower: 1.1 }, studyDiscipline: { genjutsu: 1.1 } },
  },
  {
    id: 'diligent',
    name: 'Diligent',
    note: 'First to arrive, last to leave. Forgets to eat.',
    opposite: 'lazy',
    modifiers: { training: 1.08, hungerRate: 1.1 },
  },
  {
    id: 'lazy',
    name: 'Lazy',
    note: 'Talented, when awake. Usually found watching clouds.',
    opposite: 'diligent',
    modifiers: { training: 0.92, hungerRate: 0.85 },
  },
  {
    id: 'kind',
    name: 'Kind',
    note: 'Shares lunch with whoever forgot theirs.',
    opposite: 'cunning',
    modifiers: { growth: { willpower: 1.1 } },
  },
  {
    id: 'cunning',
    name: 'Cunning',
    note: 'Has never once been caught. We suspect plenty.',
    opposite: 'kind',
    modifiers: { growth: { intellect: 1.1 }, studyDiscipline: { genjutsu: 1.05 } },
  },
  {
    id: 'proud',
    name: 'Proud',
    note: 'Will not accept help. Will not accept losing.',
    opposite: 'humble',
    modifiers: { growth: { strength: 1.1 } },
  },
  {
    id: 'humble',
    name: 'Humble',
    note: 'Asks questions. Listens to the answers.',
    opposite: 'proud',
    modifiers: {
      studyDiscipline: {
        taijutsu: 1.05,
        ninjutsu: 1.05,
        genjutsu: 1.05,
        kenjutsu: 1.05,
        fuuinjutsu: 1.05,
      },
    },
  },
  {
    id: 'curious',
    name: 'Curious',
    note: 'Has read every scroll in the library, including the ones we hid.',
    opposite: 'focused',
    modifiers: { studyElement: { fire: 1.1, wind: 1.1, lightning: 1.1, earth: 1.1, water: 1.1 } },
  },
  {
    id: 'focused',
    name: 'Focused',
    note: 'Picks one thing and does it until it is perfect.',
    opposite: 'curious',
    modifiers: { growth: { chakraControl: 1.1 } },
  },
];
