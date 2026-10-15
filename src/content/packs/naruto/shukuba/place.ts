import type { LocationDef } from '../../../types';

/**
 * Shukuba Town, the post town a day down the highway: every traveller between the Leaf and
 * Tanzaku sleeps here. Inns on every corner, a travellers' market, an outfitter for the road
 * and the post office's errands.
 */
export const SHUKUBA_TOWN: LocationDef = {
  id: 'shukuba-town',
  name: 'Shukuba Town',
  epithet: 'Post town on the highway',
  map: { x: 42, y: 32.5, label: 'right' },
  backdrop: 'lantern-rooftops',
  places: [
    {
      id: 'shukuba-inn',
      kind: 'inn',
      name: 'The Highway Inn',
      icon: 'house',
      blurb: 'A long corridor of identical doors. Knock on the wrong one at your peril.',
      keeper: 'A clerk who never looks up from the register',
      roomCost: 20,
    },
    {
      id: 'post-road-market',
      kind: 'market',
      name: 'The Post Road Market',
      icon: 'cart',
      blurb: 'Food you can eat walking',
      stalls: [
        {
          name: 'The Soba Shed',
          blurb: 'Hot noodles for cold travellers',
          hours: ['morning', 'afternoon', 'evening'],
          icon: 'bowl',
          foodIds: ['post-town-soba', 'dango'],
        },
        {
          name: 'Road Stores',
          blurb: 'Everything for the next stretch',
          hours: ['morning', 'afternoon'],
          icon: 'rice',
          foodIds: [],
          ingredientIds: ['travel-rations', 'rice', 'miso', 'eggs'],
        },
      ],
    },
    {
      id: 'shukuba-outfitter',
      kind: 'gear',
      name: 'The Traveller’s Outfitter',
      icon: 'vest',
      blurb: 'Cloaks, straw hats and a few blades',
      hours: ['morning', 'afternoon'],
      keeper: 'A retired courier with one good knee',
      gearIds: ['tanto', 'weighted-kunai', 'mesh-shirt', 'shadow-cloak'],
    },
    {
      id: 'post-office',
      kind: 'missions',
      name: 'The Post Office',
      icon: 'board',
      blurb: 'Errands along the highway',
      missionIds: ['shukuba-wrong-door', 'shukuba-lost-letters'],
    },
  ],
};
