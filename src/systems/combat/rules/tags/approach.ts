import type { Delivery } from '@/systems/techniques';

import type { AttackKind } from '../hits';
import { tagsOf } from './tags';

/**
 * How an attack arrives, as the story tells a defence against it: a blow, a grab, a blade,
 * something thrown, a breath, something out of the ground or down from above, a blast, or an
 * ordeal of the mind. Read from a technique's tags (`tagsOf`), so a new delivery needs a place
 * here and lines in every defence bank (`engines/plan/defenceLines.ts`), which a test holds to.
 */

export const APPROACHES = [
  'blow',
  'grab',
  'blade',
  'thrown',
  'breath',
  'ground',
  'above',
  'blast',
  'mind',
] as const;
export type Approach = (typeof APPROACHES)[number];

const BY_DELIVERY: Readonly<Record<Delivery, Approach>> = {
  strike: 'blow',
  charge: 'blow',
  touch: 'blow',
  body: 'blow',
  self: 'blow',
  grapple: 'grab',
  weapon: 'blade',
  thrown: 'thrown',
  placed: 'thrown',
  threads: 'thrown',
  breath: 'breath',
  gas: 'breath',
  'along-ground': 'ground',
  'from-ground': 'ground',
  'from-above': 'above',
  burst: 'blast',
  field: 'blast',
  'eye-contact': 'mind',
  sound: 'mind',
  senses: 'mind',
};

type Tech = Parameters<typeof tagsOf>[0];

/** How a technique arrives: a wide or vast area is a blast, whatever carries it. */
export function approachOf(t: Tech): Approach {
  const area = t.effects.find((e) => e.verb === 'area');
  if (area?.verb === 'area' && (area.size === 'wide' || area.size === 'vast')) return 'blast';
  const lead = tagsOf(t).delivery[0];
  return lead ? BY_DELIVERY[lead] : 'blow';
}

/** How a plain attack arrives: a fist, a blade in hand, or something thrown. */
export function plainApproach(kind: AttackKind, thrown: boolean): Approach {
  if (thrown) return 'thrown';
  return kind === 'weapon' ? 'blade' : 'blow';
}
