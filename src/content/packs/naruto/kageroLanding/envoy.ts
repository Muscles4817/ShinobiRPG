import type { MissionDef } from '@/systems/missions';

import { SUNA_BARGE_PASSAGE } from './passage';

/**
 * The way into the Sand for a Leaf shinobi (`docs/design/sunagakure-plan.md`): the Sand turns
 * the Leaf back at its gates, until its own envoy, stranded at the Landing, is walked home
 * across the sand by one. The job takes you in, and the Kazekage's leave it ends with
 * (`SUNA_GATES_OPEN`) keeps the gates open after.
 */
export const SUNA_GATES_OPEN = 'suna-gates-open';

const HONEST = 'honest';
const WATCHED = 'watched';

export const LANDING_ENVOY_JOB: MissionDef = {
  id: 'landing-sand-envoy',
  title: 'The Envoy Who Missed the Barge',
  rank: 'B',
  client: 'Sayo, envoy of the Sand',
  summary:
    'The Sand’s envoy is back from the daimyo’s court with an answer for the Kazekage, and raiders burned her caravan at the edge of the sand. The barge left without her. She needs walking home, and a Leaf shinobi is the last escort she would choose.',
  slots: 3,
  energyCost: 35,
  reward: { ryo: 900, reputation: 14 },
  minMissionsCompleted: 8,
  needsWorldMark: SUNA_BARGE_PASSAGE,
  once: true,
  endsAt: 'sunagakure',
  stages: [
    {
      kind: 'narrative',
      text: 'Sayo is sitting in the caravanserai with the daimyo’s answer sealed in a lacquer case on her knees. She looks at your forehead protector a long time before she says yes, and then only because Sunao of the Dunes tells her you are the one who brought the boy back.',
    },
    {
      kind: 'leg',
      text: 'Out across the outer sands on foot, Sayo walking a little apart from you.',
      days: 2,
      region: 'dune-road',
    },
    {
      kind: 'decision',
      text: 'By the second night’s fire Sayo finally speaks. “My brother rode out against the Leaf’s outpost and came back over a camel,” she says. “The White Fang. Give me one reason I should speak for you at the gate.”',
      options: [
        {
          label: 'Tell her you can’t answer for him, only for yourself',
          tone: 'earnest',
          reply:
            'She turns that over for a long while. “Then answer for yourself,” she says, “all the way to the gate.”',
          effects: [{ kind: 'mark', mark: HONEST }],
          ledger: 'Told Sayo you could answer only for yourself.',
        },
        {
          label: 'Say nothing, and keep watch all night so she can sleep',
          tone: 'quiet',
          reply:
            'She doesn’t sleep at first. Some time after midnight she does, and in the morning she notices you never lay down.',
          effects: [{ kind: 'mark', mark: WATCHED }],
          ledger: 'Kept watch all night for Sayo.',
        },
        {
          label: 'Tell her the Sand started that war',
          tone: 'challenge',
          reply: '“So it did,” she says, and doesn’t speak to you again until morning.',
          ledger: 'Told Sayo the Sand started the war.',
        },
      ],
    },
    {
      kind: 'encounter',
      ground: 'desert',
      template: 'bandit-camp',
      job: 'escort',
      text: 'The raiders who burned her caravan have followed the tracks, and they are camped across the only pass through the dunes, waiting for her.',
      enemyIds: ['dune-raider', 'dune-raider', 'spice-runner'],
      canFlee: false,
      bypassable: true,
    },
    {
      kind: 'leg',
      text: 'The last day over the dunes, with the cliffs of the Sand standing up out of the haze.',
      days: 1,
      region: 'dune-road',
    },
    {
      kind: 'ending',
      endings: [
        {
          when: { has: HONEST },
          text: 'At the gorge the guards draw on you. Sayo steps between and tells them you answered for yourself all the way across the sand. By evening the Kazekage’s word comes down, and this one Leaf shinobi may come and go.',
          effects: [
            { kind: 'world', mark: SUNA_GATES_OPEN },
            { kind: 'memory', text: 'answering for yourself all the way to the gate' },
          ],
          ledger: 'Brought the Sand’s envoy home, and won the Kazekage’s leave to come and go.',
        },
        {
          when: { has: WATCHED },
          text: 'At the gorge the guards draw on you. Sayo tells them you kept watch over her for a whole night in the open sand and never once lay down. By evening the Kazekage’s word comes down, and this one Leaf shinobi may come and go.',
          effects: [
            { kind: 'world', mark: SUNA_GATES_OPEN },
            { kind: 'memory', text: 'a night’s watch over the Sand’s envoy' },
          ],
          ledger: 'Brought the Sand’s envoy home, and won the Kazekage’s leave to come and go.',
        },
        {
          text: 'At the gorge the guards draw on you, and Sayo lets them for a moment before she says you brought her home. By evening the Kazekage’s word comes down, and the Leaf shinobi who brought the envoy home may come and go, and will be watched.',
          effects: [
            { kind: 'world', mark: SUNA_GATES_OPEN },
            { kind: 'memory', text: 'walking the Sand’s envoy home' },
          ],
          ledger: 'Brought the Sand’s envoy home, and won leave to come and go, under watch.',
        },
      ],
    },
  ],
};
