import type { ArcDef, MissionDef } from '@/systems/missions';

import type { EnemyDef } from '../../../types';
import { ANKO_DEN } from '../people/stories/marks';

/**
 * The White Snake's Den: Anko's story. One of Orochimaru's old hideouts lies in the woods past Otafuku; once Anko trusts you enough to say so, the jobs go up. Find the way in, then go back with Anko and burn out what he left behind.
 */

const CLIENT = 'Anko Mitarashi';
export const SNAKE_DEN_FOUND = 'anko-den-found';
export const SNAKE_DEN_SETTLED = 'anko-den-settled';

export const SNAKE_DEN_FOE: EnemyDef = {
  id: 'den-keeper',
  kind: 'Experiment',
  danger: 'deadly',
  name: 'The Den-Keeper',
  proper: true,
  pronouns: 'it',
  description: 'Something Orochimaru left behind to guard his work, and forgot to come back for.',
  baseStat: 11,
  statBonuses: { ninjutsu: 3, stamina: 3, speed: 1 },
  maxChakra: 80,
  techniqueIds: ['hidden-shadow-snake-hands', 'snake-clone', 'binding-snake-glare'],
  traits: ['swift'],
  healthScale: 1.2,
};

export const SNAKE_DEN_ACT_ONE: MissionDef = {
  id: 'arc-anko-den-one',
  title: 'The Den',
  rank: 'C',
  client: CLIENT,
  summary: 'Anko wants to find the way into one of her old teacher’s hideouts.',
  slots: 1,
  energyCost: 25,
  reward: { ryo: 520, reputation: 5 },
  minMissionsCompleted: 4,
  needsWorldMark: ANKO_DEN,
  stages: [
    {
      kind: 'narrative',
      text: 'Anko eats a whole stick of dango in one bite at the gate, and doesn’t joke once after.',
    },
    {
      kind: 'leg',
      text: 'Two days on the forest track past Otafuku. Anko’s hand keeps going to the mark on her neck.',
      days: 2,
      region: 'forest-track',
    },
    {
      kind: 'check',
      text: 'In a ravine thick with ferns, the air smells of something old and chemical.',
      approaches: [
        {
          label: 'Feel for the hidden door',
          stat: 'perception',
          difficulty: 9,
          role: 'sensor',
          onSuccess: {
            effects: [{ kind: 'world', mark: SNAKE_DEN_FOUND }],
            ledger: 'Found the hideout’s hidden door.',
          },
        },
        {
          label: 'Read the old patrol paths',
          stat: 'intellect',
          difficulty: 9,
          onSuccess: {
            effects: [{ kind: 'world', mark: SNAKE_DEN_FOUND }],
            ledger: 'Worked out the hideout’s way in.',
          },
        },
      ],
      success: 'Behind the ferns, a stone door marked with a snake eating its tail.',
      failure:
        'You find nothing, but Anko walks straight to the door, as if it were calling her name.',
      onFailure: 'forward',
    },
    {
      kind: 'camp',
      text: 'You camp far from the ravine. Anko sits up all night with her back to the fire, watching the dark.',
      picks: 2,
      activities: [
        { kind: 'crew', label: 'Sit with Anko', when: { crew: 'team' } },
        { kind: 'drill', label: 'Drill by the fire' },
        { kind: 'rest', label: 'Sleep properly' },
      ],
    },
    {
      kind: 'ending',
      endings: [
        {
          text: '“That’s his,” Anko says. “Something’s still alive in there.” She spits. “Next time I bring fire.”',
        },
      ],
    },
    { kind: 'leg', text: 'Back along the forest track to the Leaf.', days: 2 },
  ],
};

export const SNAKE_DEN_ACT_TWO: MissionDef = {
  id: 'arc-anko-den-two',
  title: 'Burn It Out',
  rank: 'C',
  client: CLIENT,
  summary: 'Back to the den with Anko, to burn out what Orochimaru left.',
  slots: 1,
  energyCost: 30,
  reward: { ryo: 600, reputation: 8 },
  minMissionsCompleted: 4,
  needsWorldMark: SNAKE_DEN_FOUND,
  stages: [
    {
      kind: 'leg',
      text: 'The forest track again. Anko doesn’t eat. That is how you know.',
      days: 2,
      region: 'forest-track',
    },
    {
      kind: 'decision',
      text: 'Deep in the den, among the jars, something that used to be a person wakes. Anko asks you, “What do we do with it?”',
      options: [
        {
          label: '“It didn’t choose this. Free it.”',
          tone: 'kind',
          reply: 'Anko stares at you, then at it. “Yeah,” she says. “Neither did I.”',
          effects: [{ kind: 'mark', mark: 'mercy' }],
          ledger: 'Chose to free what was left in the den.',
        },
        {
          label: '“Burn the notes first. Then see.”',
          tone: 'earnest',
          reply: 'Anko sets the scrolls alight. The thing watches, almost grateful.',
          effects: [{ kind: 'mark', mark: 'mercy' }],
          ledger: 'Burned Orochimaru’s notes first.',
        },
        {
          label: '“Burn all of it.”',
          tone: 'challenge',
          reply: 'Anko nods. “All of it.”',
          ledger: 'Told Anko to burn everything.',
        },
      ],
    },
    {
      kind: 'encounter',
      ground: 'room',
      template: 'guarded-building',
      job: 'eliminate',
      text: 'The Den-Keeper comes out of the dark like a snake out of a drain, fast and wrong.',
      enemyIds: ['den-keeper'],
      canFlee: false,
      bypassable: false,
    },
    {
      kind: 'ending',
      endings: [
        {
          when: { has: 'mercy' },
          text: 'When it is over, the thing lies still and almost peaceful. Anko burns the den behind you, every jar of it, and for once she lets you hold her hand on the way out.',
          effects: [
            { kind: 'world', mark: SNAKE_DEN_SETTLED },
            { kind: 'memory', text: 'the night the den burned' },
          ],
          ledger: 'Burned the den, and freed what it held.',
        },
        {
          text: 'Fire goes through the den from end to end. Anko watches it burn and doesn’t touch her neck once. “Done,” she says.',
          effects: [
            { kind: 'world', mark: SNAKE_DEN_SETTLED },
            { kind: 'memory', text: 'the fire in the ravine' },
          ],
          ledger: 'Burned the den and everything in it.',
        },
      ],
    },
    {
      kind: 'leg',
      text: 'Back along the forest track. Anko buys dango in Otafuku, two sticks, and gives you one.',
      days: 2,
    },
  ],
};

export const SNAKE_DEN_JOBS: readonly MissionDef[] = [SNAKE_DEN_ACT_ONE, SNAKE_DEN_ACT_TWO];

export const SNAKE_DEN_ARC: ArcDef = {
  id: 'the-white-snakes-den',
  title: 'The White Snake’s Den',
  summary:
    'Anko has found one of her old teacher’s hideouts in the woods past Otafuku, and means to burn it out.',
  acts: [
    {
      beats: ['you', 'need', 'go', 'search'],
      title: 'The den',
      text: 'Find the way into Orochimaru’s old hideout.',
      jobs: ['arc-anko-den-one'],
    },
    {
      beats: ['find', 'take', 'return', 'change'],
      title: 'Burn it out',
      text: 'Go back with Anko and burn out what her teacher left behind.',
      jobs: ['arc-anko-den-two'],
    },
  ],
};
