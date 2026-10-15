import { look } from '../../../look';
import { statLine } from '../../../statLine';
import type { PersonDef } from '../../../types';

/** Shukuba Town's people: they live on the highway and are met only there. */
export const SHUKUBA_PEOPLE: readonly PersonDef[] = [
  {
    id: 'sota',
    name: 'Sōta',
    familyName: 'Hikyaku',
    homeLocationId: 'shukuba-town',
    role: 'villager',
    title: 'Highway courier',
    rank: 'civilian',
    stats: statLine(4, {
      speed: 10,
      stamina: 10,
      intellect: 8,
      taijutsu: 1,
      ninjutsu: 0,
      genjutsu: 0,
      kenjutsu: 0,
      fuuinjutsu: 0,
    }),
    traitIds: ['curious', 'lazy'],
    appearance: look(
      'short',
      { hair: '#2a2a2a', eyes: '#2a1d14', skin: '#e2b48c', outfit: '#6a4a2a' },
      'arm',
    ),
    bio: 'Runs letters between the Leaf and Tanzaku and reads none of them, he says. Knows the gossip of both ends of the road anyway.',
    schedule: {
      morning: null,
      afternoon: 'post-office',
      evening: 'waystation',
      night: 'waystation',
    },
  },
];
