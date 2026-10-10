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
    reward: { ryo: 280, reputation: 7 },
    minMissionsCompleted: 2,
    withTeam: true,
    stages: [
      {
        kind: 'narrative',
        text: 'Your sensei sees the three of you off at the gate. "Stay together. That is the whole lesson."',
      },
      {
        kind: 'check',
        text: 'Fresh boot prints lead off the towpath into the reeds.',
        approaches: [
          { label: 'Follow the trail', stat: 'perception', difficulty: 9 },
          { label: 'Guess where they’ll strike next', stat: 'intellect', difficulty: 10 },
        ],
        success: 'You find their camp before they find you.',
        failure: 'The trail goes cold. The bandits find you first.',
        onFailure: 'penalty',
        failureDamage: 6,
      },
      {
        kind: 'combat',
        text: 'Three figures step out of the reeds, the biggest one grinning.',
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
    reward: { ryo: 320, reputation: 8 },
    minMissionsCompleted: 4,
    withTeam: true,
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
        ],
        success: 'You keep your team steady and push through to the shrine.',
        failure: 'One of your teammates wanders off after a voice. You drag them back.',
        onFailure: 'penalty',
        failureDamage: 6,
      },
      {
        kind: 'combat',
        text: 'Two ghosts rise from the unlit lanterns, mouths open and hungry.',
        enemyIds: ['hungry-ghost', 'hungry-ghost'],
        canFlee: false,
      },
    ],
  },
];
