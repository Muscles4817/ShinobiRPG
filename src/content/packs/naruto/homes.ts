import type { HomeDef } from '../../homes';
import type { PlaceDef } from '../../types';

/** The Leaf's ladder of homes, and the housing office that lets them. */

export const NARUTO_HOMES: readonly HomeDef[] = /*#__PURE__*/ (() => [
  {
    id: 'market-street-flat',
    name: 'A flat off the market street',
    lodging: 'The flat off the market street',
    blurb: 'Two rooms and a balcony with a view of the faces on the cliff.',
    movingIn:
      'Two rooms and a balcony, and a kitchen that isn’t also the bedroom. The faces on the cliff watch over the street below.',
    rentPerWeek: 70,
    needs: { missionsCompleted: 3 },
    spots: ['bed', 'desk', 'wall', 'corner', 'hearth'],
    rooms: [],
  } satisfies HomeDef,
  {
    id: 'garden-house',
    name: 'A house by the training fields',
    lodging: 'The house by the training fields',
    blurb: 'A garden, a yard to drill in, and a room for a guest.',
    movingIn:
      'The house is small and the garden is mostly weeds, but the yard backs onto the training fields. It is the first place that has felt like yours.',
    rentPerWeek: 150,
    price: 4000,
    needs: { rank: 'chunin' },
    spots: ['bed', 'desk', 'wall', 'corner', 'hearth'],
    rooms: ['garden', 'yard', 'guest'],
    beds: 6,
    yardTrainingIds: ['training-posts', 'rooftop-runs', 'sword-kata'],
  } satisfies HomeDef,
  {
    id: 'walled-house',
    name: 'A walled house in the old district',
    lodging: 'The house in the old district',
    blurb: 'A dojo, a bath of your own, a library alcove.',
    movingIn: 'The gate closes behind you with a sound like a decision.',
    price: 12000,
    needs: { rank: 'jonin' },
    spots: ['bed', 'desk', 'wall', 'corner', 'hearth'],
    rooms: ['garden', 'yard', 'guest'],
    beds: 8,
    yardTrainingIds: ['training-posts', 'rooftop-runs', 'sword-kata'],
    lockedReason: 'The old district’s houses are still being restored.',
  } satisfies HomeDef,
])();

export const NARUTO_LETTINGS: PlaceDef = {
  id: 'housing-office',
  kind: 'lettings',
  name: 'Village Housing Office',
  icon: 'house',
  blurb: 'Flats and houses; a carpenter next door',
  keeper: 'The housing clerk',
  homeIds: ['market-street-flat', 'garden-house', 'walled-house'],
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
