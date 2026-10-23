import type { RoadEventDef } from '@/systems/missions';

import { ROUGH_ROAD_EVENTS } from './roughEvents';
import { SEASON_ROAD_EVENTS } from './seasonEvents';
import { WILD_ROAD_EVENTS } from './wildEvents';

/**
 * Things that happen on the road, drawn by the region and the day. Written once for every pack
 * and every job: effects name only threads a job may keep (`daylight`, and `charge` for whoever
 * you look after), so a job without them simply isn't moved by that part. A ledger line says
 * only what was done; what it cost (the light) is added by the job's thread when it really moved.
 */

const LOST_HOUR = { kind: 'thread', thread: 'daylight', by: -1 } as const;
const WARMS_CHARGE = { kind: 'thread', thread: 'charge', by: 1 } as const;
const COOLS_CHARGE = { kind: 'thread', thread: 'charge', by: -1 } as const;

const EVERYDAY_ROAD_EVENTS: readonly RoadEventDef[] = [
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
          'You scrape the moss away and leave a rice cake in the bowl, and somebody says a word for the road ahead.',
        effects: [LOST_HOUR, WARMS_CHARGE],
        ledger: 'Tended a wayside shrine.',
      },
      {
        label: 'Bow as you pass',
        tone: 'quiet',
        reply: 'You bow to it without breaking step, and the road bends and takes it out of sight.',
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
          'He talks for a mile about tolls and prices and a stretch of road ahead where nobody likes to camp, and leaves you at a fork with half his gossip still untold.',
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
        reply:
          'You wait it out under the dripping cedars, watching the road turn to a stream, and set off again late and damp.',
        effects: [LOST_HOUR],
        ledger: 'Sheltered from a cloudburst.',
      },
      {
        label: 'Push on through it',
        tone: 'challenge',
        reply:
          'You march through it soaked to the bone and keep your time, though everyone is shivering by evening.',
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
          'Home turns out to be a farm an hour back the way you came, where the mother cries as well and then feeds you all.',
        effects: [LOST_HOUR, WARMS_CHARGE, { kind: 'bond', by: 2 }],
        ledger: 'Walked a lost child home.',
      },
      {
        label: 'Point them to the nearest farm and go on',
        tone: 'earnest',
        reply:
          'You point out the smoke of a farmhouse and wait at the crossroads until they are walking towards it.',
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
          'Nobody gives way, and in the end it is their leader who laughs and waves his team on past you.',
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
        reply:
          'You lie in the hot water with your eyes shut while the steam drifts off over the rocks, and climb out pink and late.',
        effects: [LOST_HOUR, { kind: 'energy', by: 25 }, { kind: 'bond', by: 1 }],
        ledger: 'Soaked in a hot spring.',
      },
      {
        label: 'Promise yourself you’ll come back',
        tone: 'earnest',
        reply:
          'You mark the place in your head and walk on, with the smell of sulphur following you for a mile.',
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
        reply:
          'It goes more or less where it seemed to, and you come down the far side scratched and sore and well ahead of time.',
        effects: [
          { kind: 'thread', thread: 'daylight', by: 1 },
          { kind: 'harm', health: 4 },
        ],
        ledger: 'Took a goat track over the hill.',
      },
      {
        label: 'Keep to the road',
        tone: 'quiet',
        reply:
          'You keep to the road as it winds round the hill, and the goat track climbs away above you.',
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
        reply: 'They wave back without looking up from the nets.',
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
        reply:
          'It takes an hour to find a ford upstream, and you cross it up to your waists in cold brown water.',
        effects: [LOST_HOUR, { kind: 'energy', by: -10 }],
        ledger: 'Forded a river where the bridge had gone.',
      },
      {
        label: 'Cross on the rope',
        tone: 'challenge',
        reply:
          'You go across hand over hand on the rope, and everyone makes it, though not everyone makes it dry.',
        effects: [{ kind: 'harm', health: 6 }, COOLS_CHARGE],
        ledger: 'Crossed a flooded river on a rope.',
      },
    ],
  },
  {
    id: 'patrol-boat-in-the-fog',
    regions: ['mist-sea'],
    text: 'Oars creak somewhere in the fog, closer with every stroke. The boatman puts his hand over the lantern.',
    options: [
      {
        label: 'Ship the oars and drift until they pass',
        tone: 'quiet',
        reply:
          'You sit without breathing while a long boat full of masks slides past an arm’s length away, and then the fog closes behind it.',
        effects: [LOST_HOUR],
        ledger: 'Drifted past a patrol boat in the fog.',
      },
      {
        label: 'Row hard for open water',
        tone: 'challenge',
        reply:
          'Someone shouts behind you and a kunai thunks into the stern, but the fog takes you before a second one comes.',
        effects: [{ kind: 'harm', health: 5 }, COOLS_CHARGE],
        ledger: 'Outran a patrol boat in the fog.',
      },
    ],
  },
  {
    id: 'empty-boat-drifting',
    regions: ['mist-sea'],
    text: 'A small boat drifts out of the mist with nobody in it, only a cloak, a child’s sandal and a forehead protector scratched through.',
    options: [
      {
        label: 'Tow it in and look for whoever it carried',
        tone: 'kind',
        reply:
          'You search the water until the light goes, and find nobody. The boatman says a word for them over the side.',
        effects: [LOST_HOUR, WARMS_CHARGE],
        ledger: 'Searched the water around an empty boat.',
      },
      {
        label: 'Let it drift by',
        tone: 'quiet',
        reply: 'The empty boat turns slowly in the swell and is gone into the white.',
      },
    ],
  },
];

/** Every road event every pack takes: everyday ones, the seasons' and the rough roads'. */
export const ROAD_EVENTS: readonly RoadEventDef[] = [
  ...EVERYDAY_ROAD_EVENTS,
  ...SEASON_ROAD_EVENTS,
  ...ROUGH_ROAD_EVENTS,
  ...WILD_ROAD_EVENTS,
];
export { TRAVELLERS } from './travellers';
