import type { MissionDef } from '@/systems/missions';

/**
 * The Brewer's Ghost, acts one and two: a haunted brewery whose master wants the ghost gone
 * quickly and without questions, and three leads (any one moves the story on; the others stay
 * open until you face her). Every true lead found adds to the village's count of clues, which
 * decides what you can do on the night; the gravedigger the brewer blames is the wrong man.
 */

export const BREWER = 'Gensai Mori, brewer';
/** Clues found about the drowned brewer: the more, the more you can do for her. */
export const BREWER_CLUES = 'brewer-clues';

export const SOUR_VATS: MissionDef = {
  id: 'arc-brewer-sour-vats',
  title: 'Sour Vats',
  rank: 'D',
  client: BREWER,
  summary:
    'Something cold walks the Mori brewery at night, and every vat it passes turns to vinegar.',
  slots: 2,
  energyCost: 15,
  reward: { ryo: 110, reputation: 3 },
  minMissionsCompleted: 3,
  stages: [
    {
      kind: 'narrative',
      text: 'Gensai Mori meets you at the brewery gate in a fine coat and a hurry. “A hungry ghost,” he says, “sent by some rival. Just get rid of it.”',
    },
    {
      kind: 'encounter',
      template: 'spirit',
      job: 'eliminate',
      text: 'In the cellar the lamps burn blue. Between the vats, something pale drips on the floor.',
      enemyIds: ['storehouse-wraith'],
      canFlee: true,
    },
    {
      kind: 'check',
      text: 'It is gone, for tonight. Where it stood there are footprints, small and wet, though nothing in the cellar is wet.',
      approaches: [
        {
          label: 'Follow the wet footprints',
          stat: 'perception',
          difficulty: 7,
          onSuccess: {
            effects: [
              { kind: 'world', mark: 'brewer-saw-well' },
              { kind: 'mark', mark: 'saw-well' },
            ],
            ledger: 'Followed wet footprints to a boarded-up well in the yard.',
          },
        },
        {
          label: 'Feel where the cold is coming from',
          stat: 'chakraControl',
          difficulty: 8,
          onSuccess: {
            effects: [
              { kind: 'world', mark: 'brewer-saw-well' },
              { kind: 'mark', mark: 'saw-well' },
            ],
            ledger: 'Felt the cold rising from a boarded-up well in the yard.',
          },
        },
      ],
      success: 'They lead out of the cellar to a well in the yard, boarded over and nailed shut.',
      failure: 'The prints dry and vanish before you can follow them.',
      onFailure: 'forward',
    },
    {
      kind: 'decision',
      text: 'Gensai counts out your fee, then keeps counting. “Double,” he says, “if it’s gone for good by the end of the month. Quickly, and no fuss in the village.”',
      options: [
        {
          label: 'Agree, and take the money',
          tone: 'quiet',
          reply: 'He presses the coins into your hand with a damp palm.',
          effects: [
            { kind: 'pay', share: 0.5 },
            { kind: 'world', mark: 'brewer-took-bonus' },
          ],
          ledger: 'Took the brewer’s extra money to keep it quick and quiet.',
        },
        {
          label: 'Ask who she was',
          tone: 'curious',
          reply: '“Nobody,” Gensai says, much too fast. “A hungry ghost. They’re nobody.”',
          effects: [{ kind: 'world', mark: 'brewer-asked' }],
          ledger: 'Asked who the ghost was. The brewer said nobody, too fast.',
        },
      ],
    },
    {
      kind: 'ending',
      endings: [
        {
          when: { has: 'saw-well' },
          text: 'The Watch captain frowns at the boarded well in your report. “Mori’s first wife drowned in the river ten years back,” he says. “Never found. People talk. Find out what they say.”',
        },
        {
          text: 'The Watch captain frowns at your report. “Ghosts don’t come from nowhere,” he says. “Find out who she was.”',
        },
      ],
    },
  ],
};

export const OLD_WELL: MissionDef = {
  id: 'arc-brewer-old-well',
  title: 'The Boarded Well',
  rank: 'D',
  client: 'Tōrōgakure Watch',
  summary: 'Open the old well in the Mori brewery yard while the brewer is away at the market.',
  slots: 2,
  energyCost: 15,
  reward: { ryo: 100, reputation: 2 },
  minMissionsCompleted: 3,
  stages: [
    {
      kind: 'check',
      text: 'The nails come out easily. They have been pulled and hammered back before. The water below is black and very still.',
      approaches: [
        {
          label: 'Climb down on the rope',
          stat: 'strength',
          difficulty: 8,
          onSuccess: {
            effects: [
              { kind: 'world', mark: 'brewer-hairpin' },
              { kind: 'tally', tally: BREWER_CLUES, by: 1 },
            ],
            ledger: 'Found a woman’s hairpin on a ledge down the well.',
          },
        },
        {
          label: 'Drop a lantern and look',
          stat: 'perception',
          difficulty: 9,
          onSuccess: {
            effects: [
              { kind: 'world', mark: 'brewer-hairpin' },
              { kind: 'tally', tally: BREWER_CLUES, by: 1 },
            ],
            ledger: 'Saw a woman’s hairpin on a ledge down the well.',
          },
        },
      ],
      success:
        'On a ledge just above the water lies a lacquered hairpin, the kind a bride is given, green with ten years of damp.',
      failure: 'The rope slips and you come up soaked, with nothing but a mouthful of well water.',
      onFailure: 'forward',
    },
    {
      kind: 'ending',
      endings: [
        {
          text: 'You nail the boards back the way you found them, and leave before the brewer comes home.',
        },
      ],
    },
  ],
};
