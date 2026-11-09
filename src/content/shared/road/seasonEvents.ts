import type { RoadEventDef } from '@/systems/missions';

/**
 * Road events of one season or another (`docs/design/journeys-plan.md` 3.5): blossom and
 * pilgrims in spring, heat in summer, chestnuts and storm surf in autumn, snow and ice in winter.
 * Like every road event, their effects name only the threads a job may keep.
 */

const LOST_HOUR = { kind: 'thread', thread: 'daylight', by: -1 } as const;
const GAINED_HOUR = { kind: 'thread', thread: 'daylight', by: 1 } as const;
const WARMS_CHARGE = { kind: 'thread', thread: 'charge', by: 1 } as const;

export const SEASON_ROAD_EVENTS: readonly RoadEventDef[] = [
  {
    id: 'blossom-pilgrims',
    regions: ['hill-road', 'river-road'],
    seasons: ['Spring'],
    text: 'Pilgrims have spread their mats under a cherry tree by the road, and the eldest waves you over to share their rice.',
    options: [
      {
        label: 'Sit with them a while',
        tone: 'kind',
        reply:
          'They want to know where you are going and tell you where they have been, and petals fall into the tea.',
        effects: [LOST_HOUR, WARMS_CHARGE, { kind: 'energy', by: 10 }, { kind: 'bond', by: 1 }],
        ledger: 'Shared rice with pilgrims under a cherry tree.',
      },
      {
        label: 'Bow and walk on',
        tone: 'quiet',
        reply:
          'The eldest bows back without getting up, and the blossom carries on falling behind you.',
      },
    ],
  },
  {
    id: 'summer-heat',
    regions: ['dune-road', 'hill-road', 'coast-road'],
    seasons: ['Summer'],
    text: 'By noon the air above the road wavers like water.',
    options: [
      {
        label: 'Wait out the worst of it in the shade',
        tone: 'quiet',
        reply:
          'You lie under the one tree for an hour and set off again when the light turns gold.',
        effects: [LOST_HOUR, { kind: 'energy', by: 15 }],
        ledger: 'Waited out the noon heat.',
      },
      {
        label: 'Push on through it',
        tone: 'challenge',
        reply:
          'You keep the pace, and by the afternoon your head is pounding and your tongue is dry.',
        effects: [
          { kind: 'energy', by: -15 },
          { kind: 'harm', health: 3 },
        ],
        ledger: 'Pushed on through the heat.',
      },
    ],
  },
  {
    id: 'chestnut-fall',
    regions: ['forest-track', 'hill-road'],
    seasons: ['Autumn'],
    text: 'Chestnuts lie thick under the trees, their husks split open on the track.',
    options: [
      {
        label: 'Gather a pocketful and roast them',
        tone: 'curious',
        reply:
          'You roast them in the embers of a small fire and eat them too hot, burning your fingers on every one.',
        effects: [LOST_HOUR, { kind: 'energy', by: 10 }, { kind: 'bond', by: 1 }],
        ledger: 'Roasted chestnuts by the track.',
      },
      {
        label: 'Kick one down the track and keep going',
        tone: 'joke',
        reply: 'It skitters ahead of you for most of a mile before it finds a ditch.',
      },
    ],
  },
  {
    id: 'storm-surf',
    regions: ['coast-road'],
    seasons: ['Autumn'],
    text: 'The autumn swell is breaking right over the road where it runs below the cliff.',
    options: [
      {
        label: 'Wait for the tide to turn',
        tone: 'quiet',
        reply:
          'You sit on a rock above the spray until the sea draws back and leaves the road shining.',
        effects: [LOST_HOUR],
        ledger: 'Waited for the tide to turn below the cliff.',
      },
      {
        label: 'Run it between the waves',
        tone: 'challenge',
        reply:
          'You time the gap and run for it, and the last wave catches you anyway and throws you against the rock.',
        effects: [{ kind: 'harm', health: 4 }],
        ledger: 'Ran the road between the breakers.',
      },
    ],
  },
  {
    id: 'snowdrift',
    regions: ['mountain-pass', 'hill-road'],
    seasons: ['Winter'],
    text: 'Snow drifted across the road in the night. It lies waist deep and smooth as paper.',
    options: [
      {
        label: 'Dig a way through',
        tone: 'challenge',
        reply: 'It takes the morning and every bit of warmth you had, but the road is yours again.',
        effects: [LOST_HOUR, { kind: 'energy', by: -15 }],
        ledger: 'Dug a way through a drift.',
      },
      {
        label: 'Go the long way round by the valley',
        tone: 'quiet',
        reply:
          'The valley path adds hours, and you come back to the road above the drift as the light goes.',
        effects: [LOST_HOUR, LOST_HOUR],
        ledger: 'Went round a drift by the valley.',
      },
    ],
  },
  {
    id: 'frozen-river',
    regions: ['river-road'],
    seasons: ['Winter'],
    text: 'The river has frozen from bank to bank and creaks in the cold. The bridge is an hour downstream.',
    options: [
      {
        label: 'Cross on the ice',
        tone: 'challenge',
        reply:
          'It holds, groaning under every step, and you are over before you let yourself breathe.',
        effects: [GAINED_HOUR],
        ledger: 'Crossed the river on the ice.',
      },
      {
        label: 'Walk down to the bridge',
        tone: 'quiet',
        reply:
          'You follow the bank to the bridge and back up the far side, and the ice cracks behind you.',
        effects: [LOST_HOUR],
        ledger: 'Kept to the bridge over a frozen river.',
      },
    ],
  },
];
