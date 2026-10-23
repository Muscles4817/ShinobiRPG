import type { RoadEventDef } from '@/systems/missions';

/**
 * Road events of the kinds the game plays itself (`docs/design/journeys-plan.md` 3.5): foes on
 * the road from the shared bestiary, never worse than the road's danger and only on a trip of
 * your own; something good to eat lying by it; the weather turning; and a sight worth stopping
 * for, which teaches a little.
 */

const FOES: readonly RoadEventDef[] = [
  {
    kind: 'encounter',
    id: 'wolves-on-the-track',
    regions: ['forest-track', 'hill-road', 'mountain-pass'],
    text: 'Grey shapes cross the road ahead and stop among the trees to watch you come.',
    parties: [['grey-wolf'], ['grey-wolf', 'grey-wolf'], ['wolf-pack-leader', 'grey-wolf']],
    template: 'beast',
    ground: 'forest',
    around:
      'You leave the road and climb a long way round through the brush until the wolves are behind you.',
  },
  {
    kind: 'encounter',
    id: 'footpads',
    regions: ['hill-road', 'river-road', 'forest-track'],
    rarity: 'uncommon',
    text: 'Two men sit on a wall by the road with their hoods up, and they get to their feet as you come near.',
    parties: [
      ['bandit-cutpurse'],
      ['bandit-cutpurse', 'bandit-knifeman'],
      ['bandit-deserter', 'bandit-knifeman'],
    ],
    template: 'bandit-camp',
    flavour: {
      terrain:
        'A wall, a ditch behind it and a field beyond, with nowhere much to hide on either side.',
    },
    around: 'You turn off down a cart track and come back to the road a long way past the wall.',
  },
  {
    kind: 'encounter',
    id: 'bear-in-the-pass',
    regions: ['mountain-pass'],
    danger: 'deadly',
    rarity: 'uncommon',
    text: 'An old bear is turning over stones in the middle of the pass, in no hurry to be anywhere else.',
    parties: [['old-cave-bear']],
    template: 'beast',
    around:
      'You climb the scree above the pass and pick your way along it until the bear is far below you.',
  },
  {
    kind: 'encounter',
    id: 'strand-scavengers',
    regions: ['coast-road'],
    text: 'Down on the strand something is fighting over a dead seal, and it turns as your shadow falls across the sand.',
    parties: [['wild-dog', 'wild-dog'], ['shore-crab']],
    template: 'beast',
    flavour: {
      terrain: 'Wet sand, a line of rocks and the sea coming in, with the road above on the dunes.',
    },
    around:
      'You keep to the dunes above the strand, wading through loose sand, and leave them to their meal.',
  },
  {
    kind: 'encounter',
    id: 'hunting-in-the-dunes',
    regions: ['dune-road'],
    text: 'Tracks cross the road ahead, fresh and deep, and the thing that made them is lying in the shade of the next dune.',
    parties: [['sand-viper'], ['striped-hyena', 'striped-hyena'], ['desert-lion']],
    template: 'beast',
    ground: 'desert',
    flavour: {
      terrain:
        'Open sand, a ridge of dune and a stand of thorn, with the heat coming up off the ground.',
    },
    around:
      'You swing wide over the dunes and lose the road for half the day before you find it again.',
  },
];

const FINDS: readonly RoadEventDef[] = [
  {
    kind: 'find',
    id: 'by-the-woodland-path',
    regions: ['forest-track', 'hill-road'],
    text: 'Off the path, in the damp under the trees, there is food for the pot if you stoop for it.',
    ingredientIds: ['wild-mushrooms', 'butterbur', 'mountain-yam'],
    taken: 'You fill a cloth with what you can carry and tie it to your pack.',
  },
  {
    kind: 'find',
    id: 'in-the-ditch',
    regions: ['river-road'],
    text: 'The ditch beside the river road runs clear and cold, and it is full of good greens.',
    ingredientIds: ['watercress', 'water-dropwort', 'water-chestnuts'],
    taken: 'You wade in to the knees and come out with your hands full.',
  },
  {
    kind: 'find',
    id: 'on-the-tideline',
    regions: ['coast-road'],
    text: 'The tide has gone out a long way and left the rocks below the road covered in weed.',
    ingredientIds: ['rock-laver', 'sea-lettuce'],
    taken: 'You climb down and pick the best of it before the tide turns.',
  },
  {
    kind: 'find',
    id: 'at-the-dry-well',
    regions: ['dune-road'],
    text: 'An old well by the road has gone dry, but the plants round it have not.',
    ingredientIds: ['wild-dates', 'prickly-pear', 'desert-sage', 'desert-truffles'],
    taken: 'You gather what you can without the thorns getting you, and wrap it well.',
  },
  {
    kind: 'find',
    id: 'up-the-pass',
    regions: ['mountain-pass'],
    text: 'Where a stream crosses the pass, the banks are green with mountain herbs.',
    ingredientIds: ['mountain-greens', 'wild-ginger'],
    taken: 'You pick them by the stream and pack them in wet moss to keep.',
  },
];

const WEATHER: readonly RoadEventDef[] = [
  {
    kind: 'weather',
    id: 'downpour',
    regions: ['hill-road', 'river-road', 'forest-track', 'coast-road'],
    seasons: ['Spring', 'Summer', 'Autumn'],
    text: 'The sky goes dark in the west, and the first heavy drops come down on the road.',
    wait: {
      reply: 'You sit it out under a farmer’s eaves until the rain stops and the road steams.',
      slots: 1,
    },
    push: {
      reply: 'You walk on with your head down, soaked through and slipping in the mud.',
      energy: 15,
      health: 4,
    },
  },
  {
    kind: 'weather',
    id: 'sandstorm',
    regions: ['dune-road'],
    text: 'The wind gets up and the horizon goes brown, then gone, as the sand comes for you.',
    wait: {
      reply: 'You lie up behind a dune with your face wrapped until the wind dies away.',
      slots: 2,
    },
    push: {
      reply: 'You lean into the wind and walk by feel, sand in your teeth and in your eyes.',
      energy: 20,
      health: 8,
    },
  },
  {
    kind: 'weather',
    id: 'fog-in-the-pass',
    regions: ['mountain-pass'],
    text: 'Cloud comes down over the pass until you can barely see your own feet on the stones.',
    wait: {
      reply: 'You sit on a rock wrapped in your cloak until the cloud lifts off the pass.',
      slots: 1,
    },
    push: {
      reply: 'You feel your way along the stones and fall more than once before the cloud thins.',
      energy: 10,
      health: 6,
    },
  },
];

const SIGHTS: readonly RoadEventDef[] = [
  {
    kind: 'sight',
    id: 'herons-at-first-light',
    regions: ['river-road'],
    text: 'A heron is standing in the shallows below the road, perfectly still, watching the water.',
    outcome:
      'You watch until it strikes, quicker than you can follow, and learn how stillness looks.',
    reward: { perception: 1 },
  },
  {
    kind: 'sight',
    id: 'falling-stars',
    regions: ['hill-road', 'dune-road'],
    rarity: 'uncommon',
    text: 'The sky in the east is still dark enough for stars, and they are falling, one after another.',
    outcome:
      'You lie on your back by the road until the light comes and think about nothing at all.',
    reward: { willpower: 1 },
  },
  {
    kind: 'sight',
    id: 'whale-off-the-point',
    regions: ['coast-road'],
    rarity: 'rare',
    text: 'Far out beyond the point, the sea breaks white where no rock is, and then again.',
    outcome: 'A whale rises and rolls and goes down slow, and you stay until it has gone.',
    reward: { perception: 1 },
  },
  {
    kind: 'sight',
    id: 'hawk-on-the-wind',
    regions: ['mountain-pass', 'forest-track'],
    text: 'A hawk hangs on the wind over the road, hardly moving its wings.',
    outcome: 'You follow how it holds itself on the air, and see it drop when it chooses.',
    reward: { speed: 1 },
  },
];

export const WILD_ROAD_EVENTS: readonly RoadEventDef[] = [...FOES, ...FINDS, ...WEATHER, ...SIGHTS];
