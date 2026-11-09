import type { LocationDef } from '../../../types';
import { SHORE_FINDS, SHORE_SPOTS } from '../../../shared/waters';

/**
 * The Land of Waves: fishing islands under a shipping tycoon's thumb, joined to the mainland
 * only by a bridge nobody has been allowed to finish. A room at the bridge builder's house,
 * a market with more empty stalls than full, work at the bridge site, and the forest and the
 * sea for chakra control, and the tide flats to fish when the boats can't go out.
 */
export const LAND_OF_WAVES: LocationDef = {
  id: 'land-of-waves',
  name: 'Land of Waves',
  kind: 'town',
  famous: true,
  epithet: 'Fishing islands and a great bridge',
  map: { x: 76.6, y: 46 },
  backdrop: 'bridge-coast',
  places: [
    {
      id: 'tazunas-house',
      kind: 'inn',
      name: 'Tazuna’s House',
      icon: 'house',
      blurb: 'A wooden house on stilts over the water. The spare room has a view of the bridge.',
      keeper: 'Tsunami, who won’t hear of you sleeping anywhere else',
      roomCost: 15,
    },
    {
      id: 'waves-market',
      kind: 'market',
      name: 'The Waterfront Market',
      icon: 'cart',
      blurb: 'More shutters than stalls',
      stalls: [
        {
          name: 'The Last Fish Stall',
          blurb: 'What the boats brought in, after the tycoon’s men took their share',
          hours: ['morning', 'afternoon'],
          icon: 'fish',
          foodIds: ['salt-grilled-mackerel', 'clam-miso-soup'],
        },
        {
          name: 'A Grocer With Half a Shelf',
          blurb: 'Rice by the cup, and nothing fresh',
          hours: ['morning', 'afternoon', 'evening'],
          icon: 'rice',
          foodIds: ['waves-rice-porridge'],
          ingredientIds: ['rice', 'river-fish', 'travel-rations'],
          cookbookIds: ['tide-and-shell'],
        },
      ],
    },
    {
      id: 'bridge-site',
      kind: 'missions',
      name: 'The Bridge Site',
      icon: 'board',
      blurb: 'Tazuna takes any help he can get',
      missionIds: [
        'waves-bridge-night-watch',
        'waves-market-shakedown',
        'waves-inari-ran-off',
        'arc-waves-cut-nets',
        'arc-waves-cut-ropes',
        'arc-waves-third-hand',
      ],
    },
    {
      id: 'waves-shore',
      kind: 'wilds',
      name: 'The Tide Flats',
      icon: 'wave',
      blurb: 'Rocks, sand and the end of a broken jetty',
      biome: 'shore',
      finds: SHORE_FINDS,
      spots: SHORE_SPOTS,
    },
    {
      id: 'great-bridge',
      kind: 'training',
      name: 'The Unfinished Bridge',
      icon: 'wave',
      blurb: 'Scaffolds, stone and open sea',
      trainingIds: ['scaffold-hauling', 'tide-pylon-stance'],
      exerciseIds: ['water-walking'],
    },
    {
      id: 'waves-forest',
      kind: 'training',
      name: 'The Forest Behind the House',
      icon: 'tree',
      blurb: 'Tall trees, scored with kunai marks',
      trainingIds: ['kunai-mark-climbs'],
      exerciseIds: ['tree-walking'],
    },
  ],
};
