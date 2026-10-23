import type { RoadEventDef } from '@/systems/missions';

/**
 * Road events that come only on roads with real danger on them (`docs/design/journeys-plan.md`
 * 3.5: an event's `danger` is the least a road must hold), and the rare and the once-in-a-life
 * ones that make a long road worth walking. Effects name only the threads a job may keep.
 */

const LOST_HOUR = { kind: 'thread', thread: 'daylight', by: -1 } as const;
const WARMS_CHARGE = { kind: 'thread', thread: 'charge', by: 1 } as const;
const COOLS_CHARGE = { kind: 'thread', thread: 'charge', by: -1 } as const;

const ROUGH: readonly RoadEventDef[] = [
  {
    id: 'toll-men',
    regions: ['hill-road', 'river-road', 'forest-track'],
    danger: 'armed',
    text: 'Three men with clubs have laid a log across the road and want a toll from anyone who would cross it.',
    options: [
      {
        label: 'Talk them out of it',
        tone: 'earnest',
        reply:
          'It takes a long while and a longer story, but in the end they roll the log aside and wish you luck.',
        effects: [LOST_HOUR],
        ledger: 'Talked toll-men off the road.',
      },
      {
        label: 'Step over the log and dare them',
        tone: 'challenge',
        reply:
          'One of them swings, you take it on the arm, and the other two decide the road is yours after all.',
        effects: [
          { kind: 'harm', health: 4 },
          { kind: 'bond', by: 1 },
        ],
        ledger: 'Faced down toll-men at a log.',
      },
    ],
  },
  {
    id: 'burned-waystation',
    regions: ['forest-track', 'hill-road', 'dune-road'],
    danger: 'armed',
    text: 'The waystation where the road forks has been burned out, and the ashes are still warm.',
    options: [
      {
        label: 'Search what is left',
        tone: 'curious',
        reply:
          'You find hoofprints going north and a dropped tally stick, and you take the fork they didn’t.',
        effects: [LOST_HOUR, { kind: 'mark', mark: 'heard-the-road' }],
        ledger: 'Read the tracks at a burned waystation.',
      },
      {
        label: 'Keep moving and keep quiet',
        tone: 'quiet',
        reply: 'Nobody speaks for the next mile, and nobody needs to.',
        effects: [COOLS_CHARGE],
      },
    ],
  },
  {
    id: 'arrows-in-a-tree',
    regions: ['forest-track'],
    danger: 'armed',
    rarity: 'uncommon',
    text: 'Three arrows stand in a trunk beside the track, fletched in black and not long shot.',
    options: [
      {
        label: 'Go slowly and keep to cover',
        tone: 'quiet',
        reply: 'You move from trunk to trunk for an hour, and whoever shot them never shows.',
        effects: [LOST_HOUR, WARMS_CHARGE],
        ledger: 'Went carefully past fresh arrows.',
      },
      {
        label: 'Pull one out to read the fletching',
        tone: 'curious',
        reply: 'The feathers are cut in a hunter’s style, not a soldier’s, and you breathe easier.',
        effects: [{ kind: 'mark', mark: 'heard-the-road' }],
      },
    ],
  },
  {
    id: 'watcher-on-the-ridge',
    regions: ['mountain-pass', 'hill-road', 'forest-track'],
    danger: 'deadly',
    rarity: 'rare',
    text: 'A figure stands on the ridge above the road, still as a post, and stays there however far you walk.',
    options: [
      {
        label: 'Double back and lose them',
        tone: 'quiet',
        reply:
          'You leave the road for a stream bed and come back to it an hour on, and the ridge is empty.',
        effects: [LOST_HOUR],
        ledger: 'Lost a watcher on the ridge.',
      },
      {
        label: 'Stop and meet their eye',
        tone: 'challenge',
        reply: 'You stand in the road and look up until they turn away, and nobody follows.',
        effects: [{ kind: 'bond', by: 1 }],
      },
    ],
  },
];

const RARE: readonly RoadEventDef[] = [
  {
    id: 'crane-dance',
    regions: ['river-road', 'coast-road'],
    rarity: 'rare',
    text: 'Two cranes are dancing in the shallows. They bow and leap and are in no hurry for anyone.',
    options: [
      {
        label: 'Stop and watch',
        tone: 'quiet',
        reply:
          'You watch until they lift off together and go low over the water, and the road feels shorter after.',
        effects: [
          LOST_HOUR,
          { kind: 'energy', by: 10 },
          { kind: 'memory', text: 'the cranes in the shallows' },
        ],
        ledger: 'Watched cranes dance in the shallows.',
      },
      {
        label: 'Leave them to it',
        tone: 'kind',
        reply: 'You walk on softly so as not to startle them.',
      },
    ],
  },
  {
    id: 'merchant-caravan',
    regions: ['dune-road', 'river-road', 'coast-road'],
    rarity: 'uncommon',
    text: 'A caravan of mules is going your way, and its master offers you a place among the loads.',
    options: [
      {
        label: 'Walk with the caravan',
        tone: 'kind',
        reply:
          'The muleteers sing badly and share their water, and the day goes by quicker for it.',
        effects: [WARMS_CHARGE, { kind: 'bond', by: 1 }],
        ledger: 'Walked a stretch with a caravan.',
      },
      {
        label: 'Keep your own pace',
        tone: 'quiet',
        reply:
          'You thank the master and let the caravan draw ahead, its bells fading round the bend.',
      },
    ],
  },
  {
    id: 'old-swordsman-at-the-ford',
    regions: ['river-road', 'hill-road'],
    rarity: 'rare',
    once: true,
    text: 'An old swordsman sits by the ford with a blade across his knees, and asks whether you would cross it with him before you cross the river.',
    options: [
      {
        label: 'Draw and cross blades',
        tone: 'challenge',
        reply:
          'He disarms you twice and laughs both times, then shows you the turn of the wrist that did it.',
        effects: [
          { kind: 'energy', by: -15 },
          { kind: 'memory', text: 'the old swordsman at the ford' },
        ],
        ledger: 'Crossed blades with an old swordsman at a ford.',
      },
      {
        label: 'Bow and decline',
        tone: 'earnest',
        reply: 'He bows back, and says the river will still be there when you are ready.',
      },
    ],
  },
  {
    id: 'lantern-without-a-keeper',
    regions: ['hill-road', 'mountain-pass'],
    rarity: 'rare',
    once: true,
    text: 'A stone lantern by the road is lit, though there is no village for miles and no one near it.',
    options: [
      {
        label: 'Add a little oil from your own flask',
        tone: 'kind',
        reply:
          'The flame stands up straighter, and for the rest of the day you feel as if someone is walking with you.',
        effects: [
          { kind: 'energy', by: 10 },
          { kind: 'memory', text: 'the lantern with no keeper' },
        ],
        ledger: 'Fed a lantern with no keeper.',
      },
      {
        label: 'Leave it be',
        tone: 'quiet',
        reply: 'You walk past, and when you look back the road behind you is dark.',
      },
    ],
  },
];

export const ROUGH_ROAD_EVENTS: readonly RoadEventDef[] = [...ROUGH, ...RARE];
