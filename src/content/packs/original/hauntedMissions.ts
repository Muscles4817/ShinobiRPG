import type { MissionDef } from '@/systems/missions';

/** The storehouse's ghost, and the boy from the boulders who came after a kinder job. */
export const HAUNTED_MISSIONS: readonly MissionDef[] = [
  {
    id: 'storehouse-ghost',
    title: 'The Storehouse Ghost',
    rank: 'D',
    client: 'Rice Broker Hanada',
    summary:
      'Something is spoiling the rice in Hanada’s storehouse, and the workers refuse to go in.',
    slots: 3,
    energyCost: 30,
    reward: { ryo: 260, reputation: 8, scrollId: 'whispering-dread' },
    minMissionsCompleted: 3,
    stages: [
      {
        kind: 'check',
        text: 'The storehouse is freezing. Ledgers flip their own pages. The lamp keeps going out.',
        approaches: [
          {
            label: 'Steel your nerves and go in',
            stat: 'willpower',
            difficulty: 10,
            failure:
              'You get three steps past the door before your legs carry you back out into the street. It takes a while, standing in the sun, before you can go in again.',
          },
          {
            label: 'See through the haunting',
            stat: 'genjutsu',
            difficulty: 10,
            success:
              'The pages stop turning once you stop believing them. You walk straight to the back wall, where the cold is real.',
            failure:
              'You try to unpick the illusion and it unpicks you instead, until you are standing in the street with no memory of leaving. You go back in.',
          },
        ],
        success: 'You walk straight to the back wall, where the cold is strongest.',
        failure: 'You flee into the street before you realise you have moved. You go back in.',
        onFailure: 'penalty',
        failureDamage: 6,
      },
      {
        kind: 'encounter',
        ground: 'room',
        template: 'spirit',
        job: 'eliminate',
        text: 'A grey figure hunches over the rice sacks at the back, muttering. "Mine. All of it. Mine."',
        enemyIds: ['storehouse-wraith'],
        canFlee: false,
      },
      {
        kind: 'narrative',
        text: 'You light a lantern at the door. The cold drains away, and the rice smells sweet again.',
      },
    ],
  },
  {
    id: 'boy-from-the-boulders',
    title: 'The Boy from the Boulders',
    rank: 'D',
    client: 'A boy from the hill farms',
    summary:
      'The lookout you let go on the pilgrims’ road has come to the village. He wants to learn to throw a kunai, and he has nothing to pay with but turnips.',
    slots: 2,
    energyCost: 15,
    reward: { ryo: 40, reputation: 4 },
    minMissionsCompleted: 0,
    needsWorldMark: 'kohaku-spared',
    stages: [
      {
        kind: 'narrative',
        text: 'He is waiting at the training ground before dawn, a sack of turnips at his feet and a borrowed kunai in his fist.',
      },
      {
        kind: 'check',
        text: 'He throws like a farmer: all shoulder, eyes shut. He looks at you as if you might send him home.',
        approaches: [
          { label: 'Show him slowly, again and again', stat: 'willpower', difficulty: 6 },
          { label: 'Show him how you learned', stat: 'taijutsu', difficulty: 7 },
        ],
        success:
          'By noon he hits the post three times running, and whoops so loud the lamplighters look round.',
        failure:
          'By noon he still misses more than he hits, but he is laughing at his misses now, which is a start.',
        onFailure: 'forward',
      },
      {
        kind: 'ending',
        endings: [
          {
            text: 'He leaves the turnips on the step and runs home over the hills. Next spring, he says, he will sit the academy test.',
            effects: [{ kind: 'world', mark: 'boulders-boy-taught' }],
            ledger: 'Taught the boy from the boulders to throw.',
          },
        ],
      },
    ],
  },
];
