import type { RoadEventDef } from '@/systems/missions';

import { deepEvents } from './deepWildsDeep';
import { EDGE_EVENTS } from './deepWildsEdge';
import { HEART_EVENTS, OWL_ON_THE_PINE } from './deepWildsHeart';

/** What a pack puts in its deep wilds: its missing-nin, and when the old owl is about. */
export interface DeepWildsCast {
  readonly missingNin: readonly (readonly string[])[];
  /** The world marks the owl waits on, where the pack's story tells of it. */
  readonly owl?: Pick<RoadEventDef, 'needsWorldMark' | 'closedBy'>;
}

/**
 * What the depths of wild country hold (`DEEP_WILDS`), as road events of each depth's region,
 * met on a venture: the edge, the deep with the pack's missing-nin hiding in it, and the heart.
 */
/*#__NO_SIDE_EFFECTS__*/
export function deepWildsEvents({ missingNin, owl = {} }: DeepWildsCast): RoadEventDef[] {
  return [
    ...EDGE_EVENTS,
    ...deepEvents(missingNin),
    ...HEART_EVENTS,
    { ...OWL_ON_THE_PINE, ...owl },
  ];
}
