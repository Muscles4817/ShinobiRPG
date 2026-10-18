import type { MissionDef } from '@/systems/missions';

/** C-rank jobs for a whole team: your teammates come along and fight beside you. */
export const TEAM_MISSIONS: readonly MissionDef[] = [
  {
    id: 'river-road-bandits',
    title: 'Bandits on the River Road',
    rank: 'C',
    client: 'Rice Merchants’ Guild',
    summary: 'A gang has been robbing barges below the falls. The guild wants a whole team on it.',
    slots: 4,
    energyCost: 30,
    reward: { ryo: 280, reputation: 7, scrollId: 'riverbank-draw', gearId: 'ashen-needles' },
    minMissionsCompleted: 2,
    stages: [
      {
        kind: 'narrative',
        text: 'Your sensei leads the three of you out through the gate. “Stay together. That is the whole lesson.”',
      },
      {
        kind: 'check',
        text: 'Fresh boot prints lead off the towpath into the reeds.',
        approaches: [
          { label: 'Follow the trail', stat: 'perception', difficulty: 9, role: 'tracker' },
          { label: 'Guess where they’ll strike next', stat: 'intellect', difficulty: 10 },
        ],
        success: 'You find their camp before they find you.',
        failure: 'The trail goes cold. The bandits find you first.',
        onFailure: 'penalty',
        failureDamage: 6,
      },
      {
        kind: 'encounter',
        template: 'bandit-camp',
        job: 'eliminate',
        text: 'Three figures sit round a fire in the reeds, the biggest one grinning at some joke.',
        enemyIds: ['bandit-thug', 'bandit-chief', 'bandit-archer'],
        canFlee: false,
      },
    ],
  },
  {
    id: 'festival-haunting',
    title: 'The Festival Haunting',
    rank: 'C',
    client: 'Shrine Priest Tatsuo',
    summary: 'Ghosts are snuffing out the Festival of Returning lanterns. The shrine needs a team.',
    slots: 4,
    energyCost: 30,
    reward: { ryo: 320, reputation: 8, scrollId: 'kindled-pulse', gearId: 'hungry-lantern' },
    minMissionsCompleted: 4,
    stages: [
      {
        kind: 'narrative',
        text: 'Every third lantern on the shrine steps is dark, and the dark ones are whispering.',
      },
      {
        kind: 'check',
        text: 'The whispers reach for your team, one name at a time.',
        approaches: [
          { label: 'Hold your nerve', stat: 'willpower', difficulty: 10 },
          { label: 'See through the illusion', stat: 'genjutsu', difficulty: 10 },
          {
            label: 'Feel where the whispers come from',
            stat: 'perception',
            difficulty: 10,
            role: 'sensor',
          },
        ],
        success: 'You keep your team steady and push through to the shrine.',
        failure: 'One of your teammates wanders off after a voice. You drag them back.',
        onFailure: 'penalty',
        failureDamage: 6,
      },
      {
        kind: 'encounter',
        template: 'spirit',
        job: 'eliminate',
        text: 'Two ghosts drift over the unlit lanterns, mouths open and hungry.',
        enemyIds: ['hungry-ghost', 'hungry-ghost'],
        canFlee: false,
      },
    ],
  },
  {
    id: 'cold-kiln',
    title: 'The Cold Kilns',
    rank: 'C',
    client: 'The Tōrokage’s Office',
    summary:
      'Someone has lit the abandoned kilns above the falls. The Old Lamp wants a team to find out who.',
    slots: 4,
    energyCost: 30,
    reward: {
      ryo: 360,
      reputation: 9,
      scrollId: 'old-lamp-dawn',
      gearId: 'inkwell-blade',
      contractId: 'kiln-salamanders',
    },
    minMissionsCompleted: 6,
    stages: [
      {
        kind: 'narrative',
        text: 'The kilns have been cold since before you were born. Tonight smoke is rising from every chimney.',
      },
      {
        kind: 'check',
        text: 'Ash lies thick on the kiln road, and something has been dragged through it.',
        approaches: [
          { label: 'Read the marks in the ash', stat: 'perception', difficulty: 11 },
          { label: 'Work out what they are firing', stat: 'intellect', difficulty: 11 },
        ],
        success: 'You find the back way in, past a sleeping lookout.',
        failure: 'A bell rings in the dark. They know you are coming.',
        onFailure: 'penalty',
        failureDamage: 8,
      },
      {
        kind: 'encounter',
        ground: 'room',
        template: 'guarded-building',
        job: 'eliminate',
        text: 'Firelight spills from the biggest kiln. A deserter with a black blade holds court inside, his crew on watch.',
        enemyIds: ['bandit-chief', 'academy-dropout', 'bandit-archer', 'bandit-thug'],
        canFlee: false,
      },
    ],
  },
];
