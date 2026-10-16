import type { SenseiGround, SenseiParts } from '../../senseiParts';
import { SENSEI_PASTS } from './pasts';
import { SENSEI_TEMPERAMENTS } from './temperaments';

/** Every temperament and past, with a pack's own grounds and names. */
/*#__NO_SIDE_EFFECTS__*/
export function senseiParts(
  grounds: readonly SenseiGround[],
  names: SenseiParts['names'],
): SenseiParts {
  return { temperaments: SENSEI_TEMPERAMENTS, pasts: SENSEI_PASTS, grounds, names };
}
