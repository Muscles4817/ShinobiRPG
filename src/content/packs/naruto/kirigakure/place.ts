import type { LocationDef } from '../../../types';
import { SHORE_FINDS, SHORE_SPOTS } from '../../../shared/waters';
import { KIRI_COMPOUNDS } from './compounds';

/**
 * Kirigakure in the years of the Bloody Mist: Yagura's village, where bloodlines are hunted
 * (a visitor whose bloodline has woken pays for it, `greetings`) and the academy's last test is
 * a fight to the death. A foreigner gets no further than the
 * harbour ward, under a pass checked at every corner. It is the loyal houses' ward: the
 * Kasumi's fog shrine, the Isana's whaling quay, the Kurage's infirmary and the Shiogama's
 * forge stand among the lodging house, the dawn auction, the bathhouse, the fishermen's bar,
 * the sea cliffs and a broker who hands out the work nobody official will.
 */
export const KIRIGAKURE: LocationDef = {
  id: 'kirigakure',
  name: 'Kirigakure',
  epithet: 'Village Hidden in the Mist',
  map: { x: 92, y: 36, label: 'left' },
  backdrop: 'mist-village',
  greetings: [
    {
      cause: { kind: 'bloodline' },
      temper: 'cold',
      line: 'The Blood Register has your chakra on a page by now. Shopkeepers serve you quickly and watch the door, and the masks watch you.',
      // Anywhere on the Mist's water, unless the Leaf has sent you there (`game/hunt.ts`).
      hunt: {
        regions: ['mist-sea'],
        hunterIds: ['mist-hunter-nin', 'mist-patrol'],
        ground: 'lake',
        travel: {
          text: 'Halfway over, the boatman asks how you mean to come in to the harbour.',
          answers: [
            {
              label: 'Openly, on the ferry',
              tone: 'earnest',
              reply:
                'You stand at the rail with the other passengers, where anyone on the quay can see you.',
              heat: 2,
            },
            {
              label: 'By night, with no lantern',
              tone: 'challenge',
              reply:
                'The boatman shrugs and douses the lamp. Dark water is quiet, and quiet boats are noticed.',
              heat: 1,
            },
            {
              label: 'Under the nets in the bilge',
              tone: 'quiet',
              reply: 'You lie in fish water under the nets for hours and climb out stiff and cold.',
              heat: 0,
              energy: 10,
            },
          ],
        },
        sleep: {
          text: 'Night comes down on the water. The boatman puts in at a fishing island and asks where you will sleep.',
          answers: [
            {
              label: 'At the island inn',
              tone: 'kind',
              reply: 'You sleep in a real bed, and the innkeeper writes a name in her book.',
              heat: 2,
            },
            {
              label: 'Wrapped in a sail on deck',
              tone: 'quiet',
              reply: 'You sleep badly under wet canvas while the mist drips off the mast.',
              heat: 1,
              energy: 5,
            },
            {
              label: 'Hardly at all, watching the water',
              tone: 'challenge',
              reply:
                'You sit up all night with your back to the mast. Nothing comes, and you are worn through by dawn.',
              heat: 0,
              energy: 15,
            },
          ],
        },
        found:
          'A mask rises out of the fog beside the boat, then another. The hunter-nin have been on your trail for days, and now they have you.',
      },
    },
  ],
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
        'kiri-blockade-lookout',
        'kiri-drain-hunt',
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
      id: 'kasumi-fog-shrine',
      kind: 'training',
      name: 'The Fog Shrine',
      icon: 'torii',
      blurb: 'Where the Kasumi tend the braziers that feed the village’s mist',
      trainingIds: ['fog-breath-drill', 'brazier-watch'],
    },
    {
      id: 'isana-quay',
      kind: 'market',
      name: 'The Whaling Quay',
      icon: 'wave',
      blurb: 'The Isana fleet’s berth, where the blockade boats come in',
      stalls: [
        {
          name: 'The Flensing Shed',
          blurb: 'Whale meat cut on the quay, the bones carted off to the whale graves',
          hours: ['morning', 'afternoon'],
          icon: 'grill',
          foodIds: ['whale-bacon', 'whale-broth'],
        },
        {
          name: 'The Fleet Chandlery',
          blurb: 'Rope, rations and lamp oil for the boats, sold to anyone with a pass',
          hours: ['morning', 'afternoon', 'evening'],
          icon: 'cart',
          foodIds: ['kelp-tea'],
          ingredientIds: ['travel-rations', 'rice'],
        },
      ],
    },
    {
      id: 'kurage-infirmary',
      kind: 'hospital',
      name: 'The Kurage Infirmary',
      icon: 'heal',
      blurb: 'The hunter-nin house mends the living as neatly as it disposes of the dead',
      treatmentCost: 90,
    },
    {
      id: 'canal-stilt-house',
      kind: 'house',
      name: 'A Stilt House on the Back Canal',
      icon: 'house',
      blurb:
        'Two rooms over the water and a ladder down to a boat. The last owners left in the night and nobody asks where.',
      seller: 'An Amibari clerk, who has the deed and the Register page that went with it',
      price: 2400,
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
    ...KIRI_COMPOUNDS,
  ],
};
