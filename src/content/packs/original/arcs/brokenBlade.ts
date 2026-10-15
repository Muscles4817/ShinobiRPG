import type { ArcDef, MissionDef } from '@/systems/missions';

import type { EnemyDef } from '../../../types';
import { GORAN_OLD_DEBT } from '../senseiStories';

/**
 * The Broken Blade: Gōran's own story. Kurobane, the Black Wing, who killed Gōran's teammate
 * on the pass years ago, is back; once Gōran trusts you enough to say so (`GORAN_OLD_DEBT`,
 * the last of his story beats), the jobs go up. Up the pass to find his camp, then the debt,
 * paid one way or another. Gōran leads (they are C-rank team work), whoever's sensei he is.
 */

const CLIENT = 'Gōran Ishizaki';
export const KUROBANE_FOUND = 'goran-kurobane-found';
export const GORAN_DEBT_PAID = 'goran-debt-paid';

export const KUROBANE: EnemyDef = {
  id: 'kurobane',
  kind: 'Rogue',
  danger: 'deadly',
  name: 'Kurobane, the Black Wing',
  description: 'A swordsman gone grey on the pass. He remembers Gōran’s arm, and his teammate.',
  baseStat: 11,
  statBonuses: { kenjutsu: 4, speed: 2, perception: 1 },
  maxChakra: 60,
  techniqueIds: ['moonfall-slash', 'bleeding-cut'],
  traits: ['swift'],
};

export const UP_THE_PASS: MissionDef = {
  id: 'arc-blade-up-the-pass',
  title: 'Up the Pass',
  rank: 'C',
  client: CLIENT,
  summary: 'Gōran wants to find where Kurobane is camped. He wants you along.',
  slots: 1,
  energyCost: 25,
  reward: { ryo: 520, reputation: 5 },
  minMissionsCompleted: 4,
  needsWorldMark: GORAN_OLD_DEBT,
  stages: [
    {
      kind: 'narrative',
      text: 'Gōran says nothing at the gate. He has his old forehead protector tied round his arm, over the scar.',
    },
    {
      kind: 'leg',
      text: 'Two days of switchbacks and thin air. Gōran sets a pace nobody complains about.',
      days: 2,
      region: 'mountain-pass',
    },
    {
      kind: 'check',
      text: 'Above the last waystation, the snow is trodden where it shouldn’t be.',
      approaches: [
        {
          label: 'Read the tracks',
          stat: 'perception',
          difficulty: 9,
          role: 'tracker',
          onSuccess: {
            effects: [{ kind: 'world', mark: KUROBANE_FOUND }],
            ledger: 'Followed the tracks to Kurobane’s camp.',
          },
        },
        {
          label: 'Think where a swordsman would camp',
          stat: 'intellect',
          difficulty: 9,
          onSuccess: {
            effects: [{ kind: 'world', mark: KUROBANE_FOUND }],
            ledger: 'Worked out where Kurobane would camp.',
          },
        },
      ],
      success: 'A cave mouth, a cold fire, and a sword-rack with one blade missing.',
      failure:
        'The tracks fade into rock. Gōran finds the cave himself, by the old smell of the place.',
      onFailure: 'forward',
    },
    {
      kind: 'camp',
      text: 'You camp out of sight of the cave. Gōran doesn’t sleep.',
      picks: 2,
      activities: [
        { kind: 'crew', label: 'Sit with Gōran', when: { crew: 'team' } },
        { kind: 'drill', label: 'Drill by the fire' },
        { kind: 'rest', label: 'Sleep properly' },
      ],
    },
    {
      kind: 'ending',
      endings: [
        {
          text: '“Not yet,” Gōran says, looking at the cave. “Next time, we come to settle it.” He turns for home without another word.',
        },
      ],
    },
    { kind: 'leg', text: 'Back down the pass to the village.', days: 2 },
  ],
};

export const BLACK_WING: MissionDef = {
  id: 'arc-blade-black-wing',
  title: 'The Black Wing',
  rank: 'C',
  client: CLIENT,
  summary: 'Back up the pass, to settle Gōran’s debt with Kurobane.',
  slots: 1,
  energyCost: 30,
  reward: { ryo: 600, reputation: 8 },
  minMissionsCompleted: 4,
  needsWorldMark: KUROBANE_FOUND,
  stages: [
    {
      kind: 'leg',
      text: 'The pass again. This time Gōran talks the whole way up, about Daichi.',
      days: 2,
      region: 'mountain-pass',
    },
    {
      kind: 'decision',
      text: 'At the cave mouth, Gōran stops. “I could kill him,” he says. “Or bring him down to answer for it. What would you do?”',
      options: [
        {
          label: '“Bring him in. Let the village judge.”',
          tone: 'earnest',
          reply: 'Gōran breathes out, long. “Daichi would have said that.”',
          effects: [{ kind: 'mark', mark: 'mercy' }],
          ledger: 'Told Gōran to bring Kurobane in.',
        },
        {
          label: '“It’s your debt. Your choice.”',
          tone: 'quiet',
          reply: '“Then I choose not to become him,” Gōran says.',
          effects: [{ kind: 'mark', mark: 'mercy' }],
          ledger: 'Left the choice to Gōran.',
        },
        {
          label: '“Finish it.”',
          tone: 'challenge',
          reply: 'Gōran’s face goes hard. “Maybe,” he says.',
          ledger: 'Told Gōran to finish it.',
        },
      ],
    },
    {
      kind: 'encounter',
      template: 'bandit-camp',
      job: 'eliminate',
      text: 'Kurobane steps out of the dark with his blade already drawn. “The arm,” he says. “I wondered when.”',
      enemyIds: [KUROBANE.id],
      canFlee: false,
      bypassable: false,
    },
    {
      kind: 'ending',
      endings: [
        {
          when: { has: 'mercy' },
          text: 'Gōran carries Kurobane down the pass himself. At the stone for the dead, he stops a long while. “Done,” he says. “Paid.”',
          effects: [
            { kind: 'world', mark: GORAN_DEBT_PAID },
            { kind: 'memory', text: 'the night the debt was paid' },
          ],
          ledger: 'Brought Kurobane down alive. Gōran’s debt is paid.',
        },
        {
          text: 'Kurobane doesn’t get up. Gōran stands over him a long time, then cleans his hands in the snow. “Done,” he says. It doesn’t sound like peace.',
          effects: [
            { kind: 'world', mark: GORAN_DEBT_PAID },
            { kind: 'memory', text: 'the night on the pass' },
          ],
          ledger: 'Kurobane fell on the pass.',
        },
      ],
    },
    { kind: 'leg', text: 'Down the pass, quieter than you came.', days: 2 },
  ],
};

export const BROKEN_BLADE_JOBS: readonly MissionDef[] = [UP_THE_PASS, BLACK_WING];

export const BROKEN_BLADE: ArcDef = {
  id: 'the-broken-blade',
  title: 'The Broken Blade',
  summary: 'Gōran’s old enemy is back on the pass, and Gōran has a debt to pay.',
  acts: [
    {
      beats: ['you', 'need', 'go', 'search'],
      title: 'Up the pass',
      text: 'Find where Kurobane, the Black Wing, is camped.',
      jobs: [UP_THE_PASS.id],
    },
    {
      beats: ['find', 'take', 'return', 'change'],
      title: 'The debt',
      text: 'Go back up with Gōran and settle it, one way or another.',
      jobs: [BLACK_WING.id],
    },
  ],
};
