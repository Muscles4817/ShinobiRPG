import type { ExamDef } from '@/systems/exams';
import type { MissionDef } from '@/systems/missions';

import type { EnemyDef, PromotedRank, PromotionText } from '../../types';

/**
 * Konoha's Chūnin Exams, hosted in turn by the allied villages and held here twice a year: the
 * written test, the Forest of Death with its Heaven and Earth scrolls, and the finals before the
 * Hokage.
 */

const FOREST = 'exam-forest-of-death';

export const EXAMS: readonly ExamDef[] = [
  {
    id: 'chunin-exams',
    name: 'The Chūnin Exams',
    rank: 'chunin',
    dates: [
      { season: 2, day: 7 },
      { season: 0, day: 7 },
    ],
    rumour:
      'Genin in Sand and Rain headbands have been seen at the gate. The Chūnin Exams must be close.',
    announcement:
      '{them} hands you an application form. "I’ve recommended you for the Chūnin Exams. Whether you sit them is up to the three of you."',
    intro:
      'Room 301 of the academy is packed with genin from five villages, and every one of them is staring at your team.',
    stages: [
      {
        kind: 'mind',
        name: 'The written test',
        intro:
          'Ibiki Morino stands at the front with his scars and his clipboard. "Ten points each. Every time a proctor catches you cheating, you lose two. Twice, and your team is out."',
        questions: [
          { text: 'Plot the arc of a shuriken thrown from a moving branch.', difficulty: 5 },
          {
            text: 'How far does a decoy kunai have to fall to sound like footsteps?',
            difficulty: 7,
          },
          { text: 'Decode the cipher at the bottom of the page.', difficulty: 9 },
          { text: 'Name the seal that keeps a summoning contract sealed.', difficulty: 11 },
        ],
        passMark: 2,
        vigilance: 10,
        caught: 'A pencil thuds into your desk. "That’s one." Somebody in the back row laughs.',
        passed: '"Pencils down." Ibiki collects the papers himself and lingers at your desk.',
        failed: '"Pencils down." Your paper is too thin. Your team’s number is not called.',
        disqualified: '"That’s two. Out." Your teammates stand up with you.',
        final: {
          text: '"The tenth question," Ibiki says. "If you take it and get it wrong, you will never sit this exam again. If you don’t want to take it, leave now with your team."',
          stay: 'Stay in your seat',
          leave: 'Raise your hand and leave',
          stayed:
            '"Then... you all pass." Ibiki takes off his headband. The scars beneath are worse.',
          left: 'Your hand goes up. Your team follows you out of the room.',
        },
      },
      {
        kind: 'survival',
        name: 'The Forest of Death',
        intro:
          'Anko Mitarashi hands your team a Heaven scroll at the gate of Training Ground 44. "Bring me an Earth scroll and this one to the tower. Try not to die."',
        missionId: FOREST,
        passed:
          'You hand both scrolls in at the tower. Iruka’s face appears in the smoke, grinning.',
        failed: 'Five days are up. Your team walks out of the forest with one scroll, or none.',
      },
      {
        kind: 'tournament',
        name: 'The finals',
        intro:
          'Too many teams reached the tower. The rest is settled one against one, in the arena, in front of the Hokage and half the Land of Fire.',
        rivals: [11, 12.5, 14],
        rivalBase: 8,
        bout: '{them} walks into the arena and doesn’t bother to bow.',
        won: 'Genma steps between you, senbon in his teeth. "Winner."',
        lost: 'The world tilts. Genma calls it before you hit the ground.',
        yielded: 'You raise your hand. Genma nods and steps in.',
        champion: 'The stands are on their feet. You won the finals.',
      },
    ],
    verdict: {
      promoted: 'Your name is read out with the few who made chūnin. The Hokage puffs his pipe.',
      passedOver: 'The names are read out. Yours isn’t one. Your sensei says only, "Next time."',
    },
  },
];

/** Genin from other villages, met in the Forest of Death. */
export const EXAM_ENEMIES: readonly EnemyDef[] = [
  {
    id: 'rain-genin-blade',
    kind: 'Genin',
    danger: 'armed',
    name: 'Rain Genin',
    description: 'Wears a rebreather and carries an umbrella with a blade in the handle.',
    baseStat: 7,
    statBonuses: { kenjutsu: 4, speed: 2 },
    maxChakra: 40,
    techniqueIds: ['iaido-draw', 'bleeding-slash'],
    traits: ['swift'],
  },
  {
    id: 'grass-genin-thrower',
    kind: 'Genin',
    danger: 'armed',
    name: 'Grass Genin',
    description: 'Throws from the treetops and is gone before the kunai land.',
    baseStat: 7,
    statBonuses: { perception: 3, speed: 1 },
    maxChakra: 40,
    techniqueIds: ['shuriken-jutsu', 'air-bullet'],
    traits: ['archer'],
  },
  {
    id: 'rain-genin-illusionist',
    kind: 'Genin',
    danger: 'armed',
    name: 'Rain Illusionist',
    description: 'Makes the forest look emptier than it is.',
    baseStat: 7,
    statBonuses: { genjutsu: 4, chakraControl: 1 },
    maxChakra: 50,
    techniqueIds: ['false-surroundings', 'hell-viewing'],
    traits: ['illusionist'],
  },
  {
    id: 'forest-tiger',
    kind: 'Beast',
    danger: 'armed',
    name: 'Forest Tiger',
    description: 'Training Ground 44 grows its animals big. This one has eaten genin before.',
    baseStat: 6,
    statBonuses: { strength: 4, stamina: 3 },
    healthScale: 1.4,
    maxChakra: 0,
    techniqueIds: [],
    traits: ['brawler'],
  },
];

/** The Forest of Death, played as a team mission that only the exam ever posts. */
export const EXAM_MISSIONS: readonly MissionDef[] = [
  {
    id: FOREST,
    title: 'The Forest of Death',
    rank: 'C',
    client: 'The exam proctors',
    summary: 'Five days in Training Ground 44: bring a Heaven and an Earth scroll to the tower.',
    slots: 6,
    energyCost: 30,
    reward: { ryo: 0, reputation: 0 },
    minMissionsCompleted: 0,
    examOnly: true,
    stages: [
      {
        kind: 'narrative',
        text: 'The gate slams behind you. Trees as wide as houses, and somewhere ahead a scream.',
      },
      {
        kind: 'encounter',
        template: 'rival-team',
        job: 'retrieve',
        text: 'Three Rain genin are resting in a hollow tree. One of them has an Earth scroll in his pouch.',
        enemyIds: ['rain-genin-blade', 'grass-genin-thrower', 'rain-genin-illusionist'],
        canFlee: true,
      },
      {
        kind: 'check',
        text: 'Every path to the tower seems to lead back to the same broken branch.',
        approaches: [
          { label: 'Spot the genjutsu', stat: 'perception', difficulty: 9 },
          { label: 'Work out the loop', stat: 'intellect', difficulty: 10 },
        ],
        success: 'You see through it and find the true path before nightfall.',
        failure: 'You walk in circles until dark and lose a day.',
        onFailure: 'penalty',
        failureDamage: 4,
      },
      {
        kind: 'encounter',
        template: 'beast',
        job: 'deliver',
        text: 'The tower is in sight. A tiger the size of a horse lies across the path.',
        enemyIds: ['forest-tiger'],
        canFlee: true,
      },
    ],
  },
];

/** The ceremonies, before the Hokage. */
export const PROMOTIONS: Readonly<Record<PromotedRank, PromotionText>> = {
  chunin: {
    title: 'Before the {leader}',
    speech:
      'The {leader} sets down his pipe. "{you}. A chūnin is a captain: someone others can follow. You showed me that in the exams. Congratulations."',
    gift: 'Shikaku tosses you a green flak vest. "Troublesome to keep clean. Wear it anyway."',
  },
  jonin: {
    title: 'In the {leader}’s office',
    speech:
      'The {leader} looks up from a pile of reports, most of them yours. "Your record speaks for itself, {you}. From today you are a jōnin of the Leaf."',
    gift: 'He slides a jōnin’s papers across the desk, already stamped.',
  },
};
