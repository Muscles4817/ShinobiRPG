import type { RoadEventDef } from '@/systems/missions';

import { deepEvents } from './deepWildsDeep';
import { EDGE_EVENTS } from './deepWildsEdge';
import { HEART_EVENTS } from './deepWildsHeart';

/**
 * What the depths of wild country hold (`DEEP_WILDS`), as road events of each depth's region,
 * met on a venture: the edge, the deep with the pack's missing-nin hiding in it, and the heart.
 */
/*#__NO_SIDE_EFFECTS__*/
export function deepWildsEvents(missingNin: readonly (readonly string[])[]): RoadEventDef[] {
  return [...EDGE_EVENTS, ...deepEvents(missingNin), ...HEART_EVENTS];
}
