import type { MissionDef } from '@/systems/missions';

/** The Lantern Thief, acts one and two: the dark wall, and following the glass. */

export const WATCH = 'Tōrōgakure Watch';

export const DARK_WALL: MissionDef = {
  id: 'arc-lantern-dark-wall',
  title: 'The Dark Stretch of Wall',
  rank: 'D',
  client: WATCH,
  summary:
    'Lanterns are vanishing from the old wall, a few each night. The Watch wants to know where they go.',
  slots: 2,
  energyCost: 15,
  reward: { ryo: 90, reputation: 3 },
  minMissionsCompleted: 3,
  stages: [
    {
      kind: 'narrative',
      text: 'The watch captain walks you along the old wall, past hook after empty hook. “Forty lanterns in a month,” he says. “Lanterns. Who steals lanterns?”',
    },
    {
      kind: 'check',
      text: 'Below the empty hooks, glass dust glitters between the stones, as if the lanterns were broken here with care and the pieces carried away.',
      approaches: [
        {
          label: 'Follow the glitter of glass',
          stat: 'perception',
          difficulty: 7,
          onSuccess: {
            effects: [
              { kind: 'world', mark: 'lantern-canal-trail' },
              { kind: 'mark', mark: 'canal-trail' },
            ],
            ledger: 'Followed the glass dust down to the canal.',
          },
        },
        {
          label: 'Work out which lanterns they chose, and why',
          stat: 'intellect',
          difficulty: 7,
          onSuccess: {
            effects: [
              { kind: 'world', mark: 'lantern-canal-trail' },
              { kind: 'mark', mark: 'canal-trail' },
            ],
            ledger: 'Worked out they only take the old chakra-glass lanterns.',
          },
        },
      ],
      success:
        'The trail of glass runs down the steps to the canal, and stops where a boat must have waited.',
      failure:
        'You lose the trail in the market crowds. A fishwife says she has seen strange boats from the river villages lately.',
      onFailure: 'forward',
    },
    {
      kind: 'ending',
      endings: [
        {
          when: { has: 'canal-trail' },
          text: 'The captain marks the canal on his map and taps the river beyond it. “Somebody upriver is buying our light,” he says. “Find them.”',
        },
        {
          text: 'The captain frowns at the river on his map. “Upriver, then. Somebody up there is buying our light.”',
        },
      ],
    },
  ],
};

export const RIVER_VILLAGES: MissionDef = {
  id: 'arc-lantern-river-villages',
  title: 'Asking Along the River',
  rank: 'C',
  client: WATCH,
  summary:
    'Walk the river villages and find out who is buying lantern glass, and who is selling it.',
  slots: 1,
  energyCost: 25,
  reward: { ryo: 320, reputation: 5 },
  minMissionsCompleted: 3,
  stages: [
    {
      kind: 'leg',
      text: 'A day of reed beds and ferries, and villages that all smell of fish.',
      days: 1,
      region: 'river-road',
    },
    {
      kind: 'decision',
      text: 'In the third village the headman’s wife is mending nets on her step. She has clearly seen the smugglers, and just as clearly doesn’t want to say so.',
      options: [
        {
          label: 'Ask about her nets, and wait',
          tone: 'curious',
          reply:
            'By the third net she mentions a kiln out in the reeds where no potter has worked for years, and smoke that rises from it at night.',
          effects: [{ kind: 'world', mark: 'lantern-kiln-heard' }],
          ledger: 'Heard about a kiln in the reeds that smokes at night.',
        },
        {
          label: 'Tell her the Watch will be grateful',
          tone: 'earnest',
          reply:
            'She snorts. “The Watch never came out here before.” But she points you towards the reeds.',
          effects: [{ kind: 'world', mark: 'lantern-kiln-heard' }],
          ledger: 'Was pointed towards the reeds.',
        },
        {
          label: 'Lean on her',
          tone: 'challenge',
          reply:
            'She goes in and shuts the door. A child runs off into the reeds, fast, to warn somebody.',
          effects: [{ kind: 'world', mark: 'lantern-smugglers-warned' }],
          ledger: 'Leaned on a headman’s wife, and someone ran to warn the smugglers.',
        },
      ],
    },
    {
      kind: 'camp',
      text: 'You camp on a ferry landing, the river loud in the dark.',
      picks: 2,
      activities: [
        { kind: 'crew', label: 'Sit with your team', when: { crew: 'team' } },
        {
          kind: 'watch',
          label: 'Watch the river',
          stat: 'perception',
          difficulty: 8,
          role: 'sensor',
          success:
            'Past midnight a flat boat slides downstream with no lantern, low in the water, heavy with sacks that clink.',
          failure: 'The river runs on in the dark, keeping its secrets.',
          onSuccess: {
            effects: [{ kind: 'world', mark: 'lantern-boat-seen' }],
            ledger: 'Saw the smugglers’ boat on the river at night.',
          },
        },
        { kind: 'drill', label: 'Drill by the fire' },
        { kind: 'rest', label: 'Sleep properly' },
      ],
    },
    { kind: 'leg', text: 'Back down the river road to the village.', days: 1 },
  ],
};

export const NIGHT_MARKET: MissionDef = {
  id: 'arc-lantern-night-market',
  title: 'Glass at the Night Market',
  rank: 'D',
  client: WATCH,
  summary:
    'Somebody at the night market is selling old lantern glass, cut into beads. Find out who they buy it from.',
  slots: 2,
  energyCost: 15,
  reward: { ryo: 110, reputation: 3 },
  minMissionsCompleted: 3,
  stages: [
    {
      kind: 'narrative',
      text: 'Among the skewer stalls a woman with a tray of glass beads is doing good business. Every bead gives off a faint light of its own in the dark.',
    },
    {
      kind: 'decision',
      text: '“Pretty, aren’t they?” the bead-seller says, watching your hands, not your face.',
      options: [
        {
          label: 'Admire her work',
          tone: 'praise',
          reply:
            'She warms to you, and lets slip that a boy brings the glass, a skinny thing who smells of lamp oil.',
          effects: [
            { kind: 'world', mark: 'lantern-thief-named' },
            { kind: 'mark', mark: 'named' },
          ],
          ledger: 'Learned the glass comes from a boy who smells of lamp oil.',
        },
        {
          label: 'Ask where the glass comes from',
          tone: 'curious',
          reply:
            '“From a boy,” she says. “A lamplighter’s boy, I’d guess, by the smell of him. He doesn’t sell, he’s paid in debts.”',
          effects: [
            { kind: 'world', mark: 'lantern-thief-named' },
            { kind: 'mark', mark: 'named' },
          ],
          ledger: 'Learned the glass comes from a lamplighter’s boy, paying off a debt.',
        },
        {
          label: 'Show her your headband',
          tone: 'challenge',
          reply:
            'The tray is packed and the woman gone into the crowd before you can blink. All she leaves is a single bead.',
          ledger: 'Scared off the bead-seller before she said anything.',
        },
      ],
    },
    {
      kind: 'ending',
      endings: [
        {
          when: { has: 'named' },
          text: 'The captain goes very quiet at “lamplighter’s boy”. “Oume’s son,” he says. “Tobi. Gods.”',
        },
        {
          text: 'The captain turns the bead over in his fingers. “Chakra-glass,” he says. “Ours.”',
        },
      ],
    },
  ],
};
