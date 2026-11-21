import type { TechniqueDef } from '@/systems/techniques';

/**
 * Canon ninjutsu techniques for the versus fighters who use them, drafted from Narutopedia's facts (rank,
 * art, element, range and users; `prototypes/narutopedia/`). The effects are a first reading
 * of what the wiki says each does, for review; the descriptions are our own words.
 */
export const WIKI_NINJUTSU: readonly TechniqueDef[] = [
  {
    id: 'air-sand-protective-wall',
    name: 'Air Sand Protective Wall',
    description:
      'A vast shield of hardened sand lifts from the ground and hangs in the air between the user and the blast.',
    discipline: 'ninjutsu',
    effects: [{ verb: 'substitute', power: 16 }],
    chakraCost: 0,
    dustCost: 30,
    dustDraw: 30,
    rank: 'A',
    difficulty: 140,
  },
  {
    id: 'armour-of-sand',
    name: 'Armour of Sand',
    description:
      'A thin skin of sand closes over the body and cracks away under blows that slip past the shield.',
    discipline: 'ninjutsu',
    effects: [{ verb: 'shroud', power: 12, kind: 'sand' }],
    chakraCost: 0,
    dustCost: 20,
    rank: 'B',
    difficulty: 105,
  },
  {
    id: 'armour-of-sticky-gold',
    name: 'Armour of Sticky Gold',
    description: 'Gold sweat seeps from every pore and sets hard as steel over the whole body.',
    discipline: 'ninjutsu',
    effects: [{ verb: 'shroud', power: 12, kind: 'earth' }],
    chakraCost: 0,
    rank: 'B',
    difficulty: 105,
  },
  {
    id: 'barrier-method-formation',
    name: 'Barrier Method Formation',
    description:
      'Tags hidden in the shade wait for a foot to cross them, then a barrier snaps shut around the intruder.',
    discipline: 'ninjutsu',
    reach: ['close', 'mid'],
    effects: [{ verb: 'trap', power: 16 }],
    chakraCost: 0,
    rank: 'B',
    difficulty: 105,
  },
  {
    id: 'canopy-method-formation',
    name: 'Barrier: Canopy Method Formation',
    description:
      'A sphere of sensing chakra swells out from the user and feels every movement inside it.',
    discipline: 'ninjutsu',
    effects: [{ verb: 'sense', power: 14 }],
    chakraCost: 0,
    rank: 'B',
    difficulty: 105,
  },
  {
    id: 'toad-gourd-prison',
    name: 'Barrier: Toad Gourd Prison',
    description:
      'A little gourd toad flicks out its tongue, wraps the foe and hauls them into the walled dark of its stomach.',
    discipline: 'ninjutsu',
    reach: ['close', 'mid'],
    effects: [{ verb: 'pin', power: 16 }],
    chakraCost: 0,
    rank: 'B',
    difficulty: 105,
  },
  {
    id: 'kagutsuchi',
    name: 'Blaze Style: Kagutsuchi',
    description:
      'The black flames of Amaterasu are bent into spikes that lash out at the foe and cling.',
    discipline: 'ninjutsu',
    element: 'fire',
    needs: { nature: 'fire' },
    reach: ['close', 'mid'],
    effects: [
      { verb: 'damage', power: 24 },
      { verb: 'afflict', power: 8, harm: 'burn' },
    ],
    chakraCost: 0,
    rank: 'A',
    difficulty: 140,
  },
  {
    id: 'body-fluid-shedding',
    name: 'Body Fluid Shedding Technique',
    description:
      'The body melts into a wash of chakra-laced fluid and slides out of the blow, leaving only a wet trail.',
    discipline: 'ninjutsu',
    effects: [{ verb: 'substitute', power: 14 }],
    chakraCost: 0,
    rank: 'B',
    difficulty: 105,
  },
  {
    id: 'cat-flame-roaring-fire',
    name: 'Cat Flame Roaring Fire',
    description:
      'A great ball of blue flame swells in the mouth and bursts out to smash the foe to rubble.',
    discipline: 'ninjutsu',
    element: 'fire',
    needs: { nature: 'fire' },
    reach: ['close', 'mid'],
    effects: [
      { verb: 'damage', power: 24 },
      { verb: 'afflict', power: 8, harm: 'burn' },
    ],
    chakraCost: 0,
    rank: 'A',
    difficulty: 140,
  },
  {
    id: 'jugo-chain',
    name: 'Chain',
    description:
      'An arm stretches far across the field, seizes the foe and flings them back to the user.',
    discipline: 'ninjutsu',
    reach: ['mid', 'far'],
    effects: [
      { verb: 'damage', power: 10 },
      { verb: 'knock', power: 8, to: 'close' },
    ],
    chakraCost: 0,
    rank: 'C',
    difficulty: 80,
  },
  {
    id: 'claw-creation',
    name: 'Claw Creation Technique',
    description:
      'Nails on hands and feet lengthen and harden into claws tough enough to meet a sword.',
    discipline: 'ninjutsu',
    effects: [
      { verb: 'empower', power: 10, boosts: ['taijutsu', 'strength'], healthPerExchange: 2 },
    ],
    chakraCost: 0,
    rank: 'C',
    difficulty: 80,
  },
  {
    id: 'clone-great-explosion',
    name: 'Clone Great Explosion',
    description:
      'A shadow clone steps in to be struck and erupts in a roaring blast the moment the foe closes on it.',
    discipline: 'ninjutsu',
    reach: ['close'],
    effects: [
      { verb: 'clone', power: 10, kind: 'shadow', strikes: true },
      { verb: 'trap', power: 16, dazes: true },
    ],
    chakraCost: 0,
    rank: 'A',
    difficulty: 140,
  },
  {
    id: 'concealed-sand-picture-cat',
    name: 'Concealed Sand Picture Cat',
    description:
      'Chakra-laced sand drifts over the ground and through the air, feeling for every body that touches it.',
    discipline: 'ninjutsu',
    effects: [{ verb: 'sense', power: 14 }],
    chakraCost: 0,
    dustCost: 15,
    rank: 'C',
    difficulty: 80,
  },
  {
    id: 'crow-clone',
    name: 'Crow Clone Technique',
    description:
      'Dozens of crows swirl together into a copy of the user that fights and scatters back into birds.',
    discipline: 'ninjutsu',
    effects: [{ verb: 'clone', power: 8, kind: 'illusion' }],
    chakraCost: 0,
    rank: 'C',
    difficulty: 80,
  },
  {
    id: 'imperial-funeral-seal',
    name: 'Desert Layered Imperial Funeral Seal',
    description:
      'Layer on layer of sand buries the foe and presses into a great pyramid that seals them inside.',
    discipline: 'ninjutsu',
    reach: ['close', 'mid'],
    accuracy: 'wild',
    effects: [
      { verb: 'pin', power: 18 },
      { verb: 'seal', power: 17 },
    ],
    chakraCost: 0,
    dustCost: 40,
    dustDraw: 40,
    rank: 'A',
    difficulty: 140,
  },
  {
    id: 'desert-suspension',
    name: 'Desert Suspension',
    description:
      'A platform of sand lifts the user into the air, well out of reach of blows below.',
    discipline: 'ninjutsu',
    effects: [{ verb: 'move', power: 6, to: 'far' }],
    chakraCost: 0,
    dustCost: 15,
    rank: 'C',
    difficulty: 80,
  },
  {
    id: 'desert-wave',
    name: 'Desert Wave',
    description: 'Sand rises into a stone-hard wall in front of the user and takes the blow.',
    discipline: 'ninjutsu',
    effects: [{ verb: 'substitute', power: 12 }],
    chakraCost: 0,
    dustCost: 15,
    rank: 'C',
    difficulty: 80,
  },
];
