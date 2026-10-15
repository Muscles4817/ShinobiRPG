import type { LocationDef } from '../../../types';

/**
 * Tanzaku Town, a castle town two days west of the Leaf on a safe road: gambling dens,
 * festival streets that never quite pack up, and bars that keep a tab for anyone. The first
 * place a genin with a pass can reach, and a city where a shinobi with savings can buy a house.
 */
export const TANZAKU_TOWN: LocationDef = {
  id: 'tanzaku-town',
  name: 'Tanzaku Town',
  epithet: 'Castle town of gamblers',
  map: { x: 32, y: 37, label: 'left' },
  backdrop: 'lantern-rooftops',
  places: [
    {
      id: 'lucky-cat-inn',
      kind: 'inn',
      name: 'The Beckoning Cat',
      icon: 'house',
      blurb: 'A gamblers’ inn: paper walls, loud neighbours, and a lucky cat in every window.',
      keeper: 'Old Man Fuku, who has seen every kind of losing streak',
      roomCost: 35,
    },
    {
      id: 'festival-street',
      kind: 'market',
      name: 'Festival Street',
      icon: 'lantern',
      blurb: 'Stalls under the castle, lit all night',
      stalls: [
        {
          name: 'Street Griddles',
          blurb: 'Whatever smells best from the end of the street',
          hours: ['afternoon', 'evening', 'night'],
          icon: 'grill',
          foodIds: ['takoyaki', 'festival-yakisoba', 'castle-town-gyoza'],
        },
        {
          name: 'The Sweet Seller',
          blurb: 'Sweets for winners and losers alike',
          hours: ['morning', 'afternoon', 'evening'],
          icon: 'dango',
          foodIds: ['dango', 'shaved-ice'],
        },
        {
          name: 'The Rice Merchant',
          blurb: 'Grain from the castle stores, at castle prices',
          hours: ['morning', 'afternoon'],
          icon: 'rice',
          foodIds: [],
          ingredientIds: ['rice', 'eggs', 'miso', 'tofu', 'spices', 'travel-rations'],
        },
      ],
    },
    {
      id: 'short-odds',
      kind: 'tavern',
      name: 'The Short Odds',
      icon: 'sake',
      blurb: 'Dice at the back, sake at the front',
      hours: ['evening', 'night'],
      keeper: 'Madam Suzu, who keeps the tabs and the bouncers',
      foodIds: ['tavern-yakitori', 'tavern-oden', 'barley-tea'],
      roundCost: 50,
      cupCost: 15,
      pastimes: [
        {
          id: 'cho-han',
          name: 'Chō-han',
          scene:
            'Two dice under an upturned cup: even or odd. The house never seems to lose, and a blonde regular never seems to win.',
        },
      ],
    },
    {
      id: 'castle-ward-office',
      kind: 'missions',
      name: 'The Castle Ward Office',
      icon: 'board',
      blurb: 'The town constables hire out what they can’t handle',
      missionIds: ['tanzaku-loaded-dice', 'tanzaku-unpaid-tab', 'tanzaku-castle-crowds'],
    },
    {
      id: 'tanzaku-townhouse',
      kind: 'house',
      name: 'A Townhouse Below the Castle',
      icon: 'house',
      blurb:
        'Two floors on a quiet lane, a kitchen, and a balcony with the castle roofs over it. Won at dice, and sold at a loss.',
      seller: 'A merchant who would rather not say how he came by it',
      price: 3200,
    },
  ],
};
