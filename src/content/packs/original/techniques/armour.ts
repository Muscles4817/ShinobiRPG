import type { TechniqueDef } from '@/systems/techniques';

/**
 * Cast armour (the `shroud` verb): techniques that put armour on their user and cost chakra
 * every exchange they hold. A plain chakra skin is on the open shelves; the elemental shells
 * need their nature.
 */
export const CAST_ARMOUR: readonly TechniqueDef[] = [
  {
    id: 'lantern-skin',
    name: 'Lantern Skin',
    description: 'Chakra drawn tight over the body, thin as lantern paper and as hard to tear.',
    discipline: 'ninjutsu',
    effects: [{ verb: 'shroud', power: 8, kind: 'chakra' }],
    chakraCost: 8,
    rank: 'C',
    difficulty: 70,
  },
  {
    id: 'kiln-glaze',
    name: 'Kiln Glaze',
    description: 'The skin greys and glazes like fired clay; blows and blades skid off it.',
    discipline: 'ninjutsu',
    element: 'earth',
    needs: { nature: 'earth' },
    effects: [{ verb: 'shroud', power: 12, kind: 'earth' }],
    chakraCost: 12,
    rank: 'B',
    difficulty: 105,
  },
  {
    id: 'dune-shell',
    name: 'Dune Shell',
    description:
      'Fine sand climbs the body and sets into a shell that takes anything, for a while.',
    discipline: 'ninjutsu',
    element: 'earth',
    needs: { nature: 'earth' },
    effects: [{ verb: 'shroud', power: 12, kind: 'sand' }],
    chakraCost: 14,
    rank: 'B',
    difficulty: 110,
  },
  {
    id: 'storm-mantle',
    name: 'Storm Mantle',
    description: 'Lightning runs over the skin like a cloak; its wearer moves like the strike.',
    discipline: 'ninjutsu',
    element: 'lightning',
    needs: { nature: 'lightning' },
    effects: [{ verb: 'shroud', power: 16, kind: 'lightning' }],
    chakraCost: 18,
    rank: 'A',
    difficulty: 140,
  },
];
