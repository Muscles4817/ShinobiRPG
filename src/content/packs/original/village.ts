import type { VillageLife } from '../../types';

/** Gossip, night sights and festivals of Tōrōgakure. */
export const VILLAGE: VillageLife = {
  rumours: [
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
      text: 'Something knocks inside the rice storehouse after dark. The guards won’t go in.',
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
      text: 'Old Tsune hears every whisper in the village. Be careful what you say near her.',
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
      unseen: 'The canal lanterns flicker, though there is no wind.',
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
      text: 'A shinobi in an old uniform keeps watch on the wall, flickering.',
      outcome: 'You stand watch beside him till he fades. He nods to you, one guard to another.',
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
      text: 'One lantern on Market Street glows blue and drips light like tears.',
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
    },
    {
      id: 'summer-fire',
      name: 'Night of a Thousand Sparks',
      description: 'The Hibana clan fills the sky with fire. Everyone is out, and in a good mood.',
      season: 1,
      day: 14,
      marketPrices: 0.8,
      bondBonus: 3,
    },
    {
      id: 'lantern-festival',
      name: 'Festival of Lanterns',
      description:
        'The great lantern festival: the dead are guided home on the river, and the living eat.',
      season: 2,
      day: 21,
      marketPrices: 0.5,
      bondBonus: 4,
    },
    {
      id: 'winter-vigil',
      name: 'Long Night Vigil',
      description: 'On the longest night the village keeps watch together around warm braziers.',
      season: 3,
      day: 14,
      marketPrices: 0.8,
      bondBonus: 3,
    },
  ],
};
