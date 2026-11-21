import { withKitAdditions, withShelfAdditions } from '../../../kitAdditions';
import type { LocationDef, PersonDef } from '../../../types';
import { FILL_KEPT, FILL_KITS } from './fill';
import { CANON_KITS } from './kits';
import { CANON_SHELVED, CANON_TEACHES, KIT_KEPT } from './sources';

/**
 * The fan pack's fighters with their kits laid over them: first the canon kits read from
 * Narutopedia (`kits.ts`), then the fill (`fill.ts`) that gives a thin fighter generic
 * techniques a person of the pack could have learned. New canon techniques are taught by the
 * teachers who hold them, or shelved in the home village by rank.
 */

/** The people (or versus fighters) with their canon kits and fill laid over them. */
/*#__NO_SIDE_EFFECTS__*/
export function withCanonKits(people: readonly PersonDef[]): PersonDef[] {
  return withKitAdditions(people, [
    { adds: CANON_KITS, kept: KIT_KEPT, teaches: CANON_TEACHES },
    { adds: FILL_KITS, kept: FILL_KEPT },
  ]);
}

/** The locations with the canon kits' shelved techniques in the home village. */
/*#__NO_SIDE_EFFECTS__*/
export function withCanonShelves(locations: readonly LocationDef[], homeId: string): LocationDef[] {
  return withShelfAdditions(locations, homeId, CANON_SHELVED);
}
