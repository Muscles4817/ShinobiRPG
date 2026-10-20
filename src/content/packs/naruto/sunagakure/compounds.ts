import type { PlaceDef } from '../../../types';

/**
 * The great families' compounds. Three stand in the Families' Quarter on the ring's inner
 * cliffs; the sand priests' stands outside the wall by the barge yards, in a quarter of its
 * own, because nobody inside the wall will have them.
 */
export const SUNA_COMPOUNDS: readonly PlaceDef[] = [
  {
    id: 'families-quarter',
    kind: 'quarter',
    name: 'The Families’ Quarter',
    icon: 'torii',
    blurb: 'The great houses, cut into the cliffs of the ring',
    compoundIds: ['sabaku-compound', 'akasuna-compound', 'kamaitachi-compound'],
  },
  {
    id: 'outer-yards',
    kind: 'quarter',
    name: 'The Outer Yards',
    icon: 'wind',
    blurb: 'Outside the wall, where the barges come in',
    compoundIds: ['sakyu-compound'],
  },
  {
    id: 'sabaku-compound',
    kind: 'compound',
    name: 'The Kazekage’s Residence',
    icon: 'house',
    blurb: 'A domed house at the foot of the tower, with a guard at every door',
    clanId: 'sabaku',
  },
  {
    id: 'akasuna-compound',
    kind: 'compound',
    name: 'The Red Sand Workshops',
    icon: 'seal',
    blurb: 'Half-built puppets hanging from the rafters, and the smell of lacquer and poison',
    clanId: 'akasuna',
  },
  {
    id: 'kamaitachi-compound',
    kind: 'compound',
    name: 'The Sail Lofts',
    icon: 'wind',
    blurb: 'Barge sails stretched to dry across the courtyard, and fans hung on every wall',
    clanId: 'kamaitachi',
  },
  {
    id: 'sakyu-compound',
    kind: 'compound',
    name: 'The Priests’ Yards',
    icon: 'torii',
    blurb: 'Low houses of sand-brick beside the barges, and a shrine to a god asleep in the sand',
    clanId: 'sakyu',
  },
];
