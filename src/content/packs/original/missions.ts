import type { MissionDef } from '@/systems/missions';

import { HAUNTED_MISSIONS } from './hauntedMissions';
import { RESCUE_MISSIONS } from './rescueMissions';

export const MISSIONS: readonly MissionDef[] = [
  {
    id: 'lantern-patrol',
    title: 'Lantern Patrol',
    rank: 'D',
    client: 'Tōrōgakure Watch',
    summary:
      'Walk the wall at dusk and make sure every lantern is lit. The village never stops needing this.',
    slots: 2,
    energyCost: 15,
    reward: { ryo: 55, reputation: 1 },
    minMissionsCompleted: 0,
    standing: true,
    stages: [
      {
        kind: 'narrative',
        text: 'The watch captain hands you a taper and a list of a hundred lanterns.',
      },
      {
        kind: 'check',
        text: 'Halfway round, a stretch of wall has gone dark, and something is moving in it.',
        approaches: [
          {
            label: 'Relight them one by one, eyes open',
            stat: 'perception',
            difficulty: 7,
            success:
              'You take the stretch lamp by lamp, watching the dark between them, and catch a shape slipping off the wall before the last wick takes.',
            failure:
              'You are bent over the fourth lantern when something cold brushes the back of your neck. The taper gutters, and you finish the round shaken.',
          },
          {
            label: 'Run the whole stretch before it notices',
            stat: 'speed',
            difficulty: 7,
            success:
              'You sprint the dark stretch with the taper cupped in your hand, lighting as you pass, and are out the far end before anything stirs.',
            failure:
              'You run, and something keeps pace with you on the far side of the parapet the whole way. You finish the round shaken and out of breath.',
          },
        ],
        success: 'The last lantern catches. Whatever it was slips back into the night.',
        failure: 'Something cold brushes past you in the dark. You finish the round shaken.',
        onFailure: 'penalty',
        failureDamage: 2,
      },
    ],
  },
  {
    id: 'lantern-keepers-cat',
    title: 'The Lantern-Keeper’s Cat',
    rank: 'D',
    client: 'Old Mother Hisae',
    summary: 'Hisae’s cat, Mochi, has bolted into the Lantern District again.',
    slots: 2,
    energyCost: 15,
    reward: { ryo: 90, reputation: 3 },
    minMissionsCompleted: 0,
    stages: [
      {
        kind: 'narrative',
        text: 'Hisae presses a fish-shaped treat into your hand. "She likes high places. And biting."',
      },
      {
        kind: 'check',
        text: 'You spot a grey tail vanishing over a rooftop.',
        approaches: [
          { label: 'Chase her down', stat: 'speed', difficulty: 7 },
          { label: 'Predict where she’ll go', stat: 'perception', difficulty: 8 },
        ],
        success: 'You scoop Mochi up mid-leap. She bites you, but only a little.',
        failure: 'Mochi leads you on a two-hour chase before you finally corner her.',
        onFailure: 'penalty',
        failureDamage: 3,
      },
    ],
  },
  {
    id: 'shrine-weeding',
    title: 'Weeding the Spirit Shrine',
    rank: 'D',
    client: 'Shrine Priest Tatsuo',
    summary: 'The overgrown shrine garden must be cleared before the Festival of Returning.',
    slots: 3,
    energyCost: 25,
    reward: { ryo: 110, reputation: 3, recipeId: 'shrine-rice' },
    minMissionsCompleted: 0,
    stages: [
      {
        kind: 'check',
        text: 'The weeds are waist-high, and something in the stones keeps whispering your name.',
        approaches: [
          { label: 'Work through the backache', stat: 'stamina', difficulty: 7 },
          { label: 'Ignore the whispers', stat: 'willpower', difficulty: 8 },
        ],
        success: 'By dusk the garden is immaculate. The whispering stops, as if satisfied.',
        failure: 'You finish, but the priest has to redo a corner you abandoned in a cold sweat.',
        onFailure: 'penalty',
      },
    ],
  },
  {
    id: 'kuroda-medicine',
    title: 'Medicine for Kuroda Farm',
    rank: 'D',
    client: 'Village Clinic',
    summary: 'Carry fever medicine to an outlying farm before nightfall.',
    slots: 3,
    energyCost: 25,
    reward: { ryo: 150, reputation: 4, recipeId: 'kuroda-farm-stew' },
    minMissionsCompleted: 1,
    stages: [
      {
        kind: 'check',
        text: 'The farm is a long way out along muddy paddy dikes.',
        approaches: [
          { label: 'Run the whole way', stat: 'stamina', difficulty: 8 },
          { label: 'Take the rooftop-and-treetop route', stat: 'speed', difficulty: 9 },
        ],
        success: 'You make excellent time.',
        failure: 'You arrive late and mud-soaked. The farmer is not impressed.',
        onFailure: 'penalty',
      },
      {
        kind: 'encounter',
        template: 'beast',
        job: 'deliver',
        text: 'A feral tanuki has been raiding the storehouse — and it does not want to share.',
        enemyIds: ['feral-tanuki'],
        canFlee: true,
      },
      {
        kind: 'narrative',
        text: 'The farmer’s daughter is already sitting up by the time you leave.',
      },
    ],
  },
  {
    id: 'tea-merchant-escort',
    title: 'Escort the Tea Merchant',
    rank: 'D',
    client: 'Merchant Ōkubo',
    summary: 'Escort a nervous tea merchant to the river crossing.',
    slots: 4,
    energyCost: 30,
    reward: { ryo: 220, reputation: 6, recipeId: 'hunters-skewers' },
    minMissionsCompleted: 2,
    stages: [
      { kind: 'narrative', text: 'Ōkubo talks about tea prices for the entire first hour.' },
      {
        kind: 'check',
        text: 'The road narrows between two rocky banks. Something feels wrong.',
        approaches: [
          { label: 'Scan the ridgeline', stat: 'perception', difficulty: 9 },
          { label: 'Recall where ambushes happen', stat: 'intellect', difficulty: 10 },
        ],
        success: 'You spot the bandit before he springs his ambush.',
        failure: 'A rock catches you on the shoulder as the bandit leaps down.',
        onFailure: 'penalty',
        failureDamage: 10,
      },
      {
        kind: 'encounter',
        ground: 'forest',
        template: 'bandit-camp',
        job: 'escort',
        text: 'Where the road narrows, a bowstring creaks somewhere in the trees. They are waiting for the cart.',
        enemyIds: ['bandit-thug', 'bandit-archer'],
        canFlee: false,
        flavour: {
          terrain:
            'Two rocky banks, a narrow road between them, and a treeline where a bow could hide.',
          slipped:
            'You lead Ōkubo off the road and round the banks by a goat track. Nobody follows.',
        },
      },
    ],
  },
  {
    id: 'academy-dropout',
    title: 'The Academy Dropout',
    rank: 'D',
    client: 'Academy Instructor Rin',
    summary: 'A washed-out student has been stealing practice scrolls. Bring him in.',
    slots: 3,
    energyCost: 25,
    reward: { ryo: 200, reputation: 5, scrollId: 'great-seal-of-ash' },
    minMissionsCompleted: 2,
    stages: [
      {
        kind: 'check',
        text: 'Rin hands you a list of the stolen scrolls. Where would he go to practise them?',
        approaches: [
          { label: 'Follow the scorch marks', stat: 'perception', difficulty: 9 },
          { label: 'Think like a dropout', stat: 'intellect', difficulty: 9 },
        ],
        success: 'You find him behind the old kiln, mid-seal.',
        failure: 'By the time you find him, he has heard you coming.',
        onFailure: 'penalty',
      },
      {
        kind: 'encounter',
        template: 'lone-rogue',
        job: 'eliminate',
        text: 'A thin figure with a scratched-out headband is practising seals, alone, scrolls spread around him.',
        enemyIds: ['academy-dropout'],
        canFlee: true,
        flavour: {
          parley: '“Fine. Fine! Take me back to Rin, then.” He drops the scrolls at your feet.',
        },
      },
    ],
  },
  ...HAUNTED_MISSIONS,
  ...RESCUE_MISSIONS,
];
