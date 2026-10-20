import type { CompanionKindDef } from '../../../companions';
import { HOUND_TECHNIQUES } from '../../../shared/beastTechniques';
import { HOUND_DIET } from '../../../shared/wildKinds';

/**
 * The Sand's hounds, bred at the Breaking Pens for the collar: short-coated, long-legged, quick
 * to take an order and never encouraged to think past it. The Sand keeps no beast with a mind
 * of its own (`docs/design/sunagakure-plan.md`).
 */
export const SAND_HOUND: CompanionKindDef = {
  id: 'sand-hound',
  name: 'Sand hound',
  description:
    'A lean, long-legged hound of the Breaking Pens, bred to run on sand and to obey before it thinks.',
  temperament: 'bred',
  body: {
    adult: { strength: 10, speed: 15, stamina: 12, perception: 13 },
    maturesInDays: 56,
  },
  baseStat: 4,
  statBonuses: { taijutsu: 1, intellect: -2 },
  healthScale: 0.6,
  maxChakra: 10,
  traits: ['brawler', 'swift'],
  aptitude: {
    speed: 1.4,
    perception: 1.1,
    taijutsu: 1.2,
    intellect: 0.4,
    chakraControl: 0.4,
    ninjutsu: 0,
    genjutsu: 0,
    kenjutsu: 0,
    fuuinjutsu: 0,
  },
  diet: HOUND_DIET,
  techniques: HOUND_TECHNIQUES,
  roles: ['tracker'],
  plays: { likes: ['fetch', 'rough'], dislikes: ['scent'] },
  names: ['Kaze', 'Suna', 'Hayate', 'Ibuki', 'Tsumuji', 'Arashi'],
};
