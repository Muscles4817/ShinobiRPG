import { DESERT_FINDS } from '../../../shared/desert';
import type { LocationDef } from '../../../types';
import { SUNA_COMPOUNDS } from './compounds';

/**
 * Sunagakure under the Fourth Kazekage, a village cut into the inside of a ring of cliffs in
 * the deep desert. A foreigner is kept to the Outer Ring, and a Leaf one is watched there: the
 * Sand remembers Sakumo Hatake's raids (`docs/design/sunagakure-plan.md`); its gates are shut to
 * the Leaf until the Kazekage gives leave (`kageroLanding/envoy.ts`). Water is wealth,
 * beasts are broken rather than befriended, and the sand priests live outside the wall, by the
 * barges, because nobody inside it will have them.
 */
export const SUNAGAKURE: LocationDef = {
  id: 'sunagakure',
  name: 'Sunagakure',
  kind: 'village',
  epithet: 'Village Hidden in the Sand',
  map: { x: 12, y: 51 },
  backdrop: 'sand-village',
  greetings: [
    {
      cause: { kind: 'from', locationId: 'konohagakure' },
      temper: 'cold',
      line: 'The Sand remembers Sakumo Hatake. A Leaf forehead protector buys you the foreigner’s price, and long looks from everyone who lost someone in the war.',
      shut: {
        until: 'suna-gates-open',
        refusal:
          'The Sand turns Leaf shinobi back at the gorge. Only the Kazekage’s leave lets one in, and the Sand’s envoys pass through Kagerō Landing.',
      },
    },
    {
      cause: { kind: 'contract' },
      temper: 'cold',
      line: 'Word has gone round that you hold a summoning contract. In the Sand, binding a beast is the Monarch’s sin, and nobody lets you forget it.',
    },
  ],
  places: [
    {
      id: 'cistern-house',
      kind: 'inn',
      name: 'The Cistern House',
      icon: 'house',
      blurb: 'Rooms built over the Outer Ring’s cistern, cool as a cellar at noon',
      keeper: 'Madam Ruri, who counts every cup of water you drink and adds it to the bill',
      roomCost: 35,
    },
    {
      id: 'covered-bazaar',
      kind: 'market',
      name: 'The Covered Bazaar',
      icon: 'cart',
      blurb: 'A street roofed with awnings, where the caravans unload',
      stalls: [
        {
          name: 'Spice Row',
          blurb: 'Meat over coals, and spices from three countries away',
          hours: ['afternoon', 'evening'],
          icon: 'grill',
          foodIds: ['spiced-lamb-skewers', 'sand-flatbread'],
        },
        {
          name: 'The Water-Seller’s Arch',
          blurb: 'Mint tea poured from a height, and supplies for the crossing',
          hours: ['morning', 'afternoon', 'evening'],
          icon: 'tea',
          foodIds: ['mint-tea', 'date-cakes'],
          ingredientIds: ['travel-rations', 'rice'],
        },
      ],
    },
    {
      id: 'envoys-office',
      kind: 'missions',
      name: 'The Envoy’s Office',
      icon: 'board',
      blurb: 'Where the Sand hands foreigners the work it can spare',
      missionIds: [
        'suna-cistern-watch',
        'suna-bitter-spice',
        'suna-chalk-on-the-wall',
        'suna-broken-hound',
        'suna-outer-wells',
      ],
    },
    {
      id: 'windbreak-workshop',
      kind: 'gear',
      name: 'The Windbreak Workshop',
      icon: 'anvil',
      blurb: 'War fans and sand veils, with refined dust by the batch',
      hours: ['morning', 'afternoon'],
      keeper: 'Itsuki of the Cutting Wind, who tests every fan by trying to knock you over with it',
      gearIds: ['war-fan', 'sand-veil', 'senbon-case'],
      toolIds: ['smoke-bomb', 'explosive-tag'],
      dustIds: ['iron-sand', 'gold-dust'],
    },
    {
      id: 'steam-baths',
      kind: 'onsen',
      name: 'The Steam Baths',
      icon: 'spring',
      blurb: 'Water poured on hot stones, for those who can afford to waste it',
      hours: ['morning', 'afternoon', 'evening'],
      keeper: 'The bath-master, who weighs out the water by the bucket',
      waters: 'bathhouse',
      soakCost: 60,
    },
    {
      id: 'last-well',
      kind: 'tavern',
      name: 'The Last Well',
      icon: 'sake',
      blurb: 'A bar down a dry well-shaft where the barge crews drink in the cool',
      hours: ['evening', 'night'],
      keeper: 'A one-legged sail-hand of the Cutting Wind, who pours with the fan clan’s flourish',
      foodIds: ['spiced-lamb-skewers', 'mint-tea'],
      roundCost: 60,
      cupCost: 15,
      pastimes: [
        {
          id: 'puppet-play',
          name: 'A puppet play',
          scene:
            'An Akasuna apprentice works a puppet Monarch on threads, and when the puppet Shukaku buries her the whole bar stamps and cheers.',
        },
        {
          id: 'knucklebones',
          name: 'Knucklebones',
          scene: 'Camel knucklebones rattled in a cup, and stakes in ryo or water.',
          game: { kind: 'dice', dice: 2, stakes: [10, 30, 80] },
        },
      ],
    },
    {
      id: 'wind-gallery',
      kind: 'training',
      name: 'The Wind Gallery',
      icon: 'wind',
      blurb: 'A ledge high on the ring’s cliffs, where the desert wind never stops',
      trainingIds: ['gale-stance', 'cliff-wind-cutting'],
    },
    {
      id: 'thread-yard',
      kind: 'training',
      name: 'The Thread Yard',
      icon: 'seal',
      blurb: 'A courtyard of practice dummies hung on threads, behind the puppet workshops',
      trainingIds: ['thread-weaving', 'dummy-dodging'],
    },
    {
      id: 'poison-ward',
      kind: 'hospital',
      name: 'The Poison Ward',
      icon: 'heal',
      blurb: 'The Sand’s hospital, where every antidote has a poison it was made for',
      treatmentCost: 80,
    },
    {
      id: 'breaking-pens',
      kind: 'vet',
      name: 'The Breaking Pens',
      icon: 'fist',
      blurb: 'Hounds and camels broken to the collar, and nothing kept that thinks for itself',
      keeperId: 'suna-gozan',
      treatmentCost: 50,
      medicineCost: 20,
      pups: {
        kindId: 'sand-hound',
        price: 1400,
        giftStage: 3,
        line: 'Sand-hound pups in a pen of their own, already wearing little collars, watching the breaker’s hands.',
      },
    },
    {
      id: 'cliff-cut-room',
      kind: 'house',
      name: 'A Room Cut in the Cliff',
      icon: 'house',
      blurb:
        'Two rooms carved into the ring’s inner wall, with a shutter that opens on the whole village. Cool all day.',
      seller: 'A clerk of the Envoy’s Office, who sells to foreigners only at a foreigner’s price',
      price: 2600,
    },
    {
      id: 'wadi-beyond-the-wall',
      kind: 'wilds',
      name: 'The Wadi Beyond the Wall',
      icon: 'leaf',
      blurb:
        'A dry riverbed outside the cliffs, where sage and pears grow and the rain runs once a year',
      biome: 'desert',
      finds: DESERT_FINDS,
    },
    ...SUNA_COMPOUNDS,
  ],
};
