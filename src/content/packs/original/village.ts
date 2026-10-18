import type { VillageLife } from '../../types';
import { ARC_RUMOURS } from './arcRumours';

/** Gossip, night sights and festivals of Tōrōgakure. */
export const VILLAGE: VillageLife = {
  rumours: [
    ...ARC_RUMOURS,
    // Talk about what you did: it goes round once the village remembers it.
    {
      id: 'tobi-forgiven',
      worldMark: 'tobi-forgiven',
      text: 'The lamplighter’s boy is lighting the wall again, with his mother watching him like a hawk.',
    },
    {
      id: 'tobi-turned-in',
      worldMark: 'tobi-turned-in',
      text: 'The Watch has the lamplighter’s boy scrubbing the barracks floors. He sings while he does it.',
    },
    {
      id: 'lantern-wall-lit',
      worldMark: 'lantern-kiln-burned',
      text: 'They say someone burned out a smugglers’ kiln in the reeds. The old wall has been bright ever since.',
    },
    {
      id: 'kohaku-lantern',
      worldMark: 'kohaku-trusted',
      text: 'Sister Kohaku is telling everyone at the temple that a young shinobi lit her brother’s lantern at the foot shrine.',
    },
    {
      id: 'kohaku-boy',
      worldMark: 'kohaku-spared',
      text: 'A boy from the hill farms has been seen at the academy gate, asking after the shinobi who let his brothers go.',
    },
    {
      id: 'saburo-chest',
      worldMark: 'saburo-trusted',
      text: 'Old Saburō sings a new verse at every wedding now, about a young shinobi who carried the bride’s chest the last steps.',
    },
    {
      id: 'yasuke-bowl',
      worldMark: 'yasuke-trusted',
      text: 'Potter Yasuke has started on a new blue. He says he owes it to a shinobi who listened.',
    },
    {
      id: 'tsuru-monk',
      worldMark: 'tsuru-trusted',
      text: 'The Wandering Moon Puppet Troupe has a new puppet in its show, a very serious young shinobi who saves a fox princess.',
    },
    {
      id: 'cat-again',
      missionId: 'lantern-keepers-cat',
      text: 'The old lantern-keeper is calling for his cat again. Third time this month.',
    },
    {
      id: 'shrine-overgrown',
      missionId: 'shrine-weeding',
      text: 'The priests say the spirit shrine is choking on weeds, and nobody wants to touch them.',
    },
    {
      id: 'kuroda-fever',
      missionId: 'kuroda-medicine',
      text: 'A fever has gone through Kuroda Farm. They can’t spare anyone to fetch medicine.',
    },
    {
      id: 'tea-merchant',
      missionId: 'tea-merchant-escort',
      text: 'A tea merchant at the inn keeps asking how safe the mountain pass is.',
    },
    {
      id: 'dropout',
      missionId: 'academy-dropout',
      text: 'An academy dropout has been seen practising jutsu where he shouldn’t.',
    },
    {
      id: 'storehouse-noises',
      missionId: 'storehouse-ghost',
      text: 'There is knocking inside the rice storehouse after dark, and the guards won’t go in.',
    },
    {
      id: 'river-road',
      missionId: 'river-road-bandits',
      text: 'Two carts never arrived from the river road. People are talking about bandits.',
    },
    {
      id: 'haunted-stalls',
      missionId: 'festival-haunting',
      text: 'Stallholders swear their festival lanterns go out by themselves.',
    },
    {
      id: 'goran-dawn',
      personId: 'goran',
      text: 'Gōran-sensei was seen running the lake before dawn. With a boulder.',
    },
    {
      id: 'akari-letters',
      personId: 'akari',
      text: 'Akari-sensei gets a letter every week from the capital and burns each one unread.',
    },
    {
      id: 'yomi-lanterns',
      personId: 'yomi',
      text: 'Yomi-sensei talks to the lanterns. Some say the lanterns answer.',
    },
    {
      id: 'kaen-ramen',
      personId: 'kaen',
      text: 'Kaen ate eight bowls at Kenji’s last night and still asked for a ninth.',
    },
    {
      id: 'shiori-library',
      personId: 'shiori',
      text: 'Shiori has read every scroll in the academy library. Twice.',
    },
    {
      id: 'tsune-hearing',
      personId: 'tsune',
      text: 'Old Tsune hears every word said in the village. Be careful what you say near her.',
    },
    {
      id: 'lantern-count',
      text: 'The lantern-lighters swear there are more lanterns every year than they remember hanging.',
    },
    {
      id: 'border-quiet',
      text: 'The borders have been quiet lately. The old-timers say that’s never good.',
    },
    {
      id: 'sakyu-envoy',
      text: 'An envoy from the desert village came and went without a word to anyone.',
    },
    {
      id: 'seasons-cart',
      text: 'The cook on the Four Seasons Cart changes his menu by the weather, not the calendar.',
    },
    {
      id: 'kasumi-notices',
      text: 'Kasumi wraps her buns in old mission notices. Someone found a sealed one inside.',
    },
    {
      id: 'eel-secret',
      text: 'The Riverside Grill won’t say where its eels come from. Nobody has seen them caught.',
    },
    {
      id: 'forge-blade',
      text: 'Old Hagane at the forge is working on a blade he won’t talk about.',
    },
  ],
  sights: [
    {
      id: 'drowned-child',
      title: 'A small light by the canal',
      text: 'A child’s spirit sits on the canal steps, looking for a way home.',
      outcome: 'You walk it to the great lantern gate. It smiles once and is gone.',
      unseen: 'The canal lanterns gutter, though there is no wind.',
      reward: { willpower: 1 },
    },
    {
      id: 'chakra-threads',
      title: 'Threads in the dark',
      text: 'Faint threads of chakra run between the rooftops, like a web someone left behind.',
      outcome: 'You trace them to a roof where a seal was drawn and broken. You learn its shape.',
      unseen: 'You feel watched on the way home.',
      reward: { fuuinjutsu: 1 },
    },
    {
      id: 'old-shinobi',
      title: 'An old shinobi on the wall',
      text: 'A shinobi in an old uniform keeps watch on the wall, coming and going like a lamp in a draught.',
      outcome:
        'You stand watch beside him until he fades, and before he goes he salutes you, one guard to another.',
      unseen: 'A cold spot hangs over the east wall tonight.',
      reward: { perception: 1 },
    },
    {
      id: 'fox-procession',
      title: 'A fox procession',
      text: 'A line of fox-lights winds through the back lanes toward the forest.',
      outcome: 'You follow at a respectful distance and learn how they move without a sound.',
      unseen: 'Somewhere a fox barks, and then another, and another.',
      reward: { speed: 1 },
    },
    {
      id: 'weeping-lantern',
      title: 'A lantern that weeps',
      text: 'One lantern on Market Street burns blue and drips light like tears.',
      outcome: 'You sit with it and listen. Some grief only needs a witness.',
      unseen: 'One lantern on Market Street has gone strangely dim.',
      reward: { genjutsu: 1 },
    },
  ],
  festivals: [
    {
      id: 'spring-kites',
      name: 'Kite Day',
      description: 'Children fly paper kites over the lake and the stalls sell cheap sweets.',
      season: 0,
      day: 7,
      marketPrices: 0.7,
      bondBonus: 2,
      stalls: [
        {
          name: 'Kite Day Sweets',
          blurb: 'Only on Kite Day',
          icon: 'dango',
          foodIds: ['kite-candy'],
          hours: ['afternoon', 'evening', 'night'],
        },
      ],
    },
    {
      id: 'summer-fire',
      name: 'Night of a Thousand Sparks',
      description: 'The Hibana clan fills the sky with fire. Everyone is out, and in a good mood.',
      season: 1,
      day: 14,
      marketPrices: 0.8,
      bondBonus: 3,
      stalls: [
        {
          name: 'Hibana Fire Grill',
          blurb: 'Cooked on festival flame',
          icon: 'fish',
          foodIds: ['spark-squid'],
          hours: ['afternoon', 'evening', 'night'],
        },
      ],
    },
    {
      id: 'boat-lanterns',
      name: 'Night of the Boat Lanterns',
      description:
        'Shiomachi floats a paper boat for everyone lost at sea, and eats grilled eel on the jetty.',
      locationId: 'port-shiomachi',
      season: 1,
      day: 20,
      marketPrices: 0.7,
      bondBonus: 3,
      stalls: [
        {
          name: 'Jetty Eel Grill',
          blurb: 'Only on the night of the boats',
          icon: 'grill',
          foodIds: ['jetty-eel'],
          hours: ['afternoon', 'evening', 'night'],
        },
      ],
    },
    {
      id: 'lantern-festival',
      name: 'Festival of Lanterns',
      description:
        'The great lantern festival, when the dead are guided home on the river and the living eat.',
      season: 2,
      day: 21,
      marketPrices: 0.5,
      bondBonus: 4,
      stalls: [
        {
          name: 'Lantern Festival Yatai',
          blurb: 'Only on festival night',
          icon: 'dango',
          foodIds: ['lantern-dango', 'festival-takoyaki'],
          hours: ['afternoon', 'evening', 'night'],
        },
      ],
    },
    {
      id: 'winter-vigil',
      name: 'Long Night Vigil',
      description: 'On the longest night the village keeps watch together around warm braziers.',
      season: 3,
      day: 14,
      marketPrices: 0.8,
      bondBonus: 3,
      stalls: [
        {
          name: 'Brazier Soup Cart',
          blurb: 'Free warmth, almost',
          icon: 'bowl',
          foodIds: ['vigil-soup'],
          hours: ['afternoon', 'evening', 'night'],
        },
      ],
    },
  ],
};
