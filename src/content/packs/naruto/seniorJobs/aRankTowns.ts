import type { MissionDef } from '@/systems/missions';

/**
 * A-rank work among the Fire Country's towns: a daimyō's envoy to keep alive through a night at
 * Tanzaku Castle, a Stone weapons cache under the Tenchi Bridge, and a Leaf traitor selling the
 * village's secrets in Otafuku.
 */

export const ENVOY_NIGHT: MissionDef = {
  id: 'senior-envoy-night',
  title: 'A Night at Tanzaku Castle',
  rank: 'A',
  client: 'The Fire Daimyō’s court',
  summary:
    'The daimyō’s envoy meets the lords of the river country at Tanzaku Castle, and a price has been put on his head. Keep him alive until the treaty is signed.',
  slots: 6,
  energyCost: 40,
  reward: { ryo: 1050, reputation: 16 },
  minMissionsCompleted: 13,
  goesTo: 'tanzaku-town',
  endsAt: 'konohagakure',
  stages: [
    { kind: 'road', to: 'outbound', text: 'Down the river road to Tanzaku.' },
    {
      kind: 'narrative',
      text: 'Envoy Okiyama is a clever man and plainly frightened. He has brought his own cook, who he says is the only person in the castle he trusts.',
    },
    {
      kind: 'check',
      text: 'The castle is full of the lords’ retainers, and any of them could have been paid. You have until midnight to find out which.',
      approaches: [
        { label: 'Watch who watches the envoy', stat: 'perception', difficulty: 14 },
        { label: 'Go through the guest lists', stat: 'intellect', difficulty: 14 },
        { label: 'Taste everything he eats', stat: 'stamina', difficulty: 13 },
      ],
      success:
        'The envoy’s own cook has a second knife in the rice chest, and two strangers on the roof are waiting for her signal.',
      failure:
        'You find the cook too late. Her signal has gone up, and the roof tiles are already moving.',
      onFailure: 'penalty',
      failureDamage: 8,
    },
    {
      kind: 'encounter',
      template: 'guarded-building',
      job: 'escort',
      ground: 'room',
      text: 'Two hired knives drop through the roof of the envoy’s chamber, and a Cloud missing-nin who brokered the job comes in through the door behind them.',
      enemyIds: ['hired-assassin', 'hired-assassin', 'rogue-kumogakure-scout-chunin'],
      canFlee: false,
      talkable: false,
    },
    {
      kind: 'ending',
      endings: [
        {
          text: 'The treaty is signed at noon with the envoy’s hand shaking, and he sends you a jar of his late cook’s pickled plums, untouched.',
        },
      ],
    },
    { kind: 'road', to: 'home' },
  ],
};

export const STONE_CACHE: MissionDef = {
  id: 'senior-stone-cache',
  title: 'What the Stone Buried',
  rank: 'A',
  client: 'The Hokage’s office',
  summary:
    'The Stone surveyors were only the first. Under the Tenchi Bridge, Stone shinobi have dug out a cache of explosive tags big enough to drop the gorge. Wreck it, and leave no sign the Leaf was there.',
  slots: 6,
  energyCost: 40,
  reward: { ryo: 1200, reputation: 17 },
  minMissionsCompleted: 17,
  goesTo: 'tenchi-bridge',
  endsAt: 'konohagakure',
  stages: [
    { kind: 'road', to: 'outbound', text: 'North and west through the hills, by the back ways.' },
    {
      kind: 'check',
      text: 'The cache is in a cave under the far footing, and a Stone jōnin sleeps across its mouth.',
      approaches: [
        { label: 'Slip in between their breaths', stat: 'speed', difficulty: 15 },
        { label: 'Walk in under another face', stat: 'genjutsu', difficulty: 15 },
        { label: 'Come in through the rock', stat: 'ninjutsu', difficulty: 16 },
      ],
      success: 'You stand in the cave among the crates, and nobody knows you are there.',
      failure: 'You are in, but a tripwire hums somewhere in the dark behind you.',
      onFailure: 'penalty',
      failureDamage: 8,
    },
    {
      kind: 'check',
      text: 'The tags are stacked so that one set off sets off the rest. They have to go quietly, and in the right order.',
      approaches: [
        { label: 'Unwrite their seals one by one', stat: 'fuuinjutsu', difficulty: 15 },
        { label: 'Drain them with your own chakra', stat: 'chakraControl', difficulty: 15 },
        { label: 'Work out the order they were laid', stat: 'intellect', difficulty: 16 },
      ],
      success:
        'The last tag goes dead in your hand and is only paper again. The cave is only a cave.',
      failure:
        'Most of them go dead, but one catches, and the cave fills with smoke and the sound of the gorge shifting.',
      onFailure: 'penalty',
      failureDamage: 12,
    },
    {
      kind: 'encounter',
      template: 'guarded-building',
      job: 'deliver',
      ground: 'room',
      text: 'The Stone jōnin is awake and in the cave mouth, and their trapper is coming down the cliff on a rope.',
      enemyIds: ['foe-iwagakure-captain-jonin', 'foe-iwagakure-trapper-chunin'],
      canFlee: true,
      talkable: false,
      flavour: {
        slipped:
          'You go out through a crack at the back of the cave while the jōnin stands in the smoke shouting for the trapper.',
      },
    },
    {
      kind: 'ending',
      endings: [
        {
          text: 'The bridge still stands, and in the spring the Stone sends a polite letter about a cave collapse it regrets, under a bridge it says it never knew about.',
        },
      ],
    },
    { kind: 'road', to: 'home' },
  ],
};

export const OTAFUKU_TRAITOR: MissionDef = {
  id: 'senior-otafuku-traitor',
  title: 'The Leaf Ledger in Otafuku',
  rank: 'A',
  client: 'Ibiki Morino',
  summary:
    'A Leaf chūnin left the village a month ago with the patrol rota for the northern border. He is selling copies of it in Otafuku, one buyer at a time.',
  slots: 6,
  energyCost: 40,
  reward: { ryo: 1000, reputation: 15 },
  minMissionsCompleted: 14,
  goesTo: 'otafuku-town',
  endsAt: 'konohagakure',
  stages: [
    { kind: 'road', to: 'outbound', text: 'East over the hills to the gambling town.' },
    {
      kind: 'narrative',
      text: 'Ibiki gives you a sketch of a face and a name. “Hayato Tsuji,” he says. “He was a good chūnin. He needed money, and he found a better way to make it.”',
    },
    {
      kind: 'check',
      text: 'Tsuji sells his copies at a teahouse on the canal, and buyers come by appointment.',
      approaches: [
        { label: 'Pose as a buyer', stat: 'willpower', difficulty: 14 },
        { label: 'Watch the teahouse for a day', stat: 'perception', difficulty: 13 },
      ],
      success:
        'You sit across from him with tea between you, and he doesn’t know your face. He has the rota in a sealed case at his elbow.',
      failure: 'He knows your face as soon as you sit down, and he has friends in the room.',
      onFailure: 'penalty',
      failureDamage: 8,
    },
    {
      kind: 'encounter',
      template: 'guarded-building',
      job: 'eliminate',
      ground: 'town',
      text: 'Tsuji stands, kicking the table over, and the Stone missing-nin he hired as a bodyguard comes in off the canal steps.',
      enemyIds: ['leaf-missing-nin', 'rogue-iwagakure-trapper-chunin'],
      canFlee: true,
      flavour: {
        parley:
          'Tsuji puts the case on the floor and his hands on his head. “Ibiki sent you,” he says. “Then I would rather go home.”',
      },
    },
    {
      kind: 'ending',
      endings: [
        {
          when: { has: 'talked-down' },
          text: 'Tsuji walks home ahead of you with his hands bound, and gives Ibiki every buyer’s name before the first night is out.',
        },
        {
          text: 'The rota comes home in its sealed case, and the northern patrols change their hours for the first time in a decade.',
        },
      ],
    },
    { kind: 'road', to: 'home' },
  ],
};
