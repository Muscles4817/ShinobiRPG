import type { CombatOption, RangeBand } from '../../contract';
import { RANGE_BANDS } from '../../rules/range';
import { asRound } from './intent';
import { slotVerdict } from './slots';
import { playerOf, type PlanState } from './state';
import type { PassReason } from './traceShape';

/**
 * The plan screen's forecast (audit P1.6), the static part: for each slot at each distance,
 * what it would do if the round began there now, read by the same judgement that plays it
 * (`slots.ts`), from what the player can see (foes in sight, their telegraphs). Words, never
 * odds: which slot plays first, and why the ones above it wouldn't. A dry run of the whole round
 * is left out: it would read hidden things (a foe out of sight, a retinue unseen) and cost too
 * much on a phone at every edit.
 */

const WAITS: Readonly<Record<PassReason, string>> = {
  missing: 'None left in your pouch.',
  'out-of-reach': 'Can’t reach from this distance.',
  'cannot-use': 'Can’t be used now: chakra, breath or a seal.',
  saving: 'Kept back for a finisher.',
  'not-needed': 'Nothing for it to do yet.',
  condition: 'Waits for its condition.',
  'no-target': 'No foe it could aim at yet.',
};

const PLAYS_FIRST = 'Would play first if the round began here now.';

/** What each of your slots at a distance would do if the round began there now, by card id. */
function forecastAt(state: PlanState, band: RangeBand): ReadonlyMap<string, string> {
  const round = { ...asRound(state), range: band };
  const { distances: _apart, ...together } = round;
  const self = playerOf(state);
  const said = new Map<string, string>();
  for (const slot of self.loadout[band]) {
    const verdict = slotVerdict(self, together, slot);
    if ('plays' in verdict) {
      said.set(slot.card, PLAYS_FIRST);
      break;
    }
    said.set(slot.card, WAITS[verdict.passed]);
  }
  return said;
}

/** The table's options, each of your own slotted cards with its forecast. */
export function withForecasts(options: readonly CombatOption[], state: PlanState): CombatOption[] {
  const byBand = new Map(RANGE_BANDS.map((band) => [band, forecastAt(state, band)] as const));
  return options.map((o) => {
    const [kind, band, ...rest] = o.id.split(':');
    const at = RANGE_BANDS.find((b) => b === band);
    if (kind !== 'slot' || o.owner !== undefined || !o.selected || !at) return o;
    const forecast = byBand.get(at)?.get(rest.join(':'));
    return forecast ? { ...o, forecast } : o;
  });
}
