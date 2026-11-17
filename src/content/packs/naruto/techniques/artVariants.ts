import type { TechniqueDef } from '@/systems/techniques';

/**
 * More of the plain genjutsu, kenjutsu and fūinjutsu every village teaches: a ringing that
 * stuns, a crowd of false selves, a field of nightmares; a two-step cut, a parry, a lunge, a
 * whirling blade and a storm of cuts; a flash seal, an exploding kunai and barriers to hide
 * behind or lock a foe inside.
 */
export const ART_VARIANTS: readonly TechniqueDef[] = [
  {
    id: 'ringing-ears',
    name: 'Ringing Ears',
    description:
      'A bell only they can hear, rung so close to the ear that the ground tilts and the next step goes the wrong way.',
    discipline: 'genjutsu',
    effects: [
      { verb: 'daze', power: 8 },
      { verb: 'confuse', power: 4 },
    ],
    chakraCost: 7,
    rank: 'D',
    difficulty: 50,
  },
  {
    id: 'mirage-crowd',
    name: 'Mirage Crowd',
    description:
      'A dozen of you standing where only one was, and the real one already walking off among them.',
    discipline: 'genjutsu',
    effects: [
      { verb: 'clone', power: 9, kind: 'illusion' },
      { verb: 'conceal', power: 6 },
    ],
    chakraCost: 11,
    rank: 'C',
    difficulty: 75,
  },
  {
    id: 'swallowing-earth',
    name: 'Swallowing Earth',
    description:
      'The ground turns soft and opens under them, and their body believes it is sinking even as the blow they imagine lands.',
    discipline: 'genjutsu',
    effects: [
      { verb: 'pin', power: 14 },
      { verb: 'damage', power: 14 },
    ],
    chakraCost: 18,
    rank: 'B',
    difficulty: 110,
  },
  {
    id: 'nightmare-field',
    name: 'Nightmare Field',
    description:
      'Every foe on the field sees their worst fear walk out of the trees at once, and stands frozen to watch it come.',
    discipline: 'genjutsu',
    effects: [
      { verb: 'area', power: 16, size: 'wide' },
      { verb: 'daze', power: 12 },
    ],
    chakraCost: 30,
    rank: 'A',
    needs: { control: 'B' },
    difficulty: 140,
  },
  {
    id: 'two-step-cut',
    name: 'Two-Step Cut',
    description:
      'Down and back up again in the time of one stroke, the second cut finding whatever the first one opened.',
    discipline: 'kenjutsu',
    needs: { weapon: 'blade' },
    effects: [{ verb: 'damage', power: 12, hits: 2 }],
    chakraCost: 4,
    rank: 'E',
    difficulty: 35,
  },
  {
    id: 'sword-parry',
    name: 'Sword Parry',
    description:
      'Hold the blade low and wait, then turn their stroke along your edge and back into them before they recover.',
    discipline: 'kenjutsu',
    needs: { weapon: 'blade' },
    reach: ['close'],
    effects: [{ verb: 'counter', power: 13 }],
    chakraCost: 6,
    rank: 'D',
    difficulty: 55,
  },
  {
    id: 'lunging-thrust',
    name: 'Lunging Thrust',
    description:
      'A long straight thrust from as far off as the blade will reach, the whole body behind the point.',
    discipline: 'kenjutsu',
    needs: { weapon: 'blade' },
    reach: ['mid'],
    accuracy: 'sure',
    effects: [{ verb: 'damage', power: 17 }],
    chakraCost: 9,
    rank: 'C',
    difficulty: 75,
  },
  {
    id: 'whirling-blade',
    name: 'Whirling Blade',
    description:
      'Spin with the sword held out flat and cut a ring round you that leaves everyone inside it bleeding.',
    discipline: 'kenjutsu',
    needs: { weapon: 'blade' },
    reach: ['close'],
    effects: [
      { verb: 'area', power: 14, size: 'wide' },
      { verb: 'afflict', power: 6, harm: 'bleed' },
    ],
    chakraCost: 14,
    rank: 'B',
    difficulty: 115,
  },
  {
    id: 'thousand-cut-storm',
    name: 'Thousand-Cut Storm',
    description:
      'Cuts so fine and so many that the foe feels them only afterwards, when the blood starts and will not stop.',
    discipline: 'kenjutsu',
    needs: { weapon: 'blade' },
    effects: [
      { verb: 'damage', power: 28, hits: 4 },
      { verb: 'afflict', power: 8, harm: 'bleed' },
    ],
    chakraCost: 17,
    rank: 'A',
    difficulty: 140,
  },
  {
    id: 'flash-seal',
    name: 'Flash Seal',
    description:
      'A tag inked to burst into white light at arm’s length, which leaves whoever was looking at it blind for a breath.',
    discipline: 'fuuinjutsu',
    effects: [{ verb: 'daze', power: 7 }],
    chakraCost: 5,
    rank: 'E',
    difficulty: 30,
  },
  {
    id: 'exploding-kunai',
    name: 'Exploding Kunai',
    description:
      'A kunai with a tag wound round the grip, thrown to burst at the chest and throw its target back across the ground.',
    discipline: 'fuuinjutsu',
    effects: [
      { verb: 'damage', power: 16 },
      { verb: 'knock', power: 6, to: 'mid' },
    ],
    chakraCost: 11,
    rank: 'C',
    difficulty: 80,
  },
  {
    id: 'shield-barrier',
    name: 'Shield Barrier',
    description:
      'Kekkai. A pane of sealing script stands up between you and the attack, and whatever comes through it comes through to nothing.',
    discipline: 'fuuinjutsu',
    effects: [{ verb: 'substitute', power: 15 }],
    chakraCost: 18,
    rank: 'B',
    needs: { control: 'C' },
    difficulty: 110,
  },
  {
    id: 'barrier-prison',
    name: 'Barrier Prison',
    description:
      'Four tags thrown to the corners of where they stand, and a box of sealing script closes on them that chakra cannot get out of.',
    discipline: 'fuuinjutsu',
    reach: ['close', 'mid'],
    effects: [
      { verb: 'pin', power: 20 },
      { verb: 'seal', power: 12 },
    ],
    chakraCost: 30,
    rank: 'A',
    difficulty: 140,
  },
];
