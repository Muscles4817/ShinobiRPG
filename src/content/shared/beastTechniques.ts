import type { TechniqueDef } from '@/systems/techniques';

import type { CompanionLoreDef, KindTechnique } from '../companions';

/**
 * What companions do in a fight (`CompanionKindDef.techniques`): techniques only kinds hold,
 * never learned by people, opened by the bond (and a handler, for the deeper ones). One is half
 * of a combination with your own Pincer Strike, shelved at the academy: it plays only with a
 * companion beside you that knows its half.
 */
export const BEAST_TECHNIQUES: readonly TechniqueDef[] = [
  {
    id: 'fang-rush',
    name: 'Fang Rush',
    description: 'It closes the gap low and fast and goes for whatever is nearest.',
    discipline: 'taijutsu',
    effects: [{ verb: 'damage', power: 10 }],
    chakraCost: 2,
    rank: 'E',
    difficulty: 30,
  },
  {
    id: 'hamstring',
    name: 'Hamstring',
    description: 'A snap at the back of the leg that leaves a foe bleeding and slower to follow.',
    discipline: 'taijutsu',
    effects: [
      { verb: 'damage', power: 7 },
      { verb: 'afflict', power: 6, harm: 'bleed' },
    ],
    chakraCost: 3,
    rank: 'D',
    difficulty: 45,
  },
  {
    id: 'baying-howl',
    name: 'Baying Howl',
    description: 'A howl right in a foe’s face, loud enough to rattle the teeth and stop a breath.',
    discipline: 'taijutsu',
    effects: [{ verb: 'daze', power: 10 }],
    chakraCost: 4,
    rank: 'D',
    difficulty: 55,
  },
  {
    id: 'flanking-bite',
    name: 'Flanking Bite',
    description: 'While you hold a foe’s eyes, it comes in from the side they aren’t watching.',
    discipline: 'taijutsu',
    effects: [{ verb: 'damage', power: 12 }],
    chakraCost: 3,
    rank: 'D',
    difficulty: 50,
    combo: { partnerTechniqueId: 'pincer-strike' },
  },
  {
    id: 'pincer-strike',
    name: 'Pincer Strike',
    description:
      'You come at a foe head on so your companion can take them from the side. Needs a companion who knows its half.',
    discipline: 'taijutsu',
    effects: [{ verb: 'damage', power: 12 }],
    chakraCost: 5,
    rank: 'D',
    difficulty: 50,
    combo: { partnerTechniqueId: 'flanking-bite' },
  },
];

/** The human half of the companion combination, for each pack's academy shelf. */
export const PINCER_STRIKE = 'pincer-strike';

/** What a hound comes to do: a rush, then the flank beside you, and a howl a handler teaches. */
export const HOUND_TECHNIQUES: readonly KindTechnique[] = [
  { techniqueId: 'fang-rush', stage: 1 },
  { techniqueId: 'flanking-bite', stage: 3 },
  { techniqueId: 'baying-howl', stage: 4, handler: true },
];

/** A wolf hunts by the leg, and learns to hunt beside you later still. */
export const WOLF_TECHNIQUES: readonly KindTechnique[] = [
  { techniqueId: 'fang-rush', stage: 1 },
  { techniqueId: 'hamstring', stage: 2 },
  { techniqueId: 'flanking-bite', stage: 4 },
  { techniqueId: 'baying-howl', stage: 4, handler: true },
];

/** Handling lore sold far from home: your own sessions with your companion count for more. */
export const COMPANION_LORE: readonly CompanionLoreDef[] = [
  {
    id: 'kennel-masters-notes',
    name: 'A Kennel Master’s Notes',
    description:
      'A dog-eared notebook of drills, rewards and mistakes, written by someone who raised a hundred hounds.',
    cost: 300,
    handling: 1.25,
  },
];
