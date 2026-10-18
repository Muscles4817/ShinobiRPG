import type { ArcDef, MissionDef } from '@/systems/missions';

import { CUT_NETS, TOWN_APART, TWO_SIDES_CLUES } from './twoSidesStart';

/**
 * Two Sides of the Water: the builders and the fishermen of the Waves each hire you against
 * the other. Doing both jobs is the only way to see the third hand: the tycoon's man paying
 * cutters on both sides, so a town that fights itself never finishes its bridge. What you found
 * on each side decides whether you can bring both sides to face him together.
 */

export const CUT_ROPES: MissionDef = {
  id: 'arc-waves-cut-ropes',
  title: 'Cut Ropes',
  rank: 'D',
  client: 'Tazuna, bridge builder',
  summary: 'Someone keeps cutting the scaffold ropes. Tazuna’s builders say it’s the fishermen.',
  slots: 2,
  energyCost: 20,
  reward: { ryo: 120, reputation: 2 },
  minMissionsCompleted: 3,
  stages: [
    {
      kind: 'encounter',
      template: 'bandit-camp',
      job: 'patrol',
      text: 'You wait under the scaffold. Two men row in after midnight with knives and a fisherman’s gutting blade in plain view.',
      enemyIds: ['bandit-thug', 'bandit-thug'],
      canFlee: true,
    },
    {
      kind: 'check',
      text: 'The gutting blade lies on the planks where one of them dropped it, very carefully, where anyone would find it.',
      approaches: [
        {
          label: 'Look at the blade properly',
          stat: 'perception',
          difficulty: 7,
          onSuccess: {
            effects: [
              { kind: 'world', mark: 'waves-planted-blade' },
              { kind: 'tally', tally: TWO_SIDES_CLUES, by: 1 },
            ],
            ledger: 'The fisherman’s blade was new, never used, and left to be found.',
          },
        },
        {
          label: 'Ask the fishermen whose it is',
          stat: 'intellect',
          difficulty: 8,
          onSuccess: {
            effects: [
              { kind: 'world', mark: 'waves-planted-blade' },
              { kind: 'tally', tally: TWO_SIDES_CLUES, by: 1 },
            ],
            ledger: 'No fisherman owns the blade. It was bought at the tycoon’s store.',
          },
        },
      ],
      success: 'The blade has never gutted a fish. It was left there to be found.',
      failure: 'The builders snatch up the blade and wave it at the harbour. It doesn’t help.',
      onFailure: 'forward',
    },
    {
      kind: 'ending',
      endings: [{ text: 'Tazuna pays you out of his own pocket, which is thin.' }],
    },
  ],
};

export const THIRD_HAND: MissionDef = {
  id: 'arc-waves-third-hand',
  title: 'The Third Hand',
  rank: 'C',
  client: 'Tsunami',
  summary: 'Somebody is behind the cutting on both sides of the water. End it, and go home.',
  slots: 1,
  energyCost: 30,
  reward: { ryo: 520, reputation: 7 },
  minMissionsCompleted: 3,
  endsAt: 'konohagakure',
  stages: [
    {
      kind: 'decision',
      text: 'The man who pays the cutters works out of the tycoon’s warehouse on the point. Before you go, Tsunami asks whether the town should hear the truth first.',
      options: [
        {
          when: { tally: TWO_SIDES_CLUES, atLeast: 2 },
          label: 'Gather the builders and the fishermen at the market, and show them both',
          tone: 'earnest',
          reply:
            'The tycoon’s sandals on the jetty, the new blade on the scaffold. The market goes quiet. Then Tazuna and the eldest fisherman pick up the same boathook and walk out behind you.',
          effects: [
            { kind: 'mark', mark: 'united' },
            { kind: 'world', mark: 'waves-united' },
          ],
          ledger: 'Showed the builders and the fishermen what was done to them both.',
        },
        {
          label: 'Go to the warehouse alone, before he hears you’re coming',
          tone: 'challenge',
          reply: 'Tsunami nods, and closes the shutters behind you.',
          ledger: 'Went for the warehouse before the town knew.',
        },
      ],
    },
    {
      when: { has: 'united' },
      kind: 'encounter',
      template: 'guarded-building',
      job: 'eliminate',
      text: 'With half the town at your back, only the tycoon’s hired man stands his ground at the warehouse door.',
      enemyIds: ['missing-nin'],
      canFlee: false,
    },
    {
      when: { lacks: 'united' },
      kind: 'encounter',
      template: 'guarded-building',
      job: 'eliminate',
      text: 'The warehouse on the point, the tycoon’s hired man inside, and his cutters at the door.',
      enemyIds: ['missing-nin', 'bandit-thug', 'bandit-archer'],
      canFlee: false,
    },
    {
      kind: 'ending',
      endings: [
        {
          when: { has: 'united' },
          text: 'The next morning the fishermen row the builders out to the scaffold, and stay to mend nets in its shade. Inari runs between them with the tea.',
          effects: [
            { kind: 'world', mark: 'waves-two-sides-done' },
            { kind: 'memory', text: 'the morning the Waves rowed out together' },
          ],
          ledger: 'The builders and the fishermen are friends again.',
        },
        {
          text: 'The cutting stops. The town is quieter, though it takes a long while before the fishermen look the builders in the eye.',
          effects: [{ kind: 'world', mark: 'waves-two-sides-done' }],
          ledger: 'The cutting stopped, though the town is slow to mend.',
        },
      ],
    },
    { kind: 'leg', text: 'Back across the water and up the coast.', days: 1, region: 'coast-road' },
    { kind: 'leg', text: 'Home through the forest.', days: 1 },
  ],
};

export const TWO_SIDES_JOBS: readonly MissionDef[] = [TOWN_APART, CUT_NETS, CUT_ROPES, THIRD_HAND];

export const TWO_SIDES_ARC: ArcDef = {
  id: 'two-sides-of-the-water',
  title: 'Two Sides of the Water',
  summary: 'The Land of Waves is coming apart while its bridge goes up.',
  acts: [
    {
      beats: ['you', 'need'],
      title: 'A town coming apart',
      text: 'Tsunami has written from the Waves: the builders and the fishermen are at war.',
      jobs: ['arc-waves-town-apart'],
    },
    {
      beats: ['go', 'search'],
      title: 'Both sides',
      text: 'The fishermen want the net-cutter caught; the builders want the rope-cutter. Work for both.',
      jobs: ['arc-waves-cut-nets', 'arc-waves-cut-ropes'],
      baseLocationId: 'land-of-waves',
    },
    {
      beats: ['find', 'take', 'return', 'change'],
      title: 'The third hand',
      text: 'Somebody is paying cutters on both sides. Find him, and go home.',
      jobs: ['arc-waves-third-hand'],
      baseLocationId: 'land-of-waves',
    },
  ],
};
