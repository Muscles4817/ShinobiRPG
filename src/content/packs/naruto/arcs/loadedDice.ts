import type { ArcDef, MissionDef } from '@/systems/missions';

import type { EnemyDef } from '../../../types';
import { SHION_DEBT } from '../people/stories/marks';

/**
 * The Loaded Dice: Shion's story. The boss who caught her informant is back at the tables in Tanzaku; once Shion trusts you enough to say so, the jobs go up. Find out what became of Kenta, then go back with Shion to settle up.
 */

const CLIENT = 'Shion Ukiha';
export const LOADED_DICE_FOUND = 'shion-dice-found';
export const LOADED_DICE_SETTLED = 'shion-dice-settled';

export const LOADED_DICE_FOE: EnemyDef = {
  id: 'gonzo',
  kind: 'Gambler',
  danger: 'deadly',
  name: 'Gonzō the House',
  description: 'Runs Tanzaku’s back tables, and the illusions that keep them winning.',
  baseStat: 11,
  statBonuses: { genjutsu: 4, intellect: 2, perception: 1 },
  maxChakra: 70,
  techniqueIds: ['sapping-illusion', 'sly-mind-affect', 'bell-sound-clone', 'binding-illusion'],
  traits: ['illusionist', 'coward'],
};

export const LOADED_DICE_ACT_ONE: MissionDef = {
  id: 'arc-shion-dice-one',
  title: 'The House Always Wins',
  rank: 'C',
  client: CLIENT,
  summary: 'Shion wants to find out what became of the informant she lost.',
  slots: 1,
  energyCost: 25,
  reward: { ryo: 520, reputation: 5 },
  minMissionsCompleted: 4,
  needsWorldMark: SHION_DEBT,
  stages: [
    {
      kind: 'narrative',
      text: 'Shion lets her hair down and becomes, somewhere on the road, someone else entirely.',
    },
    {
      kind: 'leg',
      text: 'Two days on the hill road to Tanzaku Town. Shion teaches you three card games and cheats at all of them.',
      days: 2,
      region: 'hill-road',
    },
    {
      kind: 'check',
      text: 'At Gonzō’s back tables, the dice come up the same too often.',
      approaches: [
        {
          label: 'Spot how the dice are loaded',
          stat: 'perception',
          difficulty: 9,
          role: 'sensor',
          onSuccess: {
            effects: [{ kind: 'world', mark: LOADED_DICE_FOUND }],
            ledger: 'Spotted the illusion on the dice.',
          },
        },
        {
          label: 'Count the house’s wins',
          stat: 'intellect',
          difficulty: 9,
          onSuccess: {
            effects: [{ kind: 'world', mark: LOADED_DICE_FOUND }],
            ledger: 'Worked out the house’s cheat.',
          },
        },
      ],
      success:
        'The dice are honest. The players’ eyes are not: a soft illusion on the whole room. And the croupier in the corner is Kenta, in chains under his sleeves.',
      failure: 'You lose your stake, but Shion sees the croupier in the corner, and goes white.',
      onFailure: 'forward',
    },
    {
      kind: 'camp',
      text: 'You sleep at the Lucky Cat. Shion sits by the window all night, dealing cards to nobody.',
      picks: 2,
      activities: [
        { kind: 'crew', label: 'Sit with Shion', when: { crew: 'team' } },
        { kind: 'drill', label: 'Drill by the fire' },
        { kind: 'rest', label: 'Sleep properly' },
      ],
    },
    {
      kind: 'ending',
      endings: [
        {
          text: '“Kenta’s alive,” Shion says. “Working off a debt that never ends.” She shuffles once, hard. “Next time, I collect.”',
        },
      ],
    },
    { kind: 'leg', text: 'Back along the hill road to the Leaf.', days: 2 },
  ],
};

export const LOADED_DICE_ACT_TWO: MissionDef = {
  id: 'arc-shion-dice-two',
  title: 'Settling Up',
  rank: 'C',
  client: CLIENT,
  summary: 'Back to Tanzaku with Shion, to settle Kenta’s debt.',
  slots: 1,
  energyCost: 30,
  reward: { ryo: 600, reputation: 8 },
  minMissionsCompleted: 4,
  needsWorldMark: LOADED_DICE_FOUND,
  stages: [
    {
      kind: 'leg',
      text: 'The hill road again. Shion is cheerful, which is how you know she is afraid.',
      days: 2,
      region: 'hill-road',
    },
    {
      kind: 'decision',
      text: 'Gonzō spreads his hands over the table. “Play me for him,” he says. Shion glances at you. “Well?”',
      options: [
        {
          label: '“Free Kenta first. Then deal with Gonzō.”',
          tone: 'kind',
          reply: 'Shion nods. Kenta’s chains come off under the table.',
          effects: [{ kind: 'mark', mark: 'mercy' }],
          ledger: 'Freed Kenta first.',
        },
        {
          label: '“Play him, and cheat better.”',
          tone: 'joke',
          reply: 'Shion grins. “Now you’re learning.”',
          effects: [{ kind: 'mark', mark: 'mercy' }],
          ledger: 'Out-cheated the house.',
        },
        {
          label: '“No games. Take him down.”',
          tone: 'challenge',
          reply: 'Gonzō’s smile goes thin. The room changes.',
          ledger: 'Took Gonzō on head-on.',
        },
      ],
    },
    {
      kind: 'encounter',
      ground: 'room',
      template: 'guarded-building',
      job: 'eliminate',
      text: 'The room tilts. The walls are cards. Gonzō’s men come out of them.',
      enemyIds: ['gonzo', 'bandit-thug'],
      canFlee: false,
      bypassable: false,
    },
    {
      kind: 'ending',
      endings: [
        {
          when: { has: 'mercy' },
          text: 'Kenta walks out of the back room with no chains and Shion’s arm around him. She buys him a drink at the Lucky Cat and lets him win at cards.',
          effects: [
            { kind: 'world', mark: LOADED_DICE_SETTLED },
            { kind: 'memory', text: 'the night the house lost' },
          ],
          ledger: 'Settled Kenta’s debt and brought him out.',
        },
        {
          text: 'Gonzō’s tables are kindling by morning. Kenta is gone before you can find him. Shion leaves a card on the bar for him. It is a queen.',
          effects: [
            { kind: 'world', mark: LOADED_DICE_SETTLED },
            { kind: 'memory', text: 'the night in Tanzaku' },
          ],
          ledger: 'Broke the house, but Kenta was already gone.',
        },
      ],
    },
    { kind: 'leg', text: 'Back along the hill road to the Leaf.', days: 2 },
  ],
};

export const LOADED_DICE_JOBS: readonly MissionDef[] = [LOADED_DICE_ACT_ONE, LOADED_DICE_ACT_TWO];

export const LOADED_DICE_ARC: ArcDef = {
  id: 'the-loaded-dice',
  title: 'The Loaded Dice',
  summary:
    'The gambling boss who ruined Shion’s informant is running the tables in Tanzaku Town again.',
  acts: [
    {
      beats: ['you', 'need', 'go', 'search'],
      title: 'The house always wins',
      text: 'Find out what became of Shion’s informant.',
      jobs: ['arc-shion-dice-one'],
    },
    {
      beats: ['find', 'take', 'return', 'change'],
      title: 'Settling up',
      text: 'Go back with Shion and settle her informant’s debt.',
      jobs: ['arc-shion-dice-two'],
    },
  ],
};
