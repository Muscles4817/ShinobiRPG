import type { PlaceDef } from '../../types';

/**
 * Where Tōrōgakure unwinds: the Paper Lantern, where the regulars drink and the counter hears
 * everything, and the Ember Springs, hot water up from the embers under the village.
 */
export const TOROGAKURE_LEISURE: readonly PlaceDef[] = [
  {
    id: 'izakaya',
    kind: 'tavern',
    name: 'The Paper Lantern',
    icon: 'sake',
    blurb: 'An izakaya that opens at dusk',
    hours: ['evening', 'night'],
    keeper: 'Mama Sayo, who hears everything',
    foodIds: [
      'lantern-yakitori',
      'night-oden',
      'roasted-barley-tea',
      'salted-edamame',
      'grilled-mushrooms',
      'hot-yuzu-tea',
    ],
    roundCost: 40,
    cupCost: 12,
    pastimes: [
      {
        id: 'lantern-dice',
        name: 'Lantern dice',
        scene:
          'Three dice in a paper cup, read by the light of the lantern hung over the table. Mama Sayo takes a cut of every pot.',
      },
      {
        id: 'shogi',
        name: 'Shōgi by the stove',
        scene:
          'Two old chūnin bent over a board that has not been cleared in a week. Nobody is allowed to touch it.',
      },
    ],
  },
  {
    id: 'ember-springs',
    kind: 'onsen',
    name: 'The Ember Springs',
    icon: 'spring',
    blurb: 'Hot water from deep under the village, steaming in rock pools among the cedars.',
    hours: ['morning', 'afternoon', 'evening'],
    keeper: 'Old Fumi, who rakes the stones and takes your coins',
    waters: 'spring',
    soakCost: 15,
  },
];
