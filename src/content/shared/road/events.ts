import type { RoadEventDef } from '@/systems/missions';

/**
 * Things that happen on the road, drawn by the region and the day. Written once for every pack
 * and every job: effects name only threads a job may keep (`daylight`, and `charge` for whoever
 * you look after), so a job without them simply isn't moved by that part. A ledger line says
 * only what was done; what it cost (the light) is added by the job's thread when it really moved.
 */

const LOST_HOUR = { kind: 'thread', thread: 'daylight', by: -1 } as const;
const WARMS_CHARGE = { kind: 'thread', thread: 'charge', by: 1 } as const;
const COOLS_CHARGE = { kind: 'thread', thread: 'charge', by: -1 } as const;

export const ROAD_EVENTS: readonly RoadEventDef[] = [
  {
    id: 'ox-cart-in-the-ditch',
    regions: ['hill-road', 'river-road'],
    text: 'An ox-cart has slid into the ditch. Its owner is trying to lift it alone, red in the face.',
    options: [
      {
        label: 'Put your shoulder to it',
        tone: 'kind',
        reply:
          'It takes all of you and most of an hour, but the cart rolls free. The carter presses a pear on everyone.',
        effects: [LOST_HOUR, WARMS_CHARGE, { kind: 'energy', by: -10 }],
        ledger: 'Pulled a carter out of the ditch.',
      },
      {
        label: 'Walk on. The job comes first',
        tone: 'quiet',
        reply: 'You walk on. Behind you, the carter swears at the ox, and then at the sky.',
        effects: [COOLS_CHARGE],
        ledger: 'Left a carter in the ditch to keep to the road.',
      },
    ],
  },
  {
    id: 'wayside-shrine',
    regions: ['hill-road', 'mountain-pass', 'forest-track'],
    text: 'A shrine no bigger than a lantern stands by the road, its offering bowl empty and its roof furred with moss.',
    options: [
      {
        label: 'Leave an offering and clean the roof',
        tone: 'earnest',
        reply:
          'You scrape the moss away and leave a rice cake in the bowl. The road feels lighter afterwards.',
        effects: [LOST_HOUR, WARMS_CHARGE],
        ledger: 'Tended a wayside shrine.',
      },
      {
        label: 'Bow as you pass',
        tone: 'quiet',
        reply: 'You bow without stopping. The little shrine watches you go.',
      },
    ],
  },
  {
    id: 'peddler-with-news',
    regions: ['hill-road', 'coast-road', 'river-road', 'dune-road'],
    text: 'A peddler with a pack taller than he is falls into step with you, eager for company and full of gossip.',
    options: [
      {
        label: 'Ask what he’s seen on the road ahead',
        tone: 'curious',
        reply:
          'He talks for a mile about tolls, prices and a stretch of road where nobody likes to camp. Some of it may even be true.',
        effects: [{ kind: 'mark', mark: 'heard-the-road' }],
        ledger: 'Heard about the road ahead from a peddler.',
      },
      {
        label: 'Make a joke of his enormous pack',
        tone: 'joke',
        reply: 'He laughs harder than you do, and tells you about the time it fell on him.',
      },
    ],
  },
  {
    id: 'cloudburst',
    regions: ['hill-road', 'mountain-pass', 'coast-road', 'forest-track'],
    text: 'The sky goes the colour of slate, and then the rain comes all at once.',
    options: [
      {
        label: 'Shelter under the trees until it passes',
        tone: 'quiet',
        reply: 'You wait it out under dripping cedar, and set off late and damp.',
        effects: [LOST_HOUR],
        ledger: 'Sheltered from a cloudburst.',
      },
      {
        label: 'Push on through it',
        tone: 'challenge',
        reply:
          'You march through it, soaked to the bone, and keep your time. Everyone is shivering by evening.',
        effects: [{ kind: 'energy', by: -15 }, COOLS_CHARGE],
        ledger: 'Marched through a cloudburst.',
      },
    ],
  },
  {
    id: 'lost-child',
    regions: ['river-road', 'coast-road', 'hill-road'],
    text: 'A child is sitting at a crossroads, crying, insisting they know the way home and refusing to say where it is.',
    options: [
      {
        label: 'Walk them home, however far it is',
        tone: 'kind',
        reply:
          'Home turns out to be a farm an hour back the way you came. The mother cries too, and feeds you all.',
        effects: [LOST_HOUR, WARMS_CHARGE, { kind: 'bond', by: 2 }],
        ledger: 'Walked a lost child home.',
      },
      {
        label: 'Point them to the nearest farm and go on',
        tone: 'earnest',
        reply:
          'You point out the smoke of a farmhouse and wait until they’re walking towards it. It will have to do.',
      },
    ],
  },
  {
    id: 'rival-team',
    regions: ['hill-road', 'river-road', 'forest-track', 'mountain-pass', 'dune-road'],
    text: 'Another team of shinobi is coming the other way, travel-stained and cocky, and their leader wants to know who you think you are.',
    options: [
      {
        label: 'Trade a few friendly insults',
        tone: 'tease',
        reply:
          'It ends in laughter and a shared flask of tea. They warn you about a washed-out bridge.',
        effects: [{ kind: 'mark', mark: 'heard-the-road' }],
      },
      {
        label: 'Stare them down',
        tone: 'challenge',
        reply:
          'Nobody blinks for a long moment. Then they shrug and walk on, and your crew stands a little taller.',
        effects: [{ kind: 'bond', by: 1 }],
      },
    ],
  },
  {
    id: 'hot-spring',
    regions: ['mountain-pass', 'hill-road'],
    text: 'Steam is rising from rocks just off the road: a hot spring, warm as a bath and entirely empty.',
    options: [
      {
        label: 'Take an hour to soak',
        tone: 'joke',
        reply: 'It is the best hour of the whole job. You climb out pink, loose and a little late.',
        effects: [LOST_HOUR, { kind: 'energy', by: 25 }, { kind: 'bond', by: 1 }],
        ledger: 'Soaked in a hot spring.',
      },
      {
        label: 'Promise yourself you’ll come back',
        tone: 'earnest',
        reply: 'You note the place and walk on, the smell of sulphur following you for a mile.',
      },
    ],
  },
  {
    id: 'shortcut',
    regions: ['hill-road', 'forest-track', 'mountain-pass'],
    text: 'A goat track leaves the road, climbing straight up where the road winds around. It would save hours, if it goes where it seems to.',
    options: [
      {
        label: 'Take the goat track',
        tone: 'challenge',
        reply: 'It goes where it seems to, mostly. You arrive scratched, sore and early.',
        effects: [
          { kind: 'thread', thread: 'daylight', by: 1 },
          { kind: 'harm', health: 4 },
        ],
        ledger: 'Took a goat track over the hill.',
      },
      {
        label: 'Keep to the road',
        tone: 'quiet',
        reply: 'The road winds on, safe and slow.',
      },
    ],
  },
  {
    id: 'fishermen-mending-nets',
    regions: ['coast-road', 'river-road'],
    text: 'Fishermen are mending nets on the shingle, and one of them calls out that their hands could use the help.',
    options: [
      {
        label: 'Sit and mend a net with them',
        tone: 'kind',
        reply:
          'Your knots are terrible, but they are kind about it, and they send you off with grilled fish wrapped in leaves.',
        effects: [LOST_HOUR, WARMS_CHARGE],
        ledger: 'Mended nets with fishermen on the shore.',
      },
      {
        label: 'Wave and keep walking',
        tone: 'quiet',
        reply: 'They wave back, and go on mending.',
      },
    ],
  },
  {
    id: 'washed-out-bridge',
    regions: ['river-road', 'forest-track'],
    text: 'The bridge is gone, nothing left but two posts and a rope sagging into brown water.',
    options: [
      {
        label: 'Ford it upstream where it’s wide',
        tone: 'earnest',
        reply: 'It takes an hour to find a ford, and you cross up to your waists in cold water.',
        effects: [LOST_HOUR, { kind: 'energy', by: -10 }],
        ledger: 'Forded a river where the bridge had gone.',
      },
      {
        label: 'Cross on the rope',
        tone: 'challenge',
        reply: 'Hand over hand across the rope. Everyone makes it. Nearly everyone stays dry.',
        effects: [{ kind: 'harm', health: 6 }, COOLS_CHARGE],
        ledger: 'Crossed a flooded river on a rope.',
      },
    ],
  },
];
