import type { LocationDef } from '../../../types';
import { FORD_CHAIN_FORD_JOBS } from '../arcs/fordChain';
import { KIRI_FORD_JOB_IDS } from './jobs';

/**
 * Kiri Ford, a river city a day east through the cedars, where the ferries cross to the dune
 * road. A crossroads more than a destination: an inn for the night, a river market, the
 * ferry office's work, the Low Water where the ferrymen drink, and the first place a shinobi
 * with money saved can buy a house.
 */
export const KIRI_FORD: LocationDef = {
  id: 'kiri-ford',
  name: 'Kiri Ford',
  kind: 'city',
  famous: true,
  epithet: 'River city',
  map: { x: 66, y: 38, label: 'right' },
  backdrop: 'mist',
  places: [
    {
      id: 'ferry-inn',
      kind: 'inn',
      name: 'The Ferryman’s Rest',
      icon: 'house',
      blurb: 'Every room smells of river, and the walls are thin enough to hear the ferries.',
      keeper: 'Mother Tama, who takes payment before she takes your name',
      roomCost: 30,
    },
    {
      id: 'ford-market',
      kind: 'market',
      name: 'The Ford Market',
      icon: 'cart',
      blurb: 'Boats tie up and sell straight from the deck',
      stalls: [
        {
          name: 'Deck Sellers',
          blurb: 'Whatever came down the river today',
          hours: ['morning', 'afternoon'],
          icon: 'fish',
          foodIds: ['grilled-fish', 'rice-ball', 'river-eel-skewer'],
        },
        {
          name: 'The Ferry Stores',
          blurb: 'Supplies for the dune road',
          hours: ['morning', 'afternoon', 'evening'],
          icon: 'veg',
          foodIds: [],
          ingredientIds: ['travel-rations', 'dried-fish', 'rice', 'river-fish'],
        },
      ],
    },
    {
      id: 'low-water',
      kind: 'tavern',
      name: 'The Low Water',
      icon: 'sake',
      blurb: 'A ferrymen’s drinking house on stilts over the shallows',
      hours: ['evening', 'night'],
      keeper: 'Brother Ino, a ferryman who never got his boat back',
      foodIds: ['river-eel-skewer', 'grilled-fish', 'roasted-barley-tea'],
      roundCost: 35,
      cupCost: 10,
      pastimes: [
        {
          id: 'crossing-lots',
          name: 'Drawing for the dawn crossing',
          scene:
            'Straws in a jar, and whoever draws the short one rows the first ferry tomorrow. Nobody ever looks pleased to win.',
        },
      ],
    },
    {
      id: 'ferry-office',
      kind: 'missions',
      name: 'The Ferry Office',
      icon: 'board',
      blurb: 'Work for anyone with a strong back',
      missionIds: [...KIRI_FORD_JOB_IDS, ...FORD_CHAIN_FORD_JOBS],
    },
    {
      id: 'reed-row-house',
      kind: 'house',
      name: 'A House on Reed Row',
      icon: 'house',
      blurb:
        'Two rooms over a boat shed, a stove, and a window over the river. The roof only leaks when it rains.',
      seller: 'Old Haru, who is moving in with his daughter',
      price: 2400,
    },
  ],
};
