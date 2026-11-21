import { withKitAdditions, withShelfAdditions } from '../../../kitAdditions';
import type { LocationDef, PersonDef } from '../../../types';
import { FILL_KEPT, FILL_KITS } from './fill';
import { LANTERN_SHELVED, LANTERN_TEACHES } from './sources';

/**
 * The lantern country's people with their kits widened: each teacher teaches the new arts of
 * their clan or school (`sources.ts`), and a thin fighter gains techniques a person of the
 * village could have learned (`fill.ts`, chosen by `prototypes/narutopedia/fill.py`).
 */

/*#__NO_SIDE_EFFECTS__*/
export function withLanternKits(people: readonly PersonDef[]): PersonDef[] {
  return withKitAdditions(people, [
    { adds: {}, teaches: LANTERN_TEACHES },
    { adds: FILL_KITS, kept: FILL_KEPT },
  ]);
}

/** The locations with the newer standard techniques on the home village's shelves. */
/*#__NO_SIDE_EFFECTS__*/
export function withLanternShelves(
  locations: readonly LocationDef[],
  homeId: string,
): LocationDef[] {
  return withShelfAdditions(locations, homeId, LANTERN_SHELVED);
}
