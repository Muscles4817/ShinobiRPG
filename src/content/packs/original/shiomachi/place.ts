import type { LocationDef } from '../../../types';
import { TOOL_IDS } from '../../../shared/tools';
import { SALT_LANTERNS_PORT_JOBS } from '../arcs/saltLanterns';
import { SHIOMACHI_JOB_IDS } from './jobs';

/**
 * Port Shiomachi, a fishing town a day down the coast road. Where a genin goes first: an inn to
 * sleep in, the fish market, the net-mender's (wire, hooks and oilskin), the breakwater to
 * drill on, the Salt Lantern, where sailors bring talk from other harbours, and the harbour
 * office's civilian work.
 */
export const PORT_SHIOMACHI: LocationDef = {
  id: 'port-shiomachi',
  name: 'Port Shiomachi',
  epithet: 'Fishing town',
  map: { x: 20, y: 54 },
  backdrop: 'coast',
  places: [
    {
      id: 'gulls-rest',
      kind: 'inn',
      name: 'The Gull’s Rest',
      icon: 'house',
      blurb: 'Salt on the windows, clean mats, and a view of the boats coming in.',
      keeper: 'Widow Isa, at the desk',
      roomCost: 25,
    },
    {
      id: 'fish-market',
      kind: 'market',
      name: 'The Fish Market',
      icon: 'fish',
      blurb: 'Loud from first light',
      stalls: [
        {
          name: 'The Morning Catch',
          blurb: 'Whatever came in on the tide',
          hours: ['morning', 'afternoon'],
          icon: 'fish',
          foodIds: ['harbour-sashimi', 'grilled-squid', 'harbour-clam-soup'],
        },
        {
          name: 'Net-Side Grill',
          blurb: 'Skewers for the dock hands',
          hours: ['morning', 'afternoon', 'evening'],
          icon: 'grill',
          foodIds: ['rice-ball', 'grilled-squid', 'fishermans-stew'],
        },
        {
          name: 'Drying Racks',
          blurb: 'Fish and kelp that keep for weeks',
          hours: ['morning', 'afternoon'],
          icon: 'veg',
          foodIds: [],
          ingredientIds: [
            'dried-fish',
            'kelp',
            'sea-salt',
            'sea-bream',
            'clams',
            'travel-rations',
            'rice',
          ],
          cookbookIds: ['recipes-from-the-port'],
        },
      ],
    },
    {
      id: 'net-menders',
      kind: 'gear',
      name: 'The Net-Mender’s',
      icon: 'anvil',
      blurb: 'Wire, hooks and oilskin',
      hours: ['morning', 'afternoon'],
      keeper: 'Grandfather Oki, net-mender',
      gearIds: ['fishhook-darts', 'gutting-needles', 'oilskin-coat', 'cork-float-charm'],
      toolIds: TOOL_IDS,
    },
    {
      id: 'breakwater',
      kind: 'training',
      name: 'The Breakwater',
      icon: 'wave',
      blurb: 'Stone, spray and the tide',
      trainingIds: ['tide-runs', 'net-hauling', 'spray-stance'],
      exerciseIds: ['water-walking'],
    },
    {
      id: 'salt-lantern',
      kind: 'tavern',
      name: 'The Salt Lantern',
      icon: 'sake',
      blurb: 'Sailors’ talk after dark',
      hours: ['evening', 'night'],
      keeper: 'Captain Bo, retired from the sea and not happy about it',
      foodIds: ['harbour-clam-soup', 'fishermans-stew', 'roasted-barley-tea'],
      roundCost: 30,
      cupCost: 10,
      pastimes: [
        {
          id: 'knot-race',
          name: 'Knot races',
          scene:
            'Two sailors race to tie a bowline round a post before the sand glass runs out. The loser buys.',
        },
        {
          id: 'arm-wrestling',
          name: 'Arm-wrestling',
          scene:
            'A barrel turned on end, two elbows on it and a ring of dock hands shouting. Captain Bo pretends not to watch.',
        },
      ],
    },
    {
      id: 'harbour-office',
      kind: 'missions',
      name: 'The Harbour Office',
      icon: 'board',
      blurb: 'Civilian work for an outsider',
      missionIds: [...SHIOMACHI_JOB_IDS, ...SALT_LANTERNS_PORT_JOBS],
    },
  ],
};
