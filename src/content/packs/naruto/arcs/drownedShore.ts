import type { ArcDef, MissionDef } from '@/systems/missions';

import type { EnemyDef } from '../../../types';
import { HOTARU_SHORE } from '../people/stories/marks';

/**
 * The Drowned Shore: Hotaru's story. A letter from the Land of Waves knows her name; once Hotaru trusts you enough to say so, the jobs go up. Find who wrote it, then go back with Hotaru for the brother who pushed her under the nets.
 */

const CLIENT = 'Hotaru Shiranami';
export const DROWNED_SHORE_FOUND = 'hotaru-shore-found';
export const DROWNED_SHORE_SETTLED = 'hotaru-shore-settled';

export const DROWNED_SHORE_FOE: EnemyDef = {
  id: 'nagi',
  kind: 'Smuggler',
  danger: 'deadly',
  name: 'Nagi',
  proper: true,
  pronouns: 'he',
  description:
    'Hotaru’s brother, grown up working the smugglers’ boats, with the same water in his hands.',
  baseStat: 10,
  statBonuses: { ninjutsu: 3, speed: 2, stamina: 1 },
  maxChakra: 70,
  techniqueIds: ['water-gun', 'water-bullet', 'hiding-in-water', 'water-needle'],
  traits: ['swift'],
  nature: 'water',
};

export const DROWNED_SHORE_ACT_ONE: MissionDef = {
  id: 'arc-hotaru-shore-one',
  title: 'The Old Shore',
  rank: 'C',
  client: CLIENT,
  summary: 'Hotaru wants to find who wrote to her from the Land of Waves.',
  slots: 1,
  energyCost: 25,
  reward: { ryo: 520, reputation: 5 },
  minMissionsCompleted: 4,
  needsWorldMark: HOTARU_SHORE,
  stages: [
    {
      kind: 'narrative',
      text: 'Hotaru packs fish broth for the road, enough for everyone, and then some more.',
    },
    {
      kind: 'leg',
      text: 'Two days down the coast road to the Waves. Hotaru stops talking the moment she smells the sea.',
      days: 2,
      region: 'coast-road',
    },
    {
      kind: 'check',
      text: 'The fishing village is half empty, with its boats rotting on the shingle and a pair of eyes watching you from behind the nets.',
      approaches: [
        {
          label: 'Follow the one who’s watching',
          stat: 'perception',
          difficulty: 9,
          role: 'tracker',
          onSuccess: {
            effects: [{ kind: 'world', mark: DROWNED_SHORE_FOUND }],
            ledger: 'Followed the watcher to the old net sheds.',
          },
        },
        {
          label: 'Ask about the letter, carefully',
          stat: 'intellect',
          difficulty: 9,
          onSuccess: {
            effects: [{ kind: 'world', mark: DROWNED_SHORE_FOUND }],
            ledger: 'Learned who wrote the letter.',
          },
        },
      ],
      success:
        'An old net-mender wrote the letter. “Your brother lived,” she tells Hotaru. “He works the smugglers’ boats now.”',
      failure:
        'Nobody will talk, but Hotaru finds her own name scratched on a net shed, and a date.',
      onFailure: 'forward',
    },
    {
      kind: 'camp',
      text: 'You camp on the shingle, and Hotaru sits at the water’s edge all night, lifting the sea and letting it fall.',
      picks: 2,
      activities: [
        { kind: 'crew', label: 'Sit with Hotaru', when: { crew: 'team' } },
        { kind: 'drill', label: 'Drill by the fire' },
        { kind: 'rest', label: 'Sleep properly' },
      ],
    },
    {
      kind: 'ending',
      endings: [
        {
          text: '“He’s alive,” Hotaru says, laughing and crying at once. “Next time we come, we bring him home.”',
        },
      ],
    },
    { kind: 'leg', text: 'Back up the coast road to the Leaf.', days: 2 },
  ],
};

export const DROWNED_SHORE_ACT_TWO: MissionDef = {
  id: 'arc-hotaru-shore-two',
  title: 'Under the Nets',
  rank: 'C',
  client: CLIENT,
  summary: 'Back to the Waves with Hotaru, for her brother.',
  slots: 1,
  energyCost: 30,
  reward: { ryo: 600, reputation: 8 },
  minMissionsCompleted: 4,
  needsWorldMark: DROWNED_SHORE_FOUND,
  stages: [
    {
      kind: 'leg',
      text: 'On the coast road again Hotaru doesn’t sleep, and doesn’t seem to need to.',
      days: 2,
      region: 'coast-road',
    },
    {
      kind: 'decision',
      text: 'Nagi stands on the smugglers’ jetty between you and the boats, and doesn’t know his own sister. Hotaru asks you, “How do I make him see me?”',
      options: [
        {
          label: '“Tell him about the nets.”',
          tone: 'kind',
          reply: 'At the word, Nagi goes very still.',
          effects: [{ kind: 'mark', mark: 'mercy' }],
          ledger: 'Told Nagi about the nets.',
        },
        {
          label: '“Show him your water. It’s the same as his.”',
          tone: 'earnest',
          reply: 'She lifts the sea, and so does he, without meaning to.',
          effects: [{ kind: 'mark', mark: 'mercy' }],
          ledger: 'Hotaru showed Nagi their water.',
        },
        {
          label: '“He chose the smugglers. Fight him.”',
          tone: 'challenge',
          reply: 'Hotaru’s face falls. “If I have to, then. If he makes me.”',
          ledger: 'Told Hotaru to fight her brother.',
        },
      ],
    },
    {
      kind: 'encounter',
      ground: 'lake',
      template: 'bandit-camp',
      job: 'eliminate',
      text: 'The smugglers come down the jetty behind Nagi, and the sea comes up to meet them.',
      enemyIds: ['nagi', 'bandit-chief', 'bandit-thug'],
      canFlee: false,
      bypassable: false,
    },
    {
      kind: 'ending',
      endings: [
        {
          when: { has: 'mercy' },
          text: 'When the smugglers are scattered, Nagi lets go of the water and his sister catches him. He comes back to the Leaf with you, under no nets at all.',
          effects: [
            { kind: 'world', mark: DROWNED_SHORE_SETTLED },
            { kind: 'memory', text: 'the night Nagi came home' },
          ],
          ledger: 'Brought Hotaru’s brother home.',
        },
        {
          text: 'Nagi goes down in the shallows and won’t come with you. Hotaru leaves him a boat and her address, and walks away without looking back.',
          effects: [
            { kind: 'world', mark: DROWNED_SHORE_SETTLED },
            { kind: 'memory', text: 'the night on the jetty' },
          ],
          ledger: 'Beat the smugglers, and left Nagi a way to follow.',
        },
      ],
    },
    { kind: 'leg', text: 'Back up the coast road to the Leaf.', days: 2 },
  ],
};

export const DROWNED_SHORE_JOBS: readonly MissionDef[] = [
  DROWNED_SHORE_ACT_ONE,
  DROWNED_SHORE_ACT_TWO,
];

export const DROWNED_SHORE_ARC: ArcDef = {
  id: 'the-drowned-shore',
  title: 'The Drowned Shore',
  summary:
    'Someone on the old shore in the Land of Waves knows Hotaru’s name, and maybe her brother’s.',
  acts: [
    {
      beats: ['you', 'need', 'go', 'search'],
      title: 'The old shore',
      text: 'Find who wrote to Hotaru from the Land of Waves.',
      jobs: ['arc-hotaru-shore-one'],
    },
    {
      beats: ['find', 'take', 'return', 'change'],
      title: 'Under the nets',
      text: 'Go back with Hotaru for her brother.',
      jobs: ['arc-hotaru-shore-two'],
    },
  ],
};
