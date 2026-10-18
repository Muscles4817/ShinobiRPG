import type { MissionDef } from '@/systems/missions';

/**
 * The Bloody Mist's work: bloodline families hunted by the Mizukage's masks, and the rebels
 * who would end his rule. A foreigner caught at either is a foreigner who doesn't go home.
 */
export const KIRI_FROST_FAMILY_OUT = 'kiri-frost-family-out';
export const KIRI_LETTER_DELIVERED = 'kiri-letter-delivered';

const SEEN = {
  effects: [{ kind: 'mark', mark: 'seen' }],
  ledger: 'The hunter-nin heard the child.',
} as const;
const CHASED = {
  effects: [{ kind: 'mark', mark: 'chased' }],
  ledger: 'The watch post saw you go by.',
} as const;

export const KIRI_RESCUE_JOBS: readonly MissionDef[] = [
  {
    id: 'kiri-frost-children',
    title: 'Frost on the Windows',
    rank: 'C',
    client: 'Granny Shio',
    summary:
      'A family two streets over has children who leave frost on everything they touch. The masks are asking about them.',
    slots: 3,
    energyCost: 30,
    reward: { ryo: 420, reputation: 8 },
    minMissionsCompleted: 6,
    once: true,
    stages: [
      {
        kind: 'narrative',
        text: 'The mother keeps the shutters closed all day. Inside, the youngest has drawn snowflakes on the table with one finger, and they haven’t melted.',
      },
      {
        kind: 'decision',
        text: 'The boat leaves from the far end of the quay at midnight. Getting the family there is up to you.',
        options: [
          {
            label: 'Hide them in a fish cart going to the auction',
            tone: 'curious',
            reply: 'The children giggle under the mackerel until their mother hushes them.',
            effects: [{ kind: 'mark', mark: 'cart' }],
            ledger: 'Hid the family under the auction’s fish.',
          },
          {
            label: 'Take them along the bathhouse drains',
            tone: 'earnest',
            reply: 'The drains are warm and stink of salt, and the patrols never look down.',
            ledger: 'Led the family through the bathhouse drains.',
          },
        ],
      },
      {
        kind: 'check',
        text: 'Halfway down the quay, a masked figure is standing on a mooring post, listening.',
        approaches: [
          {
            label: 'Stand still until the mask moves on',
            stat: 'willpower',
            difficulty: 12,
            success: 'You hold your breath until your chest burns. The mask moves on into the fog.',
            onFailure: SEEN,
          },
          {
            label: 'Throw a stone the other way',
            stat: 'intellect',
            difficulty: 12,
            when: { has: 'cart' },
            onFailure: SEEN,
          },
        ],
        success: 'The mask turns its head towards the stone, and then it is gone into the fog.',
        failure: 'The youngest child sneezes, and frost cracks across the boards.',
        onFailure: 'forward',
      },
      {
        kind: 'encounter',
        when: { has: 'seen' },
        ground: 'town',
        template: 'lone-rogue',
        job: 'escort',
        text: 'The hunter-nin drops off the post and the patrol comes running at the whistle.',
        enemyIds: ['mist-hunter-nin', 'mist-patrol'],
        canFlee: false,
        bypassable: false,
      },
      {
        kind: 'ending',
        endings: [
          {
            text: 'The boat slides out with the family under a tarpaulin. The youngest waves, and a little snow falls on the quay where nobody else will see it.',
            effects: [
              { kind: 'world', mark: KIRI_FROST_FAMILY_OUT },
              { kind: 'memory', text: 'the snow on the quay' },
            ],
            ledger: 'Got the frost family off the island.',
          },
        ],
      },
    ],
  },
  {
    id: 'kiri-sealed-letter',
    title: 'A Letter in the Lining',
    rank: 'B',
    client: 'Mirei, chūnin of the harbour watch',
    summary:
      'Mirei can’t leave her post. A sealed letter has to reach a cove up the coast where the rebels land by night.',
    slots: 3,
    energyCost: 30,
    reward: { ryo: 780, reputation: 12 },
    minMissionsCompleted: 10,
    needsWorldMark: KIRI_FROST_FAMILY_OUT,
    once: true,
    stages: [
      {
        kind: 'narrative',
        text: 'Mirei stitches the letter into your coat herself. “If the masks stop you, swallow it,” she says. “Don’t read it. Knowing would get you killed too.”',
      },
      {
        kind: 'check',
        text: 'The coast path runs past the Mizukage’s watch post, and the fog is thinning.',
        approaches: [
          {
            label: 'Go down and run the rocks under the post',
            stat: 'speed',
            difficulty: 12,
            onFailure: CHASED,
          },
          {
            label: 'Wait in the gorse for the change of watch',
            stat: 'perception',
            difficulty: 12,
            onFailure: CHASED,
          },
        ],
        success: 'You are past the post before the new watch has lit its lantern.',
        failure:
          'A shout goes up behind you, and a flare lights the fog red. They know someone has come this way.',
        onFailure: 'forward',
      },
      {
        kind: 'decision',
        text: 'At the cove a woman in a dark cloak takes the letter. Her people want to know what the harbour ward thinks of them.',
        options: [
          {
            label: '“They’re waiting for you. They won’t say so.”',
            tone: 'earnest',
            reply: 'She smiles for the first time. “Then we won’t keep them waiting long.”',
            ledger: 'Told the rebels the harbour was with them.',
          },
          {
            label: '“I carry letters. I don’t take sides.”',
            tone: 'quiet',
            reply: '“That’s a side too,” she says, but she pays you anyway.',
            ledger: 'Kept out of the rebels’ war.',
          },
        ],
      },
      {
        kind: 'encounter',
        when: { has: 'chased' },
        ground: 'forest',
        template: 'lone-rogue',
        job: 'deliver',
        text: 'Masks come down the cliff path behind you before the rebels’ boat is out of the cove.',
        enemyIds: ['mist-hunter-nin', 'mist-patrol', 'mist-patrol'],
        canFlee: true,
      },
      {
        kind: 'ending',
        endings: [
          {
            text: 'Back in the harbour ward, Mirei passes you on the quay without a word, and you find a ryo coin with a rebel’s mark in your coat pocket.',
            effects: [
              { kind: 'world', mark: KIRI_LETTER_DELIVERED },
              { kind: 'memory', text: 'the letter in the coat lining' },
            ],
            ledger: 'Carried the rebels’ letter to the cove.',
          },
        ],
      },
    ],
  },
];
