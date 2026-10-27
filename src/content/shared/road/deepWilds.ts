import type { RoadEventDef, WorldGate } from '@/systems/missions';

import { deepEvents } from './deepWildsDeep';
import { EDGE_EVENTS } from './deepWildsEdge';
import { HEART_EVENTS } from './deepWildsHeart';

/** How a pack's own story bounds one of the shared events: what it waits on, and once only. */
export type RoadEventGate = WorldGate & Pick<RoadEventDef, 'once'>;

/** What a pack puts in its deep wilds: its missing-nin, and gates its stories set on events. */
export interface DeepWildsCast {
  readonly missingNin: readonly (readonly string[])[];
  /** By event id: an elder its story tells of, met only where the story leaves it. */
  readonly gates?: Readonly<Record<string, RoadEventGate>>;
}

/**
 * What the depths of wild country hold (`DEEP_WILDS`), as road events of each depth's region,
 * met on a venture: the edge, the deep with the pack's missing-nin hiding in it, and the heart.
 */
/*#__NO_SIDE_EFFECTS__*/
export function deepWildsEvents({ missingNin, gates = {} }: DeepWildsCast): RoadEventDef[] {
  const events = [...EDGE_EVENTS, ...deepEvents(missingNin), ...HEART_EVENTS];
  return events.map((e) => ({ ...e, ...gates[e.id] }));
}
