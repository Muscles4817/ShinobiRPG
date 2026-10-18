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
  proper: true,
  pronouns: 'he',
  description:
    'A swordsman gone grey on the pass, who still remembers Gōran’s arm and the teammate Gōran lost there.',
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
  summary: 'Gōran wants to find where Kurobane is camped, and he wants you along when he does.',
  slots: 1,
  energyCost: 25,
  reward: { ryo: 520, reputation: 5 },
  minMissionsCompleted: 4,
  needsWorldMark: GORAN_OLD_DEBT,
  stages: [
    {
      kind: 'narrative',
      text: 'Gōran is quiet at the gate, which isn’t like him. He has tied his old forehead protector round his arm, over the scar.',
    },
    {
      kind: 'leg',
      text: 'Two days of switchbacks and thin air, at a pace Gōran sets and nobody complains about.',
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
        'The tracks fade into rock, but Gōran finds the cave anyway, by the old smell of the place.',
      onFailure: 'forward',
    },
    {
      kind: 'camp',
      text: 'You camp out of sight of the cave, and Gōran sits up all night without sleeping.',
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
          text: '“Not yet,” Gōran says, still looking at the cave. “Next time we come up here, we settle it.” Then he turns for home.',
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
      text: 'Up the pass again, and this time Gōran talks about Daichi the whole way.',
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
          reply: 'Gōran lets out a long breath. “That’s just what Daichi would have said.”',
          effects: [{ kind: 'mark', mark: 'mercy' }],
          ledger: 'Told Gōran to bring Kurobane in.',
        },
        {
          label: '“It’s your debt. Your choice.”',
          tone: 'quiet',
          reply: '“Then I won’t turn into him,” Gōran says. “That much I can choose.”',
          effects: [{ kind: 'mark', mark: 'mercy' }],
          ledger: 'Left the choice to Gōran.',
        },
        {
          label: '“Finish it.”',
          tone: 'challenge',
          reply: 'Gōran’s face goes hard. “Maybe. We’ll see when I’m standing over him.”',
          ledger: 'Told Gōran to finish it.',
        },
      ],
    },
    {
      kind: 'encounter',
      template: 'bandit-camp',
      job: 'eliminate',
      text: 'Kurobane steps out of the dark with his blade already drawn. “The arm,” he says. “I wondered when you’d come back for the rest of it.”',
      enemyIds: [KUROBANE.id],
      canFlee: false,
      bypassable: false,
    },
    {
      kind: 'ending',
      endings: [
        {
          when: { has: 'mercy' },
          text: 'Gōran carries Kurobane down the pass himself, and stops for a while at the stone for the dead. “That’s it paid, Daichi,” he tells it.',
          effects: [
            { kind: 'world', mark: GORAN_DEBT_PAID },
            { kind: 'memory', text: 'the night the debt was paid' },
          ],
          ledger: 'Brought Kurobane down alive. Gōran’s debt is paid.',
        },
        {
          text: 'Kurobane doesn’t get up. Gōran stands over him until the cold gets into his hands, then cleans them in the snow and says it’s done, in a voice that doesn’t sound like peace.',
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
