import type { LocationDef } from '../../../types';
import { SHORE_FINDS, SHORE_SPOTS } from '../../../shared/waters';

/**
 * Kirigakure in the years of the Bloody Mist: the Fourth Mizukage's village, where bloodlines
 * are hunted and the academy's last test is a fight to the death. A foreigner gets no further
 * than the harbour ward, under a pass that is checked at every corner: a lodging house, the
 * dawn fish auction, a bathhouse and a bar for fishermen, a smith who still forges in the old
 * Swordsmen's way, the sea cliffs, and a broker who hands out the work nobody official will.
 */
export const KIRIGAKURE: LocationDef = {
  id: 'kirigakure',
  name: 'Kirigakure',
  epithet: 'Village Hidden in the Mist',
  map: { x: 92, y: 36, label: 'left' },
  backdrop: 'mist',
  places: [
    {
      id: 'fog-lantern-lodging',
      kind: 'inn',
      name: 'The Fog Lantern',
      icon: 'lantern',
      blurb: 'The one lodging house in the harbour ward that takes foreigners.',
      keeper: 'Granny Shio, who holds your pass for you and gives it back each morning',
      roomCost: 30,
    },
    {
      id: 'kiri-fish-auction',
      kind: 'market',
      name: 'The Dawn Auction',
      icon: 'fish',
      blurb: 'Catch sold by hand signals in the fog',
      stalls: [
        {
          name: 'The Auction Floor',
          blurb: 'Whatever the boats brought through the mist, sold before the sun burns it off',
          hours: ['morning'],
          icon: 'fish',
          foodIds: ['auction-sashimi', 'salted-squid'],
        },
        {
          name: 'The Net-Menders’ Pot',
          blurb: 'A stew pot that never goes off the boil, for the people who work the quay',
          hours: ['morning', 'afternoon', 'evening'],
          icon: 'pot',
          foodIds: ['mist-hot-pot', 'kelp-tea'],
          ingredientIds: ['rice', 'river-fish', 'travel-rations'],
          cookbookIds: ['tide-and-shell'],
        },
      ],
    },
    {
      id: 'harbour-broker',
      kind: 'missions',
      name: 'The Broker’s Shed',
      icon: 'board',
      blurb: 'Work nobody official will hand a foreigner',
      missionIds: [
        'kiri-fog-lantern',
        'kiri-auction-thumb',
        'kiri-graduation',
        'kiri-frost-children',
        'kiri-sealed-letter',
      ],
    },
    {
      id: 'seventh-forge',
      kind: 'gear',
      name: 'The Seventh Forge',
      icon: 'anvil',
      blurb: 'Heavy blades in the old Swordsmen’s way',
      hours: ['morning', 'afternoon'],
      keeper: 'Tetsuo, a smith who once forged for the Seven and won’t say which of them',
      gearIds: ['senbon-case', 'ninjato', 'kiri-broadsword'],
      toolIds: ['smoke-bomb', 'explosive-tag'],
    },
    {
      id: 'kiri-bathhouse',
      kind: 'onsen',
      name: 'The Salt Bathhouse',
      icon: 'spring',
      blurb: 'Hot tubs to drive the sea damp out of your bones',
      hours: ['morning', 'afternoon', 'evening'],
      keeper: 'The bath-keeper, who looks at every bather’s neck for a bloodline’s mark',
      waters: 'bathhouse',
      soakCost: 30,
    },
    {
      id: 'drowned-man',
      kind: 'tavern',
      name: 'The Drowned Man',
      icon: 'sake',
      blurb: 'A fishermen’s bar where nobody says the Mizukage’s name',
      hours: ['evening', 'night'],
      keeper: 'A one-eyed barkeep who used to crew a hunter-nin boat',
      foodIds: ['salted-squid', 'tavern-oden', 'kelp-tea'],
      roundCost: 50,
      cupCost: 15,
      pastimes: [
        {
          id: 'knot-race',
          name: 'Knot races',
          scene:
            'Two fishermen race to tie a sheet bend blindfold, and the loser buys. Nobody bets on the man with the hunter-nin tattoo.',
        },
        {
          id: 'harbour-dice',
          name: 'Harbour dice',
          scene: 'A cup of dice on an upturned crate, and stakes paid in ryo or fish.',
          game: { kind: 'dice', dice: 2, stakes: [10, 30, 80] },
        },
      ],
    },
    {
      id: 'kiri-sea-cliffs',
      kind: 'training',
      name: 'The Sea Cliffs',
      icon: 'wave',
      blurb: 'Fog above and below, with the swell between',
      trainingIds: ['blind-mist-drill', 'cliff-surf-run'],
      exerciseIds: ['water-walking'],
    },
    {
      id: 'kiri-shingle',
      kind: 'wilds',
      name: 'The Grey Shingle',
      icon: 'wave',
      blurb: 'A stony beach below the cliffs where the fog lies thickest',
      biome: 'shore',
      finds: SHORE_FINDS,
      spots: SHORE_SPOTS,
    },
  ],
};
