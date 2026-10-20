import type { RoadEventDef } from '@/systems/missions';

/**
 * What happens on the way to the Sand (`docs/design/sunagakure-plan.md`): out in the open sand
 * (`dune-road`), aboard a priests' barge (`sand-barge`) and in the tainted belt, where Shukaku's
 * chakra has soaked into everything (`tainted-belt`). Effects name only the threads a job may
 * keep, like the shared road events.
 */
const LOST_HOUR = { kind: 'thread', thread: 'daylight', by: -1 } as const;
const WARMS_CHARGE = { kind: 'thread', thread: 'charge', by: 1 } as const;
const COOLS_CHARGE = { kind: 'thread', thread: 'charge', by: -1 } as const;

export const DESERT_ROAD_EVENTS: readonly RoadEventDef[] = [
  {
    id: 'sandstorm-wall',
    regions: ['dune-road', 'tainted-belt'],
    text: 'A brown wall stands up on the horizon and comes on faster than anyone can walk.',
    options: [
      {
        label: 'Dig in behind a dune and wait it out',
        tone: 'quiet',
        reply:
          'You lie under your cloaks with sand hissing over you for an hour, and dig yourselves out into a changed country.',
        effects: [LOST_HOUR],
        ledger: 'Sheltered from a sandstorm.',
      },
      {
        label: 'March through it on a rope',
        tone: 'challenge',
        reply:
          'You walk blind, roped together, with sand in your teeth. Everyone comes out the other side, scoured raw.',
        effects: [{ kind: 'harm', health: 5 }, COOLS_CHARGE],
        ledger: 'Marched through a sandstorm on a rope.',
      },
    ],
  },
  {
    id: 'bones-at-the-well',
    regions: ['dune-road'],
    text: 'The well marked on the map is a ring of stones round dry sand, and beside it a camel’s bones, picked white.',
    options: [
      {
        label: 'Dig down into the well for water',
        tone: 'earnest',
        reply:
          'An arm’s length down the sand turns damp, and two arms’ lengths down there is a cupful at a time. It is enough.',
        effects: [LOST_HOUR, WARMS_CHARGE, { kind: 'energy', by: -10 }],
        ledger: 'Dug out a dry well for water.',
      },
      {
        label: 'Ration what you carry and walk on',
        tone: 'quiet',
        reply:
          'You share out a mouthful each and walk on, and nobody talks about water until night.',
        effects: [{ kind: 'energy', by: -10 }],
      },
    ],
  },
  {
    id: 'mirage-oasis',
    regions: ['dune-road', 'tainted-belt'],
    text: 'Palms and blue water shimmer in a hollow ahead, close enough to hear birds.',
    options: [
      {
        label: 'Turn off the road towards it',
        tone: 'curious',
        reply:
          'The water walks away from you all afternoon as you walk towards it. Then it isn’t there at all.',
        effects: [LOST_HOUR, { kind: 'energy', by: -10 }],
        ledger: 'Chased a mirage off the road.',
      },
      {
        label: 'Keep to the line of the dunes',
        tone: 'earnest',
        reply: 'Someone looks back at it every few steps until the dune hides it.',
      },
    ],
  },
  {
    id: 'priest-at-the-helm',
    regions: ['sand-barge'],
    text: 'The priest at the helm hasn’t spoken all day. At sunset she starts a low chant, and the barge leans into the wind.',
    options: [
      {
        label: 'Ask her what the chant is for',
        tone: 'curious',
        reply:
          'She looks at you a long while. “To keep him asleep,” she says, and goes back to it, and nobody asks who.',
        effects: [{ kind: 'mark', mark: 'heard-the-road' }],
        ledger: 'Asked the barge priest about her chant.',
      },
      {
        label: 'Leave her to it',
        tone: 'quiet',
        reply:
          'The chant goes on into the dark, and the sand hisses under the hull in time with it.',
      },
    ],
  },
  {
    id: 'barge-aground',
    regions: ['sand-barge'],
    text: 'The barge shudders and stops dead, its prow buried in a dune that wasn’t there yesterday.',
    options: [
      {
        label: 'Get down and dig with the crew',
        tone: 'kind',
        reply:
          'You dig beside the fan clan’s sail-hands until the priest can move the sand again. They are surprised a passenger would.',
        effects: [LOST_HOUR, WARMS_CHARGE, { kind: 'energy', by: -10 }],
        ledger: 'Dug the barge out of a dune.',
      },
      {
        label: 'Wait in the shade of the sail',
        tone: 'quiet',
        reply:
          'It takes them an hour. The priest doesn’t look at the passengers who sat in the shade.',
        effects: [LOST_HOUR, COOLS_CHARGE],
      },
    ],
  },
  {
    id: 'grey-sand-glitter',
    regions: ['tainted-belt'],
    text: 'The sand has gone grey underfoot and glitters in the sun like crushed glass. Somebody’s ankle is bleeding where they knelt in it.',
    options: [
      {
        label: 'Bind every scrape and walk in single file',
        tone: 'earnest',
        reply:
          'You bind hands and ankles in rags and walk in each other’s footprints, slowly, until the sand turns gold again.',
        effects: [LOST_HOUR],
        ledger: 'Crossed the grey sand with every scrape bound.',
      },
      {
        label: 'Hurry across it',
        tone: 'challenge',
        reply:
          'You make good time, and by evening the scrapes have gone hot and strange. Everyone sleeps badly.',
        effects: [{ kind: 'harm', health: 6 }, COOLS_CHARGE],
        ledger: 'Hurried across the grey sand.',
      },
    ],
  },
  {
    id: 'voice-in-the-dunes',
    regions: ['tainted-belt'],
    text: 'In the dusk, a voice calls a name from behind the next dune. It is the name of somebody one of you lost.',
    options: [
      {
        label: 'Hold hands and walk on without answering',
        tone: 'quiet',
        reply:
          'It calls all night, closer and then further, in the voice of everyone you miss. In the morning there are no tracks.',
        effects: [{ kind: 'energy', by: -15 }],
        ledger: 'Walked past the voice in the dunes.',
      },
      {
        label: 'Answer it, and break the illusion',
        tone: 'challenge',
        reply:
          'You shout back and mould your chakra, and the voice tears like cloth. A shape of blown sand runs off into the dark.',
        effects: [{ kind: 'harm', health: 4 }, WARMS_CHARGE],
        ledger: 'Broke the voice in the dunes.',
      },
    ],
  },
];
