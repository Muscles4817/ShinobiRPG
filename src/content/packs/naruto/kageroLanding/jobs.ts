import type { MissionDef } from '@/systems/missions';

import { LANDING_ENVOY_JOB } from './envoy';
import { SUNA_BARGE_PASSAGE } from './passage';

/**
 * The Barge Office: work for the sand priests, which the Landing won't do and a stranger may.
 * Bringing a lost apprentice back out of the outer sands earns their leave to board a barge
 * (`SUNA_BARGE_PASSAGE`, which the barge crossing needs); walking the Sand's envoy home earns a
 * Leaf shinobi the Sand's gates (`envoy.ts`).
 */

const TAINTED_TERRAIN =
  'Dunes like frozen waves, and between them hard pans of grey sand that crunch like eggshell. Out here it glitters faintly, and nothing lives that should.';

const BARGE_OFFICE_JOBS: readonly MissionDef[] = [
  {
    id: 'landing-ballast',
    title: 'Stones for the Priests',
    rank: 'D',
    client: 'Sunao of the Dunes, barge pilot',
    summary:
      'A barge goes out at dawn and its ballast is still on the ramp. Nobody in town will carry stones for a priest.',
    slots: 2,
    energyCost: 25,
    reward: { ryo: 90, reputation: 2 },
    minMissionsCompleted: 0,
    stages: [
      {
        kind: 'narrative',
        text: 'The ballast is a heap of river stones at the foot of the ramp. A few townsfolk sit on the wall above it to watch, as if waiting for a show.',
      },
      {
        kind: 'check',
        text: 'The ramp is long and the stones are heavy, and somebody on the wall throws one of them back down.',
        approaches: [
          { label: 'Carry them up two at a time', stat: 'strength', difficulty: 9 },
          { label: 'Rig a sledge and haul them on it', stat: 'intellect', difficulty: 9 },
        ],
        success:
          'The last stone goes into the hold as the sky pales. Sunao nods once, which the yard men say is a great deal from a priest.',
        failure:
          'The barge leaves half a day late, riding high. Sunao says nothing, which the yard men say is worse.',
        onFailure: 'penalty',
        failureDamage: 1,
      },
    ],
  },
  {
    id: 'landing-lost-skiff',
    title: 'Lost in the Outer Sands',
    rank: 'C',
    client: 'Sunao of the Dunes, barge pilot',
    summary:
      'A priests’ apprentice took a sand skiff out after the storm and hasn’t come back. Sunao can’t leave her barge, and the town won’t go.',
    slots: 3,
    energyCost: 30,
    reward: { ryo: 360, reputation: 7 },
    minMissionsCompleted: 4,
    once: true,
    stages: [
      {
        kind: 'narrative',
        text: 'The apprentice is a boy called Iwao, fourteen, who wanted to show he could read the sand without a pilot. The storm took his trail. Sunao gives you a skin of water and a direction, and says the belt starts where the sand turns grey.',
      },
      {
        kind: 'check',
        text: 'The storm has rubbed out every track. The dunes all look like each other, and the sun is climbing.',
        approaches: [
          {
            label: 'Read which way the sand has moved since the storm',
            stat: 'perception',
            difficulty: 11,
            onFailure: {
              effects: [{ kind: 'mark', mark: 'belt' }],
              ledger: 'Lost the trail and wandered into the tainted belt.',
            },
          },
          {
            label: 'Work out where the wind would have driven a skiff',
            stat: 'intellect',
            difficulty: 11,
            onFailure: {
              effects: [{ kind: 'mark', mark: 'belt' }],
              ledger: 'Guessed wrong and walked into the tainted belt.',
            },
          },
        ],
        success:
          'A splinter of painted wood, then a rope end, then the skiff on its side in a hollow, and small footprints walking away from it.',
        failure:
          'By the time you find the skiff the sand under your feet has gone grey and glittering, and a pack of jackals is following you.',
        onFailure: 'forward',
      },
      {
        kind: 'encounter',
        ground: 'desert',
        template: 'beast',
        job: 'retrieve',
        text: 'The boy is on top of a rock with a broken oar, and tainted jackals are circling it. They are too big, and far too quiet.',
        enemyIds: ['tainted-jackal', 'tainted-jackal'],
        flavour: { terrain: TAINTED_TERRAIN },
        canFlee: false,
        bypassable: true,
      },
      {
        kind: 'encounter',
        when: { has: 'belt' },
        ground: 'desert',
        template: 'beast',
        job: 'retrieve',
        text: 'On the way back the sand heaves, and a scorpion the size of a cart comes up out of it between you and the Landing.',
        enemyIds: ['tainted-scorpion'],
        flavour: { terrain: TAINTED_TERRAIN },
        canFlee: true,
        bypassable: true,
      },
      {
        kind: 'ending',
        endings: [
          {
            text: 'Sunao meets you at the edge of the yards and takes the boy by the ear. Then she opens the barge ledger and writes your name in it, slowly, in the priests’ script. “You may board,” she says. “Tell nobody I was glad.”',
            effects: [
              { kind: 'world', mark: SUNA_BARGE_PASSAGE },
              { kind: 'memory', text: 'the boy on the rock in the outer sands' },
            ],
            ledger: 'Brought the priests’ apprentice back, and earned leave to board their barges.',
          },
        ],
      },
    ],
  },
  {
    id: 'landing-spice-runners',
    title: 'Grey Sand in the Grain Sacks',
    rank: 'B',
    client: 'The Barge Office',
    summary:
      'Someone is running spice out of the belt in the Landing’s grain sacks, and the priests will be blamed for it.',
    slots: 3,
    energyCost: 30,
    reward: { ryo: 820, reputation: 12 },
    minMissionsCompleted: 10,
    needsWorldMark: SUNA_BARGE_PASSAGE,
    stages: [
      {
        kind: 'narrative',
        text: 'A grain sack split on the ramp this morning, and what ran out of it glittered. The Landing is already saying the priests brought it in.',
      },
      {
        kind: 'check',
        text: 'Every caravan in the yard has grain sacks, and every caravan master swears on his mother.',
        approaches: [
          { label: 'Watch who comes for the sacks at night', stat: 'perception', difficulty: 13 },
          {
            label: 'Go through the manifests for weight that isn’t grain',
            stat: 'intellect',
            difficulty: 13,
          },
        ],
        success:
          'The sacks belong to a caravan that came out of the belt with fewer camels than it went in with. Its men are camped in a hollow beyond the flats.',
        failure:
          'You find the hollow too late. They have heard you are asking, and they are waiting.',
        onFailure: 'forward',
      },
      {
        kind: 'encounter',
        ground: 'desert',
        template: 'bandit-camp',
        job: 'eliminate',
        text: 'Three camels, a fire of dung and thorn, and men with rings round their eyes, weighing grey sand into little bags.',
        enemyIds: ['spice-runner', 'spice-runner', 'dune-raider'],
        canFlee: true,
        bypassable: true,
      },
      {
        kind: 'ending',
        endings: [
          {
            text: 'The sacks are emptied into the wind off the top of the tallest dune. Rokusuke spits when he hears, and then buys you a cup of tea, which nobody has seen him do.',
            effects: [{ kind: 'memory', text: 'spice blowing off the dune at dawn' }],
            ledger: 'Broke the spice runners and cleared the priests’ name.',
          },
        ],
      },
    ],
  },
];

export const LANDING_JOBS: readonly MissionDef[] = [...BARGE_OFFICE_JOBS, LANDING_ENVOY_JOB];
