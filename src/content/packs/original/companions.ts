import type { CompanionKindDef } from '../../companions';
import { HOUND_TECHNIQUES } from '../../shared/beastTechniques';
import { BEAST_KINDS } from '../../shared/beastKinds';
import { FOREST_WOLF, HOUND_DIET } from '../../shared/wildKinds';

/** Creatures that may become a companion in Tōrōgakure. */
export const COMPANION_KINDS: readonly CompanionKindDef[] = [
  {
    id: 'stray-hound',
    name: 'Stray hound',
    description: 'Lean, wary and quick, with a nose for trouble and for anything left unguarded.',
    temperament: 'stray',
    body: {
      adult: { strength: 7, speed: 13, stamina: 12, perception: 15 },
      maturesInDays: 56,
    },
    baseStat: 4,
    statBonuses: { intellect: -2 },
    healthScale: 0.6,
    maxChakra: 13,
    traits: ['brawler'],
    aptitude: {
      speed: 1.1,
      perception: 1.1,
      taijutsu: 0.9,
      intellect: 0.5,
      chakraControl: 0.4,
      ninjutsu: 0,
      genjutsu: 0,
      kenjutsu: 0,
      fuuinjutsu: 0,
    },
    diet: HOUND_DIET,
    techniques: HOUND_TECHNIQUES,
    roles: ['tracker'],
    plays: { likes: ['fetch', 'scent'], dislikes: ['walk'] },
    names: ['Ash', 'Soot', 'Ember', 'Wick', 'Tallow', 'Cinder', 'Moth', 'Dusk'],
    stray: {
      placeIds: ['market-street', 'mission-hall', 'training-grounds'],
      chance: 0.6,
      line: 'A thin grey hound noses through the scraps under the lanterns, ribs showing.',
      visit:
        'You crouch by the hound and wait. It edges closer, takes what you offer, and lets you touch its ear before it slips away.',
      follows:
        'This morning the grey hound is sitting outside your door. When you set off, it falls in at your heel.',
    },
  },
  {
    id: 'kennel-hound',
    name: 'Kennel hound',
    description:
      'A pup from the clinic’s own line of working dogs, steady and keen-nosed and eager to please.',
    temperament: 'bred',
    body: {
      adult: { strength: 7, speed: 13, stamina: 13, perception: 16 },
      maturesInDays: 56,
    },
    baseStat: 4,
    statBonuses: { taijutsu: 1, intellect: -1 },
    healthScale: 0.6,
    maxChakra: 13,
    traits: ['brawler'],
    aptitude: {
      speed: 1.2,
      perception: 1.3,
      taijutsu: 1.1,
      intellect: 0.6,
      chakraControl: 0.5,
      ninjutsu: 0,
      genjutsu: 0,
      kenjutsu: 0,
      fuuinjutsu: 0,
    },
    diet: HOUND_DIET,
    techniques: HOUND_TECHNIQUES,
    roles: ['tracker'],
    plays: { likes: ['fetch', 'walk'], dislikes: [] },
    names: ['Lantern', 'Tsuki', 'Hoshi', 'Kibi', 'Mame', 'Kuri'],
  },
  FOREST_WOLF,
  ...BEAST_KINDS,
];
