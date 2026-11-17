import type { TechniqueDef } from '@/systems/techniques';

/**
 * The curse mark's second state, which Orochimaru's guard carry: the mark spreads, the skin
 * darkens and the body changes, stronger in everything for as long as the body can stand it.
 * A plain empower (there is no ladder for it), with the first state folded in.
 */
export const CURSE_MARK_ARTS: readonly TechniqueDef[] = [
  {
    id: 'curse-mark-second-state',
    name: 'Curse Mark: Second State',
    description:
      'The marks crawl out over the whole body, the skin goes dark and the body changes. Everything is stronger, and it eats its bearer while it lasts.',
    discipline: 'ninjutsu',
    effects: [
      {
        verb: 'empower',
        power: 9,
        boosts: ['strength', 'speed', 'stamina', 'taijutsu', 'ninjutsu', 'genjutsu'],
        healthPerExchange: 3,
        afterCost: { kind: 'exhaustion', days: 2 },
      },
    ],
    chakraCost: 18,
    rank: 'B',
    difficulty: 115,
    oncePerFight: true,
  },
];
