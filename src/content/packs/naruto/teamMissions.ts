import type { MissionDef } from '@/systems/missions';

/** C-rank jobs for a whole team: your teammates come along and fight beside you. */
export const TEAM_MISSIONS: readonly MissionDef[] = [
  {
    id: 'border-bandits',
    title: 'Bandits at the Border Post',
    rank: 'C',
    client: 'Land of Fire Border Guard',
    summary: 'A bandit gang keeps raiding the supply carts to the northern border post.',
    slots: 4,
    energyCost: 30,
    reward: { ryo: 280, reputation: 7 },
    minMissionsCompleted: 2,
    withTeam: true,
    stages: [
      {
        kind: 'narrative',
        text: 'Your sensei walks you to the gate. "Look underneath the underneath. And stay together."',
      },
      {
        kind: 'check',
        text: 'The supply cart’s tracks veer off the road into the forest.',
        approaches: [
          { label: 'Follow the trail', stat: 'perception', difficulty: 9 },
          { label: 'Set a trap with a decoy cart', stat: 'intellect', difficulty: 10 },
        ],
        success: 'You catch them by surprise, still counting the stolen rice.',
        failure: 'A tripwire snaps. The whole gang knows you’re coming.',
        onFailure: 'penalty',
        failureDamage: 6,
      },
      {
        kind: 'combat',
        text: 'The bandit chief draws a chipped sword. "Kids? They sent kids?"',
        enemyIds: ['bandit-thug', 'bandit-chief', 'bandit-thug'],
        canFlee: false,
      },
    ],
  },
  {
    id: 'missing-nin-forest',
    title: 'A Missing-nin in the Forest',
    rank: 'C',
    client: 'Hokage’s Office',
    summary: 'A missing-nin from the Hidden Mist was sighted near the village. Track and capture.',
    slots: 4,
    energyCost: 30,
    reward: { ryo: 340, reputation: 8 },
    minMissionsCompleted: 4,
    withTeam: true,
    stages: [
      {
        kind: 'narrative',
        text: 'Mist curls between the trees, much too thick for the season.',
      },
      {
        kind: 'check',
        text: 'Somewhere in the mist, someone is watching your team.',
        approaches: [
          { label: 'Sense their chakra', stat: 'chakraControl', difficulty: 10 },
          { label: 'Hold still and listen', stat: 'perception', difficulty: 10 },
        ],
        success: 'You spot the glint of a headband and signal your team.',
        failure: 'A water bullet bursts out of the mist and knocks you flat.',
        onFailure: 'penalty',
        failureDamage: 8,
      },
      {
        kind: 'combat',
        text: 'The missing-nin steps out of the mist with a hired bandit at their side.',
        enemyIds: ['missing-nin', 'bandit-thug'],
        canFlee: false,
      },
    ],
  },
];
