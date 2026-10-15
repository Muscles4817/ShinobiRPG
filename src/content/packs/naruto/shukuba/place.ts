import type { LocationDef } from '../../../types';

/**
 * Shukuba Town, the post town a day down the highway: every traveller between the Leaf and
 * Tanzaku sleeps here. Inns on every corner, a travellers' market, an outfitter for the road,
 * the Waystation for a cup before bed, and the post office's errands.
 */
export const SHUKUBA_TOWN: LocationDef = {
  id: 'shukuba-town',
  name: 'Shukuba Town',
  epithet: 'Post town on the highway',
  map: { x: 38, y: 42 },
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
      id: 'waystation',
      kind: 'tavern',
      name: 'The Waystation',
      icon: 'sake',
      blurb: 'A drinking stand for travellers who aren’t sleepy yet',
      hours: ['evening', 'night'],
      keeper: 'Granny Ume, who has poured for every courier on the highway',
      foodIds: ['post-town-soba', 'tavern-oden', 'barley-tea'],
      roundCost: 30,
      cupCost: 10,
      pastimes: [
        {
          id: 'go',
          name: 'The travellers’ go game',
          scene:
            'A go board left mid-game. Whoever sits down plays on from where the last traveller stopped, and leaves it for the next.',
        },
      ],
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
