import { capitalise } from '@/core';
import type { EnemyDef } from '@/content';
import { overpoweredBy, type CombatPerk } from '@/systems/combat';

import { glanceCatches, type RetinueKnowledge } from './retinueSight';
import type { PoolNote } from './scoutingPools';
import type { GameState } from './state';

/**
 * What a read says of a beast changed by chakra (`EnemyDef.chakraBeast`). That it is one shows
 * at a glance; its nature and its gifts only in a fight, from a client's report, or to eyes
 * sharp enough to catch them (by hash, as for a companion kept out of sight).
 */

/** What each gift a beast may be born with means for you. */
const GIFT_NOTES: Readonly<Partial<Record<CombatPerk, PoolNote>>> = {
  mimicry: {
    label: 'It copies what it sees.',
    counter:
      'It copies what it watches you use. Clan arts it can’t take, and while it can’t see you it copies nothing.',
  },
  foresight: {
    label: 'It sees a move coming.',
    counter:
      'It slips and counters more than its body should. A wide area leaves it nowhere to go.',
  },
};

const CHANGED: PoolNote = {
  label: 'Changed by chakra.',
  counter: 'It has chakra like a shinobi’s, and techniques no person knows.',
};

/** Whether you can tell a changed beast's nature and gifts. */
export function changeSeen(state: GameState, def: EnemyDef, knowledge: RetinueKnowledge): boolean {
  return glanceCatches(state, def, { key: 'changed', tell: 'kept' }, knowledge);
}

/** Notes on a chakra beast: that it is one and, once seen, its nature and gifts. */
export function changedNotes(def: EnemyDef, seen: boolean): PoolNote[] {
  if (!def.chakraBeast) return [];
  if (!seen) return [CHANGED];
  const nature = def.nature
    ? [
        {
          label: `A ${def.nature} nature.`,
          counter: `${capitalise(overpoweredBy(def.nature))} beats it.`,
        },
      ]
    : [];
  const gifts = (def.perks ?? []).flatMap((perk) => GIFT_NOTES[perk] ?? []);
  return [CHANGED, ...nature, ...gifts];
}
