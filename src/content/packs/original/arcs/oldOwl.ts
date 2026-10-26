import type { ArcDef, MissionDef } from '@/systems/missions';

/**
 * The Old Owl of the Pass: an elder's story (`docs/design/chakra-beasts-plan.md`). Someone is
 * knocking down the cairns on the high pass and robbing the travellers who lose their way. The
 * deserters you catch say an owl watched them all summer, and it wasn't them it was watching.
 * Then go up into the heart of the high country and see what the owl sees.
 */

const CLIENT = 'The Pass Wardens';
export const OWL_NAMED = 'old-owl-named';
export const OWL_SETTLED = 'old-owl-settled';

export const FALLEN_CAIRNS: MissionDef = {
  id: 'arc-old-owl-cairns',
  title: 'The Fallen Cairns',
  rank: 'C',
  client: CLIENT,
  summary: 'The cairns on the high pass are being knocked down, and travellers are going missing.',
  slots: 6,
  energyCost: 35,
  reward: { ryo: 500, reputation: 9 },
  minMissionsCompleted: 7,
  stages: [
    {
      kind: 'narrative',
      text: 'The warden puts a cairn stone on the table, painted red on one side. “We put them up every spring. Someone’s been knocking them down and moving them, and the people who follow the wrong ones don’t come down.”',
    },
    {
      kind: 'leg',
      text: 'Up off the goat tracks onto the high scree, setting the cairns right as you go.',
      days: 2,
      region: 'mountain-edge',
      danger: 'armed',
    },
    {
      kind: 'check',
      text: 'One line of cairns leads off the pass into a gully. The stones in it have been moved this week.',
      approaches: [
        {
          label: 'Read who has walked the gully',
          stat: 'perception',
          difficulty: 10,
          role: 'tracker',
          onSuccess: { ledger: 'Found the boot marks of the people moving the cairns.' },
        },
        {
          label: 'Work out where the gully comes out',
          stat: 'intellect',
          difficulty: 10,
          onSuccess: { ledger: 'Worked out where the false cairns lead, and got there first.' },
        },
      ],
      success: 'At the bottom of the gully there is a cave, and a fire in it.',
      failure:
        'You follow the false cairns as the travellers did, and find the cave by walking into it.',
      onFailure: 'forward',
      failureDamage: 6,
    },
    {
      kind: 'encounter',
      template: 'bandit-camp',
      job: 'eliminate',
      text: 'Three deserters are sharing out a traveller’s pack by the fire, and the red cairn paint is still on their hands.',
      enemyIds: ['bandit-deserter', 'bandit-deserter', 'bandit-knifeman'],
      canFlee: false,
      flavour: {
        terrain: 'A cave at the bottom of a gully, loose scree on both sides and one way out.',
      },
    },
    {
      kind: 'decision',
      text: 'The last of them sits against the cave wall with their hands tied. “We only moved stones. Ask the owl what’s up there. It sat on that dead pine all summer and watched us, and it was never us it was watching.”',
      options: [
        {
          label: 'Ask what it was watching',
          tone: 'curious',
          reply:
            '“Up the pass. Past where the cairns stop. It looks up there like a dog looks at a door.”',
          ledger: 'Heard about the old owl of the pass from a deserter.',
        },
        {
          label: 'Tell them owls watch everybody',
          tone: 'challenge',
          reply: '“Not like that one,” they say, and won’t say anything else all the way down.',
          ledger: 'Heard about the old owl of the pass, and didn’t think much of it.',
        },
      ],
    },
    {
      kind: 'ending',
      endings: [
        {
          text: 'The cairns go back where they belong, and the deserters go to the wardens. The warden writes one more thing on the pass board: the old owl, and where it sits.',
          effects: [
            { kind: 'world', mark: OWL_NAMED },
            { kind: 'memory', text: 'the false cairns on the high pass' },
          ],
        },
      ],
    },
    {
      kind: 'leg',
      text: 'Down off the scree with the deserters roped in a line.',
      days: 2,
      region: 'mountain-edge',
      danger: 'armed',
    },
  ],
};

export const OWL_OF_THE_PASS: MissionDef = {
  id: 'arc-old-owl-heart',
  title: 'The Owl of the Pass',
  rank: 'B',
  client: CLIENT,
  summary:
    'Go up past the cairns into the high country, and find out what the old owl is watching.',
  slots: 6,
  energyCost: 45,
  reward: { ryo: 600, reputation: 11 },
  minMissionsCompleted: 9,
  stages: [
    {
      kind: 'leg',
      text: 'Up past the last cairn, where the snow lies all year.',
      days: 2,
      region: 'mountain-heart',
      danger: 'elite',
    },
    {
      kind: 'decision',
      text: 'The owl sits in its dead pine on the saddle, as big as a child, and doesn’t move when you come up. Its eyes go past you, to a peak above the snow.',
      options: [
        {
          label: 'Go where it is looking',
          tone: 'curious',
          reply: 'You walk past the pine. The owl turns its head to follow you, and lets you go.',
          effects: [{ kind: 'mark', mark: 'followed-the-owl' }],
          ledger: 'Went where the old owl was looking.',
        },
        {
          label: 'Drive it off the pass',
          tone: 'challenge',
          reply: 'You go for the pine. The owl spreads its wings, wider than the pine is tall.',
          ledger: 'Went for the old owl of the pass.',
        },
      ],
    },
    {
      kind: 'encounter',
      when: { lacks: 'followed-the-owl' },
      template: 'beast',
      job: 'eliminate',
      text: 'The owl comes down off the pine without a sound, and you lose sight of it before it lands.',
      enemyIds: ['old-owl-of-the-pass'],
      canFlee: false,
      bypassable: false,
    },
    {
      kind: 'check',
      when: { has: 'followed-the-owl' },
      text: 'Under the peak there is a hollow in the snow where no snow lies, and the ground is warm. Someone has been digging.',
      approaches: [
        {
          label: 'Feel for whose chakra it is',
          stat: 'chakraControl',
          difficulty: 12,
          role: 'sensor',
          onSuccess: { ledger: 'Felt a sensor’s chakra in the warm ground under the peak.' },
        },
        {
          label: 'Wait for them to come back',
          stat: 'willpower',
          difficulty: 12,
          onSuccess: { ledger: 'Waited in the snow until the digger came back.' },
        },
      ],
      success: 'At dusk a figure comes down the peak with a pick and a sack, and doesn’t see you.',
      failure:
        'They see you first, from high on the peak, and are waiting in the hollow when you come.',
      onFailure: 'forward',
    },
    {
      kind: 'encounter',
      when: { has: 'followed-the-owl' },
      template: 'lone-rogue',
      job: 'eliminate',
      text: 'A missing-nin with a scratched headband stands in the warm hollow, with a sack of stones still warm from the ground.',
      enemyIds: ['rogue-arashigakure-sensor-chunin'],
      canFlee: false,
      bypassable: false,
    },
    {
      kind: 'ending',
      endings: [
        {
          when: { has: 'followed-the-owl' },
          text: 'The digging stops, and the warm hollow goes cold over the winter. When you come back past the saddle the owl is still on its pine. It looks at you this time.',
          effects: [
            { kind: 'world', mark: OWL_SETTLED },
            { kind: 'memory', text: 'the warm hollow under the peak' },
          ],
        },
        {
          text: 'The pine on the saddle is empty. The wardens put up new cairns in the spring, and nobody finds out what the owl was watching.',
          effects: [
            { kind: 'world', mark: OWL_SETTLED },
            { kind: 'memory', text: 'the fight on the saddle' },
          ],
        },
      ],
    },
    {
      kind: 'leg',
      text: 'Down out of the peaks and back to the pass.',
      days: 2,
      region: 'mountain-edge',
      danger: 'armed',
    },
  ],
};

export const OLD_OWL_JOBS: readonly MissionDef[] = [FALLEN_CAIRNS, OWL_OF_THE_PASS];

export const OLD_OWL_ARC: ArcDef = {
  id: 'the-old-owl-of-the-pass',
  title: 'The Old Owl of the Pass',
  summary: 'Someone is moving the cairns on the high pass, and an owl has been watching.',
  acts: [
    {
      beats: ['you', 'need', 'go', 'search'],
      title: 'The false cairns',
      text: 'Find out who is moving the cairns on the high pass.',
      jobs: [FALLEN_CAIRNS.id],
    },
    {
      beats: ['find', 'take', 'return', 'change'],
      title: 'What the owl sees',
      text: 'The deserters spoke of an old owl on the pass. Go up and see what it is watching.',
      jobs: [OWL_OF_THE_PASS.id],
    },
  ],
};
