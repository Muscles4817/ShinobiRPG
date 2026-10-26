import type { RoadEventDef } from '@/systems/missions';

/**
 * The deep of wild country, where people go when they don't want to be found: missing-nin,
 * smugglers, deserters and the odd hermit. The first touched beasts live here too. Each pack
 * names its own missing-nin (`deepEvents`), since the villages they ran from are the pack's.
 */

const DEEP = ['woods-deep', 'mountain-deep', 'marsh-deep', 'shore-deep', 'desert-deep'];

const HIDERS: readonly RoadEventDef[] = [
  {
    kind: 'encounter',
    danger: 'deadly',
    id: 'smugglers-cache',
    regions: DEEP,
    rarity: 'uncommon',
    text: 'A cache of crates under an oiled cloth, a long way from any road. Someone is sitting on them.',
    parties: [['smuggler', 'smuggler'], ['smuggler-boss'], ['smuggler-boss', 'smuggler']],
    template: 'bandit-camp',
    flavour: {
      terrain: 'A clearing with the crates in the middle and a single way out the far side.',
    },
    around: 'You leave them to their crates and go on by another way.',
  },
  {
    kind: 'encounter',
    danger: 'deadly',
    id: 'deserters-fire',
    regions: DEEP,
    text: 'Smoke from a fire that nobody is trying to hide. Three people sit round it in what is left of their uniforms.',
    parties: [['bandit-deserter'], ['bandit-deserter', 'bandit-firebrand'], ['mercenary-veteran']],
    template: 'bandit-camp',
    around: 'You circle wide of the smoke and keep the wind in your face.',
  },
  {
    id: 'hermits-hut',
    regions: DEEP,
    rarity: 'uncommon',
    text: 'A hut of woven branches with a garden of beans in front of it. An old woman is weeding, and doesn’t look up.',
    options: [
      {
        label: 'Help her weed',
        tone: 'kind',
        reply:
          'You work down the row beside her until the light goes. When you finish she nods once, and that is all she says.',
        effects: [{ kind: 'energy', by: -10 }],
        ledger: 'Weeded a hermit’s beans.',
      },
      {
        label: 'Ask what lives further in',
        tone: 'curious',
        reply:
          '“Things that don’t like visitors,” she says. “Same as me.” She goes on weeding until you leave.',
      },
      {
        label: 'Leave her in peace',
        tone: 'quiet',
        reply: 'You nod to her and go on. She doesn’t nod back.',
      },
    ],
  },
];

/** The touched beasts of each country, and what is worth stopping for there. */
const COUNTRY: readonly RoadEventDef[] = [
  {
    kind: 'encounter',
    danger: 'deadly',
    id: 'lights-between-the-trunks',
    regions: ['woods-deep'],
    text: 'There is a fox sitting in the path ahead. When you blink, it is a little to the left of where it was.',
    parties: [['mist-fox'], ['echo-shrike'], ['lantern-moths']],
    template: 'beast',
    ground: 'forest',
    around: 'You turn your back on it and walk a long way round, and it doesn’t follow.',
  },
  {
    kind: 'sight',
    id: 'a-fallen-giant',
    regions: ['woods-deep'],
    text: 'A cedar has come down across the valley, so big that a whole wood of saplings is growing along its trunk.',
    outcome:
      'You walk its length from root to crown, and by the end you can name every tree on it.',
    reward: { intellect: 1 },
  },
  {
    kind: 'encounter',
    danger: 'deadly',
    id: 'a-nest-on-the-crag',
    regions: ['mountain-deep'],
    text: 'A grey nest is stuck to the crag above you, humming. The sound comes down to you clear as a bell.',
    parties: [['bell-nest-wasps'], ['echo-shrike']],
    template: 'beast',
    around: 'You back away down the slope and cross the crag further along.',
  },
  {
    kind: 'sight',
    id: 'above-the-cloud',
    regions: ['mountain-deep'],
    text: 'You climb out of the cloud onto a ridge in sunlight, and the cloud lies below you like a sea.',
    outcome: 'You sit on the ridge and breathe the thin air slowly until it stops hurting.',
    reward: { stamina: 1 },
  },
  {
    kind: 'encounter',
    danger: 'deadly',
    id: 'a-fog-that-croaks',
    regions: ['marsh-deep'],
    text: 'A fog sits on the water ahead, and something in the middle of it croaks.',
    parties: [['mist-toad'], ['mist-toad', 'mist-toad'], ['lantern-moths']],
    template: 'beast',
    around: 'You wade out of the fog the way you came and find another channel.',
  },
  {
    kind: 'sight',
    id: 'cranes-dancing',
    regions: ['marsh-deep'],
    text: 'On a mudbank in the reeds, two cranes are dancing, wings open, bowing to each other.',
    outcome: 'You stay low in the reeds and watch how they move, all balance and no hurry.',
    reward: { speed: 1 },
  },
  {
    kind: 'encounter',
    danger: 'deadly',
    id: 'ink-in-the-rock-pools',
    regions: ['shore-deep'],
    text: 'The rock pool ahead is black with ink, and the gulls on the rocks are watching you, not the sea.',
    parties: [['ink-squid'], ['storm-gull-flock'], ['ink-squid', 'storm-gull-flock']],
    template: 'beast',
    around: 'You climb the cliff above the pools and come down past them.',
  },
  {
    kind: 'sight',
    id: 'a-sea-cave',
    regions: ['shore-deep'],
    text: 'At low water a cave opens in the cliff, and the sea inside it glows green.',
    outcome: 'You wade in as far as you dare and watch the light move on the roof.',
    reward: { perception: 1 },
  },
  {
    kind: 'encounter',
    danger: 'deadly',
    id: 'a-hunting-pack',
    regions: ['desert-deep'],
    text: 'Hyenas are laughing somewhere behind the dunes, and the laughing is coming nearer.',
    parties: [
      ['striped-hyena', 'striped-hyena', 'striped-hyena'],
      ['desert-lion', 'desert-lion'],
    ],
    template: 'beast',
    ground: 'desert',
    around: 'You walk on through the night and leave them behind with the moon.',
  },
  {
    kind: 'sight',
    id: 'a-buried-wall',
    regions: ['desert-deep'],
    text: 'The wind has uncovered the top of a wall, carved with figures nobody has seen for a thousand years.',
    outcome: 'You trace the carvings with your fingers, and they are shinobi, making signs.',
    reward: { intellect: 1 },
  },
];

/** The deep's events, with the pack's missing-nin hiding out in all of it. */
/*#__NO_SIDE_EFFECTS__*/
export function deepEvents(missingNin: readonly (readonly string[])[]): RoadEventDef[] {
  return [
    {
      kind: 'encounter',
      danger: 'deadly',
      id: 'a-hideout',
      regions: DEEP,
      text: 'There is a lean-to under an overhang, swept clean, and a forehead protector with a scratch through it hanging on a peg.',
      parties: missingNin,
      template: 'lone-rogue',
      flavour: {
        terrain:
          'The overhang at their back, and open ground in front where they can see you come.',
      },
      around: 'You back off without a sound and give the overhang a day’s walk of room.',
    },
    ...HIDERS,
    ...COUNTRY,
  ];
}
