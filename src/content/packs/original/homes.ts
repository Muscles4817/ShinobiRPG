import type { HomeDef } from '../../homes';
import type { PlaceDef } from '../../types';

/** Tōrōgakure's ladder of homes, and the land office by the market that lets them. */

export const ORIGINAL_HOMES: readonly HomeDef[] = [
  {
    id: 'lantern-row-flat',
    name: 'A flat on Lantern Row',
    lodging: 'The flat on Lantern Row',
    blurb: 'Two rooms and a balcony over the night market.',
    movingIn:
      'Two rooms, a balcony and a kitchen with a real stove. The night market hums below the window until late, and you find you like it.',
    rentPerWeek: 70,
    needs: { missionsCompleted: 3 },
    spots: ['bed', 'desk', 'wall', 'corner', 'hearth'],
    rooms: [],
  },
  {
    id: 'dyers-townhouse',
    name: 'A townhouse in the dyers’ quarter',
    lodging: 'The townhouse in the dyers’ quarter',
    blurb: 'A garden, a yard to drill in, and a room for a guest.',
    movingIn:
      'You carry the last box up the step. The house smells of indigo and old cedar, and the garden is mostly weeds. It is the first place that has felt like yours.',
    rentPerWeek: 150,
    price: 4000,
    needs: { rank: 'chunin' },
    spots: ['bed', 'desk', 'wall', 'corner', 'hearth'],
    rooms: ['garden', 'yard', 'guest'],
    beds: 6,
    yardTrainingIds: ['post-kicks', 'rooftop-sprints', 'blade-forms'],
  },
  {
    id: 'river-house',
    name: 'A walled house above the river',
    lodging: 'The house above the river',
    blurb: 'A dojo, a bath of your own, a library alcove.',
    movingIn: 'The gate closes behind you with a sound like a decision.',
    price: 12000,
    needs: { rank: 'jonin' },
    spots: ['bed', 'desk', 'wall', 'corner', 'hearth'],
    rooms: ['garden', 'yard', 'guest'],
    beds: 8,
    yardTrainingIds: ['post-kicks', 'rooftop-sprints', 'blade-forms'],
    lockedReason: 'The river houses are still being built.',
  },
  {
    id: 'own-compound',
    name: 'A compound of your own',
    lodging: 'Your compound',
    blurb: 'Not for sale. Founded, when a name is worth carrying on.',
    movingIn: 'Your crest goes up on the gate.',
    needs: { rank: 'jonin' },
    spots: ['bed', 'desk', 'wall', 'corner', 'hearth'],
    rooms: ['garden', 'yard', 'guest'],
    beds: 8,
    yardTrainingIds: ['post-kicks', 'rooftop-sprints', 'blade-forms'],
    lockedReason: 'Founding a house of your own comes later.',
  },
];

export const ORIGINAL_LETTINGS: PlaceDef = {
  id: 'lettings',
  kind: 'lettings',
  name: 'Lantern Quarter Lettings',
  icon: 'house',
  blurb: 'Rooms, flats and houses; a joiner next door',
  keeper: 'Clerk Hanabusa',
  homeIds: ORIGINAL_HOMES.map((h) => h.id),
  furnishingIds: [
    'straw-futon',
    'cotton-futon',
    'low-desk',
    'lacquer-desk',
    'calligraphy-scroll',
    'kettle-brazier',
    'bonsai',
    'low-table',
    'irori',
  ],
};
