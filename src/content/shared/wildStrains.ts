import type { StrainDef } from '../strains';

/**
 * Insects found wild, in the country of every pack: each strong in a quality or two and with a
 * gift worth crossing into a hive. Found by searching a wild place of their biome
 * (`seekInsects`), studied in a jar at home and crossed in (`docs/design/retinue-plan.md`).
 */
export const WILD_STRAINS: readonly StrainDef[] = [
  {
    id: 'paper-wasp',
    name: 'Paper Wasps',
    description: 'Striped and quick, with nests like grey paper lanterns under the eaves of trees.',
    species: 'paper wasp',
    family: 'wasp',
    qualities: { speed: 'B', bite: 'B', toughness: 'D', brood: 'D', size: 'D', senses: 'C' },
    gifts: { venom: 1 },
    fears: ['fire'],
    wild: { biomes: ['woods'] },
  },
  {
    id: 'bark-moth',
    name: 'Bark Moths',
    description:
      'Moths the colour of old bark. You only see them when they move, and they rarely do.',
    species: 'bark moth',
    family: 'moth',
    qualities: { speed: 'D', bite: 'E', toughness: 'D', brood: 'C', size: 'C', senses: 'C' },
    gifts: { camouflage: 2 },
    fears: ['fire'],
    wild: { biomes: ['woods', 'mountain'], night: true },
  },
  {
    id: 'marsh-midge',
    name: 'Marsh Midges',
    description:
      'A haze of midges over still water. Each is almost nothing; there are always more, and they leave you oddly tired.',
    species: 'marsh midge',
    family: 'fly',
    qualities: { speed: 'C', bite: 'E', toughness: 'E', brood: 'A', size: 'A', senses: 'D' },
    gifts: { drain: 1 },
    fears: ['wind'],
    wild: { biomes: ['marsh'] },
  },
  {
    id: 'water-beetle',
    name: 'Water Beetles',
    description:
      'Black beetles that row along the shallows, hard-shelled and dull as river stones.',
    species: 'water beetle',
    family: 'beetle',
    qualities: { speed: 'D', bite: 'C', toughness: 'A', brood: 'D', size: 'D', senses: 'D' },
    gifts: { camouflage: 1 },
    fears: ['fire'],
    wild: { biomes: ['river'] },
  },
  {
    id: 'rock-locust',
    name: 'Rock Locusts',
    description: 'Grey locusts that rise off the scree in a dust that stings the eyes.',
    species: 'rock locust',
    family: 'locust',
    qualities: { speed: 'B', bite: 'C', toughness: 'B', brood: 'C', size: 'D', senses: 'D' },
    gifts: { blinding: 1 },
    fears: ['water'],
    wild: { biomes: ['mountain'] },
  },
  {
    id: 'sand-flea',
    name: 'Sand Fleas',
    description: 'Tiny jumping things in the wrack line, gone before you see them land.',
    species: 'sand flea',
    family: 'fly',
    qualities: { speed: 'A', bite: 'D', toughness: 'D', brood: 'B', size: 'B', senses: 'D' },
    gifts: { venom: 1 },
    fears: ['water'],
    wild: { biomes: ['shore'] },
  },
];
