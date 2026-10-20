import type { TechniqueDef } from '@/systems/techniques';

import type { PuppetDef } from '../../../puppets';
import { statLine } from '../../../statLine';

/** The plain workshop puppet an Akasuna journeyman carries, before they build one of their own. */
export const WORKSHOP_DOLL_ARTS: readonly TechniqueDef[] = [
  {
    id: 'unseal-workshop-doll',
    name: 'Unsealing: Workshop Doll',
    description: 'A plain wooden puppet, lacquered red, unfolds out of a scroll.',
    discipline: 'ninjutsu',
    school: 'Red Sand Puppetry',
    effects: [{ verb: 'summon', power: 1, call: 'workshop-doll' }],
    chakraCost: 10,
    rank: 'C',
    difficulty: 80,
  },
];

export const WORKSHOP_DOLL: PuppetDef = {
  id: 'workshop-doll',
  name: 'Workshop Doll',
  description:
    'Every journeyman of the Red Sand carries one: two blades in the wrists and nothing clever.',
  techniqueId: 'unseal-workshop-doll',
  stats: statLine('D', { kenjutsu: 'C', speed: 'C' }),
  healthScale: 1,
  maxChakra: 20,
  techniqueIds: ['hidden-blades'],
  upkeep: 2,
};
