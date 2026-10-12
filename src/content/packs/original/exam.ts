import type { ExamDef } from '@/systems/exams';
import type { MissionDef } from '@/systems/missions';

import type { EnemyDef, PromotedRank, PromotionText } from '../../types';

/**
 * Tōrōgakure's chūnin exam: the Lantern Trials, held at the turn of autumn and of spring. A
 * written paper in the Archive, three days' survival in the Ash Wood against teams from the
 * other villages of the Land of Embers, and bouts in the Lantern Ring before the Tōrokage.
 */

const ASH_WOOD = 'exam-ash-wood';

export const EXAMS: readonly ExamDef[] = [
  {
    id: 'lantern-trials',
    name: 'The Lantern Trials',
    rank: 'chunin',
    dates: [
      { season: 2, day: 7 },
      { season: 0, day: 7 },
    ],
    rumour:
      'Genin from every village in the Land of Embers are taking rooms by the river. The Lantern Trials are close.',
    announcement:
      '{them} leaves three forms on the training-ground post, one weighted with a stone for each of you. "The Trials are coming. Think hard before you sign."',
    intro:
      'The Archive’s great hall is full of strangers in other villages’ headbands. Nobody speaks. A proctor with ink-black sleeves walks the rows, counting.',
    stages: [
      {
        kind: 'mind',
        name: 'The written paper',
        intro:
          'Four questions, one hour, and a proctor at every window. "Five eyes on each of you," the head proctor says. "Be caught twice and your whole team goes home."',
        questions: [
          {
            text: 'A spirit lantern burns blue in a dry wind. Which way did it come?',
            difficulty: 5,
          },
          { text: 'Plot the arc of a kunai thrown from a moving barge.', difficulty: 7 },
          { text: 'Decode the cipher on the back of the page.', difficulty: 9 },
          { text: 'Name the seal that binds a wraith to running water.', difficulty: 11 },
        ],
        passMark: 2,
        vigilance: 10,
        caught: 'A brush taps your desk. "That is one." The proctor writes something down.',
        passed: 'Pens down. The proctor gathers the papers without a word, then nods at your row.',
        failed: 'Pens down. Your paper is thinner than it should be. Your name is not read out.',
        disqualified: '"Two." The proctor points at the door. Your team stands up with you.',
        final: {
          text: 'The head proctor lifts a sealed envelope. "The last question is inside. Take it and fail, and you stay genin for life. Leave now, and you may try again next season."',
          stay: 'Stay in your seat',
          leave: 'Walk out',
          stayed:
            'Nobody else moves. The head proctor tears the envelope in half. "That was the question. You pass."',
          left: 'You stand. Your team follows you out without a word.',
        },
      },
      {
        kind: 'survival',
        name: 'The Ash Wood',
        intro:
          'At dawn every team is given one lacquered token and shown the gate to the Ash Wood. "Bring a second token to the shrine at its heart. How you come by it is your affair."',
        missionId: ASH_WOOD,
        passed: 'You lay two tokens on the shrine steps. A proctor ticks your team off a list.',
        failed: 'The bell rings over the wood. Your team walks out with one token, or none.',
      },
      {
        kind: 'tournament',
        name: 'The Lantern Ring',
        intro:
          'Too many teams came out of the wood. The rest is settled one against one, in a ring of lanterns, with the Tōrokage watching from the balcony.',
        rivals: [11, 12.5, 14],
        rivalBase: 8,
        bout: '{them} steps into the ring and bows, and the lanterns flare.',
        won: 'The proctor’s hand comes down between you. The bout is yours.',
        lost: 'The lanterns gutter. The proctor calls it before you can get up.',
        yielded: 'You raise your hand. The proctor steps in at once.',
        champion: 'The whole balcony is on its feet. You won the Ring.',
      },
    ],
    verdict: {
      promoted: 'Your name is read out with the few who will be chūnin. The Tōrokage is smiling.',
      passedOver:
        'The names are read out. Yours is not one of them. Your sensei says only, "Next season."',
    },
  },
];

/** Genin from the other villages of the Land of Embers, met in the Ash Wood. */
export const EXAM_ENEMIES: readonly EnemyDef[] = [
  {
    id: 'rival-genin-blade',
    kind: 'Genin',
    name: 'Ashfield Blade',
    description: 'A quick genin from a farming village, with a short sword and a long grudge.',
    baseStat: 7,
    statBonuses: { kenjutsu: 4, speed: 2 },
    maxChakra: 40,
    techniqueIds: ['lantern-cut', 'moonfall-slash'],
    traits: ['swift'],
  },
  {
    id: 'rival-genin-thrower',
    kind: 'Genin',
    name: 'Ashfield Thrower',
    description: 'Keeps to the branches and throws everything she carries.',
    baseStat: 7,
    statBonuses: { perception: 3, speed: 1 },
    maxChakra: 40,
    techniqueIds: ['pebble-volley'],
    traits: ['archer'],
  },
  {
    id: 'rival-genin-weaver',
    kind: 'Genin',
    name: 'Ashfield Weaver',
    description: 'Hangs back and fills the clearing with moths that aren’t there.',
    baseStat: 7,
    statBonuses: { genjutsu: 4, chakraControl: 1 },
    maxChakra: 50,
    techniqueIds: ['moth-dance', 'shadow-feint'],
    traits: ['illusionist'],
  },
  {
    id: 'ash-wood-boar',
    kind: 'Beast',
    name: 'Ash Wood Boar',
    description: 'Old, scarred and bigger than a cart. It has eaten exam tokens before.',
    baseStat: 6,
    statBonuses: { strength: 4, stamina: 3 },
    healthScale: 1.4,
    maxChakra: 0,
    techniqueIds: [],
    traits: ['brawler'],
  },
];

/** The Ash Wood, played as a team mission that only the exam ever posts. */
export const EXAM_MISSIONS: readonly MissionDef[] = [
  {
    id: ASH_WOOD,
    title: 'The Ash Wood',
    rank: 'C',
    client: 'The exam proctors',
    summary: 'Three days in the Ash Wood: bring a second token to the shrine at its heart.',
    slots: 6,
    energyCost: 30,
    reward: { ryo: 0, reputation: 0 },
    minMissionsCompleted: 0,
    withTeam: true,
    examOnly: true,
    stages: [
      {
        kind: 'narrative',
        text: 'The gate shuts behind you. Grey trunks, ash underfoot, and somewhere ahead a scream that stops too soon.',
      },
      {
        kind: 'encounter',
        template: 'rival-team',
        job: 'retrieve',
        text: 'Three genin from Ashfield are filling their flasks at a stream. One of them wears a token on a cord.',
        enemyIds: ['rival-genin-blade', 'rival-genin-thrower', 'rival-genin-weaver'],
        canFlee: true,
      },
      {
        kind: 'check',
        text: 'The paths through the wood loop back on themselves. Someone has moved the markers.',
        approaches: [
          { label: 'Read the moss and the light', stat: 'perception', difficulty: 9 },
          { label: 'Work out the pattern', stat: 'intellect', difficulty: 10 },
        ],
        success: 'You find the true path before nightfall.',
        failure: 'You walk in circles until dark and lose a day.',
        onFailure: 'penalty',
        failureDamage: 4,
      },
      {
        kind: 'encounter',
        template: 'beast',
        job: 'deliver',
        text: 'The shrine is in sight. Between you and it, a boar the size of a cart roots in the ash.',
        enemyIds: ['ash-wood-boar'],
        canFlee: true,
      },
    ],
  },
];

/** The ceremonies, before the Tōrokage. */
export const PROMOTIONS: Readonly<Record<PromotedRank, PromotionText>> = {
  chunin: {
    title: 'Before the {leader}',
    speech:
      'The {leader} comes down from the balcony to you. "{you}. You kept your head, and your team. Tōrōgakure needs shinobi who can be trusted with other people’s lives. Kneel, and stand up a chūnin."',
    gift: 'An attendant hands you a folded flak vest, still smelling of lamp oil and new canvas.',
  },
  jonin: {
    title: 'In the {leader}’s study',
    speech:
      'Late, by one lantern, the {leader} pushes a single sheet across the desk. "Your record speaks for you, {you}. From tomorrow you are a jōnin of this village. Sign it."',
    gift: 'Under the sheet lies a lacquered tag with your name in the village’s hand.',
  },
};
