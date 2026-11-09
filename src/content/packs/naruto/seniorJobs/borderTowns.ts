import type { MissionDef } from '@/systems/missions';

/**
 * B-rank work in the towns along the Leaf's roads: a bounty station at the Valley of the End
 * paying for Leaf headbands, a sealed scroll pawned in Otafuku's gambling halls, and the
 * daimyō's tax silver carried down the post road past the men who want it.
 */

export const BOUNTY_STATION: MissionDef = {
  id: 'senior-bounty-station',
  title: 'The Bounty on Leaf Headbands',
  rank: 'B',
  client: 'The Hokage’s office',
  summary:
    'Someone near the Valley of the End is paying for Leaf headbands, and two genin on a courier run never came back. Close the station.',
  slots: 4,
  energyCost: 35,
  reward: { ryo: 620, reputation: 11 },
  minMissionsCompleted: 11,
  goesTo: 'valley-of-the-end',
  endsAt: 'konohagakure',
  stages: [
    { kind: 'road', to: 'outbound', text: 'North along the river road to the border.' },
    {
      kind: 'narrative',
      text: 'The two statues face each other across the falls, and on the near bank a burnt-out shrine has a fresh lock on its door.',
    },
    {
      kind: 'check',
      text: 'The station’s keeper only opens to people who bring a headband. You have one, your own.',
      approaches: [
        { label: 'Wear another face and sell it', stat: 'genjutsu', difficulty: 13 },
        { label: 'Wait for the next seller and follow them in', stat: 'stamina', difficulty: 13 },
        { label: 'Pick the lock while the keeper sleeps', stat: 'speed', difficulty: 14 },
      ],
      success:
        'Inside, headbands hang on nails along the wall, and the two from the courier run are among them, still bloodied.',
      failure: 'The keeper knows a Leaf face when one walks in, and the door slams behind you.',
      onFailure: 'penalty',
      failureDamage: 8,
    },
    {
      kind: 'encounter',
      template: 'guarded-building',
      job: 'eliminate',
      ground: 'room',
      text: 'The keeper counts coins at a table under the headbands, and the hired knife who brings most of them sharpens a blade by the stove.',
      enemyIds: ['hired-assassin', 'mercenary-veteran'],
      canFlee: true,
      talkable: false,
    },
    {
      kind: 'check',
      text: 'The keeper’s ledger names whoever pays for the headbands, written in a merchant’s cipher.',
      approaches: [
        { label: 'Break the cipher', stat: 'intellect', difficulty: 13 },
        { label: 'Copy every page and carry it home', stat: 'chakraControl', difficulty: 11 },
      ],
      success:
        'The payments come from a buyer in the Land of Rivers who collects enemy headbands the way some lords collect swords.',
      failure: 'The ledger burns in the stove before you can read more than a page of it.',
      onFailure: 'forward',
    },
    {
      kind: 'ending',
      endings: [
        {
          text: 'You carry the headbands home in a cloth bag, and the families of the two genin come to the gate to meet you.',
        },
      ],
    },
    { kind: 'road', to: 'home' },
  ],
};

export const OTAFUKU_PAWN: MissionDef = {
  id: 'senior-otafuku-pawn',
  title: 'The Scroll in the Pawnshop',
  rank: 'B',
  client: 'A Leaf chūnin who would rather not be named',
  summary:
    'A chūnin lost a sealed scroll at dice in Otafuku and has come to you before the Hokage hears of it. Get it back before anyone breaks the seal.',
  slots: 4,
  energyCost: 30,
  reward: { ryo: 560, reputation: 8 },
  minMissionsCompleted: 9,
  goesTo: 'otafuku-town',
  endsAt: 'konohagakure',
  stages: [
    { kind: 'road', to: 'outbound', text: 'East over the hills to the gambling town.' },
    {
      kind: 'narrative',
      text: 'The pawnshop is the back room of the biggest gambling hall, where the house keeps what its luckless customers leave behind.',
    },
    {
      kind: 'decision',
      text: 'The house will sell the scroll back. The price is more than the chūnin has, and more than the job pays.',
      options: [
        {
          label: 'Win it back at the tables',
          tone: 'joke',
          reply:
            'You sit down at the dice with your own money and a straight face, and the house starts to look worried before midnight.',
          effects: [{ kind: 'mark', mark: 'won-it-back' }],
          ledger: 'Won the scroll back at the house’s own tables.',
        },
        {
          label: 'Take it from the back room',
          tone: 'challenge',
          reply: 'You go round the back after the hall closes.',
          effects: [{ kind: 'mark', mark: 'took-it' }],
          ledger: 'Went in after the scroll when the house wouldn’t sell it fairly.',
        },
      ],
    },
    {
      kind: 'check',
      when: { has: 'won-it-back' },
      text: 'The dealer’s cups are weighted, and the house doesn’t lose at its own tables for long.',
      approaches: [
        { label: 'Hear the dice settle', stat: 'perception', difficulty: 13 },
        { label: 'Count the house’s cheat', stat: 'intellect', difficulty: 13 },
      ],
      success: 'By dawn the scroll is on your side of the table, seal still whole.',
      failure:
        'You lose your own stake, and the house’s guards walk you to the back room to discuss your manners.',
      onFailure: 'forward',
    },
    {
      kind: 'encounter',
      template: 'guarded-building',
      job: 'retrieve',
      ground: 'room',
      text: 'The back room is full of other people’s swords and wedding silks. The house’s two keepers of the peace stand between you and the scroll.',
      enemyIds: ['ronin', 'mercenary-veteran'],
      canFlee: true,
    },
    {
      kind: 'ending',
      endings: [
        {
          when: { has: 'won-it-back' },
          text: 'The chūnin takes the scroll back with both hands and swears off dice, which nobody who knows them believes.',
        },
        {
          text: 'The scroll goes back to its chūnin with the seal unbroken, and Otafuku’s biggest gambling hall bars you for life.',
        },
      ],
    },
    { kind: 'road', to: 'home' },
  ],
};

/** A chest of the daimyō's silver gone into the ravine off the charcoal track. */
const LOST_CHEST = {
  effects: [{ kind: 'thread', thread: 'silver', by: -1 }],
  ledger: 'Lost a chest of silver into the ravine off the charcoal track.',
} as const;

export const TAX_SILVER: MissionDef = {
  id: 'senior-tax-silver',
  title: 'The Daimyō’s Silver',
  rank: 'B',
  client: 'The Fire Daimyō’s tax office',
  summary:
    'The season’s tax silver from the post towns goes to the capital by way of the Leaf. Somebody in the hills means to take it on the way.',
  slots: 4,
  energyCost: 35,
  reward: { ryo: 600, reputation: 10 },
  minMissionsCompleted: 10,
  goesTo: 'shukuba-town',
  endsAt: 'konohagakure',
  threads: [
    {
      id: 'silver',
      label: 'The silver',
      levels: ['Lost', 'Short', 'Mostly there', 'All there'],
      start: 3,
    },
  ],
  stages: [
    { kind: 'road', to: 'outbound', text: 'Up the post road to Shukuba.' },
    {
      kind: 'narrative',
      text: 'The tax clerk counts the silver into iron-bound chests in front of you, slowly, so that you can never say later that it was short.',
    },
    {
      kind: 'decision',
      text: 'Word of the silver will have reached the hills already. The convoy can go by the post road or the old charcoal track.',
      options: [
        {
          label: 'The post road, in plain sight',
          tone: 'earnest',
          reply: 'You go by the post road with the chests in an open cart and your headband on.',
          effects: [{ kind: 'mark', mark: 'post-road' }],
          ledger:
            'Took the silver down the post road, where everyone could see the Leaf guarding it.',
        },
        {
          label: 'The charcoal track, by night',
          tone: 'quiet',
          reply:
            'You go by the charcoal track with the chests under sacks of charcoal, and no lamp.',
          effects: [{ kind: 'mark', mark: 'charcoal-track' }],
          ledger: 'Took the silver by the old charcoal track under cover of dark.',
        },
      ],
    },
    {
      kind: 'check',
      when: { has: 'charcoal-track' },
      text: 'The charcoal track is steep and half washed away, and the cart is heavier than charcoal.',
      approaches: [
        {
          label: 'Carry the chests over the worst of it',
          stat: 'strength',
          difficulty: 13,
          onFailure: LOST_CHEST,
        },
        {
          label: 'Find the way in the dark',
          stat: 'perception',
          difficulty: 12,
          onFailure: LOST_CHEST,
        },
      ],
      success: 'You reach the valley floor before dawn with every chest.',
      failure: 'A chest goes over the edge into the ravine, and you hear it burst open far below.',
      onFailure: 'forward',
    },
    {
      kind: 'encounter',
      template: 'bandit-camp',
      job: 'deliver',
      ground: 'forest',
      text: 'Felled trees block the road ahead, and the warlord of the hills sits on one of them with his men around him.',
      enemyIds: ['hill-warlord', 'bandit-chief'],
      canFlee: false,
      flavour: {
        parley:
          'The warlord weighs you up and spits. “Not worth it,” he says to his men. “Let the Leaf have its silver.”',
      },
    },
    {
      kind: 'ending',
      endings: [
        {
          when: { thread: 'silver', below: 3 },
          text: 'The tax office counts the chests twice, writes the shortfall down in red, and pays you anyway.',
        },
        {
          text: 'The silver goes on to the capital with the Leaf’s seal on every chest, and the tax office asks for you by name next season.',
        },
      ],
    },
    { kind: 'road', to: 'home' },
  ],
};
