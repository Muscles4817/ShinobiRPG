import type { DustDef } from '../dusts';

/** The kinds of dust a user may command, shared by every pack (`dusts.ts`). */
export const DUSTS: readonly DustDef[] = [
  {
    id: 'sand',
    name: 'Sand',
    description:
      'Light and quick, and there is sand nearly everywhere. Water soaks it heavy and useless.',
    qualities: { weight: 'D', hold: 'B', draw: 'A' },
    gifts: {},
    banes: ['water'],
    drawnOn: ['arena', 'forest', 'town'],
  },
  {
    id: 'iron-sand',
    name: 'Iron Sand',
    description:
      'Black grit that hits like a hammer and cuts where it lands. Lightning scatters it, and no ground gives it back.',
    qualities: { weight: 'A', hold: 'C', draw: 'E' },
    gifts: { cutting: 2 },
    banes: ['lightning'],
    drawnOn: [],
    making: { ryo: 60, how: 'You pan black sand from the river and draw the iron out of it.' },
    price: 180,
    techniqueIds: ['dust-iron-needles', 'dust-iron-maul'],
  },
  {
    id: 'gold-dust',
    name: 'Gold Dust',
    description:
      'Heavy and slow, and nothing grips harder. Water runs off it. Only ground with gold in it gives more.',
    qualities: { weight: 'A', hold: 'A', draw: 'E' },
    gifts: {},
    banes: [],
    drawnOn: [],
    making: { ryo: 320, how: 'You file gold down to dust, grain by grain, until your hands ache.' },
    price: 900,
    techniqueIds: ['dust-gold-press', 'dust-gold-tide'],
  },
  {
    id: 'ash',
    name: 'Ash',
    description:
      'Grey and choking, it finds a foe’s eyes. Any wind blows it away, but every hearth makes more.',
    qualities: { weight: 'E', hold: 'D', draw: 'B' },
    gifts: { blinding: 2 },
    banes: ['wind'],
    drawnOn: ['town', 'room'],
  },
  {
    id: 'glass-sand',
    name: 'Glass Sand',
    description:
      'Ground glass that slices whatever it touches, and shatters to nothing under a heavy blow.',
    qualities: { weight: 'C', hold: 'D', draw: 'D' },
    gifts: { cutting: 3 },
    banes: ['heavy'],
    drawnOn: [],
    making: { ryo: 40, how: 'You break old bottles and grind them fine in a mortar.' },
    price: 120,
    techniqueIds: ['dust-glass-shards', 'dust-glass-squall'],
  },
];
