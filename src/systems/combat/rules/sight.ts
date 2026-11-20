import type { Delivery } from '@/systems/techniques';

import type { RangeBand } from '../contract';

/**
 * What a defender can see of an attack as it comes (`docs/design/technique-tags.md`, "What you can
 * see"): one from someone they can't see (hidden, and no one of theirs watching) is read far
 * worse, since nothing of its making shows until it lands; and one that travels (thrown, breathed,
 * through or out of the ground, down from above) is seen coming more the further it has to come.
 * Both bend the read in the avoid roll (`plan/avoid.ts`) and a counter's (`plan/counter.ts`).
 */

/** The read of an attack from someone unseen, against one seen. */
export const UNSEEN_READ = 0.6;

/** How much longer the eye has on an attack that travels, by how far it comes. */
export const TRAVEL_READ: Readonly<Record<RangeBand, number>> = { close: 1, mid: 1.1, far: 1.3 };

/** Ways of reaching a target that cross the gap, and so take time over it. */
const TRAVELLING: ReadonlySet<Delivery> = new Set([
  'thrown',
  'breath',
  'gas',
  'along-ground',
  'from-ground',
  'from-above',
]);

export function travelsBy(delivery: Delivery): boolean {
  return TRAVELLING.has(delivery);
}

/** The read's multiplier for what can be seen of an attack. */
export function sightRead({
  unseen,
  travels,
  band,
}: {
  unseen: boolean;
  travels: boolean;
  band: RangeBand;
}): number {
  return (unseen ? UNSEEN_READ : 1) * (travels ? TRAVEL_READ[band] : 1);
}
