import type { LocationDef } from '../../../types';

/**
 * The Fire Temple, up in the hills north-west of the Leaf, where the Daimyō's warrior monks
 * guard the country's prayers. A pilgrims' hall to sleep in, a temple kitchen, a courtyard
 * where the monks drill, and the steward's errands.
 */
export const FIRE_TEMPLE: LocationDef = {
  id: 'fire-temple',
  name: 'The Fire Temple',
  epithet: 'Monks of the Land of Fire',
  map: { x: 37, y: 22, label: 'left' },
  backdrop: 'mountain',
  places: [
    {
      id: 'pilgrims-hall',
      kind: 'inn',
      name: 'The Pilgrims’ Hall',
      icon: 'torii',
      blurb: 'Bare floors, a thin quilt and a bell at dawn. Nobody snores twice.',
      keeper: 'An old monk who takes your coins as an offering',
      roomCost: 10,
    },
    {
      id: 'temple-kitchen',
      kind: 'market',
      name: 'The Temple Kitchen',
      icon: 'pot',
      blurb: 'Plain food, served after prayers',
      stalls: [
        {
          name: 'The Refectory Hatch',
          blurb: 'No meat, no fish, no complaints',
          hours: ['morning', 'evening'],
          icon: 'bowl',
          foodIds: ['temple-vegetable-set', 'temple-sesame-tofu'],
        },
      ],
    },
    {
      id: 'temple-courtyard',
      kind: 'training',
      name: 'The Temple Courtyard',
      icon: 'fist',
      blurb: 'Stone flags worn smooth by bare feet',
      trainingIds: ['staff-forms', 'thousand-steps', 'dawn-zazen'],
    },
    {
      id: 'stewards-office',
      kind: 'missions',
      name: 'The Steward’s Office',
      icon: 'board',
      blurb: 'The temple asks favours of passing shinobi',
      missionIds: ['temple-pilgrim-road', 'temple-bell-thief'],
    },
  ],
};
