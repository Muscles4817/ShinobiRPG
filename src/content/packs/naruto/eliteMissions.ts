import type { MissionDef } from '@/systems/missions';

/**
 * Hard jobs for a seasoned record: the Land of Waves, Sound spies, a Mist swordsman and the
 * Scroll of Seals. Each hands over a rare scroll (the pack's forbidden and S-rank arts) and
 * two of them a named weapon.
 */
export const ELITE_MISSIONS: readonly MissionDef[] = [
  {
    id: 'demon-brothers',
    title: 'A Puddle on a Dry Road',
    rank: 'C',
    client: 'Tazuna, bridge builder',
    summary: 'Escort an old bridge builder home to the Land of Waves. He is hiding something.',
    slots: 4,
    energyCost: 30,
    reward: { ryo: 380, reputation: 9, scrollId: 'multiple-shadow-clone' },
    minMissionsCompleted: 5,
    stages: [
      {
        kind: 'narrative',
        text: 'Tazuna drinks from a flask and complains about the heat. It hasn’t rained in a week.',
      },
      {
        kind: 'check',
        text: 'There is a puddle in the middle of the road, and nothing else is wet.',
        approaches: [
          { label: 'Notice what doesn’t fit', stat: 'perception', difficulty: 11 },
          { label: 'Walk past, kunai ready', stat: 'speed', difficulty: 12 },
        ],
        success: 'You are already moving when the chain bursts out of the water.',
        failure: 'A chain wraps round your sensei and pulls tight before anyone can move.',
        onFailure: 'penalty',
        failureDamage: 8,
      },
      {
        kind: 'combat',
        text: 'Two masked chūnin of the Mist, joined by one long chain. “One down. Who’s next?”',
        enemyIds: ['gozu', 'meizu'],
        canFlee: false,
      },
      {
        kind: 'narrative',
        text: 'Tazuna confesses: a shipping tycoon wants him dead. He presses an old scroll on you for staying.',
      },
    ],
  },
  {
    id: 'bridge-builder',
    title: 'The Bridge in the Mist',
    rank: 'B',
    client: 'Tazuna, bridge builder',
    summary: 'The tycoon has hired a real killer. Guard the bridge until it is finished.',
    slots: 5,
    energyCost: 35,
    reward: {
      ryo: 520,
      reputation: 12,
      scrollId: 'water-dragon-bullet',
      gearId: 'kubikiribocho',
    },
    minMissionsCompleted: 7,
    stages: [
      {
        kind: 'narrative',
        text: 'The mist rolls in off the water. Somewhere inside it, a man laughs softly about vital points.',
      },
      {
        kind: 'check',
        text: 'You can’t see the end of your own arm. Where will the first cut come from?',
        approaches: [
          { label: 'Feel for killing intent', stat: 'willpower', difficulty: 13 },
          { label: 'Sense the chakra in the mist', stat: 'chakraControl', difficulty: 13 },
        ],
        success: 'You turn just in time to meet the cleaver with steel.',
        failure: 'The cleaver comes out of nowhere. You barely keep your head.',
        onFailure: 'penalty',
        failureDamage: 10,
      },
      {
        kind: 'combat',
        text: 'A masked boy steps out beside the swordsman, needles between his fingers.',
        enemyIds: ['zabuza', 'haku'],
        canFlee: false,
      },
      {
        kind: 'narrative',
        text: 'The bridge is finished. The swordsman’s cleaver is left planted at the far end, and the village gives it to you.',
      },
    ],
  },
  {
    id: 'sound-spies',
    title: 'Footsteps from the Sound',
    rank: 'B',
    client: 'Hokage’s Office',
    summary: 'Two genin from a new village have been mapping our patrol routes. Stop them.',
    slots: 4,
    energyCost: 35,
    reward: { ryo: 480, reputation: 11, scrollId: 'toad-confrontation-chant' },
    minMissionsCompleted: 9,
    stages: [
      {
        kind: 'check',
        text: 'Their camp is in the hills to the north, behind a ring of bells on threads.',
        approaches: [
          { label: 'Slip between the threads', stat: 'speed', difficulty: 13 },
          { label: 'Work out the pattern', stat: 'intellect', difficulty: 13 },
        ],
        success: 'You are standing in their camp before a single bell rings.',
        failure: 'A bell rings. Then another. They are waiting for you.',
        onFailure: 'penalty',
        failureDamage: 8,
      },
      {
        kind: 'encounter',
        template: 'lone-rogue',
        job: 'eliminate',
        text: 'Two foreign genin crouch over a half-drawn map of the patrol routes, a bandaged boy and a girl with bells in her hair.',
        enemyIds: ['dosu', 'kin'],
        canFlee: true,
      },
      {
        kind: 'narrative',
        text: 'In their packs: maps of the village, and a scroll they stole from a mountain of toads.',
      },
    ],
  },
  {
    id: 'lightning-swordsman',
    title: 'The Funeral Swordsman',
    rank: 'B',
    client: 'A valley headman',
    summary: 'A swordsman has made a valley his kingdom, and holds funerals for the living.',
    slots: 5,
    energyCost: 40,
    reward: {
      ryo: 600,
      reputation: 14,
      scrollId: 'great-fire-annihilation',
      gearId: 'kiba-blades',
    },
    minMissionsCompleted: 11,
    stages: [
      {
        kind: 'narrative',
        text: 'The villagers wear mourning for people who are still alive. Tomorrow is their turn.',
      },
      {
        kind: 'check',
        text: 'His thugs guard every road into the valley.',
        approaches: [
          { label: 'Go over the cliffs', stat: 'stamina', difficulty: 13 },
          { label: 'Walk in with the mourners', stat: 'genjutsu', difficulty: 14 },
        ],
        success: 'You reach the funeral ground while he is still reading the eulogy.',
        failure: 'The thugs see you. So does he, and lightning runs along both his blades.',
        onFailure: 'penalty',
        failureDamage: 10,
      },
      {
        kind: 'encounter',
        template: 'bandit-camp',
        job: 'eliminate',
        text: 'Funeral lanterns line the valley road. A swordsman weeps beside an empty grave while his thug digs another.',
        enemyIds: ['raiga', 'bandit-thug'],
        canFlee: false,
      },
      {
        kind: 'narrative',
        text: 'The valley’s headman gives you the swords, and the burnt scroll his grandfather hid from the swordsman.',
      },
    ],
  },
  {
    id: 'scroll-of-seals',
    title: 'The Scroll of Seals',
    rank: 'B',
    client: 'Hokage’s Office',
    summary: 'A chūnin has taken the Scroll of Seals and run. Bring it back before he reads it.',
    slots: 4,
    energyCost: 40,
    reward: { ryo: 650, reputation: 15, scrollId: 'reaper-death-seal' },
    minMissionsCompleted: 13,
    stages: [
      {
        kind: 'check',
        text: 'He has a night’s head start and knows every patrol route.',
        approaches: [
          { label: 'Track him through the forest', stat: 'perception', difficulty: 14 },
          { label: 'Guess where a traitor would rest', stat: 'intellect', difficulty: 14 },
        ],
        success: 'You find him in a clearing, the great scroll unrolled across his knees.',
        failure: 'His tags go off as you step into the clearing.',
        onFailure: 'penalty',
        failureDamage: 12,
      },
      {
        kind: 'encounter',
        ground: 'forest',
        template: 'lone-rogue',
        job: 'retrieve',
        text: 'A lamp burns in a woodcutter’s hut. Inside, a chūnin bends over a great scroll, mouthing the seals.',
        enemyIds: ['traitor-chunin'],
        canFlee: false,
      },
      {
        kind: 'narrative',
        text: 'The Hokage takes the scroll back and looks at you a long time. He copies out one seal and hands it over. “Never, unless there is no other way.”',
      },
    ],
  },
];
