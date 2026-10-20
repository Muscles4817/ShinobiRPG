import type { LocationDef } from '../../../types';

/**
 * Kagerō Landing, where the Land of Rivers runs out and the Wind Country's sand begins: a
 * frontier town of wells and caravans, and the yards where the sand priests' barges put in.
 * Nobody crosses the desert sane without a barge, and nobody boards one without a priest's
 * leave (`docs/design/sunagakure-plan.md`). The town needs the priests and won't eat with them.
 */
export const KAGERO_LANDING: LocationDef = {
  id: 'kagero-landing',
  name: 'Kagerō Landing',
  epithet: 'Where the Sand Begins',
  map: { x: 22.5, y: 41, label: 'left' },
  backdrop: 'barge-landing',
  places: [
    {
      id: 'kagero-caravanserai',
      kind: 'inn',
      name: 'The Caravanserai',
      icon: 'house',
      blurb: 'A walled yard of rooms round a well, and camels in the gateway',
      keeper: 'Old Hamada, who rents rooms by the night and water by the cup',
      roomCost: 25,
    },
    {
      id: 'kagero-water-market',
      kind: 'market',
      name: 'The Water Market',
      icon: 'cart',
      blurb: 'Water sold by the cup and the skin, and everything else besides',
      stalls: [
        {
          name: 'The Well-Seller',
          blurb: 'Cold water drawn while you watch, and a date cake to go with it',
          icon: 'tea',
          foodIds: ['well-water', 'date-cakes'],
        },
        {
          name: 'Caravan Provisions',
          blurb: 'Everything a crossing needs, at a price that knows it',
          hours: ['morning', 'afternoon'],
          icon: 'cart',
          foodIds: ['camel-milk-tea'],
          ingredientIds: ['travel-rations', 'rice'],
        },
      ],
    },
    {
      id: 'barge-office',
      kind: 'missions',
      name: 'The Barge Office',
      icon: 'board',
      blurb: 'A shed by the yards, where a priest writes down who may board',
      missionIds: ['landing-ballast', 'landing-lost-skiff', 'landing-spice-runners'],
    },
    {
      id: 'barge-yards',
      kind: 'training',
      name: 'The Barge Yards',
      icon: 'wind',
      blurb: 'Sand barges drawn up on the dunes, and priests who won’t look at you',
      trainingIds: ['ballast-hauling', 'reading-the-dunes'],
    },
    {
      id: 'heat-flats',
      kind: 'training',
      name: 'The Heat Flats',
      icon: 'eye',
      blurb: 'Hard white ground where the air shimmers from mid-morning',
      trainingIds: ['heat-shimmer-drill', 'sand-running'],
    },
  ],
};
