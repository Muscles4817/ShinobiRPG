import type { MissionDef } from '@/systems/missions';

/**
 * Work for the loyal houses. The regime pays a foreigner well to look where its own people
 * won't, and a foreigner can always look the other way. Nobody makes you choose a side.
 */
export const KIRI_REBEL_HANDED_OVER = 'kiri-rebel-handed-over';

export const KIRI_REGIME_JOBS: readonly MissionDef[] = [
  {
    id: 'kiri-blockade-lookout',
    title: 'Lookout on the Blockade',
    rank: 'C',
    client: 'Tora of the Isana fleet',
    summary:
      'The fleet is a lookout short. Sit the masthead through the night and call any boat that runs without lights.',
    slots: 3,
    energyCost: 25,
    reward: { ryo: 260, reputation: 4 },
    minMissionsCompleted: 4,
    stages: [
      {
        kind: 'narrative',
        text: 'The whale boat rides at anchor off the outer islands, with its lamps hooded and its harpoons racked along the gunwale.',
      },
      {
        kind: 'check',
        text: 'Some time after midnight, oars dip somewhere off the bow, slow and careful.',
        approaches: [
          { label: 'Find the boat by the sound of its oars', stat: 'perception', difficulty: 11 },
          { label: 'Stay sharp through the cold watch', stat: 'willpower', difficulty: 11 },
        ],
        success:
          'A low black boat creeps past with its oars muffled in rags. It’s packed with people, and one of them is a child.',
        failure: 'You hear it too late. By the time you look, the boat is only a wake in the fog.',
        onFailure: 'forward',
      },
      {
        kind: 'decision',
        text: 'Tora stands below the mast with a harpoon in his hand, waiting for you to call it.',
        options: [
          {
            label: 'Call the boat',
            tone: 'earnest',
            reply:
              'Tora shouts the fleet awake, and the whale boats close on the black one in the fog.',
            ledger: 'Called a rebel boat to the blockade.',
          },
          {
            label: 'Say it was a seal',
            tone: 'quiet',
            reply: 'Tora looks at you for a long moment, then racks the harpoon. “Seals, then.”',
            effects: [{ kind: 'mark', mark: 'mercy' }],
            ledger: 'Let a rebel boat slip past the blockade.',
          },
        ],
      },
      {
        kind: 'ending',
        endings: [
          {
            when: { has: 'mercy' },
            text: 'At dawn Tora buys you a bowl of whale broth on the quay and doesn’t mention the seal.',
            effects: [{ kind: 'memory', text: 'the seal off the outer islands' }],
          },
          {
            text: 'The fleet comes home with a boat in tow. Tora pays you, and doesn’t meet your eye.',
            effects: [{ kind: 'memory', text: 'the boat in tow' }],
          },
        ],
      },
    ],
  },
  {
    id: 'kiri-drain-hunt',
    title: 'Something in the Drains',
    rank: 'C',
    client: 'The Kurage house',
    summary:
      'A Hōzuki has gone to water in the canals under the harbour ward. The masks want a stranger’s eyes down there.',
    slots: 3,
    energyCost: 30,
    reward: { ryo: 460, reputation: 7 },
    minMissionsCompleted: 6,
    once: true,
    stages: [
      {
        kind: 'narrative',
        text: 'A masked Kurage hands you a lantern and a map of the drains. “Water moves wrong where he is,” they say. “Find where it moves wrong.”',
      },
      {
        kind: 'check',
        text: 'The drains run under the whole ward, ankle-deep and black. Somewhere the water ripples against the current.',
        approaches: [
          { label: 'Follow the ripple against the current', stat: 'perception', difficulty: 12 },
          { label: 'Work out where he’d run to from the map', stat: 'intellect', difficulty: 12 },
        ],
        success:
          'You find him where the drain opens under the bathhouse, half water and half boy, shaking.',
        failure: 'You lose an hour in the dark, and he finds you instead.',
        onFailure: 'forward',
      },
      {
        kind: 'decision',
        text: 'He isn’t much older than a genin. He says his mother is on the outer islands, and that the masks took his brother last spring.',
        options: [
          {
            label: '“Run. I never saw you.”',
            tone: 'kind',
            reply:
              'He stares at you, then goes to water and is gone down the drain towards the sea.',
            effects: [{ kind: 'mark', mark: 'mercy' }],
            ledger: 'Let the Hōzuki boy go.',
          },
          {
            label: '“Come quietly and I’ll see you’re treated fairly.”',
            tone: 'earnest',
            reply:
              '“You don’t know them,” he says, and the water comes up out of the drain at you.',
            ledger: 'Tried to bring the Hōzuki in.',
          },
        ],
      },
      {
        kind: 'encounter',
        when: { lacks: 'mercy' },
        ground: 'town',
        template: 'lone-rogue',
        job: 'eliminate',
        text: 'The Hōzuki boy fights like the water he turns into, from every side of the drain at once.',
        enemyIds: ['hozuki-rebel'],
        canFlee: true,
      },
      {
        kind: 'ending',
        endings: [
          {
            when: { has: 'mercy' },
            text: 'You tell the mask the drains were empty. They take the lantern back without a word, and you feel them watching you all the way home.',
            effects: [{ kind: 'memory', text: 'the boy who went to water' }],
            ledger: 'Told the Kurage the drains were empty.',
          },
          {
            text: 'The masks take him away in a net. The Kurage pay you in full and write your name in a book.',
            effects: [
              { kind: 'world', mark: KIRI_REBEL_HANDED_OVER },
              { kind: 'memory', text: 'the boy in the net' },
            ],
            ledger: 'Handed a Hōzuki rebel to the hunter-nin.',
          },
        ],
      },
    ],
  },
];
